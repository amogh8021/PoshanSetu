package com.poshansetu.repository;

import com.poshansetu.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {
    List<Attendance> findAllByAnganwadiIdAndAttendanceDate(String anganwadiId, LocalDate attendanceDate);
    Optional<Attendance> findByChildIdAndAttendanceDate(UUID childId, LocalDate attendanceDate);
    List<Attendance> findAllByChildIdAndAttendanceDateBetween(UUID childId, LocalDate startDate, LocalDate endDate);
}
