package com.hireflow.application;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationEventRepository extends JpaRepository<ApplicationEvent, UUID> {
    @Query("SELECT e FROM ApplicationEvent e LEFT JOIN FETCH e.actor WHERE e.application.id = :applicationId ORDER BY e.createdAt ASC")
    List<ApplicationEvent> findByApplicationIdOrderByCreatedAtAsc(@Param("applicationId") UUID applicationId);
}
