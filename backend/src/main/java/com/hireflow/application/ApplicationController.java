package com.hireflow.application;

import com.hireflow.common.ApiResponse;
import com.hireflow.common.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Candidate Application Pipeline & Status Management")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Submit a new job application")
    public ResponseEntity<ApiResponse<ApplicationResponse>> submitApplication(@Valid @RequestBody ApplicationRequest request) {
        ApplicationResponse response = applicationService.apply(request);
        return ResponseEntity.ok(ApiResponse.success("Application submitted successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get all applications submitted by currently authenticated candidate")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications() {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getCandidateApplications()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLATFORM_ADMIN')")
    @Operation(summary = "List and filter organization candidate applications (Recruiter)")
    public ResponseEntity<ApiResponse<PagedResponse<ApplicationResponse>>> getRecruiterApplications(
            @RequestParam(required = false) UUID jobId,
            @RequestParam(required = false) ApplicationStatus status,
            @PageableDefault(size = 15, sort = "appliedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success(applicationService.getRecruiterApplications(jobId, status, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get detailed application by ID")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplicationById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplicationDetails(id)));
    }

    @GetMapping("/{id}/timeline")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get event history and audit timeline for an application")
    public ResponseEntity<ApiResponse<List<ApplicationEventResponse>>> getTimeline(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplicationTimeline(id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLATFORM_ADMIN')")
    @Operation(summary = "Advance or update application stage with transition rules")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", applicationService.updateStatus(id, request)));
    }

    @PatchMapping("/{id}/notes")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Update internal recruiter notes")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateNotes(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        String notes = payload.get("notes");
        return ResponseEntity.ok(ApiResponse.success("Internal notes updated", applicationService.updateInternalNotes(id, notes)));
    }

    @PostMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Withdraw an application")
    public ResponseEntity<ApiResponse<ApplicationResponse>> withdrawApplication(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn", applicationService.withdrawApplication(id)));
    }
}
