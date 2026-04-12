package medlink.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

/**
 * Factory for payment processors.
 * 
 * ADAPTER PATTERN - Factory
 * Creates appropriate payment processor adapter based on provider name.
 * 
 * Usage:
 *   IPaymentProcessor processor = factory.getPaymentProcessor("STRIPE");
 *   String transactionId = processor.processPayment(amount, currency, token);
 */
@Component
public class PaymentProcessorFactory {
    
    private final Map<String, IPaymentProcessor> processors;
    private final String defaultProvider;
    
    @Autowired
    public PaymentProcessorFactory(
            @Value("${medlink.payment.default-provider:STRIPE}") String defaultProvider) {
        
        this.defaultProvider = defaultProvider;
        processors = new HashMap<>();
        processors.put("STRIPE", new StripePaymentAdapter());
        processors.put("PAYPAL", new PayPalPaymentAdapter());
    }
    
    /**
     * Get a payment processor by provider name.
     * 
     * @param provider The provider name (e.g., "STRIPE", "PAYPAL")
     * @return The payment processor
     */
    public IPaymentProcessor getPaymentProcessor(String provider) {
        IPaymentProcessor processor = processors.get(provider);
        if (processor == null) {
            throw new IllegalArgumentException("Unknown payment provider: " + provider);
        }
        return processor;
    }
    
    /**
     * Get the default payment processor.
     * 
     * @return The default payment processor
     */
    public IPaymentProcessor getDefaultPaymentProcessor() {
        return getPaymentProcessor(defaultProvider);
    }
    
    /**
     * Get all available payment providers.
     * 
     * @return Set of available provider names
     */
    public java.util.Set<String> getAvailableProviders() {
        return processors.keySet();
    }
}
