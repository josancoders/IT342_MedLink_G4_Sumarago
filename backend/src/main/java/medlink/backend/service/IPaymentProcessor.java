package medlink.backend.service;

import java.math.BigDecimal;

/**
 * Unified interface for payment processing.
 * 
 * ADAPTER PATTERN - Target Interface
 * Problem: Different payment providers have different APIs
 * Solution: Adapters implement this unified interface
 */
public interface IPaymentProcessor {
    
    /**
     * Process a payment through the provider.
     * 
     * @param amount The payment amount
     * @param currency The currency code (e.g., "USD")
     * @param token The payment token/card token
     * @return Transaction ID from the provider
     */
    String processPayment(BigDecimal amount, String currency, String token);
    
    /**
     * Refund a payment.
     * 
     * @param transactionId The original transaction ID
     * @param amount The refund amount
     * @return true if refund successful, false otherwise
     */
    boolean refundPayment(String transactionId, BigDecimal amount);
}
