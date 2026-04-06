package medlink.backend.service;

import medlink.backend.entity.Appointment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Strategy: Schedule appointment on patient's preferred date.
 * Defaults to 7 days from now at 2:00 PM if no preference specified.
 */
public class PreferredDateStrategy implements IAppointmentSchedulingStrategy {
    
    private static final Logger logger = LoggerFactory.getLogger(PreferredDateStrategy.class);
    private static final int DEFAULT_DAYS_AHEAD = 7;
    
    @Override
    public void schedule(Appointment appointment) {
        LocalDate preferredDate;
        
        // Use appointment's preferred date if set, otherwise default to 7 days out
        if (appointment.getPreferredDate() != null) {
            preferredDate = appointment.getPreferredDate();
        } else {
            preferredDate = LocalDate.now().plusDays(DEFAULT_DAYS_AHEAD);
        }
        
        LocalTime afternoonSlot = LocalTime.of(14, 0);
        
        appointment.setAppointmentDate(preferredDate);
        appointment.setAppointmentTime(afternoonSlot);
        appointment.setStatus("PENDING");
        
        logger.info("Scheduled appointment for preferred date: {}", preferredDate);
    }
}
