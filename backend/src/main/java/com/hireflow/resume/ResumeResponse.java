package com.hireflow.resume;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponse {
    private UUID id;
    private UUID candidateProfileId;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private String rawText;
    private ParsingStatus parsingStatus;
    private String errorMessage;
    private List<ResumeSkillDto> skills;
    private Instant createdAt;

    public static ResumeResponse fromEntity(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .candidateProfileId(resume.getCandidateProfile().getId())
                .fileName(resume.getFileName())
                .contentType(resume.getContentType())
                .fileSize(resume.getFileSize())
                .rawText(resume.getRawText())
                .parsingStatus(resume.getParsingStatus())
                .errorMessage(resume.getErrorMessage())
                .skills(resume.getSkills() != null
                        ? resume.getSkills().stream().map(ResumeSkillDto::fromEntity).collect(Collectors.toList())
                        : List.of())
                .createdAt(resume.getCreatedAt())
                .build();
    }
}
