package com.vbbs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class BloodRequestDto {
    @NotBlank
    private String patientName;

    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Invalid blood group")
    private String bloodGroup;

    @Positive
    private int unitsRequired;

    @NotBlank
    private String hospitalName;

    @NotBlank
    private String city;
}
