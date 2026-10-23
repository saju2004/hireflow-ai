package com.hireflow.application;

public enum ApplicationStatus {
    APPLIED,
    SCREENING,
    SHORTLISTED,
    INTERVIEW,
    OFFER,
    HIRED,
    REJECTED,
    WITHDRAWN;

    public boolean canTransitionTo(ApplicationStatus target) {
        if (this == target) return true;
        if (this == HIRED || this == WITHDRAWN) {
            return false; // Terminal states
        }
        if (target == REJECTED || target == WITHDRAWN) {
            return true; // Can reject or withdraw from almost any active state
        }
        return switch (this) {
            case APPLIED -> target == SCREENING || target == SHORTLISTED || target == REJECTED;
            case SCREENING -> target == SHORTLISTED || target == INTERVIEW || target == REJECTED;
            case SHORTLISTED -> target == INTERVIEW || target == OFFER || target == REJECTED;
            case INTERVIEW -> target == OFFER || target == REJECTED || target == SHORTLISTED;
            case OFFER -> target == HIRED || target == REJECTED;
            case REJECTED -> target == SCREENING; // Re-evaluate candidate
            default -> false;
        };
    }
}
