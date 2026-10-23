package com.hireflow.security;

import com.hireflow.common.TenantAccessDeniedException;
import com.hireflow.user.Role;
import com.hireflow.user.UserStatus;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class TenantIsolationTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Recruiter should have access to their own organization resources")
    void testTenantAccessPermitted() {
        UUID orgA = UUID.randomUUID();
        UserPrincipal recruiterOrgA = UserPrincipal.builder()
                .id(UUID.randomUUID())
                .email("recruiter@orga.com")
                .role(Role.RECRUITER)
                .status(UserStatus.ACTIVE)
                .organizationId(orgA)
                .authorities(Collections.emptyList())
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(recruiterOrgA, null, recruiterOrgA.getAuthorities())
        );

        assertDoesNotThrow(() -> SecurityUtils.requireOrganizationAccess(orgA));
    }

    @Test
    @DisplayName("Recruiter attempting to access another organization must throw TenantAccessDeniedException")
    void testCrossTenantAccessViolationBlocked() {
        UUID orgA = UUID.randomUUID();
        UUID orgB = UUID.randomUUID();

        UserPrincipal recruiterOrgA = UserPrincipal.builder()
                .id(UUID.randomUUID())
                .email("recruiter@orga.com")
                .role(Role.RECRUITER)
                .status(UserStatus.ACTIVE)
                .organizationId(orgA)
                .authorities(Collections.emptyList())
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(recruiterOrgA, null, recruiterOrgA.getAuthorities())
        );

        assertThrows(TenantAccessDeniedException.class, () -> SecurityUtils.requireOrganizationAccess(orgB));
    }

    @Test
    @DisplayName("Platform Admin is authorized across organizations")
    void testPlatformAdminAuthorized() {
        UUID anyOrg = UUID.randomUUID();

        UserPrincipal admin = UserPrincipal.builder()
                .id(UUID.randomUUID())
                .email("admin@hireflow.io")
                .role(Role.PLATFORM_ADMIN)
                .status(UserStatus.ACTIVE)
                .organizationId(null)
                .authorities(Collections.emptyList())
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities())
        );

        assertDoesNotThrow(() -> SecurityUtils.requireOrganizationAccess(anyOrg));
    }
}
