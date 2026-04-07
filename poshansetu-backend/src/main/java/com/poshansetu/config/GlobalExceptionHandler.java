package com.poshansetu.config;

import com.poshansetu.dto.ApiResponse;
import com.poshansetu.exception.ResourceNotFoundException;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({NoResourceFoundException.class, ResourceNotFoundException.class})
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<String> handleNotFound(Exception ex) {
        return new ApiResponse<>("ERROR", ex.getMessage() != null ? ex.getMessage() : "Resource not found", null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ApiResponse<>("ERROR", "Validation failed", errors);
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<String> handleAccessDenied(AccessDeniedException ex) {
        return new ApiResponse<>("ERROR", "Access denied", null);
    }

    @ExceptionHandler(JwtException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<String> handleJwtException(JwtException ex) {
        return new ApiResponse<>("ERROR", "Invalid or expired token", null);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<String> handleGenericException(Exception ex) {
        return new ApiResponse<>("ERROR", "Internal server error", null);
    }
}
