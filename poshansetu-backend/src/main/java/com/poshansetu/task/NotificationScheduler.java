package com.poshansetu.task;

import com.poshansetu.integration.SmsService;
import com.poshansetu.model.Pregnancy;
import com.poshansetu.model.Vaccination;
import com.poshansetu.model.enums.RiskLevel;
import com.poshansetu.model.enums.VaccineStatus;
import com.poshansetu.repository.PregnancyRepository;
import com.poshansetu.repository.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name="notifications.enabled", havingValue="true")
public class NotificationScheduler {

    private final VaccinationRepository vaccinationRepository;
    private final PregnancyRepository pregnancyRepository;
    private final SmsService smsService;

    // Daily at 9 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void sendVaccineReminders() {
        log.info("Running vaccine reminder job");
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Vaccination> dueTomorrow = vaccinationRepository.findAllByScheduledDateAndStatus(tomorrow, VaccineStatus.PENDING);
        
        for (Vaccination v : dueTomorrow) {
            String phone = "+919999999999"; 
            String msg = String.format("Reminder: vaccine %s is due tomorrow", v.getVaccineName());
            smsService.send(phone, msg);
        }
    }

    // Every Monday at 10 AM
    @Scheduled(cron = "0 0 10 * * 1")
    public void notifyHighRiskPregnancies() {
        log.info("Running high risk pregnancy job");
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Pregnancy> highRiskList = pregnancyRepository.findAllByRiskLevelAndAssessedAtAfter(RiskLevel.HIGH, sevenDaysAgo);
        
        for (Pregnancy p : highRiskList) {
            String workerPhone = "+918888888888";
            String msg = String.format("High risk case assigned: User ID %s", p.getUserId());
            smsService.send(workerPhone, msg);
        }
    }
}
