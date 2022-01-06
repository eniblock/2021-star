package com.star.models.participant.tso;

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
public class ImportMarketParticipantTsoResult implements ImportResult<MarketParticipantTso> {

    List<MarketParticipantTso> datas = new ArrayList<>();
    List<String> errors =  new ArrayList<>();

    @Override
    public List<MarketParticipantTso> getDatas() {
        return datas;
    }

    @Override
    public void setDatas(List<MarketParticipantTso> marketParticipantTsos) {
        this.datas = marketParticipantTsos;
    }

    @Override
    public List<String> getErrors() {
        return errors;
    }
}