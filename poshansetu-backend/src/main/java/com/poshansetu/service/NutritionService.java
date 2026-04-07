package com.poshansetu.service;

import com.poshansetu.dto.NutritionLogDto;
import com.poshansetu.integration.MlIntegrationService;
import com.poshansetu.model.NutritionLog;
import com.poshansetu.model.enums.SufficiencyStatus;
import com.poshansetu.repository.NutritionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Validated
public class NutritionService {

    private final NutritionLogRepository nutritionLogRepository;
    private final MlIntegrationService mlIntegrationService;

    public NutritionLog logNutrition(@Valid NutritionLogDto dto) {
        MlIntegrationService.NutritionRequest mlReq = new MlIntegrationService.NutritionRequest();
        mlReq.setCaloriesKcal(dto.getCaloriesKcal());
        mlReq.setProteinG(dto.getProteinG());
        mlReq.setIronMg(dto.getIronMg());
        mlReq.setVitaminA(dto.getVitaminA());

        MlIntegrationService.NutritionResponse mlRes = mlIntegrationService.predictNutritionDeficiency(mlReq);
        
        SufficiencyStatus status;
        try {
            status = SufficiencyStatus.valueOf(mlRes.getStatus().toUpperCase());
        } catch (Exception e) {
            status = SufficiencyStatus.PENDING;
        }

        NutritionLog log = NutritionLog.builder()
                .childId(dto.getChildId())
                .date(LocalDate.now())
                .caloriesKcal(dto.getCaloriesKcal())
                .proteinG(dto.getProteinG())
                .ironMg(dto.getIronMg())
                .vitaminA(dto.getVitaminA())
                .sufficiencyStatus(status)
                .build();
        
        return nutritionLogRepository.save(log);
    }
}
