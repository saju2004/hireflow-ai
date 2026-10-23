package com.hireflow.resume;

import com.hireflow.common.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

class ResumeTextExtractorTest {

    private ResumeTextExtractor extractor;

    @BeforeEach
    void setUp() {
        extractor = new ResumeTextExtractor();
    }

    @Test
    @DisplayName("Empty file upload must be rejected with BadRequestException")
    void testEmptyFileRejected() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> extractor.extractText(emptyFile));
        assertTrue(ex.getMessage().contains("empty"));
    }

    @Test
    @DisplayName("Unsupported file extension or signature must be rejected")
    void testUnsupportedFormatRejected() {
        MockMultipartFile exeFile = new MockMultipartFile(
                "file", "malicious.exe", "application/octet-stream", "MZ\0\0\0\0dummy".getBytes()
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> extractor.extractText(exeFile));
        assertTrue(ex.getMessage().contains("Only PDF and DOCX"));
    }
}
