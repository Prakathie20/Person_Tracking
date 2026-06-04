package com.example.demo.controller;

import com.example.demo.model.Appointment;
import com.example.demo.model.Doctor;
import com.example.demo.model.Patient;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, Object> payload) {
        try {
            Long patientId = Long.valueOf(payload.get("patientId").toString());
            Long doctorId = Long.valueOf(payload.get("doctorId").toString());
            LocalDate appointmentDate = LocalDate.parse(payload.get("appointmentDate").toString());

            Optional<Patient> patientOpt = patientRepository.findById(patientId);
            Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);

            if (patientOpt.isEmpty() || doctorOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Either doctor or patient doesn't exist!!!"));
            }

            List<Appointment> existingAppointments = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, appointmentDate);
            if (!existingAppointments.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Doctor not available on this date!!"));
            }

            Appointment appointment = new Appointment();
            appointment.setPatient(patientOpt.get());
            appointment.setDoctor(doctorOpt.get());
            appointment.setAppointmentDate(appointmentDate);

            appointmentRepository.save(appointment);
            return ResponseEntity.ok(Map.of("message", "Appointment Booked!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
