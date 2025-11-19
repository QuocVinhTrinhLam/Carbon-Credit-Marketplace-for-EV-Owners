package com.example.demo.controller;

import com.example.demo.service.AIChatService;
import com.example.demo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final AIChatService aiChatService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> chat(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body
    ) {

        String message = body.getOrDefault("message", "").trim();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("reply", "⚠ Token không hợp lệ hoặc chưa đăng nhập"));
        }

        String token = authHeader.substring(7);

        Long userId = jwtUtil.extractUserId(token);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("reply", "⚠ Token không hợp lệ"));
        }

        log.info("User {} hỏi: {}", userId, message);

        String reply = aiChatService.ask(message);

        log.info("AI trả lời: {}", reply);

        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
