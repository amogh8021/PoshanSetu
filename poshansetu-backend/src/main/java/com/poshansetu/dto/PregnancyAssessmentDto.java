package com.poshansetu.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.UUID;

@Data
public class PregnancyAssessmentDto {
    @NotNull
    private UUID userId;
    @Positive
    private Integer age;
    @Positive
    private Integer systolicBP;
    @Positive
    private Integer diastolicBP;
    @Positive
    private Double bloodSugar;
    @Positive
    private Double bodyTemp;
    @Positive
    private Integer heartRate;
}
