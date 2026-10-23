package com.hireflow.interview;

import com.hireflow.application.*;
import com.hireflow.candidate.CandidateProfile;
import com.hireflow.candidate.CandidateProfileRepository;
import com.hireflow.common.BadRequestException;
import com.hireflow.common.ResourceNotFoundException;
import com.hireflow.notification.NotificationService;
import com.hireflow.notification.NotificationType;
import com.hireflow.security.SecurityUtils;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewFeedbackRepository feedbackRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationEventRepository eventRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final NotificationService notificationService;

    @Transactional
    public InterviewResponse scheduleInterview(InterviewRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + request.getApplicationId()));

        SecurityUtils.requireOrganizationAccess(application.getJob().getOrganization().getId());

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User interviewer = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Interviewer not found: " + currentUserId));

        if (request.getScheduledEnd().isBefore(request.getScheduledStart())) {
            throw new BadRequestException("Interview end time must be after start time");
        }

        Interview interview = Interview.builder()
                .application(application)
                .organization(application.getJob().getOrganization())
                .interviewer(interviewer)
                .title(request.getTitle().trim())
                .interviewType(request.getInterviewType())
                .scheduledStart(request.getScheduledStart())
                .scheduledEnd(request.getScheduledEnd())
                .timezone(request.getTimezone() != null ? request.getTimezone() : "UTC")
                .meetingLink(request.getMeetingLink())
                .location(request.getLocation() != null ? request.getLocation() : "Virtual / Remote")
                .status(InterviewStatus.SCHEDULED)
                .notes(request.getNotes())
                .build();

        Interview saved = interviewRepository.save(interview);

        // Advance application to INTERVIEW stage if not already there
        if (application.getStatus() != ApplicationStatus.INTERVIEW && application.getStatus() != ApplicationStatus.OFFER && application.getStatus() != ApplicationStatus.HIRED) {
            ApplicationStatus prevStatus = application.getStatus();
            application.setStatus(ApplicationStatus.INTERVIEW);
            applicationRepository.save(application);

            ApplicationEvent statusEvent = ApplicationEvent.builder()
                    .application(application)
                    .actor(interviewer)
                    .previousStatus(prevStatus)
                    .newStatus(ApplicationStatus.INTERVIEW)
                    .eventType(ApplicationEventType.STATUS_CHANGE)
                    .notes("Candidate moved to Interview stage")
                    .build();
            eventRepository.save(statusEvent);
        }

        // Add timeline event
        ApplicationEvent event = ApplicationEvent.builder()
                .application(application)
                .actor(interviewer)
                .previousStatus(application.getStatus())
                .newStatus(application.getStatus())
                .eventType(ApplicationEventType.INTERVIEW_SCHEDULED)
                .notes(String.format("Scheduled %s interview: %s", request.getInterviewType(), request.getTitle()))
                .build();
        eventRepository.save(event);

        // Notify candidate
        User candidateUser = application.getCandidateProfile().getUser();
        notificationService.createNotification(
                candidateUser,
                "Interview Scheduled",
                String.format("An interview has been scheduled for %s: %s", application.getJob().getTitle(), request.getTitle()),
                NotificationType.INTERVIEW_SCHEDULED,
                "/candidate/interviews"
        );

        return InterviewResponse.fromEntity(saved);
    }

    @Transactional
    public InterviewResponse updateStatus(UUID interviewId, InterviewStatus newStatus) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found: " + interviewId));

        SecurityUtils.requireOrganizationAccess(interview.getOrganization().getId());

        interview.setStatus(newStatus);
        Interview saved = interviewRepository.save(interview);
        return InterviewResponse.fromEntity(saved);
    }

    @Transactional
    public InterviewResponse submitFeedback(UUID interviewId, InterviewFeedbackRequest request) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found: " + interviewId));

        SecurityUtils.requireOrganizationAccess(interview.getOrganization().getId());

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User interviewer = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        InterviewFeedback feedback = feedbackRepository.findByInterviewId(interviewId)
                .orElse(InterviewFeedback.builder().interview(interview).build());

        feedback.setInterviewer(interviewer);
        feedback.setOverallRating(request.getOverallRating());
        feedback.setTechnicalRating(request.getTechnicalRating());
        feedback.setCommunicationRating(request.getCommunicationRating());
        feedback.setCultureFitRating(request.getCultureFitRating());
        feedback.setStrengths(request.getStrengths());
        feedback.setWeaknesses(request.getWeaknesses());
        feedback.setRecommendation(request.getRecommendation());

        feedbackRepository.save(feedback);

        interview.setStatus(InterviewStatus.COMPLETED);
        interview.setFeedback(feedback);
        Interview saved = interviewRepository.save(interview);

        return InterviewResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getRecruiterInterviews() {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        return interviewRepository.findByOrganizationIdOrderByScheduledStartDesc(orgId).stream()
                .map(InterviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getCandidateInterviews() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        CandidateProfile profile = candidateProfileRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found: " + currentUserId));

        return interviewRepository.findByCandidateProfileId(profile.getId()).stream()
                .map(InterviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InterviewResponse getInterviewById(UUID interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found: " + interviewId));

        return InterviewResponse.fromEntity(interview);
    }
}
