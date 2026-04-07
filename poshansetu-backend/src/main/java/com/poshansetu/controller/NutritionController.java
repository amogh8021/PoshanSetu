package com.poshansetu.controller;

import com.poshansetu.dto.ApiResponse;
import com.poshansetu.dto.NutritionLogDto;
import com.poshansetu.model.NutritionLog;
import com.poshansetu.service.NutritionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/nutrition")
@RequiredArgsConstructor
public class NutritionController {

    private final NutritionService nutritionService;

    @PostMapping("/log")
    public ApiResponse<NutritionLog> logNutrition(@Valid @RequestBody NutritionLogDto dto) {
        return new ApiResponse<>("SUCCESS", "Nutrition logged", nutritionService.logNutrition(dto));
    }

    @GetMapping("/{childId}/weekly")
    public ApiResponse<String> getWeeklyNutrition(@PathVariable java.util.UUID childId) {
        return new ApiResponse<>("SUCCESS", "Weekly nutrition summary placeholder", "Weekly info for " + childId);
    }
}
