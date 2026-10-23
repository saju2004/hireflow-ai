package com.hireflow.matching;

import com.hireflow.application.Application;
import com.hireflow.application.ApplicationRepository;
import com.hireflow.common.ApiResponse;
import com.hireflow.common.ResourceNotFoundException;
import com.hireflow.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
@Tag(name = "AI Matching", description = "Candidate-to-Job Skill Matching & Explanation")
public class MatchingController {

    private final CandidateMatchingService candidateMatchingService;
    private final ApplicationRepository applicationRepository;

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get match results and transparent explanation for an application")
    public ResponseEntity<ApiResponse<MatchResultResponse>> getMatchForApplication(@PathVariable UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        // Tenant authorization: only recruiter of the job or admin or the candidate applicant
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        boolean isApplicant = application.getCandidateProfile().getUser().getId().equals(currentUserId);
        if (!isApplicant) {
            SecurityUtils.requireOrganizationAccess(application.getJob().getOrganization().getId());
        }

        return ResponseEntity.ok(ApiResponse.success(candidateMatchingService.getMatchByApplicationId(applicationId)));
    }

    @PostMapping("/application/{applicationId}/recalculate")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Recalculate match score with current job requirements")
    public ResponseEntity<ApiResponse<MatchResultResponse>> recalculateMatch(@PathVariable UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        SecurityUtils.requireOrganizationAccess(application.getJob().getOrganization().getId());

        MatchResult match = candidateMatchingService.computeAndSaveMatch(application, application.getJob(), application.getResume());
        return ResponseEntity.ok(ApiResponse.success("Match recalculated successfully", MatchResultResponse.fromEntity(match)));
    }
}
