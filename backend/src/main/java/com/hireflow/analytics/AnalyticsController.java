package com.hireflow.analytics;

import com.hireflow.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Recruitment & Pipeline Performance Analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/recruiter")
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLATFORM_ADMIN')")
    @Operation(summary = "Get database-backed recruiting analytics and conversion metrics")
    public ResponseEntity<ApiResponse<RecruiterAnalyticsResponse>> getRecruiterAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRecruiterAnalytics()));
    }
}
