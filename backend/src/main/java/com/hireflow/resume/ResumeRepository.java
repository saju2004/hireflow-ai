package com.hireflow.resume;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    List<Resume> findByCandidateProfileIdOrderByCreatedAtDesc(UUID candidateProfileId);
    Optional<Resume> findByIdAndCandidateProfileId(UUID id, UUID candidateProfileId);
}
