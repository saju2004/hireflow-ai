package com.hireflow.organization;

import com.hireflow.common.ResourceNotFoundException;
import com.hireflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public OrganizationResponse getCurrentOrganization() {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));

        return OrganizationResponse.fromEntity(org);
    }

    @Transactional
    public OrganizationResponse updateCurrentOrganization(UpdateOrganizationRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));

        if (request.getName() != null && !request.getName().isBlank()) {
            org.setName(request.getName().trim());
        }
        if (request.getDomain() != null) {
            org.setDomain(request.getDomain().trim());
        }
        if (request.getLogoUrl() != null) {
            org.setLogoUrl(request.getLogoUrl().trim());
        }

        Organization saved = organizationRepository.save(org);
        return OrganizationResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponse> getAllOrganizationsForAdmin() {
        return organizationRepository.findAll().stream()
                .map(OrganizationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrganizationResponse toggleOrganizationStatus(UUID id, OrganizationStatus status) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + id));

        org.setStatus(status);
        Organization saved = organizationRepository.save(org);
        return OrganizationResponse.fromEntity(saved);
    }
}
