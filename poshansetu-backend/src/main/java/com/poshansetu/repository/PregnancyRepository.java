package com.poshansetu.repository;

import com.poshansetu.model.Pregnancy;
import com.poshansetu.model.enums.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PregnancyRepository extends JpaRepository<Pregnancy, UUID> {
    List<Pregnancy> findAllByRiskLevel(RiskLevel riskLevel);
    Optional<Pregnancy> findByUserId(UUID userId);
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Pregnancy p JOIN User u ON p.userId = u.id WHERE u.anganwadiId = :anganwadiId")
    List<Pregnancy> findAllByAnganwadiId(String anganwadiId);
    
    List<Pregnancy> findAllByRiskLevelAndAssessedAtAfter(RiskLevel riskLevel, LocalDateTime assessedAt);
}
