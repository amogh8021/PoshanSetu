package com.poshansetu.controller;

import com.poshansetu.dto.ApiResponse;
import com.poshansetu.model.Attendance;
import com.poshansetu.model.enums.AttendanceStatus;
import com.poshansetu.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;

    @PostMapping("/mark")
    public ApiResponse<Attendance> markAttendance(
            @RequestParam UUID childId,
            @RequestParam AttendanceStatus status,
            @RequestParam String anganwadiId,
            @RequestParam(required = false, defaultValue = "false") Boolean mealEaten
    ) {
        Attendance attendance = attendanceRepository.findByChildIdAndAttendanceDate(childId, LocalDate.now())
                .orElse(Attendance.builder()
                        .childId(childId)
                        .attendanceDate(LocalDate.now())
                        .anganwadiId(anganwadiId)
                        .build());
        
        attendance.setStatus(status);
        attendance.setMealEaten(mealEaten);
        return new ApiResponse<>("SUCCESS", "Attendance marked", attendanceRepository.save(attendance));
    }

    @GetMapping("/today/{anganwadiId}")
    public ApiResponse<List<Attendance>> getTodayAttendance(@PathVariable String anganwadiId) {
        return new ApiResponse<>("SUCCESS", "Fetched today's attendance",
                attendanceRepository.findAllByAnganwadiIdAndAttendanceDate(anganwadiId, LocalDate.now()));
    }

    @GetMapping("/history/{childId}")
    public ApiResponse<List<Attendance>> getAttendanceHistory(@PathVariable UUID childId) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusMonths(3); // Show 3 months for the heatmap by default
        return new ApiResponse<>("SUCCESS", "Fetched attendance history",
                attendanceRepository.findAllByChildIdAndAttendanceDateBetween(childId, start, end));
    }
}
