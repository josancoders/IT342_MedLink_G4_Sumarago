package medlink.backend.service;

import medlink.backend.entity.Appointment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Strategy: Schedule appointment as soon as possible.
 * Books for today at 9:00 AM.
 */
public class ImmediateSlotStrategy implements IAppointmentSchedulingStrategy {
    
    private static final Logger logger = LoggerFactory.getLogger(ImmediateSlotStrategy.class);
    
    @Override
    public void schedule(Appointment appointment) {
        LocalDate today = LocalDate.now();
        LocalTime morningSlot = LocalTime.of(9, 0);
        
        appointment.setAppointmentDate(today);
        appointment.setAppointmentTime(morningSlot);
        appointment.setStatus("CONFIRMED");
        
        logger.info("Scheduled appointment immediately for {}", today);
    }
}
