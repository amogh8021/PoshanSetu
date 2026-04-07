package com.poshansetu.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth

                        // ✅ Allow preflight
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ Public APIs
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()

                        // ✅ IMPORTANT: specific first
                        .requestMatchers("/api/child/my-children/**").hasRole("PARENT")
                        .requestMatchers("/api/child/*/growth-chart").hasAnyRole("PARENT", "WORKER", "ADMIN")

                        // ✅ Worker/Admin APIs
                        .requestMatchers("/api/child/**").hasAnyRole("WORKER", "ADMIN")
                        .requestMatchers("/api/health/*/latest").hasAnyRole("PARENT", "WORKER", "ADMIN")
                        .requestMatchers("/api/health/**").hasAnyRole("WORKER", "ADMIN")
                        .requestMatchers("/api/vaccine/*/upcoming").hasAnyRole("PARENT", "WORKER", "ADMIN")
                        .requestMatchers("/api/vaccine/**").hasAnyRole("WORKER", "ADMIN")
                        .requestMatchers("/api/pregnancy/**").hasAnyRole("WORKER", "ADMIN")
                        .requestMatchers("/api/nutrition/**").hasAnyRole("WORKER", "ADMIN")

                        // ✅ Admin APIs
                        .requestMatchers("/api/admin/stats/**").hasAnyRole("ADMIN", "WORKER")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
