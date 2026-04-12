package medlink.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

/**
 * Factory for creating notification services.
 * 
 * FACTORY PATTERN - Creational Pattern
 * Problem: Creating notification services requires knowledge of concrete classes
 * Solution: Factory centralizes creation and returns appropriate service by type
 * 
 * Usage:
 *   INotificationService emailService = factory.getNotificationService("EMAIL");
 *   emailService.send("user@example.com", "Subject", "Message");
 */
@Component
public class NotificationFactory {
    
    private final Map<String, INotificationService> notificationServices;
    
    @Autowired
    public NotificationFactory(
            EmailNotificationService emailService,
            SmsNotificationService smsService,
            PushNotificationService pushService) {
        
        notificationServices = new HashMap<>();
        notificationServices.put(emailService.getType(), emailService);
        notificationServices.put(smsService.getType(), smsService);
        notificationServices.put(pushService.getType(), pushService);
    }
    
    /**
     * Get a notification service by type.
     * 
     * @param type The notification type (e.g., "EMAIL", "SMS", "PUSH")
     * @return The notification service instance
     */
    public INotificationService getNotificationService(String type) {
        return notificationServices.get(type);
    }
    
    /**
     * Get all available notification service types.
     * 
     * @return Set of available notification types
     */
    public java.util.Set<String> getAvailableTypes() {
        return notificationServices.keySet();
    }
}
