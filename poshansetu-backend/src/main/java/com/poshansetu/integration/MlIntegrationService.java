package com.poshansetu.integration;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MlIntegrationService {

    private final RestTemplate restTemplate;

    @Value("${ml.malnutrition.url}")
    private String malnutritionUrl;

    @Value("${ml.pregnancy.url}")
    private String pregnancyUrl;

    @Value("${ml.vaccine.url}")
    private String vaccineUrl;

    @Value("${ml.nutrition.url}")
    private String nutritionUrl;

    @Data
    public static class MalnutritionRequest {
        private int age;
        private String gender;
        private String motherEducation;
        private double weightKg;
        private double heightCm;
        private String stunting;
        private String anemia;
        private String malaria;
        private String diarrhea;
        private String tb;
    }

    @Data
    public static class MalnutritionResponse {
        private String prediction;
        private double confidence;
    }

    public MalnutritionResponse predictMalnutrition(MalnutritionRequest req) {
        try {
            MalnutritionResponse response = restTemplate.postForObject(malnutritionUrl, req, MalnutritionResponse.class);
            return (response != null) ? response : createMalnutritionFallback();
        } catch (RestClientException e) {
            log.warn("Failed to call malnutrition ML service", e);
            return createMalnutritionFallback();
        }
    }

    private MalnutritionResponse createMalnutritionFallback() {
        MalnutritionResponse fallback = new MalnutritionResponse();
        fallback.setPrediction("PENDING");
        return fallback;
    }

    @Data
    public static class PregnancyRequest {
        private int age;
        private int systolicBP;
        private int diastolicBP;
        private double bloodSugar;
        private double bodyTemp;
        private int heartRate;
    }

    @Data
    public static class PregnancyResponse {
        private String riskLevel;
        private double confidence;
    }

    public PregnancyResponse predictPregnancyRisk(PregnancyRequest req) {
        try {
            PregnancyResponse response = restTemplate.postForObject(pregnancyUrl, req, PregnancyResponse.class);
            return (response != null) ? response : createPregnancyFallback();
        } catch (RestClientException e) {
            log.warn("Failed to call pregnancy ML service", e);
            return createPregnancyFallback();
        }
    }

    private PregnancyResponse createPregnancyFallback() {
        PregnancyResponse fallback = new PregnancyResponse();
        fallback.setRiskLevel("PENDING");
        return fallback;
    }

    @Data
    public static class VaccineDropoutRequest {
        private int missedDosesCount;
        private int lastAttendanceDays;
        private int totalDosesScheduled;
    }

    @Data
    public static class VaccineDropoutResponse {
        private boolean dropoutRisk;
        private double probability;
    }

    public VaccineDropoutResponse predictVaccineDropout(VaccineDropoutRequest req) {
        try {
            VaccineDropoutResponse response = restTemplate.postForObject(vaccineUrl + "/predict", req, VaccineDropoutResponse.class);
            return (response != null) ? response : createVaccineFallback();
        } catch (RestClientException e) {
            log.warn("Failed to call vaccine ML service", e);
            return createVaccineFallback();
        }
    }

    private VaccineDropoutResponse createVaccineFallback() {
        VaccineDropoutResponse fallback = new VaccineDropoutResponse();
        fallback.setDropoutRisk(false);
        return fallback;
    }

    @Data
    public static class NutritionRequest {
        private double caloriesKcal;
        private double proteinG;
        private double ironMg;
        private double vitaminA;
    }

    @Data
    public static class NutritionResponse {
        private String status;
        private List<String> deficientNutrients;
    }

    public NutritionResponse predictNutritionDeficiency(NutritionRequest req) {
        try {
            NutritionResponse response = restTemplate.postForObject(nutritionUrl + "/predict", req, NutritionResponse.class);
            return (response != null) ? response : createNutritionFallback();
        } catch (RestClientException e) {
            log.warn("Failed to call nutrition ML service", e);
            return createNutritionFallback();
        }
    }

    private NutritionResponse createNutritionFallback() {
        NutritionResponse fallback = new NutritionResponse();
        fallback.setStatus("PENDING");
        return fallback;
    }
}
