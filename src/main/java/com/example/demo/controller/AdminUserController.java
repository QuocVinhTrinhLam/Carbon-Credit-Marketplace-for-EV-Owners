package com.example.demo.controller;

import com.example.demo.dto.UserUpdateRequest;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.entity.UserStatusRecord;
import com.example.demo.repository.*;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.UserStatusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
public class AdminUserController {

    private final UserRepository userRepository;
    private final UserStatusRepository userStatusRepository;
    private final RoleRepository roleRepository;
    private final WalletRepository walletRepository;
    private final CarbonWalletRepository carbonWalletRepository;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body(Map.of("message", "No users found"));
        }

        List<Map<String, Object>> data = users.stream().map(u -> Map.of(
                "id", u.getId(),
                "email", u.getEmail(),
                "fullName", u.getFullName(),
                "roles", u.getRoles(),
                "createdAt", u.getCreatedAt()
        )).toList();

        return ResponseEntity.ok(Map.of(
                "message", "Fetched all users successfully",
                "total", data.size(),
                "data", data
        ));
    }

    // ✅ FIX: lỗi 500 khi get user by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            Optional<User> optionalUser = userRepository.findById(id);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            User user = optionalUser.get();

            // Tránh lỗi Lazy hoặc vòng lặp khi serialize
            Map<String, Object> userData = new LinkedHashMap<>();
            userData.put("id", user.getId());
            userData.put("email", user.getEmail());
            userData.put("fullName", user.getFullName());
            userData.put("roles", user.getRoles() != null ? user.getRoles() : List.of());
            userData.put("createdAt", user.getCreatedAt());

            return ResponseEntity.ok(Map.of(
                    "message", "Fetched user successfully",
                    "data", userData
            ));
        } catch (Exception e) {
            log.error("Error fetching user by ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Unexpected server error",
                            "details", e.getMessage()
                    ));
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        if (!userRepository.existsById(id))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        UserStatusRecord record = userStatusRepository.findByUserId(id).orElse(new UserStatusRecord());
        record.setUserId(id);
        record.setStatus("APPROVED");
        userStatusRepository.save(record);
        return ResponseEntity.ok(Map.of("message", "User approved", "id", id));
    }

    @PostMapping("/{id}/ban")
    public ResponseEntity<?> banUser(@PathVariable Long id) {
        if (!userRepository.existsById(id))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        UserStatusRecord record = userStatusRepository.findByUserId(id).orElse(new UserStatusRecord());
        record.setUserId(id);
        record.setStatus("BANNED");
        userStatusRepository.save(record);
        return ResponseEntity.ok(Map.of("message", "User banned", "id", id));
    }

    @PostMapping("/{id}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable Long id) {
        if (!userRepository.existsById(id))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        UserStatusRecord record = userStatusRepository.findByUserId(id).orElse(new UserStatusRecord());
        record.setUserId(id);
        record.setStatus("ACTIVE");
        userStatusRepository.save(record);
        return ResponseEntity.ok(Map.of("message", "User unbanned", "id", id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .<ResponseEntity<?>>map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok(Map.of("message", "User deleted", "id", id));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found")));
    }

    /**
     * Get user wallet information (both money and carbon wallets)
     */
    @GetMapping("/{id}/wallets")
    public ResponseEntity<?> getUserWallets(@PathVariable Long id) {
        try {
            var user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            var moneyWallet = walletRepository.findByUserId(id);
            var carbonWallet = carbonWalletRepository.findByOwner_Id(id);

            Map<String, Object> wallets = new HashMap<>();
            wallets.put("userId", id);
            wallets.put("moneyWallet", moneyWallet != null ? Map.of(
                    "balance", moneyWallet.getBalance(),
                    "walletId", moneyWallet.getId()
            ) : null);
            wallets.put("carbonWallet", carbonWallet.map(cw -> Map.of(
                    "balance", cw.getBalance(),
                    "walletId", cw.getId()
            )).orElse(null));

            return ResponseEntity.ok(wallets);
        } catch (Exception e) {
            log.error("Error fetching wallets for user {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Assign role to user
     */
    @PostMapping("/{id}/roles/{roleName}")
    public ResponseEntity<?> assignRole(@PathVariable Long id, @PathVariable String roleName) {
        try {
            var user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            var role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Role not found"));

            user.getRoles().add(role);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Role assigned successfully",
                    "userId", id,
                    "role", roleName
            ));
        } catch (Exception e) {
            log.error("Error assigning role: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Remove role from user
     */
    @DeleteMapping("/{id}/roles/{roleName}")
    public ResponseEntity<?> removeRole(@PathVariable Long id, @PathVariable String roleName) {
        try {
            var user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            user.getRoles().removeIf(role -> role.getName().equals(roleName));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Role removed successfully",
                    "userId", id,
                    "role", roleName
            ));
        } catch (Exception e) {
            log.error("Error removing role: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
