package com.star.service;

import com.cloudant.client.api.query.EmptyExpression;
import com.cloudant.client.api.query.Expression;
import com.cloudant.client.api.query.Operation;
import com.cloudant.client.api.query.QueryBuilder;
import com.cloudant.client.api.query.Selector;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.star.enums.DocTypeEnum;
import com.star.exception.TechnicalException;
import com.star.models.imports.ImportResult;
import com.star.models.participant.SystemOperator;
import com.star.models.producer.Producer;
import com.star.models.site.SiteCrteria;
import com.star.models.site.dso.ImportSiteDsoResult;
import com.star.models.site.dso.SiteDso;
import com.star.models.site.dso.SiteDsoResponse;
import com.star.models.site.tso.ImportSiteTsoResult;
import com.star.models.site.tso.SiteTso;
import com.star.models.site.tso.SiteTsoResponse;
import com.star.repository.MarketParticipantRepository;
import com.star.repository.ProducerRepository;
import com.star.repository.SiteRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.lang3.StringUtils;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.star.enums.DocTypeEnum.SITE;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.collections4.CollectionUtils.isNotEmpty;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Service
@Slf4j
public class SiteService {

    @Autowired
    private MessageSource messageSource;
    @Autowired
    private ImportUtilsService importUtilsService;
    @Autowired
    private SiteRepository siteRepository;
    @Autowired
    private MarketParticipantRepository marketParticipantRepository;
    @Autowired
    private ProducerRepository producerRepository;

    /**
     * Permet d'importer les sites DSO selon les informations contenues dans le fichier CSV passé en paramètre.
     *
     * @param fileName     nom du fichier CSV à traiter.
     * @param streamReader le contenu du fichier CSV à traiter, en tant qu'objet {@link Reader}
     * @return {@link ImportSiteDsoResult} contenant les sites importés et les éventuelles erreurs des lignes ne respectant pas le format.
     * @throws IOException
     */
    public ImportSiteDsoResult importSiteDso(String fileName, Reader streamReader) throws IOException, TechnicalException, ContractException {
        importUtilsService.checkFile(fileName, streamReader);
        ImportSiteDsoResult importSiteDsoResult = new ImportSiteDsoResult();
        CSVParser csvParser = importUtilsService.getCsvParser(streamReader);
        // Vérifier le header du fichier
        importUtilsService.validateHeader(fileName, csvParser, new SiteDso(), importSiteDsoResult);
        if (isNotEmpty(importSiteDsoResult.getErrors())) {
            importSiteDsoResult.setDatas(Collections.emptyList());
            return importSiteDsoResult;
        }
        // Vérifier le contenu du fichier
        this.validateBody(fileName, csvParser, importSiteDsoResult, false);
        if (isNotEmpty(importSiteDsoResult.getErrors())) {
            importSiteDsoResult.setDatas(Collections.emptyList());
            return importSiteDsoResult;
        }
        // Vérifier que les ids n'existent pas déjà
        List<String> meteringPointMrids = importSiteDsoResult.getDatas().stream().map(siteDso -> siteDso.getMeteringPointMrid()).collect(toList());
        for (String meteringPointMrid : meteringPointMrids) {
            if (siteRepository.existSite(meteringPointMrid)) {
                importSiteDsoResult.getErrors().add(messageSource.getMessage("import.file.meteringpointmrid.exist.error",
                        new String[]{meteringPointMrid}, null));
            }
        }
        if (isNotEmpty(importSiteDsoResult.getErrors())) {
            importSiteDsoResult.setDatas(Collections.emptyList());
            return importSiteDsoResult;
        }
        if (CollectionUtils.isEmpty(importSiteDsoResult.getErrors()) && CollectionUtils.isEmpty(importSiteDsoResult.getDatas())) {
            throw new IllegalArgumentException(messageSource.getMessage("import.file.data.not.empty", null, null));
        }
        List<SystemOperator> systemOperators = marketParticipantRepository.getSystemOperators();
        Map<String, String> map = systemOperators.stream()
                .collect(Collectors.toMap(SystemOperator::getSystemOperatorMarketParticipantMrid, SystemOperator::getSystemOperatorMarketParticipantName));
        importSiteDsoResult.getDatas().forEach(siteDso -> {
            siteDso.setProducerMarketParticipantName(map.get(siteDso.getProducerMarketParticipantMrid()));
        });
        importSiteDsoResult.setDatas(siteRepository.saveSiteDso(importSiteDsoResult.getDatas()));
        return importSiteDsoResult;
    }


