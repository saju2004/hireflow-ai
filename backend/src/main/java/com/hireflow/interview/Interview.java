package com.hireflow.interview;

import com.hireflow.application.Application;
import com.hireflow.organization.Organization;
import com.hireflow.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id", nullable = false)
    private User interviewer;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_type", nullable = false)
    private InterviewType interviewType;

    @Column(name = "scheduled_start", nullable = false)
    private Instant scheduledStart;

    @Column(name = "scheduled_end", nullable = false)
    private Instant scheduledEnd;

    @Column(length = 50)
    @Builder.Default
    private String timezone = "UTC";

    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToOne(mappedBy = "interview", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private InterviewFeedback feedback;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
