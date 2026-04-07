package com.poshansetu.service;

import com.poshansetu.dto.HealthRecordDto;
import com.poshansetu.integration.MlIntegrationService;
import com.poshansetu.model.Child;
import com.poshansetu.model.HealthRecord;
import com.poshansetu.model.enums.MlPrediction;
import com.poshansetu.repository.ChildRepository;
import com.poshansetu.repository.HealthRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Validated
@Slf4j
public class HealthService {

    private final HealthRecordRepository healthRecordRepository;
    private final ChildRepository childRepository;
    private final MlIntegrationService mlIntegrationService;

    public HealthRecord recordHealth(@Valid HealthRecordDto dto, UUID recordedById) {
        Child child = childRepository.findById(dto.getChildId())
                .orElseThrow(() -> new RuntimeException("Child not found"));

        int ageInMonths = (int) ChronoUnit.MONTHS.between(child.getDateOfBirth(), LocalDate.now());

        MlIntegrationService.MalnutritionRequest mlReq = new MlIntegrationService.MalnutritionRequest();
        mlReq.setAge(ageInMonths);
        mlReq.setGender(child.getGender().name());
        mlReq.setMotherEducation(dto.getMotherEducation());
        mlReq.setWeightKg(dto.getWeightKg());
        mlReq.setHeightCm(dto.getHeightCm());
        mlReq.setStunting(dto.getStunting());
        mlReq.setAnemia(dto.getAnemia());
        mlReq.setMalaria(dto.getMalaria());
        mlReq.setDiarrhea(dto.getDiarrhea());
        mlReq.setTb(dto.getTb());

        MlPrediction predictionStatus = MlPrediction.PENDING;
        double confidence = 0.0;
        
        try {
            MlIntegrationService.MalnutritionResponse mlRes = mlIntegrationService.predictMalnutrition(mlReq);
            if (mlRes != null && mlRes.getPrediction() != null) {
                // Handle possible string returned from ML that might not match enum exactly
                try {
                    predictionStatus = MlPrediction.valueOf(mlRes.getPrediction().toUpperCase());
                } catch (IllegalArgumentException ex) {
                    predictionStatus = MlPrediction.PENDING;
                }
                confidence = mlRes.getConfidence();
            }
        } catch (Exception e) {
            log.warn("Failed to process ML prediction, defaulting to PENDING: {}", e.getMessage());
        }

        HealthRecord record = HealthRecord.builder()
                .childId(dto.getChildId())
                .weightKg(dto.getWeightKg())
                .heightCm(dto.getHeightCm())
                .muacCm(dto.getMuacCm())
                .recordedBy(recordedById)
                .mlPrediction(predictionStatus)
                .predictionScore(confidence)
                .motherEducation(dto.getMotherEducation())
                .stunting(dto.getStunting())
                .anemia(dto.getAnemia())
                .malaria(dto.getMalaria())
                .diarrhea(dto.getDiarrhea())
                .tb(dto.getTb())
                .build();

        return healthRecordRepository.save(record);
    }
}
