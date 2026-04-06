package medlink.backend.service;

import medlink.backend.entity.Appointment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;

/**
 * Strategy: Schedule appointment for next Monday at 10:00 AM.
 * Useful for recurring weekly check-ups.
 */
public class WeeklyPatternStrategy implements IAppointmentSchedulingStrategy {
    
    private static final Logger logger = LoggerFactory.getLogger(WeeklyPatternStrategy.class);
    
    @Override
    public void schedule(Appointment appointment) {
        // Find next Monday
        LocalDate nextMonday = LocalDate.now()
            .with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        
        LocalTime morningSlot = LocalTime.of(10, 0);
        
        appointment.setAppointmentDate(nextMonday);
        appointment.setAppointmentTime(morningSlot);
        appointment.setStatus("PENDING");
        
        logger.info("Scheduled appointment for next Monday: {}", nextMonday);
    }
}
