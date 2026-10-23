package com.hireflow.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterAnalyticsResponse {
    private long totalJobs;
    private long publishedJobs;
    private long totalApplications;
    private long scheduledInterviews;
    private double overallHireRate;
    private List<StageCountDto> stageDistribution;
    private List<ConversionMetricDto> conversionFunnel;
    private List<Map<String, Object>> recentApplications;
}
