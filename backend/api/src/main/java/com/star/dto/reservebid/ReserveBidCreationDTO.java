package com.star.dto.reservebid;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReserveBidCreationDTO {

    @Schema(description = "The energy price amount", example = "123.765")
    @NotNull(message = "Le champ energyPriceAmount est obligatoire")
    private Float energyPriceAmount;


    @Schema(description = "The start datetime of the validity of the energy price", example = "2022-12-23T23:00:00.000Z")
    @NotNull(message = "Le champ validityPeriodStartDateTime est obligatoire")
    private String validityPeriodStartDateTime;

    @Schema(description = "The Mrid of the meteringPoint", example = "PRM30001510803649")
    @NotBlank(message = "Le champ meteringPointMrid est obligatoire")
    private String meteringPointMrid;

    @Schema(description = "Three values : 'CR' (complément de rémunération), 'OA' (Obligation d'achat), 'DAILY_MARKET'", example = "OA")
    private String marketType;

}