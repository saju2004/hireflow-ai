package com.hireflow.interview;

import com.hireflow.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "interview_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false, unique = true)
    private Interview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id", nullable = false)
    private User interviewer;

    @Column(name = "overall_rating", nullable = false)
    private Integer overallRating;

    @Column(name = "technical_rating")
    private Integer technicalRating;

    @Column(name = "communication_rating")
    private Integer communicationRating;

    @Column(name = "culture_fit_rating")
    private Integer cultureFitRating;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Recommendation recommendation;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;
}
