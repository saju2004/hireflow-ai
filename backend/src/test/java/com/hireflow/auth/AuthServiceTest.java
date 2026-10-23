package com.hireflow.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthServiceTest {

    @Test
    void testBcryptHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("password123");
        System.out.println("GENERATED_BCRYPT_HASH: " + hash);
        assertTrue(encoder.matches("password123", hash));
    }
}
