package com.star.repository;

import com.star.models.participant.tso.MarketParticipantTso;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
//TODO : Repository bouchon en attendant le câblage avec HLF
    @Slf4j
@Repository
public class MarketParticipantTsoRepository {

    public List<MarketParticipantTso> save(List<MarketParticipantTso> marketParticipantTsos, String userId) {
        log.info("Utilisateur {}. Sauvegarde des markets participants dso : {}", userId, marketParticipantTsos);
        return marketParticipantTsos;
    }

    public List<MarketParticipantTso> getMarketParticipantTsos() {
        // TODO bouchon temporaire. Il faudra coder ici la requête vers HLF
        MarketParticipantTso marketParticipantTso = new MarketParticipantTso("RTE01EIC", "RTE", "A49");
        return Arrays.asList(marketParticipantTso);
    }
}
