package com.poshansetu.service;

import com.poshansetu.dto.PregnancyAssessmentDto;
import com.poshansetu.dto.PregnancyRegistrationDto;
import com.poshansetu.integration.MlIntegrationService;
import com.poshansetu.model.Pregnancy;
import com.poshansetu.model.User;
import com.poshansetu.model.enums.RiskLevel;
import com.poshansetu.model.enums.Role;
import com.poshansetu.repository.PregnancyRepository;
import com.poshansetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;

@Service
@RequiredArgsConstructor
@Validated
public class PregnancyService {

    private final PregnancyRepository pregnancyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MlIntegrationService mlIntegrationService;

    @Transactional
    public Pregnancy registerWoman(@Valid PregnancyRegistrationDto dto) {
        // Create User account (Role PARENT)
        User user = userRepository.findByPhone(dto.getPhone())
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName(dto.getFullName())
                        .phone(dto.getPhone())
                        .passwordHash(passwordEncoder.encode(dto.getPassword() != null ? dto.getPassword() : "password123"))
                        .role(Role.PARENT)
                        .anganwadiId(dto.getAnganwadiId())
                        .build()));

        // Initial Assessment
        PregnancyAssessmentDto assessDto = new PregnancyAssessmentDto();
        assessDto.setUserId(user.getId());
        assessDto.setAge(dto.getAge());
        assessDto.setSystolicBP(dto.getSystolicBP());
        assessDto.setDiastolicBP(dto.getDiastolicBP());
        assessDto.setBloodSugar(dto.getBloodSugar());
        assessDto.setBodyTemp(dto.getBodyTemp());
        assessDto.setHeartRate(dto.getHeartRate());
 
        return saveAssessment(assessDto);
    }
 
    public Pregnancy saveAssessment(@Valid PregnancyAssessmentDto dto) {
        MlIntegrationService.PregnancyRequest mlReq = new MlIntegrationService.PregnancyRequest();
        mlReq.setAge(dto.getAge());
        mlReq.setSystolicBP(dto.getSystolicBP());
        mlReq.setDiastolicBP(dto.getDiastolicBP());
        mlReq.setBloodSugar(dto.getBloodSugar());
        mlReq.setBodyTemp(dto.getBodyTemp());
        mlReq.setHeartRate(dto.getHeartRate());
 
        MlIntegrationService.PregnancyResponse mlRes = mlIntegrationService.predictPregnancyRisk(mlReq);
        
        RiskLevel mlRisk;
        try {
            mlRisk = RiskLevel.valueOf(mlRes.getRiskLevel().toUpperCase());
        } catch(Exception e) {
            mlRisk = RiskLevel.PENDING;
        }
 
        Pregnancy pregnancy = Pregnancy.builder()
                .userId(dto.getUserId())
                .age(dto.getAge())
                .systolicBP(dto.getSystolicBP())
                .diastolicBP(dto.getDiastolicBP())
                .bloodSugar(dto.getBloodSugar())
                .bodyTemp(dto.getBodyTemp())
                .heartRate(dto.getHeartRate())
                .riskLevel(mlRisk)
                .build();
        
        return pregnancyRepository.save(pregnancy);
    }
}
