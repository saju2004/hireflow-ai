package com.hireflow.resume;

import com.hireflow.common.BadRequestException;
import com.hireflow.common.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${hireflow.storage.upload-dir:./storage/resumes}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        try {
            this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public String storeFile(MultipartFile file, UUID profileId) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.contains("..")) {
            throw new BadRequestException("Invalid file name format");
        }

        String extension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i);
        }

        String storageFilename = UUID.randomUUID().toString() + extension;
        Path profileDirectory = this.rootLocation.resolve(profileId.toString());

        try {
            Files.createDirectories(profileDirectory);
            Path targetLocation = profileDirectory.resolve(storageFilename);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            return profileId.toString() + "/" + storageFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file: " + originalFilename, ex);
        }
    }

    public Resource loadFileAsResource(String storageKey) {
        try {
            Path filePath = this.rootLocation.resolve(storageKey).normalize();

            // Prevent path traversal
            if (!filePath.startsWith(this.rootLocation)) {
                throw new BadRequestException("Cannot access file outside current directory");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + storageKey);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + storageKey);
        }
    }

    public void deleteFile(String storageKey) {
        try {
            Path filePath = this.rootLocation.resolve(storageKey).normalize();
            if (filePath.startsWith(this.rootLocation)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ignored) {
        }
    }
}
