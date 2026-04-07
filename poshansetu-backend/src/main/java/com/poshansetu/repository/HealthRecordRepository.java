package com.poshansetu.repository;

import com.poshansetu.model.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, UUID> {
    List<HealthRecord> findAllByChildIdOrderByRecordedAtDesc(UUID childId);
    Optional<HealthRecord> findTop1ByChildIdOrderByRecordedAtDesc(UUID childId);
}
