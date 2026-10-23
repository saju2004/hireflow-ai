package com.hireflow.job;

import com.hireflow.common.PagedResponse;
import com.hireflow.common.ResourceNotFoundException;
import com.hireflow.organization.Organization;
import com.hireflow.organization.OrganizationRepository;
import com.hireflow.security.SecurityUtils;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Transactional
    public JobResponse createJob(JobRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        UUID userId = SecurityUtils.getCurrentUserId();

        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        String slug = generateSlug(request.getTitle());

        Job job = Job.builder()
                .organization(organization)
                .creator(creator)
                .title(request.getTitle().trim())
                .slug(slug)
                .description(request.getDescription())
                .responsibilities(request.getResponsibilities())
                .experienceLevel(request.getExperienceLevel())
                .employmentType(request.getEmploymentType())
                .location(request.getLocation().trim())
                .workplaceType(request.getWorkplaceType())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .status(JobStatus.DRAFT)
                .skills(new ArrayList<>())
                .build();

        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            for (JobSkillDto skillDto : request.getSkills()) {
                JobSkill skill = JobSkill.builder()
                        .job(job)
                        .skillName(skillDto.getSkillName().trim())
                        .isRequired(skillDto.isRequired())
                        .weight(skillDto.getWeight() != null ? skillDto.getWeight() : 1.0)
                        .build();
                job.getSkills().add(skill);
            }
        }

        Job saved = jobRepository.save(job);
        return JobResponse.fromEntity(saved, 0);
    }

    @Transactional
    public JobResponse updateJob(UUID jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        SecurityUtils.requireOrganizationAccess(job.getOrganization().getId());

        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription());
        job.setResponsibilities(request.getResponsibilities());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setEmploymentType(request.getEmploymentType());
        job.setLocation(request.getLocation().trim());
        job.setWorkplaceType(request.getWorkplaceType());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        if (request.getCurrency() != null) job.setCurrency(request.getCurrency());

        // Update skills
        job.getSkills().clear();
        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            for (JobSkillDto skillDto : request.getSkills()) {
                JobSkill skill = JobSkill.builder()
                        .job(job)
                        .skillName(skillDto.getSkillName().trim())
                        .isRequired(skillDto.isRequired())
                        .weight(skillDto.getWeight() != null ? skillDto.getWeight() : 1.0)
                        .build();
                job.getSkills().add(skill);
            }
        }

        Job saved = jobRepository.save(job);
        return JobResponse.fromEntity(saved, 0);
    }

    @Transactional
    public JobResponse setJobStatus(UUID jobId, JobStatus newStatus) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        SecurityUtils.requireOrganizationAccess(job.getOrganization().getId());

        job.setStatus(newStatus);
        if (newStatus == JobStatus.PUBLISHED && job.getPublishedAt() == null) {
            job.setPublishedAt(Instant.now());
        }

        Job saved = jobRepository.save(job);
        return JobResponse.fromEntity(saved, 0);
    }

    @Transactional
    public void deleteJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        SecurityUtils.requireOrganizationAccess(job.getOrganization().getId());
        jobRepository.delete(job);
    }

    @Transactional(readOnly = true)
    public PagedResponse<JobResponse> getRecruiterJobs(Pageable pageable) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        Page<Job> jobs = jobRepository.findByOrganizationId(orgId, pageable);

        List<JobResponse> responses = jobs.getContent().stream()
                .map(j -> JobResponse.fromEntity(j, 0))
                .collect(Collectors.toList());

        return PagedResponse.<JobResponse>builder()
                .content(responses)
                .page(jobs.getNumber())
                .size(jobs.getSize())
                .totalElements(jobs.getTotalElements())
                .totalPages(jobs.getTotalPages())
                .last(jobs.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public JobResponse getJobById(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        // If not published, only authorized organization members or admin can view
        if (job.getStatus() != JobStatus.PUBLISHED) {
            SecurityUtils.requireOrganizationAccess(job.getOrganization().getId());
        }

        return JobResponse.fromEntity(job, 0);
    }

    @Transactional(readOnly = true)
    public PagedResponse<JobResponse> searchPublicJobs(String search,
                                                       String location,
                                                       WorkplaceType workplaceType,
                                                       ExperienceLevel experienceLevel,
                                                       EmploymentType employmentType,
                                                       Pageable pageable) {
        Page<Job> jobs = jobRepository.searchPublishedJobs(search, location, workplaceType, experienceLevel, employmentType, pageable);

        List<JobResponse> responses = jobs.getContent().stream()
                .map(j -> JobResponse.fromEntity(j, 0))
                .collect(Collectors.toList());

        return PagedResponse.<JobResponse>builder()
                .content(responses)
                .page(jobs.getNumber())
                .size(jobs.getSize())
                .totalElements(jobs.getTotalElements())
                .totalPages(jobs.getTotalPages())
                .last(jobs.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public JobResponse getPublicJobBySlug(String slug) {
        Job job = jobRepository.findBySlugAndStatus(slug, JobStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Published job not found with slug: " + slug));

        return JobResponse.fromEntity(job, 0);
    }

    private String generateSlug(String title) {
        String base = title.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        return base + "-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
