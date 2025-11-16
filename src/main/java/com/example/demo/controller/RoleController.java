package com.example.demo.controller;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Slf4j
public class RoleController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    /**
     * Assign role to user (Temporary - for setup only)
     * In production, this should be admin-only
     */
    @PostMapping("/assign")
    public ResponseEntity<?> assignRole(
            @RequestParam Long userId,
            @RequestParam String roleName
    ) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

            user.getRoles().add(role);
            userRepository.save(user);

            log.info("Assigned role {} to user {}", roleName, userId);

            return ResponseEntity.ok(Map.of(
                    "message", "Role assigned successfully",
                    "userId", userId,
                    "roleName", roleName,
                    "currentRoles", user.getRoles().stream()
                            .map(Role::getName)
                            .toList()
            ));
        } catch (Exception e) {
            log.error("Failed to assign role: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all available roles
     */
    @GetMapping
    public ResponseEntity<?> getAllRoles() {
        return ResponseEntity.ok(roleRepository.findAll());
    }
}

