package com.hireflow.security;

import com.hireflow.common.TenantAccessDeniedException;
import com.hireflow.user.Role;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static Optional<UserPrincipal> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return Optional.of((UserPrincipal) principal);
        }
        return Optional.empty();
    }

    public static UserPrincipal getRequiredCurrentUser() {
        return getCurrentUser()
                .orElseThrow(() -> new AccessDeniedException("User is not authenticated"));
    }

    public static UUID getCurrentUserId() {
        return getRequiredCurrentUser().getId();
    }

    public static UUID getCurrentOrganizationId() {
        UserPrincipal user = getRequiredCurrentUser();
        if (user.getOrganizationId() == null) {
            throw new AccessDeniedException("User does not belong to any organization");
        }
        return user.getOrganizationId();
    }

    public static void requireOrganizationAccess(UUID targetOrgId) {
        UserPrincipal currentUser = getRequiredCurrentUser();

        // Platform Admin can inspect organizations if authorized
        if (currentUser.getRole() == Role.PLATFORM_ADMIN) {
            return;
        }

        if (currentUser.getOrganizationId() == null || !currentUser.getOrganizationId().equals(targetOrgId)) {
            throw new TenantAccessDeniedException("Cross-tenant access violation: You are not authorized to access this organization's data");
        }
    }

    public static void requireRole(Role requiredRole) {
        UserPrincipal user = getRequiredCurrentUser();
        if (user.getRole() != requiredRole && user.getRole() != Role.PLATFORM_ADMIN) {
            throw new AccessDeniedException("User does not have required role: " + requiredRole);
        }
    }
}
