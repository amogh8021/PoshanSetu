package com.poshansetu.controller;

import com.poshansetu.dto.ApiResponse;
import com.poshansetu.dto.ChildRegistrationDto;
import com.poshansetu.dto.ChildSummaryDto;
import com.poshansetu.model.Child;
import com.poshansetu.model.HealthRecord;
import com.poshansetu.model.User;
import com.poshansetu.repository.HealthRecordRepository;
import com.poshansetu.repository.UserRepository;
import com.poshansetu.service.ChildService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/child")
@RequiredArgsConstructor
public class ChildController {

    private final ChildService childService;
    private final HealthRecordRepository healthRecordRepository;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ApiResponse<Child> registerChild(
            @Valid @RequestBody ChildRegistrationDto dto
    ) {
        // ✅ Get authenticated user from SecurityContext
        UserDetails userDetails = (UserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        String phone = userDetails.getUsername();

        // ⚠️ Still 1 DB call (can remove later via UserPrincipal optimization)
        User worker = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        Child child = childService.registerChild(dto, worker.getId());

        return new ApiResponse<>("SUCCESS", "Child registered", child);
    }

    @GetMapping("/my-children")
    public ApiResponse<List<Child>> getMyChildren(@RequestParam UUID parentId) {
        return new ApiResponse<>("SUCCESS", "Fetched children",
                childService.getChildrenForParent(parentId));
    }

    @GetMapping("/{childId}/growth-chart")
    public ApiResponse<List<HealthRecord>> getGrowthChart(@PathVariable UUID childId) {
        return new ApiResponse<>("SUCCESS", "Fetched growth chart",
                healthRecordRepository.findAllByChildIdOrderByRecordedAtDesc(childId));
    }

    @GetMapping("/anganwadi/{anganwadiId}")
    public ApiResponse<List<ChildSummaryDto>> getChildrenByAnganwadi(@PathVariable String anganwadiId) {
        System.out.println("Fetching children for Anganwadi ID: " + anganwadiId);
        List<ChildSummaryDto> summary = childService.getChildSummariesForAnganwadi(anganwadiId);
        System.out.println("Found " + summary.size() + " children summaries.");
        return new ApiResponse<>("SUCCESS", "Fetched anganwadi children", summary);
    }
}