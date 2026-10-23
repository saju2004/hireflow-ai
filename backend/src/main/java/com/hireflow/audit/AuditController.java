package com.hireflow.audit;

import com.hireflow.common.ApiResponse;
import com.hireflow.common.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Platform Audit & Security Activity Logs")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    @Operation(summary = "View platform system audit trail (Platform Admin)")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getAdminAuditLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getAuditLogsForAdmin(pageable)));
    }

    @GetMapping("/organization")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "View organization audit events (Recruiter)")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getOrganizationAuditLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getOrganizationAuditLogs(pageable)));
    }
}
