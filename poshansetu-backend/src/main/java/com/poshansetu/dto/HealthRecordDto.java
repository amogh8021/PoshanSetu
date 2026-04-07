package com.poshansetu.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.UUID;

@Data
public class HealthRecordDto {
    @NotNull
    private UUID childId;
    @Positive
    private Double weightKg;
    @Positive
    private Double heightCm;
    @Positive
    private Double muacCm;

    // AI Prediction Features
    private String motherEducation;
    private String stunting;
    private String anemia;
    private String malaria;
    private String diarrhea;
    private String tb;
}
