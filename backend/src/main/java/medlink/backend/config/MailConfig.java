package medlink.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Provides a default JavaMailSender bean when no mail properties are configured.
 * This prevents application startup failure in development when SMTP is not set up.
 */
@Configuration
public class MailConfig {

    @Bean
    @ConditionalOnMissingBean(JavaMailSender.class)
    public JavaMailSender javaMailSender() {
        // JavaMailSenderImpl can be used without host configuration; sending will
        // simply fail at runtime, but EmailService swallows exceptions.
        return new JavaMailSenderImpl();
    }
}
