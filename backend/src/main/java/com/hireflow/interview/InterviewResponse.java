package com.hireflow.interview;

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
public class InterviewResponse {
    private UUID id;
    private UUID applicationId;
    private UUID jobId;
    private String jobTitle;
    private UUID candidateProfileId;
    private String candidateName;
    private String candidateEmail;
    private UUID organizationId;
    private String organizationName;
    private String interviewerName;
    private String title;
    private InterviewType interviewType;
    private Instant scheduledStart;
    private Instant scheduledEnd;
    private String timezone;
    private String meetingLink;
    private String location;
    private InterviewStatus status;
    private String notes;
    private InterviewFeedbackResponse feedback;
    private Instant createdAt;

    public static InterviewResponse fromEntity(Interview interview) {
        return InterviewResponse.builder()
                .id(interview.getId())
                .applicationId(interview.getApplication().getId())
                .jobId(interview.getApplication().getJob().getId())
                .jobTitle(interview.getApplication().getJob().getTitle())
                .candidateProfileId(interview.getApplication().getCandidateProfile().getId())
                .candidateName(interview.getApplication().getCandidateProfile().getUser().getFullName())
                .candidateEmail(interview.getApplication().getCandidateProfile().getUser().getEmail())
                .organizationId(interview.getOrganization().getId())
                .organizationName(interview.getOrganization().getName())
                .interviewerName(interview.getInterviewer() != null ? interview.getInterviewer().getFullName() : "Interviewer")
                .title(interview.getTitle())
                .interviewType(interview.getInterviewType())
                .scheduledStart(interview.getScheduledStart())
                .scheduledEnd(interview.getScheduledEnd())
                .timezone(interview.getTimezone())
                .meetingLink(interview.getMeetingLink())
                .location(interview.getLocation())
                .status(interview.getStatus())
                .notes(interview.getNotes())
                .feedback(interview.getFeedback() != null ? InterviewFeedbackResponse.fromEntity(interview.getFeedback()) : null)
                .createdAt(interview.getCreatedAt())
                .build();
    }
}
