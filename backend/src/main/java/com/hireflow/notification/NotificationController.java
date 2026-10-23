package com.hireflow.notification;

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
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-App Notification Center")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user notifications and unread count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotifications() {
        List<NotificationResponse> list = notificationService.getMyNotifications();
        long unread = notificationService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.success(Map.of("notifications", list, "unreadCount", unread)));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PostMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all user notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
