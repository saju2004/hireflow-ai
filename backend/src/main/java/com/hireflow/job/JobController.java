package com.hireflow.job;

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

import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Recruiter & Organization Job Management")
public class JobController {

    private final JobService jobService;

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Create a new job in DRAFT status")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(@Valid @RequestBody JobRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Job created successfully", jobService.createJob(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Update an existing job posting")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(@PathVariable UUID id, @Valid @RequestBody JobRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Job updated successfully", jobService.updateJob(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Transition job status (DRAFT, PUBLISHED, PAUSED, CLOSED)")
    public ResponseEntity<ApiResponse<JobResponse>> updateJobStatus(@PathVariable UUID id, @RequestParam JobStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Job status updated", jobService.setJobStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Delete a job posting")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable UUID id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job deleted successfully", null));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLATFORM_ADMIN')")
    @Operation(summary = "List all jobs for current recruiter organization")
    public ResponseEntity<ApiResponse<PagedResponse<JobResponse>>> getRecruiterJobs(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getRecruiterJobs(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed job posting by ID")
    public ResponseEntity<ApiResponse<JobResponse>> getJobById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobById(id)));
    }
}
