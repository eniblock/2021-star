package com.star.service;

import com.cloudant.client.api.query.EmptyExpression;
import com.cloudant.client.api.query.Expression;
import com.cloudant.client.api.query.Operation;
import com.cloudant.client.api.query.QueryBuilder;
import com.cloudant.client.api.query.Selector;
import com.star.enums.DocTypeEnum;
import com.star.enums.FileExtensionEnum;
import com.star.enums.InstanceEnum;
import com.star.enums.TechnologyTypeEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.imports.ImportResult;
import com.star.models.producer.Producer;
import com.star.models.site.ImportSiteResult;
import com.star.models.site.Site;
import com.star.models.site.SiteCrteria;
import com.star.models.site.SiteResponse;
import com.star.repository.ProducerRepository;
import com.star.repository.SiteRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.star.enums.DocTypeEnum.SITE;
import static com.star.enums.InstanceEnum.DSO;
import static com.star.enums.InstanceEnum.TSO;
import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.collections4.CollectionUtils.isNotEmpty;
import static org.apache.commons.lang3.StringUtils.isBlank;
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
    private ProducerRepository producerRepository;

    /**
     * Permet d'importer les sites selon les informations contenues dans le fichier CSV passé en paramètre.
     *
     * @param fileName     nom du fichier CSV à traiter.
     * @param streamReader le contenu du fichier CSV à traiter, en tant qu'objet {@link Reader}
     * @return {@link ImportSiteResult} contenant les sites importés et les éventuelles erreurs des lignes ne respectant pas le format.
     * @throws IOException
     */
    public ImportSiteResult importSite(String fileName, Reader streamReader, InstanceEnum instance) throws IOException, TechnicalException, BusinessException {

        importUtilsService.checkFile(fileName, streamReader, FileExtensionEnum.CSV.getValue());
        ImportSiteResult importSiteResult = new ImportSiteResult();
        CSVParser csvParser = importUtilsService.getCsvParser(streamReader);
        // Vérifier le header du fichier
        importUtilsService.validateHeader(fileName, csvParser, new Site(), importSiteResult);
        if (isNotEmpty(importSiteResult.getErrors())) {
            importSiteResult.setDatas(emptyList());
            return importSiteResult;
        }
        // Vérifier le contenu du fichier
        this.validateBody(fileName, csvParser, importSiteResult, instance);
        if (isNotEmpty(importSiteResult.getErrors())) {
            importSiteResult.setDatas(emptyList());
            return importSiteResult;
        }
        // Vérifier que les ids n'existent pas déjà
        List<String> meteringPointMrids = importSiteResult.getDatas().stream().map(Site::getMeteringPointMrid).collect(toList());
        for (String meteringPointMrid : meteringPointMrids) {
            if (siteRepository.existSite(meteringPointMrid)) {
                importSiteResult.getErrors().add(messageSource.getMessage("import.file.meteringpointmrid.exist.error",
                        new String[]{meteringPointMrid}, null));
            }
        }
        if (isNotEmpty(importSiteResult.getErrors())) {
            importSiteResult.setDatas(emptyList());
            return importSiteResult;
        }
        if (CollectionUtils.isEmpty(importSiteResult.getErrors()) && CollectionUtils.isEmpty(importSiteResult.getDatas())) {
            throw new IllegalArgumentException(messageSource.getMessage("import.file.data.not.empty", null, null));
        }
        Map<String, String> mapProducers = producerRepository.getProducers().stream()
                .collect(Collectors.toMap(Producer::getProducerMarketParticipantMrid, Producer::getProducerMarketParticipantName));
        importSiteResult.getDatas().forEach(site -> {
            site.setProducerMarketParticipantName(mapProducers.get(site.getProducerMarketParticipantMrid()));
            if (site.getTechnologyType() != null) {
                site.setTechnologyType(TechnologyTypeEnum.fromValue(site.getTechnologyType()).getLabel());
            }
        });
        importSiteResult.setDatas(siteRepository.saveSites(importSiteResult.getDatas()));
        return importSiteResult;
    }


    public SiteResponse findSite(SiteCrteria siteCrteria, String bookmark, Pageable pageable) throws BusinessException, TechnicalException {
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
//        TODO : à réactiver lorsque les indexes seront consommées sur la blockchain
//        if (technologyTypeOrder != null) {
//            useIndex = true;
//            queryBuilder.sort(com.cloudant.client.api.query.Sort.asc(technologyTypeOrder.getProperty()));
//            queryBuilder.useIndex(SITE.getIndexName(), "indexTechnologyType");
//        } else if (producerMarketParticipantNameOrder != null) {
//            useIndex = true;
//            queryBuilder.sort(com.cloudant.client.api.query.Sort.asc(producerMarketParticipantNameOrder.getProperty()));
//            queryBuilder.useIndex(SITE.getIndexName(), "indexProducerMarketParticipantName");
//        }
//        if (!useIndex) {
//            queryBuilder.useIndex(SITE.getIndexName());
//        }
        String query = queryBuilder.build();
        log.info("Transaction query: " + query);
        return siteRepository.findSiteByQuery(query, String.valueOf(pageable.getPageSize()), bookmark);
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
            List<String> technologies = siteCrteria.getTechnologyType().stream().map(TechnologyTypeEnum::getLabel).collect(toList());
            selectors.add(Expression.in("technologyType", StringUtils.join(technologies, "\",\"")));
        }
    }

    private void validateBody(String fileName, CSVParser csvParser, ImportResult importResult, InstanceEnum instance) {
        // Vérifier le contenu du fichier
        for (CSVRecord csvRecord : csvParser) {
            Site site = null;
            Long lineNumber = csvRecord.getRecordNumber() + 1;
            // Le constructeur peut échouer dans le cas ou le record ne correspond pas à tous les paramètres attendus
            try {
                site = new Site();
                site.setData(csvRecord);
            } catch (IllegalArgumentException illegalArgumentException) {
                importUtilsService.handleConstructorException(fileName, importResult, lineNumber, illegalArgumentException);
            }
            List<String> errors = importUtilsService.validateRecord(fileName, csvRecord, site);
            if (TSO.equals(instance) && site != null) {
                if (isBlank(site.getMarketEvaluationPointMrid())) {
                    errors.add(messageSource.getMessage("import.site.marketEvaluationPointMrid.line.error",
                            new String[]{fileName, String.valueOf(lineNumber)}, null));
                }
                if (isBlank(site.getSchedulingEntityRegisteredResourceMrid())) {
                    errors.add(messageSource.getMessage("import.site.schedulingEntityRegisteredResourceMrid.line.error",
                            new String[]{fileName, String.valueOf(lineNumber)}, null));
                }
            }
            if (CollectionUtils.isNotEmpty(errors)) {
                importResult.getErrors().addAll(errors);
            } else {
                importResult.getDatas().add(site);
            }
        }
    }
}
