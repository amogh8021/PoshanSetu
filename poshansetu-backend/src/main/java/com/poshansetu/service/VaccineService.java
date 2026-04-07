package com.poshansetu.service;

import com.poshansetu.dto.VaccineRecordDto;
import com.poshansetu.integration.MlIntegrationService;
import com.poshansetu.model.Vaccination;
import com.poshansetu.model.enums.VaccineStatus;
import com.poshansetu.repository.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Validated
public class VaccineService {

    private final VaccinationRepository vaccinationRepository;
    private final MlIntegrationService mlIntegrationService;

    public Vaccination recordVaccination(@Valid VaccineRecordDto dto) {
        Vaccination vaccination = Vaccination.builder()
                .childId(dto.getChildId())
                .vaccineName(dto.getVaccineName())
                .scheduledDate(dto.getScheduledDate())
                .status(VaccineStatus.DONE)
                .administeredDate(LocalDate.now())
                .dropoutRisk(false) 
                .build();
        return vaccinationRepository.save(vaccination);
    }

    public List<Vaccination> getUpcomingVaccines(UUID childId) {
        return vaccinationRepository.findAllByChildIdOrderByScheduledDateDesc(childId);
    }

    public MlIntegrationService.VaccineDropoutResponse checkDropoutRisk(UUID childId) {
        long totalPending = vaccinationRepository.findAllByChildIdAndStatus(childId, VaccineStatus.PENDING).size();
        long missedDoses = vaccinationRepository.findAllByChildIdAndStatus(childId, VaccineStatus.MISSED).size();

        MlIntegrationService.VaccineDropoutRequest req = new MlIntegrationService.VaccineDropoutRequest();
        req.setMissedDosesCount((int) missedDoses);
        req.setLastAttendanceDays(15); 
        req.setTotalDosesScheduled((int) (totalPending + missedDoses));
        
        return mlIntegrationService.predictVaccineDropout(req);
    }
}
