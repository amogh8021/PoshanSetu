package com.poshansetu.model;

import com.poshansetu.model.enums.MlPrediction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "health_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "child_id")
    private UUID childId;

    private Double weightKg;
    private Double heightCm;
    private Double muacCm;

    @Column(name = "recorded_by_id")
    private UUID recordedBy;

    @CreationTimestamp
    private LocalDateTime recordedAt;

    @Enumerated(EnumType.STRING)
    private MlPrediction mlPrediction;

    private Double predictionScore;

    // AI Prediction Features
    private String motherEducation;
    private String stunting;
    private String anemia;
    private String malaria;
    private String diarrhea;
    private String tb;
}
