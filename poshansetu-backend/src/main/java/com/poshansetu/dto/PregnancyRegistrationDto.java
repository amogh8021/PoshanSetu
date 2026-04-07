package com.poshansetu.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class PregnancyRegistrationDto {
    private String fullName;
    private String phone;
    private String password;
    private String anganwadiId;
    
    // Clinical data for initial assessment
    private Integer age;
    private Integer systolicBP;
    private Integer diastolicBP;
    private Double bloodSugar;
    private Double bodyTemp;
    private Integer heartRate;
}
