package com.poshansetu.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.UUID;

@Data
public class NutritionLogDto {
    @NotNull
    private UUID childId;
    @Positive
    private Double caloriesKcal;
    @Positive
    private Double proteinG;
    @Positive
    private Double ironMg;
    @Positive
    private Double vitaminA;
}
