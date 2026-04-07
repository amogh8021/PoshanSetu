package com.poshansetu.model;

import com.poshansetu.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String fullName;
    private String phone;
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String anganwadiId;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
