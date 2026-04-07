package com.poshansetu.model;

import com.poshansetu.model.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pregnancies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pregnancy {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    private Integer age;
    private Integer systolicBP;
    private Integer diastolicBP;
    private Double bloodSugar;
    private Double bodyTemp;
    private Integer heartRate;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    @CreationTimestamp
    private LocalDateTime assessedAt;
}
