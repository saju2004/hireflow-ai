package com.hireflow.common;

public class TenantAccessDeniedException extends RuntimeException {
    public TenantAccessDeniedException(String message) {
        super(message);
    }
}
