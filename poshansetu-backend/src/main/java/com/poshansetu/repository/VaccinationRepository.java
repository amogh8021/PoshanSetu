package com.poshansetu.repository;

import com.poshansetu.model.Vaccination;
import com.poshansetu.model.enums.VaccineStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, UUID> {
    List<Vaccination> findAllByChildIdAndStatus(UUID childId, VaccineStatus status);
    List<Vaccination> findAllByScheduledDateBeforeAndStatus(LocalDate date, VaccineStatus status);
    List<Vaccination> findAllByScheduledDateAndStatus(LocalDate scheduledDate, VaccineStatus status);
    java.util.Optional<Vaccination> findTopByChildIdOrderByScheduledDateDesc(UUID childId);
    List<Vaccination> findAllByChildIdOrderByScheduledDateDesc(UUID childId);
}
