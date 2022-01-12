package com.star.models.participant;

import com.star.models.participant.dso.MarketParticipantDso;
import com.star.models.participant.tso.MarketParticipantTso;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketParticipant {
    private List<MarketParticipantDso> marketParticipantDsos;
    private List<MarketParticipantTso> marketParticipantTsos;
}
