package com.hireflow.user;

import com.hireflow.auth.UserDto;
import com.hireflow.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User Management & Admin Controls")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    @Operation(summary = "List all platform users (Platform Admin)")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    @Operation(summary = "Suspend or reactivate user account (Platform Admin)")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(@PathVariable UUID id, @RequestParam UserStatus status) {
        return ResponseEntity.ok(ApiResponse.success("User status updated", userService.toggleUserStatus(id, status)));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update personal user profile names")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@RequestBody Map<String, String> request) {
        String firstName = request.get("firstName");
        String lastName = request.get("lastName");
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateProfile(firstName, lastName)));
    }
}