    /**
     * Permet d'importer les sites TSO selon les informations contenues dans le fichier CSV passé en paramètre.
     *
     * @param fileName     nom du fichier CSV à traiter.
     * @param streamReader le contenu du fichier CSV à traiter, en tant qu'objet {@link Reader}
     * @return {@link ImportSiteTsoResult} contenant les sites importés et les éventuelles erreurs des lignes ne respectant pas le format.
     * @throws IOException
     */
    public ImportSiteTsoResult importSiteTso(String fileName, Reader streamReader) throws IOException, TechnicalException {
        importUtilsService.checkFile(fileName, streamReader);
        ImportSiteTsoResult importSiteTsoResult = new ImportSiteTsoResult();
        CSVParser csvParser = importUtilsService.getCsvParser(streamReader);
        // Vérifier le header du fichier
        importUtilsService.validateHeader(fileName, csvParser, new SiteTso(), importSiteTsoResult);
        if (isNotEmpty(importSiteTsoResult.getErrors())) {
            importSiteTsoResult.setDatas(Collections.emptyList());
            return importSiteTsoResult;
        }
        // Vérifier le contenu du fichier
        this.validateBody(fileName, csvParser, importSiteTsoResult, true);
        if (isNotEmpty(importSiteTsoResult.getErrors())) {
            importSiteTsoResult.setDatas(Collections.emptyList());
            return importSiteTsoResult;
        }
        // Vérifier que les ids n'existent pas déjà
        List<String> meteringPointMrids = importSiteTsoResult.getDatas().stream().map(siteTso -> siteTso.getMeteringPointMrid()).collect(toList());
        for (String meteringPointMrid : meteringPointMrids) {
            if (siteRepository.existSite(meteringPointMrid)) {
                importSiteTsoResult.getErrors().add(messageSource.getMessage("import.file.meteringpointmrid.exist.error",
                        new String[]{meteringPointMrid}, null));
            }
        }
        if (isNotEmpty(importSiteTsoResult.getErrors())) {
            importSiteTsoResult.setDatas(Collections.emptyList());
            return importSiteTsoResult;
        }
        if (CollectionUtils.isEmpty(importSiteTsoResult.getErrors()) && CollectionUtils.isEmpty(importSiteTsoResult.getDatas())) {
            throw new IllegalArgumentException(messageSource.getMessage("import.file.data.not.empty", null, null));
        }

        List<Producer> producers = producerRepository.getProducers();
        Map<String, String> map = producers.stream()
                .collect(Collectors.toMap(Producer::getProducerMarketParticipantMrid, Producer::getProducerMarketParticipantName));
        importSiteTsoResult.getDatas().forEach(siteTso -> {
            siteTso.setProducerMarketParticipantName(map.get(siteTso.getProducerMarketParticipantMrid()));
        });
        importSiteTsoResult.setDatas(siteRepository.saveSiteTso(importSiteTsoResult.getDatas()));
        return importSiteTsoResult;
    }

    public SiteDsoResponse findSiteDso(SiteCrteria siteCrteria, String bookmark, Pageable pageable) throws JsonProcessingException, ContractException, TechnicalException {
        boolean useIndex = false;
        Sort.Order producerMarketParticipantNameOrder = pageable.getSort().getOrderFor("producerMarketParticipantName");
        Sort.Order technologyTypeOrder = pageable.getSort().getOrderFor("technologyType");
        List<Selector> selectors = new ArrayList<>();
        QueryBuilder queryBuilder;
        addCriteria(selectors, siteCrteria, SITE);
        switch (selectors.size()) {
            case 0:
                queryBuilder = new QueryBuilder(EmptyExpression.empty());
                break;
            case 1:
                queryBuilder = new QueryBuilder(selectors.get(0));
                break;
            default:
                queryBuilder = new QueryBuilder(Operation.and(selectors.toArray(new Selector[]{})));
                break;
        }
        if (technologyTypeOrder != null) {
            useIndex = true;
            queryBuilder.sort(com.cloudant.client.api.query.Sort.asc(technologyTypeOrder.getProperty()));
        }
        if (producerMarketParticipantNameOrder != null) {
            useIndex = true;
            queryBuilder.sort(com.cloudant.client.api.query.Sort.asc(producerMarketParticipantNameOrder.getProperty()));
        }
        if (useIndex) {
            queryBuilder.useIndex(SITE.getIndexName());
        }
        String query = queryBuilder.build();
        log.info("Transaction query: " + query);
        SiteDsoResponse siteDsoResponse = siteRepository.findSiteDsoByQuery(query, String.valueOf(pageable.getPageSize()), bookmark);
        if (siteDsoResponse != null && isNotEmpty(siteDsoResponse.getRecords())) {
            List<Producer> producers = producerRepository.getProducers();
            Map<String, String> map = producers.stream()
                    .collect(Collectors.toMap(Producer::getProducerMarketParticipantMrid, Producer::getProducerMarketParticipantName));
            siteDsoResponse.getRecords().forEach(siteDso -> {
                siteDso.setProducerMarketParticipantName(map.get(siteDso.getProducerMarketParticipantMrid()));
            });
        }
        return siteDsoResponse;
    }


