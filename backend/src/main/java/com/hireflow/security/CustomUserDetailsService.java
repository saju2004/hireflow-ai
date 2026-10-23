package com.hireflow.security;

import com.hireflow.organization.OrganizationMembership;
import com.hireflow.organization.OrganizationMembershipRepository;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final OrganizationMembershipRepository membershipRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        UUID orgId = null;
        String orgName = null;

        List<OrganizationMembership> memberships = membershipRepository.findByUserIdWithOrganization(user.getId());
        if (!memberships.isEmpty()) {
            OrganizationMembership primary = memberships.get(0);
            orgId = primary.getOrganization().getId();
            orgName = primary.getOrganization().getName();
        }

        return UserPrincipal.create(user, orgId, orgName);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        UUID orgId = null;
        String orgName = null;

        List<OrganizationMembership> memberships = membershipRepository.findByUserIdWithOrganization(user.getId());
        if (!memberships.isEmpty()) {
            OrganizationMembership primary = memberships.get(0);
            orgId = primary.getOrganization().getId();
            orgName = primary.getOrganization().getName();
        }

        return UserPrincipal.create(user, orgId, orgName);
    }
}
