package com.star.dto.historiquelimitation;

import com.star.dto.common.MotifDTO;
import com.star.enums.MeasurementUnitTypeEnum;
import lombok.Getter;
import lombok.Setter;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Getter
@Setter
public class HistoriqueLimitationOrdreDTO {

    private String originAutomationRegisteredResourceMrid;
    private String startCreatedDateTime;
    private String endCreatedDateTime;
    private Integer quantity;
    private Integer orderValue;
    private MeasurementUnitTypeEnum measurementUnitName;
    private MotifDTO motif;

}
