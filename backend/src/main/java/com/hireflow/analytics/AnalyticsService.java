package com.hireflow.analytics;

import com.hireflow.application.Application;
import com.hireflow.application.ApplicationRepository;
import com.hireflow.application.ApplicationStatus;
import com.hireflow.interview.InterviewRepository;
import com.hireflow.job.JobRepository;
import com.hireflow.job.JobStatus;
import com.hireflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;

    @Transactional(readOnly = true)
    public RecruiterAnalyticsResponse getRecruiterAnalytics() {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        long totalJobs = jobRepository.countByOrganizationId(orgId);
        long publishedJobs = jobRepository.countByOrganizationIdAndStatus(orgId, JobStatus.PUBLISHED);
        long totalApps = applicationRepository.countByJobOrganizationId(orgId);
        long scheduledInterviews = interviewRepository.countByOrganizationId(orgId);

        List<Application> allApps = applicationRepository.findAllByOrganizationId(orgId);

        // Stage counts
        Map<ApplicationStatus, Long> countsByStatus = allApps.stream()
                .collect(Collectors.groupingBy(Application::getStatus, Collectors.counting()));

        List<StageCountDto> stageDistribution = Arrays.stream(ApplicationStatus.values())
                .map(status -> StageCountDto.builder()
                        .stage(status.name())
                        .count(countsByStatus.getOrDefault(status, 0L))
                        .build())
                .collect(Collectors.toList());

        // Conversion Funnel
        long appliedCount = countsByStatus.getOrDefault(ApplicationStatus.APPLIED, 0L);
        long screeningCount = countsByStatus.getOrDefault(ApplicationStatus.SCREENING, 0L);
        long shortlistedCount = countsByStatus.getOrDefault(ApplicationStatus.SHORTLISTED, 0L);
        long interviewCount = countsByStatus.getOrDefault(ApplicationStatus.INTERVIEW, 0L);
        long offerCount = countsByStatus.getOrDefault(ApplicationStatus.OFFER, 0L);
        long hiredCount = countsByStatus.getOrDefault(ApplicationStatus.HIRED, 0L);

        // Cumulative funnel calculation
        long reachedScreening = screeningCount + shortlistedCount + interviewCount + offerCount + hiredCount;
        long reachedInterview = interviewCount + offerCount + hiredCount;
        long reachedOffer = offerCount + hiredCount;

        List<ConversionMetricDto> funnel = new ArrayList<>();
        funnel.add(ConversionMetricDto.builder()
                .step("Applied")
                .count(totalApps)
                .rate(100.0)
                .build());

        funnel.add(ConversionMetricDto.builder()
                .step("Screening / Shortlisted")
                .count(reachedScreening)
                .rate(calcRate(reachedScreening, totalApps))
                .build());

        funnel.add(ConversionMetricDto.builder()
                .step("Interview")
                .count(reachedInterview)
                .rate(calcRate(reachedInterview, totalApps))
                .build());

        funnel.add(ConversionMetricDto.builder()
                .step("Offer")
                .count(reachedOffer)
                .rate(calcRate(reachedOffer, totalApps))
                .build());

        funnel.add(ConversionMetricDto.builder()
                .step("Hired")
                .count(hiredCount)
                .rate(calcRate(hiredCount, totalApps))
                .build());

        double hireRate = calcRate(hiredCount, totalApps);

        // Recent applications sample for chart / timeline
        List<Map<String, Object>> recentApps = allApps.stream()
                .sorted(Comparator.comparing(Application::getAppliedAt).reversed())
                .limit(5)
                .map(app -> Map.of(
                        "id", (Object) app.getId(),
                        "candidateName", app.getCandidateProfile().getUser().getFullName(),
                        "jobTitle", app.getJob().getTitle(),
                        "status", app.getStatus().name(),
                        "appliedAt", app.getAppliedAt().toString()
                ))
                .collect(Collectors.toList());

        return RecruiterAnalyticsResponse.builder()
                .totalJobs(totalJobs)
                .publishedJobs(publishedJobs)
                .totalApplications(totalApps)
                .scheduledInterviews(scheduledInterviews)
                .overallHireRate(hireRate)
                .stageDistribution(stageDistribution)
                .conversionFunnel(funnel)
                .recentApplications(recentApps)
                .build();
    }

    private double calcRate(long numerator, long denominator) {
        if (denominator == 0) return 0.0;
        double r = ((double) numerator / denominator) * 100.0;
        return BigDecimal.valueOf(r).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
