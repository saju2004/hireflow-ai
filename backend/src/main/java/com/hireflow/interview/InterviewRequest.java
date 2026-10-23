package com.hireflow.interview;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRequest {

    @NotNull(message = "Application ID is required")
    private UUID applicationId;

    @NotBlank(message = "Interview title is required")
    private String title;

    @NotNull(message = "Interview type is required")
    private InterviewType interviewType;

    @NotNull(message = "Start time is required")
    private Instant scheduledStart;

    @NotNull(message = "End time is required")
    private Instant scheduledEnd;

    private String timezone;

    private String meetingLink;

    private String location;

    private String notes;
}
