package com.poshansetu.controller;

import com.poshansetu.dto.ApiResponse;
import com.poshansetu.dto.VaccineRecordDto;
import com.poshansetu.integration.MlIntegrationService;
import com.poshansetu.model.User;
import com.poshansetu.model.Vaccination;
import com.poshansetu.repository.UserRepository;
import com.poshansetu.service.VaccineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vaccine")
@RequiredArgsConstructor
@Slf4j
public class VaccineController {
 
    private final VaccineService vaccineService;
    private final UserRepository userRepository;
 
    @PostMapping("/record")
    public ApiResponse<Vaccination> recordVaccination(@Valid @RequestBody VaccineRecordDto dto) {
        log.info("Recording vaccination for child ID: {}", dto.getChildId());
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User worker = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        return new ApiResponse<>("SUCCESS", "Vaccination recorded", vaccineService.recordVaccination(dto));
    }

    @GetMapping("/{childId}/upcoming")
    public ApiResponse<List<Vaccination>> getUpcomingVaccines(@PathVariable UUID childId) {
        return new ApiResponse<>("SUCCESS", "Fetched upcoming vaccines", vaccineService.getUpcomingVaccines(childId));
    }

    @GetMapping("/{childId}/dropout-risk")
    public ApiResponse<MlIntegrationService.VaccineDropoutResponse> getDropoutRisk(@PathVariable UUID childId) {
        return new ApiResponse<>("SUCCESS", "Fetched dropout risk", vaccineService.checkDropoutRisk(childId));
    }
}
