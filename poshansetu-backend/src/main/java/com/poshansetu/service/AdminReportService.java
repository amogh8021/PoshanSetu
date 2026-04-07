package com.poshansetu.service;

import com.poshansetu.model.Child;
import com.poshansetu.model.HealthRecord;
import com.poshansetu.model.Pregnancy;
import com.poshansetu.model.User;
import com.poshansetu.model.Vaccination;
import com.poshansetu.model.enums.RiskLevel;
import com.poshansetu.repository.ChildRepository;
import com.poshansetu.repository.HealthRecordRepository;
import com.poshansetu.repository.PregnancyRepository;
import com.poshansetu.repository.UserRepository;
import com.poshansetu.repository.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminReportService {
    
    private final PregnancyRepository pregnancyRepository;
    private final ChildRepository childRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final VaccinationRepository vaccinationRepository;
    private final UserRepository userRepository;

    public List<Map<String, Object>> getVillageMalnutritionStats() {
        List<Child> children = childRepository.findAll();
        Map<String, List<Child>> byAWC = children.stream()
                .filter(c -> c.getAnganwadiId() != null)
                .collect(Collectors.groupingBy(Child::getAnganwadiId));
        
        List<Map<String, Object>> result = new ArrayList<>();
        byAWC.forEach((awc, kids) -> {
            Map<String, Object> stat = new HashMap<>();
            stat.put("anganwadiId", awc);
            int normal = 0, moderate = 0, severe = 0;
            for (Child c : kids) {
                HealthRecord hr = healthRecordRepository.findTop1ByChildIdOrderByRecordedAtDesc(c.getId()).orElse(null);
                if (hr != null && hr.getMlPrediction() != null) {
                    switch (hr.getMlPrediction()) {
                        case NORMAL: normal++; break;
                        case MODERATE: moderate++; break;
                        case SEVERE: severe++; break;
                        default: break;
                    }
                }
            }
            stat.put("normal", normal);
            stat.put("moderate", moderate);
            stat.put("severe", severe);
            result.add(stat);
        });
        return result;
    }

    public Map<String, Object> getVaccinationComplianceRate() {
        List<Vaccination> all = vaccinationRepository.findAll();
        long done = all.stream().filter(v -> v.getStatus() == com.poshansetu.model.enums.VaccineStatus.DONE).count();
        long pending = all.stream().filter(v -> v.getStatus() == com.poshansetu.model.enums.VaccineStatus.PENDING).count();
        long missed = all.stream().filter(v -> v.getStatus() == com.poshansetu.model.enums.VaccineStatus.MISSED).count();
        
        Map<String, Object> map = new HashMap<>();
        // Frontend uses uppercase keys naturally
        map.put("DONE", done);
        map.put("PENDING", pending);
        map.put("MISSED", missed);
        return map;
    }

    public List<Pregnancy> getHighRiskPregnancies() {
        return pregnancyRepository.findAllByRiskLevel(RiskLevel.HIGH);
    }

    public List<Map<String, Object>> getReportsSummary() {
        List<Child> children = childRepository.findAll();
        Map<String, List<Child>> byAWC = children.stream()
                .filter(c -> c.getAnganwadiId() != null)
                .collect(Collectors.groupingBy(Child::getAnganwadiId));
        
        List<Map<String, Object>> result = new ArrayList<>();
        byAWC.forEach((awc, kids) -> {
            Map<String, Object> row = new HashMap<>();
            row.put("anganwadiId", awc);
            row.put("totalChildren", kids.size());
            
            int malCount = 0;
            int vaxDone = 0;
            int totalVax = 0;
            
            for (Child c : kids) {
                HealthRecord hr = healthRecordRepository.findTop1ByChildIdOrderByRecordedAtDesc(c.getId()).orElse(null);
                if (hr != null && hr.getMlPrediction() != null && 
                    (hr.getMlPrediction() == com.poshansetu.model.enums.MlPrediction.MODERATE || 
                     hr.getMlPrediction() == com.poshansetu.model.enums.MlPrediction.SEVERE)) {
                    malCount++;
                }
                
                Vaccination v = vaccinationRepository.findTopByChildIdOrderByScheduledDateDesc(c.getId()).orElse(null);
                if (v != null) {
                    totalVax++;
                    if (v.getStatus() == com.poshansetu.model.enums.VaccineStatus.DONE) {
                        vaxDone++;
                    }
                }
            }
            
            double malPct = kids.isEmpty() ? 0 : (malCount * 100.0) / kids.size();
            double vaxPct = totalVax == 0 ? 0 : (vaxDone * 100.0) / totalVax;
            
            row.put("malnutritionPct", Math.round(malPct * 10.0) / 10.0);
            row.put("vaccinationCompliancePct", Math.round(vaxPct * 10.0) / 10.0);
            
            // Map users in AWC to pregnancies
            List<User> awcUsers = userRepository.findAllByAnganwadiId(awc);
            long hrp = 0;
            for(User u : awcUsers) {
                hrp += pregnancyRepository.findAllByRiskLevel(RiskLevel.HIGH)
                    .stream().filter(p -> p.getUserId().equals(u.getId())).count();
            }
            row.put("highRiskPregnancies", hrp);
            
            result.add(row);
        });
        return result;
    }
}
