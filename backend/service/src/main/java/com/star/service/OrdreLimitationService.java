package com.star.service;

import com.cloudant.client.api.query.EmptyExpression;
import com.cloudant.client.api.query.Expression;
import com.cloudant.client.api.query.Operation;
import com.cloudant.client.api.query.QueryBuilder;
import com.cloudant.client.api.query.Selector;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.FileExtensionEnum;
import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.common.FichierImportation;
import com.star.models.limitation.ImportOrdreLimitationResult;
import com.star.models.limitation.OrdreLimitation;
import com.star.models.limitation.OrdreLimitationCriteria;
import com.star.repository.OrdreLimitationRepository;
import com.star.utils.DateUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import static com.star.enums.DocTypeEnum.ACTIVATION_DOCUMENT;
import static java.util.UUID.randomUUID;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.collections4.CollectionUtils.isEmpty;
import static org.apache.commons.collections4.CollectionUtils.isNotEmpty;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Service
public class OrdreLimitationService {

    private static final String REVISION_NUMBER = "1";
    private ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();
    @Autowired
    private ImportUtilsService importUtilsService;
    @Autowired
    private OrdreLimitationRepository ordreLimitationRepository;
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private ObjectMapper objectMapper;


    public ImportOrdreLimitationResult importOrdreDebutLimitation(List<FichierImportation> fichierOrdreLimitations, InstanceEnum instance) throws BusinessException, TechnicalException, IOException {
        importUtilsService.checkImportFiles(fichierOrdreLimitations, FileExtensionEnum.JSON.getValue());
        ImportOrdreLimitationResult importOrdreDebutLimitationResult = new ImportOrdreLimitationResult();
        List<String> errors = new ArrayList<>();
        Validator validator = validatorFactory.getValidator();
        List<OrdreLimitation> ordreDebutLimitations = new ArrayList<>();
        for (FichierImportation fichierOrdreLimitation : fichierOrdreLimitations) {
            String value = IOUtils.toString(fichierOrdreLimitation.getInputStream(), StandardCharsets.UTF_8);
            OrdreLimitation ordreLimitation = !isBlank(value) ? objectMapper.readValue(value, OrdreLimitation.class) : null;
            if (ordreLimitation == null) {
                errors.add(messageSource.getMessage("import.file.empty.error", new String[]{fichierOrdreLimitation.getFileName()}, null));
                break;
            }
            try {
                if (DateUtils.toLocalDateTime(ordreLimitation.getStartCreatedDateTime()) == null) {
                    errors.add(messageSource.getMessage("import.ordreLimitation.debut.startCreatedDateTime.error",
                            new String[]{fichierOrdreLimitation.getFileName()}, null));
                }
                if (DateUtils.toLocalDateTime(ordreLimitation.getEndCreatedDateTime()) != null) {
                    errors.add(messageSource.getMessage("import.ordreLimitation.debut.endCreatedDateTime.error",
                            new String[]{fichierOrdreLimitation.getFileName()}, null));
                }
            } catch (DateTimeParseException dateTimeParseException) {
                throw new BusinessException(messageSource.getMessage("import.date.format.error",
                        new String[]{fichierOrdreLimitation.getFileName()}, null));
            }

            // le champ "orderEnd" doit être à false
            if (ordreLimitation.isOrderEnd()) {
                errors.add(messageSource.getMessage("import.ordreLimitation.debut.orderEnd.error",
                        new String[]{fichierOrdreLimitation.getFileName()}, null));
            }
            errors.addAll(validator.validate(ordreLimitation).stream().map(violation ->
                    messageSource.getMessage("import.error",
                            new String[]{fichierOrdreLimitation.getFileName(), violation.getMessage()}, null)).collect(toList()));
            if (isEmpty(errors)) {
                ordreDebutLimitations.add(ordreLimitation);
            }
        }
        if (isNotEmpty(errors)) {
            importOrdreDebutLimitationResult.setErrors(errors);
        } else {
            ordreDebutLimitations.forEach(ordreDebutLimitation -> {
                ordreDebutLimitation.setActivationDocumentMrid(randomUUID().toString());
                ordreDebutLimitation.setInstance(instance.getValue());
                ordreDebutLimitation.setDocType(ACTIVATION_DOCUMENT.getDocType());
                ordreDebutLimitation.setSubOrderList(new ArrayList<>());
                ordreDebutLimitation.setEndCreatedDateTime(EMPTY);
                if (ordreDebutLimitation.getOrderValue() == null) {
                    ordreDebutLimitation.setOrderValue(EMPTY);
                }
                if (ordreDebutLimitation.getReceiverMarketParticipantMrid() == null) {
                    ordreDebutLimitation.setReceiverMarketParticipantMrid(EMPTY);
                }
                if (ordreDebutLimitation.getRevisionNumber() == null) {
                    ordreDebutLimitation.setRevisionNumber(REVISION_NUMBER);
                }
                if (ordreDebutLimitation.getSenderMarketParticipantMrid() == null) {
                    ordreDebutLimitation.setSenderMarketParticipantMrid(EMPTY);
                }
            });
            importOrdreDebutLimitationResult.setDatas(ordreLimitationRepository.saveOrdreLimitations(ordreDebutLimitations));
        }
        return importOrdreDebutLimitationResult;
    }

