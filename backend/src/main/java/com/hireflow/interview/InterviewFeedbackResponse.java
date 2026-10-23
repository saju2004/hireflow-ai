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
public class InterviewFeedbackResponse {
    private UUID id;
    private UUID interviewId;
    private String interviewerName;
    private Integer overallRating;
    private Integer technicalRating;
    private Integer communicationRating;
    private Integer cultureFitRating;
    private String strengths;
    private String weaknesses;
    private Recommendation recommendation;
    private Instant submittedAt;

    public static InterviewFeedbackResponse fromEntity(InterviewFeedback feedback) {
        return InterviewFeedbackResponse.builder()
                .id(feedback.getId())
                .interviewId(feedback.getInterview().getId())
                .interviewerName(feedback.getInterviewer() != null ? feedback.getInterviewer().getFullName() : "Interviewer")
                .overallRating(feedback.getOverallRating())
                .technicalRating(feedback.getTechnicalRating())
                .communicationRating(feedback.getCommunicationRating())
                .cultureFitRating(feedback.getCultureFitRating())
                .strengths(feedback.getStrengths())
                .weaknesses(feedback.getWeaknesses())
                .recommendation(feedback.getRecommendation())
                .submittedAt(feedback.getSubmittedAt())
                .build();
    }
}