    public SiteTsoResponse findSiteTso(SiteCrteria siteCrteria, String bookmark, Pageable pageable) throws JsonProcessingException, ContractException, TechnicalException {
        boolean useIndex = false;
        Sort.Order producerMarketParticipantNameOrder = pageable.getSort().getOrderFor("producerMarketParticipantName");
        Sort.Order technologyTypeOrder = pageable.getSort().getOrderFor("technologyType");
        List<Selector> selectors = new ArrayList<>();
        QueryBuilder queryBuilder;
        addCriteria(selectors, siteCrteria, SITE);
        switch (selectors.size()) {
            case 0:
                queryBuilder = new QueryBuilder(EmptyExpression.empty());
                break;
            case 1:
                queryBuilder = new QueryBuilder(selectors.get(0));
                break;
            default:
                queryBuilder = new QueryBuilder(Operation.and(selectors.toArray(new Selector[]{})));
                break;
        }
        if (technologyTypeOrder != null) {
            useIndex = true;
            queryBuilder.sort(com.cloudant.client.api.query.Sort.asc(technologyTypeOrder.getProperty()));
        }
        if (producerMarketParticipantNameOrder != null) {
            useIndex = true;
            queryBuilder.sort(com.cloudant.client.api.query.Sort.asc(producerMarketParticipantNameOrder.getProperty()));
        }
        if (useIndex) {
            queryBuilder.useIndex(SITE.getIndexName());
        }
        String query = queryBuilder.build();
        log.info("Transaction query: " + query);
        SiteTsoResponse siteTsoResponse = siteRepository.findSiteTsoByQuery(query, String.valueOf(pageable.getPageSize()), bookmark);
        if (siteTsoResponse != null && isNotEmpty(siteTsoResponse.getRecords())) {
            List<SystemOperator> systemOperators = marketParticipantRepository.getSystemOperators();
            Map<String, String> map = systemOperators.stream()
                    .collect(Collectors.toMap(SystemOperator::getSystemOperatorMarketParticipantMrid, SystemOperator::getSystemOperatorMarketParticipantName));
            siteTsoResponse.getRecords().forEach(siteTso ->
                siteTso.setSystemOperatorMarketParticipantName(map.get(siteTso.getSystemOperatorMarketParticipantMrid())));
        }
        return siteTsoResponse;
    }


    private void addCriteria(List<Selector> selectors, SiteCrteria siteCrteria, DocTypeEnum docTypeEnum) {
        selectors.add(Expression.eq("docType", docTypeEnum.getDocType()));
        if (isNotBlank(siteCrteria.getSiteName())) {
            selectors.add(Expression.eq("siteName", siteCrteria.getSiteName()));
        }
        if (isNotBlank(siteCrteria.getSubstationName())) {
            selectors.add(Expression.eq("substationName", siteCrteria.getSubstationName()));
        }

        if (isNotBlank(siteCrteria.getSubstationMrid())) {
            selectors.add(Expression.eq("substationMrid", siteCrteria.getSubstationMrid()));
        }

        if (isNotBlank(siteCrteria.getProducerMarketParticipantName())) {
            selectors.add(Expression.eq("producerMarketParticipantName", siteCrteria.getProducerMarketParticipantName()));
        }

        if (isNotBlank(siteCrteria.getProducerMarketParticipantMrid())) {
            selectors.add(Expression.eq("producerMarketParticipantMrid", siteCrteria.getProducerMarketParticipantMrid()));
        }

        if (isNotBlank(siteCrteria.getSiteIecCode())) {
            selectors.add(Expression.eq("siteIecCode", siteCrteria.getSiteIecCode()));
        }

        if (isNotBlank(siteCrteria.getMeteringPointMrId())) {
            selectors.add(Expression.eq("meteringPointMrId", siteCrteria.getMeteringPointMrId()));
        }

        if (isNotEmpty(siteCrteria.getTechnologyType())) {
            List<String> technologies = siteCrteria.getTechnologyType().stream().map(technologyTypeEnum -> technologyTypeEnum.getValue()).collect(toList());
            selectors.add(Expression.in("technologyType", StringUtils.join(technologies, "\",\"")));
        }
    }

    private void validateBody(String fileName, CSVParser csvParser, ImportResult importResult, boolean isTso) {
        // Vérifier le contenu du fichier
        for (CSVRecord csvRecord : csvParser) {
            SiteTso siteTso = null;
            SiteDso siteDso = null;
            Long lineNumber = csvRecord.getRecordNumber() + 1;
            // Le constructeur peut échouer dans le cas ou le record ne correspond pas à tous les paramètres attendus
            try {
                if (isTso) {
                    siteTso = new SiteTso();
                    siteTso.setData(csvRecord);
                } else {
                    siteDso = new SiteDso();
                    siteDso.setData(csvRecord);
                }
            } catch (IllegalArgumentException illegalArgumentException) {
                importUtilsService.handleConstructorException(fileName, importResult, lineNumber, illegalArgumentException);
            }
            // Erreur de validation des annotations
            String errorRecord;
            if (isTso) {
                errorRecord = importUtilsService.validateRecord(fileName, csvRecord, siteTso);
            } else {
                errorRecord = importUtilsService.validateRecord(fileName, csvRecord, siteDso);
            }
            if (errorRecord != null) {
                log.error(errorRecord);
                importResult.getErrors().add(errorRecord);
            } else {
                importResult.getDatas().add(siteTso != null ? siteTso : siteDso);
            }
        }
    }
}
