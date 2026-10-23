package com.hireflow.job;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

    Page<Job> findByOrganizationId(UUID organizationId, Pageable pageable);

    Optional<Job> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Optional<Job> findBySlugAndStatus(String slug, JobStatus status);

    @Query("SELECT j FROM Job j JOIN FETCH j.organization WHERE j.status = 'PUBLISHED' " +
           "AND (:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:workplaceType IS NULL OR j.workplaceType = :workplaceType) " +
           "AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) " +
           "AND (:employmentType IS NULL OR j.employmentType = :employmentType)")
    Page<Job> searchPublishedJobs(@Param("search") String search,
                                  @Param("location") String location,
                                  @Param("workplaceType") WorkplaceType workplaceType,
                                  @Param("experienceLevel") ExperienceLevel experienceLevel,
                                  @Param("employmentType") EmploymentType employmentType,
                                  Pageable pageable);

    long countByOrganizationIdAndStatus(UUID organizationId, JobStatus status);
    long countByOrganizationId(UUID organizationId);
}
