package com.hireflow.resume;

import com.hireflow.common.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;

@Component
public class ResumeTextExtractor {

    private static final Logger log = LoggerFactory.getLogger(ResumeTextExtractor.class);

    // Magic bytes
    private static final byte[] PDF_MAGIC = new byte[]{0x25, 0x50, 0x44, 0x46}; // %PDF
    private static final byte[] DOCX_MAGIC = new byte[]{0x50, 0x4B, 0x03, 0x04}; // PK..

    public String extractText(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        byte[] header = new byte[4];
        byte[] bytes;
        try {
            bytes = file.getBytes();
            if (bytes.length < 4) {
                throw new BadRequestException("Uploaded file is corrupted or too small");
            }
            System.arraycopy(bytes, 0, header, 0, 4);
        } catch (IOException e) {
            throw new BadRequestException("Unable to read uploaded file: " + e.getMessage());
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        if (filename.endsWith(".pdf") || Arrays.equals(header, PDF_MAGIC)) {
            return extractFromPdf(bytes);
        } else if (filename.endsWith(".docx") || Arrays.equals(header, DOCX_MAGIC)) {
            return extractFromDocx(bytes);
        } else {
            throw new BadRequestException("Unsupported file type. Only PDF and DOCX files are allowed.");
        }
    }

    private String extractFromPdf(byte[] bytes) {
        try (PDDocument document = Loader.loadPDF(bytes)) {
            if (document.isEncrypted()) {
                throw new BadRequestException("Password-protected or encrypted PDF files are not supported.");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            if (text == null || text.isBlank()) {
                log.warn("Extracted PDF text is blank (scanned or image-only document)");
                return "Resume parsed. Note: No machine-readable text was detected in the document.";
            }
            return text.trim();
        } catch (Exception e) {
            log.error("Failed to parse PDF document", e);
            throw new BadRequestException("Failed to extract text from PDF: " + e.getMessage());
        }
    }

    private String extractFromDocx(byte[] bytes) {
        try (InputStream is = new ByteArrayInputStream(bytes);
             XWPFDocument doc = new XWPFDocument(is);
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            String text = extractor.getText();
            if (text == null || text.isBlank()) {
                return "Resume parsed. Note: Document contains no text content.";
            }
            return text.trim();
        } catch (Exception e) {
            log.error("Failed to parse DOCX document", e);
            throw new BadRequestException("Failed to extract text from DOCX: " + e.getMessage());
        }
    }
}
