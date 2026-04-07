package com.poshansetu.dto;

import com.poshansetu.model.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class ChildRegistrationDto {
    @NotBlank
    private String fullName;
    @NotNull
    private LocalDate dateOfBirth;
    @NotNull
    private Gender gender;
    @NotBlank
    private String parentPhone;
    @NotBlank
    private String motherName;
    @NotBlank
    private String anganwadiId;
    private String parentPassword;
}
