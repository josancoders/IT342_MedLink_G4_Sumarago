package medlink.backend.service;

import medlink.backend.entity.Appointment;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

/**
 * Context for appointment scheduling strategies.
 * 
 * STRATEGY PATTERN - Context Class
 * Selects and executes the appropriate scheduling strategy at runtime.
 * 
 * Usage:
 *   context.setSchedulingStrategy("IMMEDIATE");
 *   context.scheduleAppointment(appointment);
 */
@Component
public class AppointmentSchedulingContext {
    
    private final Map<String, IAppointmentSchedulingStrategy> strategies;
    private IAppointmentSchedulingStrategy currentStrategy;
    
    public AppointmentSchedulingContext() {
        strategies = new HashMap<>();
        strategies.put("IMMEDIATE", new ImmediateSlotStrategy());
        strategies.put("PREFERRED_DATE", new PreferredDateStrategy());
        strategies.put("WEEKLY_PATTERN", new WeeklyPatternStrategy());
    }
    
    /**
     * Set the scheduling strategy to use.
     * 
     * @param strategyName The name of the strategy
     */
    public void setSchedulingStrategy(String strategyName) {
        currentStrategy = strategies.get(strategyName);
        if (currentStrategy == null) {
            throw new IllegalArgumentException("Unknown strategy: " + strategyName);
        }
    }
    
    /**
     * Schedule an appointment using the current strategy.
     * 
     * @param appointment The appointment to schedule
     */
    public void scheduleAppointment(Appointment appointment) {
        if (currentStrategy == null) {
            throw new IllegalStateException("Strategy not set. Call setSchedulingStrategy first.");
        }
        currentStrategy.schedule(appointment);
    }
    
    /**
     * Get available strategies.
     * 
     * @return Set of available strategy names
     */
    public java.util.Set<String> getAvailableStrategies() {
        return strategies.keySet();
    }
}
