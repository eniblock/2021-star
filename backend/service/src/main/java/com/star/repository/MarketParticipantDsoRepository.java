package com.star.repository;

import com.star.models.participant.dso.MarketParticipantDso;
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
public class MarketParticipantDsoRepository {

    public List<MarketParticipantDso> save(List<MarketParticipantDso> marketParticipantDsos, String userId) {
        log.info("Utilisateur {}. Sauvegarde des markets participants dso : {}", userId, marketParticipantDsos);
        return marketParticipantDsos;
    }

    public List<MarketParticipantDso> getMarketParticipantDsos() {
        // TODO bouchon temporaire. Il faudra coder ici la requête vers HLF
        MarketParticipantDso marketParticipantDso = new MarketParticipantDso("ENEDIS02EIC", "ENEDIS", "A50");
        return Arrays.asList(marketParticipantDso);
    }
}
