package medlink.backend.controller;

import medlink.backend.entity.Appointment;
import medlink.backend.entity.Payment;
import medlink.backend.repository.AppointmentRepository;
import medlink.backend.repository.PaymentRepository;
import medlink.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest req) {
        try {
            Appointment appt = appointmentRepository.findById(req.getAppointmentId())
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            Payment payment = new Payment();
            payment.setAppointment(appt);
            payment.setAmount(new BigDecimal(req.getAmount()));
            payment.setProvider(req.getProvider());
            payment.setTransactionId(req.getTransactionId());
            payment.setPaymentStatus("COMPLETED");
            payment.setPaidAt(LocalDateTime.now());

            paymentRepository.save(payment);

            // update appointment status to CONFIRMED
            appt.setStatus("CONFIRMED");
            appointmentRepository.save(appt);

            // send payment confirmation email to patient
            try {
                String details = String.format("Amount: %s\nTransaction: %s\nAppointment ID: %d", req.getAmount(), req.getTransactionId(), appt.getId());
                emailService.sendPaymentConfirmation(appt.getPatient().getEmail(), details);
            } catch (Exception ex) {
                System.err.println("Failed to send payment email: " + ex.getMessage());
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("paymentId", payment.getId());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{ put("message", e.getMessage()); }});
        }
    }

    public static class PaymentRequest {
        private Long appointmentId;
        private String amount;
        private String provider;
        private String transactionId;

        public Long getAppointmentId() { return appointmentId; }
        public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
        public String getAmount() { return amount; }
        public void setAmount(String amount) { this.amount = amount; }
        public String getProvider() { return provider; }
        public void setProvider(String provider) { this.provider = provider; }
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    }
}
