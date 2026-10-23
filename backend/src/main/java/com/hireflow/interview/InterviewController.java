package com.hireflow.interview;

import com.hireflow.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@Tag(name = "Interviews", description = "Interview Scheduling & Feedback Evaluation")
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Schedule an interview for an applicant")
    public ResponseEntity<ApiResponse<InterviewResponse>> scheduleInterview(@Valid @RequestBody InterviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Interview scheduled successfully", interviewService.scheduleInterview(request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Update interview status (SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED)")
    public ResponseEntity<ApiResponse<InterviewResponse>> updateStatus(@PathVariable UUID id, @RequestParam InterviewStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", interviewService.updateStatus(id, status)));
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Submit interview feedback and score evaluation")
    public ResponseEntity<ApiResponse<InterviewResponse>> submitFeedback(
            @PathVariable UUID id,
            @Valid @RequestBody InterviewFeedbackRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", interviewService.submitFeedback(id, request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLATFORM_ADMIN')")
    @Operation(summary = "List all interviews for recruiter organization")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getRecruiterInterviews() {
        return ResponseEntity.ok(ApiResponse.success(interviewService.getRecruiterInterviews()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "List all scheduled interviews for current candidate")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getCandidateInterviews() {
        return ResponseEntity.ok(ApiResponse.success(interviewService.getCandidateInterviews()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get interview details by ID")
    public ResponseEntity<ApiResponse<InterviewResponse>> getInterviewById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(interviewService.getInterviewById(id)));
    }
}
