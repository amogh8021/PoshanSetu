package com.poshansetu.model;

import com.poshansetu.model.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "child_id")
    private UUID childId;

    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;

    private LocalDate attendanceDate;

    private String anganwadiId;
    
    @Builder.Default
    private Boolean mealEaten = false;

    @CreationTimestamp
    private LocalDateTime markedAt;
}
