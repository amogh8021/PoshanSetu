package com.poshansetu.service;

import com.poshansetu.dto.ChildRegistrationDto;
import com.poshansetu.dto.ChildSummaryDto;
import com.poshansetu.model.Child;
import com.poshansetu.model.HealthRecord;
import com.poshansetu.model.Vaccination;
import com.poshansetu.repository.ChildRepository;
import com.poshansetu.repository.HealthRecordRepository;
import com.poshansetu.repository.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Validated
public class ChildService {
    private final ChildRepository childRepository;
    private final com.poshansetu.repository.UserRepository userRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final VaccinationRepository vaccinationRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public Child registerChild(@Valid ChildRegistrationDto dto, UUID registeredById) {
        com.poshansetu.model.User parent = userRepository.findByPhone(dto.getParentPhone())
                .orElseGet(() -> {
                    String password = (dto.getParentPassword() != null && !dto.getParentPassword().isEmpty()) 
                            ? dto.getParentPassword() : "password123";
                    com.poshansetu.model.User newUser = com.poshansetu.model.User.builder()
                            .fullName("Parent of " + dto.getFullName())
                            .phone(dto.getParentPhone())
                            .passwordHash(passwordEncoder.encode(password)) // Use provided or default
                            .role(com.poshansetu.model.enums.Role.PARENT)
                            .anganwadiId(dto.getAnganwadiId())
                            .build();
                    return userRepository.save(newUser);
                });

        Child child = Child.builder()
                .fullName(dto.getFullName())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender())
                .motherName(dto.getMotherName())
                .parentId(parent.getId())
                .registeredBy(registeredById)
                .anganwadiId(dto.getAnganwadiId())
                .build();
        return childRepository.save(child);
    }

    public List<Child> getChildrenForParent(UUID parentId) {
        return childRepository.findAllByParentId(parentId);
    }

    public List<Child> getChildrenForAnganwadi(String anganwadiId) {
        return childRepository.findAllByAnganwadiId(anganwadiId);
    }

    public List<ChildSummaryDto> getChildSummariesForAnganwadi(String anganwadiId) {
        List<Child> children = childRepository.findAllByAnganwadiId(anganwadiId);
        return children.stream().map(c -> {
            HealthRecord latestHealth = healthRecordRepository.findTop1ByChildIdOrderByRecordedAtDesc(c.getId()).orElse(null);
            Vaccination lastVaccine = vaccinationRepository.findTopByChildIdOrderByScheduledDateDesc(c.getId()).orElse(null);

            return ChildSummaryDto.builder()
                    .child(c)
                    .latestRiskLevel(latestHealth != null ? latestHealth.getMlPrediction() : null)
                    .lastVaccine(lastVaccine != null ? lastVaccine.getVaccineName() : null)
                    .lastVaccineStatus(lastVaccine != null ? lastVaccine.getStatus().name() : null)
                    .build();
        }).toList();
    }
}