    public ImportOrdreLimitationResult importCoupleOrdreDebutFin(List<FichierImportation> fichierOrdreLimitations, InstanceEnum instance) throws BusinessException, TechnicalException, IOException {
        importUtilsService.checkImportFiles(fichierOrdreLimitations, FileExtensionEnum.JSON.getValue());
        ImportOrdreLimitationResult importCoupleOrdreLimitationResult = new ImportOrdreLimitationResult();
        List<String> errors = new ArrayList<>();
        Validator validator = validatorFactory.getValidator();
        List<OrdreLimitation> ordreLimitations = new ArrayList<>();
        for (FichierImportation fichierOrdreLimitation : fichierOrdreLimitations) {
            String value = IOUtils.toString(fichierOrdreLimitation.getInputStream(), StandardCharsets.UTF_8);
            OrdreLimitation ordreLimitation = !isBlank(value) ? objectMapper.readValue(value, OrdreLimitation.class) : null;
            if (ordreLimitation == null) {
                errors.add(messageSource.getMessage("import.file.empty.error", new String[]{fichierOrdreLimitation.getFileName()}, null));
                break;
            }
            // le champ "orderEnd" doit être à false
            if (ordreLimitation.isOrderEnd()) {
                errors.add(messageSource.getMessage("import.ordreLimitation.couple.orderEnd.error",
                        new String[]{fichierOrdreLimitation.getFileName()}, null));
            }
            errors.addAll(validator.validate(ordreLimitation).stream().map(violation ->
                    messageSource.getMessage("import.error",
                            new String[]{fichierOrdreLimitation.getFileName(), violation.getMessage()}, null)).collect(toList()));
            if (isEmpty(errors)) {
                ordreLimitations.add(ordreLimitation);
            }
        }
        if (isNotEmpty(errors)) {
            importCoupleOrdreLimitationResult.setErrors(errors);
        } else {
            ordreLimitations.forEach(ordreDebutLimitation -> {
                ordreDebutLimitation.setActivationDocumentMrid(randomUUID().toString());
                ordreDebutLimitation.setInstance(instance.getValue());
                ordreDebutLimitation.setSubOrderList(new ArrayList<>());
                ordreDebutLimitation.setDocType(ACTIVATION_DOCUMENT.getDocType());
                if (ordreDebutLimitation.getOrderValue() == null) {
                    ordreDebutLimitation.setOrderValue(EMPTY);
                }
                if (ordreDebutLimitation.getReceiverMarketParticipantMrid() == null) {
                    ordreDebutLimitation.setReceiverMarketParticipantMrid(EMPTY);
                }
                if (ordreDebutLimitation.getRevisionNumber() == null) {
                    ordreDebutLimitation.setRevisionNumber(REVISION_NUMBER);
                }
                if (ordreDebutLimitation.getSenderMarketParticipantMrid() == null) {
                    ordreDebutLimitation.setSenderMarketParticipantMrid(EMPTY);
                }
            });
            importCoupleOrdreLimitationResult.setDatas(ordreLimitationRepository.saveOrdreLimitations(ordreLimitations));
        }
        return importCoupleOrdreLimitationResult;
    }

    public List<OrdreLimitation> getOrdreDebutLimitation(InstanceEnum instance) throws TechnicalException {
        List<Selector> selectors = new ArrayList<>();
        selectors.add(Expression.eq("docType", ACTIVATION_DOCUMENT.getDocType()));
        selectors.add(Expression.eq("instance", instance.getValue()));
        selectors.add(Expression.eq("endCreatedDateTime", EMPTY));
        selectors.add(Expression.eq("orderEnd", false));
        selectors.add(Expression.eq("reconciliation", false));
        QueryBuilder queryBuilder = new QueryBuilder(Operation.and(selectors.toArray(new Selector[]{})));
        String query = queryBuilder.build();
        log.debug("Transaction query: " + query);
        return ordreLimitationRepository.findOrderByQuery(query);
    }

    public List<OrdreLimitation> findLimitationOrders(OrdreLimitationCriteria criteria) throws TechnicalException {
        var selectors = new ArrayList<Selector>();
        selectors.add(Expression.eq("docType", ACTIVATION_DOCUMENT.getDocType()));
        QueryBuilder queryBuilder;
        addCriteria(selectors, criteria);
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
        String query = queryBuilder.build();
        log.debug("Transaction query: " + query);
        return ordreLimitationRepository.findLimitationOrders(query);
    }

    private void addCriteria(List<Selector> selectors, OrdreLimitationCriteria criteria) {
        if (isNotBlank(criteria.getActivationDocumentMrid())) {
            selectors.add(Expression.eq("activationDocumentMrid", criteria.getActivationDocumentMrid()));
        }
    }
}
