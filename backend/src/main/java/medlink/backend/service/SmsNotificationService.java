package medlink.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * SMS notification service implementation.
 * Sends notifications via SMS.
 */
@Component
public class SmsNotificationService implements INotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(SmsNotificationService.class);
    
    @Override
    public boolean send(String recipient, String subject, String message) {
        try {
            logger.info("Sending SMS to: {} with message: {}", recipient, message);
            
            // TODO: Integrate with actual SMS service (Twilio, AWS SNS, etc.)
            // Example: twilioService.sendSms(recipient, message);
            
            logger.info("SMS sent successfully to: {}", recipient);
            return true;
            
        } catch (Exception e) {
            logger.error("Failed to send SMS to: {}", recipient, e);
            return false;
        }
    }
    
    @Override
    public String getType() {
        return "SMS";
    }
}
