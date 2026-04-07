package com.poshansetu.controller;

import com.poshansetu.dto.ApiResponse;
import com.poshansetu.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminReportService adminReportService;

    @GetMapping("/stats/malnutrition")
    public ApiResponse<java.util.List<Map<String, Object>>> getMalnutritionStats() {
        return new ApiResponse<>("SUCCESS", "Malnutrition stats fetched", adminReportService.getVillageMalnutritionStats());
    }

    @GetMapping("/stats/vaccination-compliance")
    public ApiResponse<Map<String, Object>> getVaccinationComplianceRate() {
        return new ApiResponse<>("SUCCESS", "Vaccination compliance fetched", adminReportService.getVaccinationComplianceRate());
    }

    @GetMapping("/reports/summary")
    public ApiResponse<java.util.List<Map<String, Object>>> getReportsSummary() {
        return new ApiResponse<>("SUCCESS", "Full dashboard summary fetched", adminReportService.getReportsSummary());
    }
}
