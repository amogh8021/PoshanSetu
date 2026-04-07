package com.poshansetu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class VaccineRecordDto {
    @NotNull
    private UUID childId;
    @NotBlank
    private String vaccineName;
    @NotNull
    private LocalDate scheduledDate;
}
