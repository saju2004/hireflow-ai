package com.hireflow.user;

import com.hireflow.auth.UserDto;
import com.hireflow.common.ResourceNotFoundException;
import com.hireflow.organization.OrganizationMembership;
import com.hireflow.organization.OrganizationMembershipRepository;
import com.hireflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final OrganizationMembershipRepository membershipRepository;

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto toggleUserStatus(UUID userId, UserStatus newStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setStatus(newStatus);
        User saved = userRepository.save(user);
        return toDto(saved);
    }

    @Transactional
    public UserDto updateProfile(String firstName, String lastName) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        if (firstName != null && !firstName.isBlank()) user.setFirstName(firstName.trim());
        if (lastName != null && !lastName.isBlank()) user.setLastName(lastName.trim());

        User saved = userRepository.save(user);
        return toDto(saved);
    }

    private UserDto toDto(User user) {
        UUID orgId = null;
        String orgName = null;

        List<OrganizationMembership> memberships = membershipRepository.findByUserIdWithOrganization(user.getId());
        if (!memberships.isEmpty()) {
            OrganizationMembership primary = memberships.get(0);
            orgId = primary.getOrganization().getId();
            orgName = primary.getOrganization().getName();
        }

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .role(user.getRole())
                .status(user.getStatus())
                .organizationId(orgId)
                .organizationName(orgName)
                .build();
    }
}
