package com.poshansetu.controller;

import com.poshansetu.dto.ApiResponse;
import com.poshansetu.dto.HealthRecordDto;
import com.poshansetu.model.HealthRecord;
import com.poshansetu.model.User;
import com.poshansetu.repository.HealthRecordRepository;
import com.poshansetu.repository.UserRepository;
import com.poshansetu.service.HealthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
public class HealthController {

    private final HealthService healthService;
    private final HealthRecordRepository healthRecordRepository;
    private final UserRepository userRepository;

    @PostMapping("/record")
    public ApiResponse<HealthRecord> recordHealth(@Valid @RequestBody HealthRecordDto dto) {
        log.info("Recording health data for child ID: {}", dto.getChildId());
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User worker = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        HealthRecord record = healthService.recordHealth(dto, worker.getId());
        return new ApiResponse<>("SUCCESS", "Health recorded", record);
    }

    @GetMapping("/{childId}/latest")
    public ApiResponse<HealthRecord> getLatestHealth(@PathVariable UUID childId) {
        HealthRecord record = healthRecordRepository.findTop1ByChildIdOrderByRecordedAtDesc(childId)
                .orElse(null);
        return new ApiResponse<>("SUCCESS", "Fetched latest health record", record);
    }
}
