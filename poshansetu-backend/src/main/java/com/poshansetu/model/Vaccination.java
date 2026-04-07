package com.poshansetu.model;

import com.poshansetu.model.enums.VaccineStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "vaccinations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vaccination {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "child_id")
    private UUID childId;

    private String vaccineName;
    private LocalDate scheduledDate;
    private LocalDate administeredDate;

    @Enumerated(EnumType.STRING)
    private VaccineStatus status;

    private Boolean dropoutRisk;
}
