package com.poshansetu.dto;

import com.poshansetu.model.Child;
import com.poshansetu.model.enums.MlPrediction;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChildSummaryDto {
    private Child child;
    private MlPrediction latestRiskLevel;
    private String lastVaccine;
    private String lastVaccineStatus;
}
