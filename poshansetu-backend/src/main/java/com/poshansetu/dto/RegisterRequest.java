package com.poshansetu.dto;

import com.poshansetu.model.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String fullName;
    @NotBlank
    private String phone;
    @NotBlank
    private String password;
    @NotNull
    private Role role;
    
    @NotBlank
    private String anganwadiId;
}
