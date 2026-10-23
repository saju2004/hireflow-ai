package com.hireflow.application;

import com.hireflow.candidate.CandidateProfile;
import com.hireflow.candidate.CandidateProfileRepository;
import com.hireflow.common.*;
import com.hireflow.job.Job;
import com.hireflow.job.JobRepository;
import com.hireflow.job.JobStatus;
import com.hireflow.matching.CandidateMatchingService;
import com.hireflow.matching.MatchResult;
import com.hireflow.matching.MatchResultRepository;
import com.hireflow.notification.NotificationService;
import com.hireflow.notification.NotificationType;
import com.hireflow.resume.Resume;
import com.hireflow.resume.ResumeRepository;
import com.hireflow.security.SecurityUtils;
import com.hireflow.security.UserPrincipal;
import com.hireflow.user.Role;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationEventRepository eventRepository;
    private final JobRepository jobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final MatchResultRepository matchResultRepository;
    private final CandidateMatchingService matchingService;
    private final NotificationService notificationService;

    @Transactional
    public ApplicationResponse apply(ApplicationRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        CandidateProfile profile = candidateProfileRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found: " + currentUserId));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + request.getJobId()));

        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new BadRequestException("This job is currently not accepting applications");
        }

        // Duplicate application prevention
        if (applicationRepository.existsByJobIdAndCandidateProfileId(job.getId(), profile.getId())) {
            throw new DuplicateApplicationException("You have already submitted an application for this position.");
        }

        Resume resume = null;
        if (request.getResumeId() != null) {
            resume = resumeRepository.findById(request.getResumeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + request.getResumeId()));
            if (!resume.getCandidateProfile().getId().equals(profile.getId())) {
                throw new BadRequestException("Resume does not belong to your profile");
            }
        } else {
            // Auto-select candidate's most recent resume if available
            List<Resume> resumes = resumeRepository.findByCandidateProfileIdOrderByCreatedAtDesc(profile.getId());
            if (!resumes.isEmpty()) {
                resume = resumes.get(0);
            }
        }

        Application application = Application.builder()
                .job(job)
                .candidateProfile(profile)
                .resume(resume)
                .status(ApplicationStatus.APPLIED)
                .coverLetter(request.getCoverLetter())
                .build();

        Application savedApp = applicationRepository.save(application);

        // Record initial event
        ApplicationEvent event = ApplicationEvent.builder()
                .application(savedApp)
                .actor(currentUser)
                .previousStatus(null)
                .newStatus(ApplicationStatus.APPLIED)
                .eventType(ApplicationEventType.STATUS_CHANGE)
                .notes("Application submitted by candidate" + (resume != null ? " with resume " + resume.getFileName() : ""))
                .build();
        eventRepository.save(event);

        // Trigger AI / Skill matching calculation immediately
        Double matchScore = null;
        try {
            MatchResult match = matchingService.computeAndSaveMatch(savedApp, job, resume);
            matchScore = match.getOverallScore();
        } catch (Exception ex) {
            // Non-blocking matching failure
        }

        // Notify job creator / organization recruiter
        if (job.getCreator() != null) {
            notificationService.createNotification(
                    job.getCreator(),
                    "New Application Received",
                    currentUser.getFullName() + " applied for " + job.getTitle(),
                    NotificationType.APPLICATION_UPDATE,
                    "/recruiter/applications"
            );
        }

        return ApplicationResponse.fromEntity(savedApp, matchScore, false);
    }

    @Transactional
    public ApplicationResponse updateStatus(UUID applicationId, StatusUpdateRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        // Enforce tenant isolation: recruiter must belong to the organization
        SecurityUtils.requireOrganizationAccess(application.getJob().getOrganization().getId());

        ApplicationStatus currentStatus = application.getStatus();
        ApplicationStatus newStatus = request.getStatus();

        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new InvalidStatusTransitionException(
                    String.format("Cannot transition application from %s to %s", currentStatus, newStatus)
            );
        }

        application.setStatus(newStatus);
        if (request.getRejectionReason() != null) {
            application.setRejectionReason(request.getRejectionReason());
        }

        Application savedApp = applicationRepository.save(application);

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId).orElse(null);

        // Record stage transition event
        ApplicationEvent event = ApplicationEvent.builder()
                .application(savedApp)
                .actor(currentUser)
                .previousStatus(currentStatus)
                .newStatus(newStatus)
                .eventType(ApplicationEventType.STATUS_CHANGE)
                .notes(request.getNotes() != null ? request.getNotes() : "Status updated to " + newStatus)
                .build();
        eventRepository.save(event);

        // Notify candidate of status update
        User candidateUser = application.getCandidateProfile().getUser();
        notificationService.createNotification(
                candidateUser,
                "Application Status Update",
                String.format("Your application for %s is now %s.", application.getJob().getTitle(), newStatus),
                NotificationType.APPLICATION_UPDATE,
                "/candidate/applications"
        );

        Double score = getMatchScore(applicationId);
        return ApplicationResponse.fromEntity(savedApp, score, true);
    }

    @Transactional
    public ApplicationResponse updateInternalNotes(UUID applicationId, String notes) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        SecurityUtils.requireOrganizationAccess(application.getJob().getOrganization().getId());

        application.setInternalNotes(notes);
        Application saved = applicationRepository.save(application);

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId).orElse(null);

        ApplicationEvent event = ApplicationEvent.builder()
                .application(saved)
                .actor(currentUser)
                .previousStatus(saved.getStatus())
                .newStatus(saved.getStatus())
                .eventType(ApplicationEventType.NOTE_ADDED)
                .notes("Internal note updated")
                .build();
        eventRepository.save(event);

        Double score = getMatchScore(applicationId);
        return ApplicationResponse.fromEntity(saved, score, true);
    }

    @Transactional
    public ApplicationResponse withdrawApplication(UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!application.getCandidateProfile().getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to withdraw this application");
        }

        if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Application is already withdrawn");
        }

        ApplicationStatus prev = application.getStatus();
        application.setStatus(ApplicationStatus.WITHDRAWN);
        Application saved = applicationRepository.save(application);

        User currentUser = userRepository.findById(currentUserId).orElse(null);
        ApplicationEvent event = ApplicationEvent.builder()
                .application(saved)
                .actor(currentUser)
                .previousStatus(prev)
                .newStatus(ApplicationStatus.WITHDRAWN)
                .eventType(ApplicationEventType.STATUS_CHANGE)
                .notes("Candidate withdrew application")
                .build();
        eventRepository.save(event);

        return ApplicationResponse.fromEntity(saved, null, false);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getCandidateApplications() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        CandidateProfile profile = candidateProfileRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found: " + currentUserId));

        return applicationRepository.findByCandidateProfileIdOrderByAppliedAtDesc(profile.getId()).stream()
                .map(app -> {
                    Double score = getMatchScore(app.getId());
                    return ApplicationResponse.fromEntity(app, score, false);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<ApplicationResponse> getRecruiterApplications(UUID jobId, ApplicationStatus status, Pageable pageable) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        Page<Application> page = applicationRepository.findRecruiterApplications(orgId, jobId, status, pageable);

        List<ApplicationResponse> responses = page.getContent().stream()
                .map(app -> {
                    Double score = getMatchScore(app.getId());
                    return ApplicationResponse.fromEntity(app, score, true);
                })
                .collect(Collectors.toList());

        return PagedResponse.<ApplicationResponse>builder()
                .content(responses)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationDetails(UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        UserPrincipal user = SecurityUtils.getRequiredCurrentUser();
        boolean isCandidate = application.getCandidateProfile().getUser().getId().equals(user.getId());

        if (!isCandidate) {
            // Must belong to recruiter organization or be admin
            SecurityUtils.requireOrganizationAccess(application.getJob().getOrganization().getId());
        }

        Double score = getMatchScore(applicationId);
        return ApplicationResponse.fromEntity(application, score, !isCandidate);
    }

    @Transactional(readOnly = true)
    public List<ApplicationEventResponse> getApplicationTimeline(UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        UserPrincipal user = SecurityUtils.getRequiredCurrentUser();
        boolean isCandidate = application.getCandidateProfile().getUser().getId().equals(user.getId());
        if (!isCandidate) {
            SecurityUtils.requireOrganizationAccess(application.getJob().getOrganization().getId());
        }

        return eventRepository.findByApplicationIdOrderByCreatedAtAsc(applicationId).stream()
                .map(ApplicationEventResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private Double getMatchScore(UUID applicationId) {
        return matchResultRepository.findByApplicationId(applicationId)
                .map(MatchResult::getOverallScore)
                .orElse(null);
    }
}
