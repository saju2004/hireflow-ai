package com.hireflow.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    Optional<Application> findByJobIdAndCandidateProfileId(UUID jobId, UUID candidateProfileId);

    boolean existsByJobIdAndCandidateProfileId(UUID jobId, UUID candidateProfileId);

    List<Application> findByCandidateProfileIdOrderByAppliedAtDesc(UUID candidateProfileId);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH a.candidateProfile cp JOIN FETCH cp.user " +
           "WHERE j.organization.id = :orgId " +
           "AND (:jobId IS NULL OR j.id = :jobId) " +
           "AND (:status IS NULL OR a.status = :status)")
    Page<Application> findRecruiterApplications(@Param("orgId") UUID orgId,
                                                @Param("jobId") UUID jobId,
                                                @Param("status") ApplicationStatus status,
                                                Pageable pageable);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH a.candidateProfile cp JOIN FETCH cp.user " +
           "WHERE j.organization.id = :orgId")
    List<Application> findAllByOrganizationId(@Param("orgId") UUID orgId);

    long countByJobId(UUID jobId);
    long countByJobOrganizationId(UUID orgId);
    long countByJobOrganizationIdAndStatus(UUID orgId, ApplicationStatus status);
}
