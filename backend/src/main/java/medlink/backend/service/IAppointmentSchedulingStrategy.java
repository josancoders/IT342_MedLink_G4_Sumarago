package medlink.backend.service;

import medlink.backend.entity.Appointment;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Interface for appointment scheduling strategies.
 * 
 * STRATEGY PATTERN - Behavioral Pattern
 * Problem: Multiple scheduling algorithms mixed in one method
 * Solution: Each algorithm becomes a separate strategy class
 */
public interface IAppointmentSchedulingStrategy {
    
    /**
     * Schedule an appointment using the specific strategy.
     * 
     * @param appointment The appointment to schedule
     */
    void schedule(Appointment appointment);
}
