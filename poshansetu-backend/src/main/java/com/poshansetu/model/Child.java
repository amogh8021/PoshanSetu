package com.poshansetu.model;

import com.poshansetu.model.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "children", indexes = {
    @Index(name = "idx_child_anganwadi_id", columnList = "anganwadiId")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Child {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String fullName;
    private LocalDate dateOfBirth;
    private String motherName;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(name = "registered_by_id")
    private UUID registeredBy;

    private String anganwadiId;
}
