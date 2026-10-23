package com.hireflow.job;

import com.hireflow.common.ApiResponse;
import com.hireflow.common.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/jobs")
@RequiredArgsConstructor
@Tag(name = "Public Jobs", description = "Public Candidate Job Search & Discovery")
public class PublicJobController {

    private final JobService jobService;

    @GetMapping
    @Operation(summary = "Search and filter all published jobs")
    public ResponseEntity<ApiResponse<PagedResponse<JobResponse>>> searchJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) WorkplaceType workplaceType,
            @RequestParam(required = false) ExperienceLevel experienceLevel,
            @RequestParam(required = false) EmploymentType employmentType,
            @PageableDefault(size = 12, sort = "publishedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        PagedResponse<JobResponse> results = jobService.searchPublicJobs(search, location, workplaceType, experienceLevel, employmentType, pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get published job details by public slug")
    public ResponseEntity<ApiResponse<JobResponse>> getJobBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getPublicJobBySlug(slug)));
    }
}
