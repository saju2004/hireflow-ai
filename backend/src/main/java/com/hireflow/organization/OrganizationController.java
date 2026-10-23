package com.hireflow.organization;

import com.hireflow.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
@Tag(name = "Organizations", description = "Organization & Tenant Operations")
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLATFORM_ADMIN')")
    @Operation(summary = "Get currently active organization details")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getCurrentOrganization() {
        return ResponseEntity.ok(ApiResponse.success(organizationService.getCurrentOrganization()));
    }

    @PutMapping("/current")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Update currently active organization details")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateCurrentOrganization(@RequestBody UpdateOrganizationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Organization updated", organizationService.updateCurrentOrganization(request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    @Operation(summary = "List all organizations (Platform Admin)")
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> getAllOrganizations() {
        return ResponseEntity.ok(ApiResponse.success(organizationService.getAllOrganizationsForAdmin()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    @Operation(summary = "Toggle organization status (Platform Admin)")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateStatus(@PathVariable UUID id, @RequestParam OrganizationStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", organizationService.toggleOrganizationStatus(id, status)));
    }
}
