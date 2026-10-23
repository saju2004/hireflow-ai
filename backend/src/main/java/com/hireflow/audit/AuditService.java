package com.hireflow.audit;

import com.hireflow.common.PagedResponse;
import com.hireflow.security.SecurityUtils;
import com.hireflow.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void recordAction(String action, String targetEntity, String targetId, String details) {
        UUID actorId = null;
        String actorEmail = "anonymous";
        UUID orgId = null;

        var userOpt = SecurityUtils.getCurrentUser();
        if (userOpt.isPresent()) {
            UserPrincipal principal = userOpt.get();
            actorId = principal.getId();
            actorEmail = principal.getEmail();
            orgId = principal.getOrganizationId();
        }

        AuditLog log = AuditLog.builder()
                .organizationId(orgId)
                .actorId(actorId)
                .actorEmail(actorEmail)
                .action(action)
                .targetEntity(targetEntity)
                .targetId(targetId)
                .ipAddress("127.0.0.1")
                .details(details)
                .build();

        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLog> getAuditLogsForAdmin(Pageable pageable) {
        Page<AuditLog> logs = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PagedResponse.of(logs);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLog> getOrganizationAuditLogs(Pageable pageable) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        Page<AuditLog> logs = auditLogRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId, pageable);
        return PagedResponse.of(logs);
    }
}
