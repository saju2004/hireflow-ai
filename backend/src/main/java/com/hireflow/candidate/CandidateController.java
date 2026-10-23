package com.hireflow.candidate;

import com.hireflow.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
@Tag(name = "Candidate", description = "Candidate Profile & Self-Service Management")
public class CandidateController {

    private final CandidateProfileService candidateProfileService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get currently authenticated candidate profile")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success(candidateProfileService.getCurrentCandidateProfile()));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Update currently authenticated candidate profile")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateProfile(@RequestBody CandidateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", candidateProfileService.updateCurrentCandidateProfile(request)));
    }

    @GetMapping("/profiles/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLATFORM_ADMIN')")
    @Operation(summary = "Get candidate profile by ID (Recruiter/Admin)")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> getProfileById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(candidateProfileService.getProfileById(id)));
    }
}
