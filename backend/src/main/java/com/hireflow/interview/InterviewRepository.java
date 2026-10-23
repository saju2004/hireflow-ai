package com.hireflow.interview;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, UUID> {

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a JOIN FETCH a.job j JOIN FETCH a.candidateProfile cp JOIN FETCH cp.user " +
           "WHERE i.organization.id = :orgId ORDER BY i.scheduledStart DESC")
    List<Interview> findByOrganizationIdOrderByScheduledStartDesc(@Param("orgId") UUID orgId);

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a JOIN FETCH a.job j " +
           "WHERE a.candidateProfile.id = :candidateProfileId ORDER BY i.scheduledStart ASC")
    List<Interview> findByCandidateProfileId(@Param("candidateProfileId") UUID candidateProfileId);

    List<Interview> findByApplicationId(UUID applicationId);

    long countByOrganizationId(UUID organizationId);
}
