package medlink.backend.service.notification;

/**
 * Interface for notification services.
 * Defines contract for sending notifications through various channels.
 */
public interface INotificationService {
    
    /**
     * Send a notification to a recipient.
     * 
     * @param recipient The recipient identifier (email, phone number, or device token)
     * @param subject The subject or title of the notification
     * @param message The message content
     * @return true if notification sent successfully, false otherwise
     */
    boolean send(String recipient, String subject, String message);
    
    /**
     * Get the type of notification service.
     * 
     * @return The notification type (e.g., "EMAIL", "SMS", "PUSH")
     */
    String getType();
}
