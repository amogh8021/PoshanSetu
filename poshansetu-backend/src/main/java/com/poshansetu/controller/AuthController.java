package com.poshansetu.controller;

import com.poshansetu.dto.ApiResponse;
import com.poshansetu.dto.LoginRequest;
import com.poshansetu.dto.RegisterRequest;
import com.poshansetu.model.User;
import com.poshansetu.repository.UserRepository;
import com.poshansetu.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ApiResponse<User> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.findFirstByPhone(req.getPhone()).isPresent()) {
            return new ApiResponse<>("ERROR", "Phone number already registered", null);
        }
        User user = User.builder()
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .anganwadiId(req.getAnganwadiId())
                .build();
        User saved = userRepository.save(user);
        return new ApiResponse<>("SUCCESS", "User registered", saved);
    }

    @PostMapping("/login")
    public ApiResponse<String> login(@Valid @RequestBody LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getPhone(), req.getPassword()));

        User user = userRepository.findFirstByPhone(req.getPhone())
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserDetails userDetails = userDetailsService.loadUserByUsername(req.getPhone());

        java.util.Map<String, Object> extraClaims = new java.util.HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("anganwadiId", user.getAnganwadiId());

        String token = jwtUtil.generateToken(userDetails, "ROLE_" + user.getRole().name(), extraClaims);

        return new ApiResponse<>("SUCCESS", "Login successful", token);
    }
}
