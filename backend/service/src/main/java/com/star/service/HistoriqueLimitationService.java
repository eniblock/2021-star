package com.star.service;

import com.cloudant.client.api.query.Expression;
import com.cloudant.client.api.query.Selector;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.common.PageHLF;
import com.star.models.common.PaginationDto;
import com.star.models.historiquelimitation.HistoriqueLimitation;
import com.star.models.historiquelimitation.HistoriqueLimitationCriteria;
import com.star.models.site.SiteCrteria;
import com.star.repository.HistoriqueLimitationRepository;
import com.star.service.helpers.QueryBuilderHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static com.star.enums.DocTypeEnum.ACTIVATION_DOCUMENT;
import static com.star.enums.DocTypeEnum.SITE;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Service
@Slf4j
public class HistoriqueLimitationService {

    @Autowired
    private HistoriqueLimitationRepository historiqueLimitationRepository;

    public PageHLF<HistoriqueLimitation> findHistorique(HistoriqueLimitationCriteria criteria, String bookmark, PaginationDto pagination) throws TechnicalException {
        var selectors = new ArrayList<Selector>();
        var DOC_TYPE = ACTIVATION_DOCUMENT.getDocType();
        var INDEX_NAME = ACTIVATION_DOCUMENT.getIndexName();
        selectors.add(Expression.eq("docType", DOC_TYPE));
        addCriteria(selectors, criteria);
        var queryBuilder = QueryBuilderHelper.toQueryBuilder(selectors);

        // Index and order
        if (pagination.getOrder() != null) {
            queryBuilder.sort(com.cloudant.client.api.query.Sort.asc(pagination.getOrder()));
            switch (pagination.getOrder()) {
                case "originAutomationRegisteredResourceMrid":
                    // TODO : create this index !!!
                    queryBuilder.useIndex(INDEX_NAME, "indexOriginAutomationRegisteredResourceMrid");
                    break;
            }
        } else {
            queryBuilder.useIndex(INDEX_NAME);
        }

        //


        // TODO : Etape 1 => remonter toutes les données !

        // TODO : Check pagination

        // TODO : Check filtre (formulaire)

        // TODO : Check tri

        String query = queryBuilder.build();
        log.debug("Transaction query: " + query);
        return historiqueLimitationRepository.findHistoriqueByQuery(query, String.valueOf(pagination.getPageSize()), bookmark);
    }

    private void addCriteria(List<Selector> selectors, HistoriqueLimitationCriteria criteria) throws BusinessException {
        if (isNotBlank(criteria.getSiteName())) {
            selectors.add(Expression.eq("siteName", criteria.getSiteName()));
        }
        // TODO : à finir !!!

        // TODO : Normalement => pas de pb avec les producteurs (recuperer que leurs données) => filtre dans le controleur

    }

}
