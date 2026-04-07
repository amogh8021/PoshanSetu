package com.poshansetu.model;

import com.poshansetu.model.enums.SufficiencyStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "nutrition_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NutritionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "child_id")
    private UUID childId;

    private LocalDate date;

    private Double caloriesKcal;
    private Double proteinG;
    private Double ironMg;
    private Double vitaminA;

    @Enumerated(EnumType.STRING)
    private SufficiencyStatus sufficiencyStatus;
}
