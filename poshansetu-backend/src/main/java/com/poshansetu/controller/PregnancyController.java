package com.poshansetu.controller;

import com.poshansetu.dto.ApiResponse;
import com.poshansetu.dto.PregnancyAssessmentDto;
import com.poshansetu.dto.PregnancyRegistrationDto;
import com.poshansetu.model.Pregnancy;
import com.poshansetu.repository.PregnancyRepository;
import com.poshansetu.repository.UserRepository;
import com.poshansetu.service.PregnancyService;
import com.poshansetu.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/pregnancy")
@RequiredArgsConstructor
public class PregnancyController {

    private final PregnancyService pregnancyService;
    private final AdminReportService adminReportService;
    private final PregnancyRepository pregnancyRepository;
    private final UserRepository userRepository;

    @PostMapping("/assess")
    public ApiResponse<Pregnancy> saveAssessment(@Valid @RequestBody PregnancyAssessmentDto dto) {
        return new ApiResponse<>("SUCCESS", "Pregnancy assessment recorded", pregnancyService.saveAssessment(dto));
    }

    @PostMapping("/register")
    public ApiResponse<Pregnancy> registerWoman(@Valid @RequestBody PregnancyRegistrationDto dto) {
        return new ApiResponse<>("SUCCESS", "Pregnancy registered", pregnancyService.registerWoman(dto));
    }

    @GetMapping("/list/{anganwadiId}")
    public ApiResponse<java.util.List<Pregnancy>> listPregnancies(@PathVariable String anganwadiId) {
        return new ApiResponse<>("SUCCESS", "Fetched pregnancies", pregnancyRepository.findAllByAnganwadiId(anganwadiId));
    }

    @GetMapping("/high-risk")
    public ApiResponse<List<Pregnancy>> getHighRiskPregnancies() {
        return new ApiResponse<>("SUCCESS", "Fetched high risk pregnancies", adminReportService.getHighRiskPregnancies());
    }
}
