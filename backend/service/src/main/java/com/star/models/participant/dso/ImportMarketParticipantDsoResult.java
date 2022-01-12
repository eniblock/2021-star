package com.star.models.participant.dso;

import com.star.models.participant.ImportResult;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportMarketParticipantDsoResult implements ImportResult<MarketParticipantDso> {

    List<MarketParticipantDso> datas = new ArrayList<>();
    List<String> errors =  new ArrayList<>();

    @Override
    public List<MarketParticipantDso> getDatas() {
        return datas;
    }

    @Override
    public void setDatas(List<MarketParticipantDso> marketParticipantDsos) {
        this.datas = marketParticipantDsos;
    }

    @Override
    public List<String> getErrors() {
        return errors;
    }

}
