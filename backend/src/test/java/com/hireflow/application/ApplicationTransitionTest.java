package com.hireflow.application;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationTransitionTest {

    @Test
    @DisplayName("Valid pipeline progression transitions should be permitted")
    void testValidProgression() {
        assertTrue(ApplicationStatus.APPLIED.canTransitionTo(ApplicationStatus.SCREENING));
        assertTrue(ApplicationStatus.SCREENING.canTransitionTo(ApplicationStatus.SHORTLISTED));
        assertTrue(ApplicationStatus.SHORTLISTED.canTransitionTo(ApplicationStatus.INTERVIEW));
        assertTrue(ApplicationStatus.INTERVIEW.canTransitionTo(ApplicationStatus.OFFER));
        assertTrue(ApplicationStatus.OFFER.canTransitionTo(ApplicationStatus.HIRED));
    }

    @Test
    @DisplayName("Rejection and Withdrawal should be permitted from active stages")
    void testRejectionAndWithdrawal() {
        assertTrue(ApplicationStatus.APPLIED.canTransitionTo(ApplicationStatus.REJECTED));
        assertTrue(ApplicationStatus.SCREENING.canTransitionTo(ApplicationStatus.REJECTED));
        assertTrue(ApplicationStatus.INTERVIEW.canTransitionTo(ApplicationStatus.REJECTED));
        assertTrue(ApplicationStatus.OFFER.canTransitionTo(ApplicationStatus.REJECTED));

        assertTrue(ApplicationStatus.APPLIED.canTransitionTo(ApplicationStatus.WITHDRAWN));
        assertTrue(ApplicationStatus.INTERVIEW.canTransitionTo(ApplicationStatus.WITHDRAWN));
    }

    @Test
    @DisplayName("Invalid or skipping transitions should be rejected")
    void testInvalidTransitions() {
        // Direct jump from APPLIED to HIRED is disallowed without offer
        assertFalse(ApplicationStatus.APPLIED.canTransitionTo(ApplicationStatus.HIRED));
        assertFalse(ApplicationStatus.APPLIED.canTransitionTo(ApplicationStatus.OFFER));

        // Terminal states cannot transition to active states
        assertFalse(ApplicationStatus.HIRED.canTransitionTo(ApplicationStatus.APPLIED));
        assertFalse(ApplicationStatus.HIRED.canTransitionTo(ApplicationStatus.INTERVIEW));
        assertFalse(ApplicationStatus.WITHDRAWN.canTransitionTo(ApplicationStatus.OFFER));
    }
}
