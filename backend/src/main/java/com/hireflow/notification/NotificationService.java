package com.hireflow.notification;

import com.hireflow.common.ResourceNotFoundException;
import com.hireflow.security.SecurityUtils;
import com.hireflow.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(User recipient, String title, String message, NotificationType type, String link) {
        Notification notification = Notification.builder()
                .user(recipient)
                .title(title)
                .message(message)
                .type(type)
                .link(link)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));

        if (!notification.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new ResourceNotFoundException("Notification not found: " + id);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        UUID userId = SecurityUtils.getCurrentUserId();
        notificationRepository.markAllAsRead(userId);
    }
}
