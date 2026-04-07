package com.poshansetu.repository;

import com.poshansetu.model.NutritionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface NutritionLogRepository extends JpaRepository<NutritionLog, UUID> {
    List<NutritionLog> findAllByChildIdAndDateBetween(UUID childId, LocalDate startDate, LocalDate endDate);
}
