package medlink.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendRegistrationEmail(String to, String name) {
        String subject = "Welcome to MedLink";
        String text = String.format("Hi %s,\n\nWelcome to MedLink! Your account has been successfully created.\n\nRegards,\nMedLink Team", name != null ? name : "");
        sendSimpleMessage(to, subject, text);
    }

    public void sendPaymentConfirmation(String to, String details) {
        String subject = "Booking and Payment Successful";
        String text = String.format("Hi,\n\nYour booking and payment were successful. Please proceed to the hospital on your scheduled appointment date and time.\n\nPayment details:\n%s\n\nThank you,\nMedLink Team", details != null ? details : "N/A");
        sendSimpleMessage(to, subject, text);
    }

    public void sendAppointmentConfirmation(String to, String appointmentInfo) {
        String subject = "Appointment Booking Successful";
        String text = String.format("Hi,\n\nYour appointment booking is successful. Please proceed to the hospital for your scheduled appointment.\n\nAppointment details:\n%s\n\nRegards,\nMedLink Team", appointmentInfo != null ? appointmentInfo : "N/A");
        sendSimpleMessage(to, subject, text);
    }

    private void sendSimpleMessage(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            if (fromAddress != null && !fromAddress.isBlank()) {
                message.setFrom(fromAddress);
            }
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception ex) {
            // Log and swallow so email errors do not break main flow
            System.err.println("Failed to send email to " + to + ": " + ex.getMessage());
        }
    }
}
