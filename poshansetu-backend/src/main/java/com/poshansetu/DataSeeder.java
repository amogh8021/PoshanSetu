package com.poshansetu;

import com.poshansetu.model.*;
import com.poshansetu.model.enums.*;
import com.poshansetu.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final VaccinationRepository vaccinationRepository;
    private final PregnancyRepository pregnancyRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Fixed credentials for demo ──────────────────────────────────────────
    // Worker: phone = 1111111111, password = password123
    // Parent: phone = 2222222222, password = password123
    // Admin: phone = 3333333333, password = password123

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting DataSeeder with rich demo data...");
        Random rng = new Random(42); // fixed seed for reproducible data

        // ── 0. Cleanup Duplicates (if any exists from previous buggy runs) ──
        List<String> phones = Arrays.asList("1111111111", "2222222222", "2222222233", "3333333333");
        for (String phone : phones) {
            List<User> users = userRepository.findAll().stream()
                    .filter(u -> u.getPhone().equals(phone))
                    .toList();
            if (users.size() > 1) {
                log.warn("Found {} duplicates for phone {}. Cleaning up...", users.size(), phone);
                // Keep the first one, delete others
                for (int i = 1; i < users.size(); i++) {
                    userRepository.delete(users.get(i));
                }
            }
        }

        // ── 1. Create Users (only if they don't exist) ─────────────────────
        User worker = userRepository.findByPhone("1111111111").orElseGet(() -> userRepository.save(User.builder()
                .fullName("Sunita Devi")
                .phone("1111111111")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.WORKER)
                .anganwadiId("AWC-001")
                .build()));

        User parent1 = userRepository.findByPhone("2222222222").orElseGet(() -> userRepository.save(User.builder()
                .fullName("Radha Kumari")
                .phone("2222222222")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.PARENT)
                .anganwadiId("AWC-001")
                .build()));

        User parent2 = userRepository.findByPhone("2222222233").orElseGet(() -> userRepository.save(User.builder()
                .fullName("Meera Singh")
                .phone("2222222233")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.PARENT)
                .anganwadiId("AWC-001")
                .build()));

        User admin = userRepository.findByPhone("3333333333").orElseGet(() -> userRepository.save(User.builder()
                .fullName("District Admin")
                .phone("3333333333")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.ADMIN)
                .anganwadiId("AWC-001")
                .build()));

        log.info("Users ready (existing or newly created): Worker={}, Parent1={}, Parent2={}, Admin={}",
                worker.getPhone(), parent1.getPhone(), parent2.getPhone(), admin.getPhone());

        // Stop seeding if children already exist (prevent runaway data growth)
        if (childRepository.count() > 0) {
            log.info("Data already seeded. Skipping detailed records.");
            return;
        }

        // ── 2. Register Pregnancies ─────────────────────────────────────────
        pregnancyRepository.save(Pregnancy.builder()
                .userId(parent2.getId())
                .age(28)
                .systolicBP(130)
                .diastolicBP(85)
                .bloodSugar(8.5)
                .bodyTemp(37.2)
                .heartRate(82)
                .riskLevel(RiskLevel.HIGH)
                .build());

        pregnancyRepository.save(Pregnancy.builder()
                .userId(parent1.getId())
                .age(24)
                .systolicBP(110)
                .diastolicBP(70)
                .bloodSugar(6.2)
                .bodyTemp(36.8)
                .heartRate(72)
                .riskLevel(RiskLevel.LOW)
                .build());

        log.info("Created 2 pregnancy records");

        // ── 3. Register Children ────────────────────────────────────────────
        String[][] childData = {
                { "Aarav Kumari", "MALE", "18" }, // 18 months old
                { "Priya Kumari", "FEMALE", "30" }, // 30 months old
                { "Ravi Singh", "MALE", "12" }, // 12 months old
                { "Ananya Singh", "FEMALE", "24" }, // 24 months old
                { "Vikram Kumar", "MALE", "36" }, // 36 months old
        };

        // parent assignments: first 2 → parent1, next 3 → parent2
        User[] parents = { parent1, parent1, parent2, parent2, parent2 };

        Child[] children = new Child[childData.length];
        for (int i = 0; i < childData.length; i++) {
            children[i] = childRepository.save(Child.builder()
                    .fullName(childData[i][0])
                    .dateOfBirth(LocalDate.now().minusMonths(Integer.parseInt(childData[i][2])))
                    .gender(childData[i][1].equals("MALE") ? Gender.MALE : Gender.FEMALE)
                    .motherName(parents[i].getFullName())
                    .parentId(parents[i].getId())
                    .registeredBy(worker.getId())
                    .anganwadiId("AWC-001")
                    .build());
        }

        log.info("Created {} children", children.length);

        // ── 4. Seed Health Records (multiple per child, over time) ──────────
        double[][] healthTimeSeries = {
                // {monthsAgo, weightKg, heightCm, muacCm}
                { 3, 7.2, 68.0, 11.5 },
                { 2, 7.8, 70.5, 12.0 },
                { 1, 8.1, 72.0, 12.3 },
                { 0, 8.5, 73.5, 12.8 },
        };
        MlPrediction[] preds = { MlPrediction.SEVERE, MlPrediction.MODERATE, MlPrediction.NORMAL, MlPrediction.NORMAL };

        for (int c = 0; c < children.length; c++) {
            double baseWeight = 6.0 + c * 1.5;
            double baseHeight = 60.0 + c * 5.0;
            for (int t = 0; t < healthTimeSeries.length; t++) {
                MlPrediction pred = preds[Math.min(t + (c % 2), preds.length - 1)];
                healthRecordRepository.save(HealthRecord.builder()
                        .childId(children[c].getId())
                        .weightKg(baseWeight + healthTimeSeries[t][1] - 7.0)
                        .heightCm(baseHeight + healthTimeSeries[t][2] - 68.0)
                        .muacCm(healthTimeSeries[t][3])
                        .motherEducation(c < 2 ? "Secondary" : "Primary")
                        .stunting(c == 0 ? "Yes" : "No")
                        .anemia(c == 0 || c == 3 ? "Yes" : "No")
                        .malaria("No")
                        .diarrhea(c == 2 ? "Yes" : "No")
                        .tb("No")
                        .recordedBy(worker.getId())
                        .mlPrediction(pred)
                        .predictionScore(50.0 + rng.nextDouble() * 45.0)
                        .build());
            }
        }

        log.info("Created {} health records", children.length * healthTimeSeries.length);

        // ── 5. Seed Vaccinations ────────────────────────────────────────────
        String[] vaccineNames = { "BCG", "OPV-0", "Hepatitis B-1", "OPV-1", "Pentavalent-1",
                "Rotavirus-1", "PCV-1", "OPV-2", "Pentavalent-2", "Measles-1" };
        for (Child child : children) {
            for (int v = 0; v < vaccineNames.length; v++) {
                VaccineStatus status;
                LocalDate scheduled;
                LocalDate administered = null;

                if (v < 5) {
                    // First 5 are done
                    status = VaccineStatus.DONE;
                    scheduled = LocalDate.now().minusMonths(v + 1);
                    administered = scheduled.plusDays(rng.nextInt(7));
                } else if (v < 8) {
                    // Next 3 are pending
                    status = VaccineStatus.PENDING;
                    scheduled = LocalDate.now().plusDays((v - 5) * 30 + rng.nextInt(15));
                } else {
                    // Last 2 are missed for some children
                    status = (child.getFullName().contains("Aarav") || child.getFullName().contains("Ravi"))
                            ? VaccineStatus.MISSED
                            : VaccineStatus.PENDING;
                    scheduled = LocalDate.now().minusDays(rng.nextInt(14) + 1);
                }

                vaccinationRepository.save(Vaccination.builder()
                        .childId(child.getId())
                        .vaccineName(vaccineNames[v])
                        .scheduledDate(scheduled)
                        .administeredDate(administered)
                        .status(status)
                        .dropoutRisk(status == VaccineStatus.MISSED)
                        .build());
            }
        }

        log.info("Created {} vaccination records", children.length * vaccineNames.length);

        // ── 6. Seed Attendance History (90 days for heatmap) ─────────────────
        AttendanceStatus[] statuses = { AttendanceStatus.PRESENT, AttendanceStatus.PRESENT,
                AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LEAVE };
        int attendanceCount = 0;
        for (Child child : children) {
            for (int day = 90; day >= 0; day--) {
                LocalDate date = LocalDate.now().minusDays(day);
                // Skip weekends (Sunday = 7, Saturday = 6 in DayOfWeek)
                int dow = date.getDayOfWeek().getValue();
                if (dow == 6 || dow == 7)
                    continue;

                AttendanceStatus status = statuses[rng.nextInt(statuses.length)];
                boolean mealEaten = status == AttendanceStatus.PRESENT && rng.nextDouble() > 0.2; // 80% meals when
                                                                                                  // present

                attendanceRepository.save(Attendance.builder()
                        .childId(child.getId())
                        .attendanceDate(date)
                        .anganwadiId("AWC-001")
                        .status(status)
                        .mealEaten(mealEaten)
                        .build());
                attendanceCount++;
            }
        }

        log.info("Created {} attendance records", attendanceCount);

        // ── Summary ─────────────────────────────────────────────────────────
        log.info("╔══════════════════════════════════════════════════╗");
        log.info("║           DEMO DATA SEEDED SUCCESSFULLY         ║");
        log.info("╠══════════════════════════════════════════════════╣");
        log.info("║  Worker Login:  1111111111 / password123         ║");
        log.info("║  Parent Login:  2222222222 / password123         ║");
        log.info("║  Admin Login:   3333333333 / password123         ║");
        log.info("║  Anganwadi ID:  AWC-001                         ║");
        log.info("║  Children:      5                               ║");
        log.info("║  Health Recs:   {}                              ║", children.length * healthTimeSeries.length);
        log.info("║  Vaccinations:  {}                              ║", children.length * vaccineNames.length);
        log.info("║  Attendance:    {} (90 days history)             ║", attendanceCount);
        log.info("╚══════════════════════════════════════════════════╝");
    }
}
