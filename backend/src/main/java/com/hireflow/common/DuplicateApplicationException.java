package com.hireflow.common;

public class DuplicateApplicationException extends RuntimeException {
    public DuplicateApplicationException(String message) {
        super(message);
    }
}
