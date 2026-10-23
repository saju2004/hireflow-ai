package com.hireflow.resume;

import com.hireflow.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@Tag(name = "Resumes", description = "Resume Upload, Parsing & Streaming")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Upload and parse a new resume (PDF or DOCX)")
    public ResponseEntity<ApiResponse<ResumeResponse>> uploadResume(@RequestParam("file") MultipartFile file) {
        ResumeResponse response = resumeService.uploadResume(file);
        return ResponseEntity.ok(ApiResponse.success("Resume uploaded and parsed successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get all resumes uploaded by the current candidate")
    public ResponseEntity<ApiResponse<List<ResumeResponse>>> getMyResumes() {
        return ResponseEntity.ok(ApiResponse.success(resumeService.getMyResumes()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get resume details by ID")
    public ResponseEntity<ApiResponse<ResumeResponse>> getResumeById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.getResumeById(id)));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download resume file as controlled stream")
    public ResponseEntity<Resource> downloadResume(@PathVariable UUID id) {
        ResumeResponse resume = resumeService.getResumeById(id);
        Resource file = resumeService.getResumeFileResource(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(resume.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resume.getFileName() + "\"")
                .body(file);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Delete an uploaded resume")
    public ResponseEntity<ApiResponse<Void>> deleteResume(@PathVariable UUID id) {
        resumeService.deleteResume(id);
        return ResponseEntity.ok(ApiResponse.success("Resume deleted successfully", null));
    }
}
