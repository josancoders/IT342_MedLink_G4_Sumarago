package medlink.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Email notification service implementation.
 * Sends notifications via email.
 */
@Component
public class EmailNotificationService implements INotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);
    
    @Override
    public boolean send(String recipient, String subject, String message) {
        try {
            logger.info("Sending email to: {} with subject: {}", recipient, subject);
            
            // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
            // Example: sendGridService.send(recipient, subject, message);
            
            logger.info("Email sent successfully to: {}", recipient);
            return true;
            
        } catch (Exception e) {
            logger.error("Failed to send email to: {}", recipient, e);
            return false;
        }
    }
    
    @Override
    public String getType() {
        return "EMAIL";
    }
}
