package com.example.demo.controller;

import com.example.demo.entity.FileMetadata; // Import entity
import com.example.demo.repository.FileMetadataRepository; // Import repository
import org.springframework.beans.factory.annotation.Autowired; // Import Autowired
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime; // Import time

@RestController
@RequestMapping("/api")
public class FileUploadController {

    private final FileMetadataRepository fileMetadataRepository;

    @Autowired
    public FileUploadController(FileMetadataRepository fileMetadataRepository) {
        this.fileMetadataRepository = fileMetadataRepository;
    }

    /**
     * Endpoint để upload file minh chứng cho một Yêu cầu phát hành tín chỉ.
     * @param file File được upload
     * @param requestId ID của CreditIssuanceRequest
     * @param userId ID của người upload (EV Owner)
     * @return ResponseEntity
     */
    @PostMapping("/upload/request/{requestId}")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @PathVariable Long requestId,
            @RequestParam("userId") Long userId) { // Tạm thời lấy userId qua param

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ File is empty");
        }

        try {
            // Thư mục lưu file tạm thời trong container
            String uploadDir = "/tmp/uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Tạo tên file duy nhất để tránh ghi đè (ví dụ: timestamp + tên gốc)
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String uniqueFilename = System.currentTimeMillis() + "_" + originalFilename;
            String filePath = uploadDir + uniqueFilename;
            
            File destination = new File(filePath);

            // 1. Lưu file vật lý
            file.transferTo(destination);

            // 2. Lưu thông tin metadata vào Database
            FileMetadata metadata = new FileMetadata();
            metadata.setFilename(uniqueFilename); // Lưu tên file duy nhất
            metadata.setFileType(file.getContentType());
            metadata.setFileSize(file.getSize());
            metadata.setFilePath(destination.getAbsolutePath()); // Lưu đường dẫn tuyệt đối trong container
            metadata.setUploadedAt(LocalDateTime.now());
            metadata.setUploadedBy(userId); // Gán userId
            metadata.setCreditRequestId(requestId); // Gán requestId

            fileMetadataRepository.save(metadata); // Lưu vào DB

            return ResponseEntity.ok("File uploaded and metadata saved: " + destination.getAbsolutePath());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("File upload failed: " + e.getMessage());
        }
    }
}