package com.star.service;

import com.cloudant.client.api.query.Expression;
import com.cloudant.client.api.query.Selector;
import com.star.enums.InstanceEnum;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static com.star.enums.DocTypeEnum.ACTIVATION_DOCUMENT;
import static com.star.enums.DocTypeEnum.SITE;
import static com.star.enums.InstanceEnum.PRODUCER;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Service
@Slf4j
public class HistoriqueLimitationService {

    @Value("${instance}")
    private InstanceEnum instance;

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
        if ("originAutomationRegisteredResourceMrid".equals(pagination.getOrder())) {
            queryBuilder.sort(com.cloudant.client.api.query.Sort.asc(pagination.getOrder()));
            queryBuilder.useIndex(INDEX_NAME, "indexOriginAutomationRegisteredResourceMrid");
        } else {
            queryBuilder.useIndex(INDEX_NAME);
        }

        String query = queryBuilder.build();
        log.debug("Transaction query: " + query);
        return historiqueLimitationRepository.findHistoriqueByQuery(query, String.valueOf(pagination.getPageSize()), bookmark);
    }

    private void addCriteria(List<Selector> selectors, HistoriqueLimitationCriteria criteria) throws BusinessException {
        if (isNotBlank(criteria.getOriginAutomationRegisteredResourceMrid())) {
            selectors.add(Expression.eq("originAutomationRegisteredResourceMrid", criteria.getOriginAutomationRegisteredResourceMrid()));
        }
        if (isNotBlank(criteria.getProducerMarketParticipantMrid())) {
            selectors.add(Expression.eq("producerMarketParticipantMrid", criteria.getProducerMarketParticipantMrid()));
        }
        if (isNotBlank(criteria.getSiteName()) && !PRODUCER.equals(instance)) {
            selectors.add(Expression.eq("siteName", criteria.getSiteName()));
        }
        if (isNotBlank(criteria.getActivationDocumentMrid())) {
            selectors.add(Expression.eq("activationDocumentMrid", criteria.getActivationDocumentMrid()));
        }

        // The dates
        boolean aDateDebut = isNotBlank(criteria.getStartCreatedDateTime());
        boolean aDateFin = isNotBlank(criteria.getEndCreatedDateTime());
        String dateDebut = criteria.getStartCreatedDateTime();
        String dateFin = criteria.getEndCreatedDateTime();
        if (aDateDebut && !aDateFin) {
            // We want two dates for the research (start and end), or no date
            dateFin = dateDebut;
        }
        if (!aDateDebut && aDateFin) {
            // We want two dates for the research (start and end), or no date
            dateDebut = dateFin;
        }
        if (aDateDebut || aDateFin) { // If there are dates => we search taking it into account
            // 1) We increase DateFin of 1 day
            // TODO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            log.debug("------------------------------------------------------------");
            log.debug(dateFin);
            // 2) The search
            selectors.add(Expression.gt("endCreatedDateTime", dateDebut));
            selectors.add(Expression.lt("startCreatedDateTime", dateFin));
        }
    }

}
