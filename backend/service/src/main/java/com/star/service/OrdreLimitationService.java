package com.star.service;

import com.cloudant.client.api.query.Expression;
import com.cloudant.client.api.query.Operation;
import com.cloudant.client.api.query.QueryBuilder;
import com.cloudant.client.api.query.Selector;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.FileExtensionEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.limitation.FichierOrdreLimitation;
import com.star.models.limitation.ImportOrdreLimitationResult;
import com.star.models.limitation.OrdreLimitation;
import com.star.repository.OrdreLimitationRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
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


    public ImportOrdreLimitationResult importOrdreDebutLimitation(List<FichierOrdreLimitation> fichierOrdreLimitations) throws BusinessException, TechnicalException, IOException {
        Assert.notEmpty(fichierOrdreLimitations, messageSource.getMessage("import.ordreLimitation.files.empty", new String[]{}, null));
        fichierOrdreLimitations.forEach(fichierOrdreLimitation -> importUtilsService.checkFile(fichierOrdreLimitation.getFileName(),
                new InputStreamReader(fichierOrdreLimitation.getInputStream()), FileExtensionEnum.JSON.getValue()));
        ImportOrdreLimitationResult importOrdreDebutLimitationResult = new ImportOrdreLimitationResult();
        List<String> errors = new ArrayList<>();
        Validator validator = validatorFactory.getValidator();
        List<OrdreLimitation> ordreDebutLimitations = new ArrayList<>();
        ObjectMapper objectMapper = getObjectMapper();
        for (FichierOrdreLimitation fichierOrdreLimitation : fichierOrdreLimitations) {
            String value = IOUtils.toString(fichierOrdreLimitation.getInputStream(), StandardCharsets.UTF_8);
            OrdreLimitation ordreLimitation = !isBlank(value) ? objectMapper.readValue(value, OrdreLimitation.class) : null;
            if (ordreLimitation == null) {
                errors.add(messageSource.getMessage("import.file.empty.error", new String[]{fichierOrdreLimitation.getFileName()}, null));
                break;
            }
            // Vérifier que le champ "startCreatedDateTime" est renseigné
            if (ordreLimitation.getStartCreatedDateTime() == null) {
                errors.add(messageSource.getMessage("import.ordreLimitation.debut.startCreatedDateTime.error",
                        new String[]{fichierOrdreLimitation.getFileName()}, null));
            }
            // Vérifier que le champ "endCreatedDateTime" est vide,
            if (isNotBlank(ordreLimitation.getEndCreatedDateTime())) {
                errors.add(messageSource.getMessage("import.ordreLimitation.debut.endCreatedDateTime.error",
                        new String[]{fichierOrdreLimitation.getFileName()}, null));
            }
            // le champ "orderEnd" doit être à false
            if (ordreLimitation.isOrderEnd()) {
                errors.add(messageSource.getMessage("import.ordreLimitation.debut.orderEnd.error",
                        new String[]{fichierOrdreLimitation.getFileName()}, null));
            }
            errors.addAll(validator.validate(ordreLimitation).stream().map(violation ->
                    messageSource.getMessage("import.ordreLimitation.error",
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

    public ImportOrdreLimitationResult importCoupleOrdreDebutFin(List<FichierOrdreLimitation> fichierOrdreLimitations) throws BusinessException, TechnicalException, IOException {
        Assert.notEmpty(fichierOrdreLimitations, messageSource.getMessage("import.ordreLimitation.files.empty", new String[]{}, null));
        fichierOrdreLimitations.forEach(fichierOrdreLimitation -> importUtilsService.checkFile(fichierOrdreLimitation.getFileName(),
                new InputStreamReader(fichierOrdreLimitation.getInputStream()), FileExtensionEnum.JSON.getValue()));
        ImportOrdreLimitationResult importCoupleOrdreLimitationResult = new ImportOrdreLimitationResult();
        List<String> errors = new ArrayList<>();
        Validator validator = validatorFactory.getValidator();
        List<OrdreLimitation> ordreLimitations = new ArrayList<>();
        ObjectMapper objectMapper = getObjectMapper();
        for (FichierOrdreLimitation fichierOrdreLimitation : fichierOrdreLimitations) {
            String value = IOUtils.toString(fichierOrdreLimitation.getInputStream(), StandardCharsets.UTF_8);
            OrdreLimitation ordreLimitation = !isBlank(value) ? objectMapper.readValue(value, OrdreLimitation.class) : null;
            if (ordreLimitation == null) {
                errors.add(messageSource.getMessage("import.file.empty.error", new String[]{fichierOrdreLimitation.getFileName()}, null));
                break;
            }
            // Vérifier que le champ "startCreatedDateTime" est renseigné,
            if (ordreLimitation.getStartCreatedDateTime() == null) {
                errors.add(messageSource.getMessage("import.ordreLimitation.couple.startCreatedDateTime.error",
                        new String[]{fichierOrdreLimitation.getFileName()}, null));
            }

            // Vérifier que le champ "endCreatedDateTime" est renseigné
            if (ordreLimitation.getEndCreatedDateTime() == null) {
                errors.add(messageSource.getMessage("import.ordreLimitation.couple.endCreatedDateTime.error",
                        new String[]{fichierOrdreLimitation.getFileName()}, null));
            }
            // le champ "orderEnd" doit être à false
            if (ordreLimitation.isOrderEnd()) {
                errors.add(messageSource.getMessage("import.ordreLimitation.couple.orderEnd.error",
                        new String[]{fichierOrdreLimitation.getFileName()}, null));
            }
            errors.addAll(validator.validate(ordreLimitation).stream().map(violation ->
                    messageSource.getMessage("import.ordreLimitation.error",
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

    private ObjectMapper getObjectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(JsonParser.Feature.AUTO_CLOSE_SOURCE, true);
        return objectMapper;
    }

    public List<OrdreLimitation> getOrdreDebutLimitation() throws TechnicalException {
        List<Selector> selectors = new ArrayList<>();
        selectors.add(Expression.eq("docType", ACTIVATION_DOCUMENT.getDocType()));
        selectors.add(Expression.eq("endCreatedDateTime", EMPTY));
        selectors.add(Expression.eq("orderEnd", false));
        selectors.add(Expression.eq("reconciliation", false));
        QueryBuilder queryBuilder = new QueryBuilder(Operation.and(selectors.toArray(new Selector[]{})));
        String query = queryBuilder.build();
        log.debug("Transaction query: " + query);
        return ordreLimitationRepository.findOrderByQuery(query);
    }
}
