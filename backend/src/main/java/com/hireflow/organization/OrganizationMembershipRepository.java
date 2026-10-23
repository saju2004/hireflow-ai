package com.hireflow.organization;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationMembershipRepository extends JpaRepository<OrganizationMembership, UUID> {
    List<OrganizationMembership> findByUserId(UUID userId);

    @Query("SELECT om FROM OrganizationMembership om JOIN FETCH om.organization WHERE om.user.id = :userId")
    List<OrganizationMembership> findByUserIdWithOrganization(@Param("userId") UUID userId);

    Optional<OrganizationMembership> findByOrganizationIdAndUserId(UUID organizationId, UUID userId);
    boolean existsByOrganizationIdAndUserId(UUID organizationId, UUID userId);
}
