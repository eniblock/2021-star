package com.star.service;

import com.cloudant.client.api.query.EmptyExpression;
import com.cloudant.client.api.query.Expression;
import com.cloudant.client.api.query.Operation;
import com.cloudant.client.api.query.QueryBuilder;
import com.cloudant.client.api.query.Selector;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.EligibilityStatusEnum;
import com.star.enums.FileExtensionEnum;
import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.common.FichierImportation;
import com.star.models.limitation.ImportOrdreLimitationResult;
import com.star.models.limitation.OrdreLimitation;
import com.star.models.limitation.OrdreLimitationCriteria;
import com.star.models.limitation.OrdreLimitationEligibilityStatus;
import com.star.repository.OrdreLimitationRepository;
import com.star.utils.DateUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static com.star.enums.DocTypeEnum.ACTIVATION_DOCUMENT;
import static com.star.utils.DateUtils.toLocalDateTime;
import static java.util.UUID.randomUUID;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.collections4.CollectionUtils.isNotEmpty;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.apache.commons.lang3.StringUtils.isNotBlank;
import static org.apache.commons.lang3.StringUtils.upperCase;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Service
public class OrdreLimitationService {
    private static final List<String> ELIGIBILITY_STATUS_LIST = Arrays.asList(EligibilityStatusEnum.values())
            .stream()
            .map(eligibilityStatusEnum -> eligibilityStatusEnum.name())
            .collect(toList());

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
            try {
                List<OrdreLimitation> currentOrdreLimitations = !isBlank(value) ? objectMapper.readValue(value, objectMapper.getTypeFactory().constructCollectionType(List.class, OrdreLimitation.class)) : Collections.emptyList();
                if (CollectionUtils.isEmpty(currentOrdreLimitations)) {
                    errors.add(messageSource.getMessage("import.file.empty.error", new String[]{fichierOrdreLimitation.getFileName()}, null));
                    break;
                }
                currentOrdreLimitations.forEach(ordreLimitation -> {
                    List<String> currentErrors = new ArrayList<>();
                    try {
                        if (toLocalDateTime(ordreLimitation.getStartCreatedDateTime()) == null) {
                            currentErrors.add(messageSource.getMessage("import.ordreLimitation.debut.startCreatedDateTime.error",
                                    new String[]{fichierOrdreLimitation.getFileName()}, null));
                        }
                        if (toLocalDateTime(ordreLimitation.getEndCreatedDateTime()) != null) {
                            currentErrors.add(messageSource.getMessage("import.ordreLimitation.debut.endCreatedDateTime.error",
                                    new String[]{fichierOrdreLimitation.getFileName()}, null));
                        }
                    } catch (DateTimeParseException dateTimeParseException) {
                        throw new BusinessException(messageSource.getMessage("import.date.format.error",
                                new String[]{fichierOrdreLimitation.getFileName()}, null));
                    }
                    if (ordreLimitation.isOrderEnd()) {
                        currentErrors.add(messageSource.getMessage("import.ordreLimitation.debut.orderEnd.error",
                                new String[]{fichierOrdreLimitation.getFileName()}, null));
                    }
                    checkEligibilityStatus(ordreLimitation.getEligibilityStatus(), currentErrors);
                    currentErrors.addAll(validator.validate(ordreLimitation).stream().map(violation ->
                            messageSource.getMessage("import.error",
                                    new String[]{fichierOrdreLimitation.getFileName(), violation.getMessage()}, null)).collect(toList()));
                    if (isNotEmpty(currentErrors)) {
                        errors.addAll(currentErrors);
                    } else {
                        ordreDebutLimitations.addAll(currentOrdreLimitations);
                    }
                });
            } catch (JsonProcessingException jsonProcessingException) {
                log.error(jsonProcessingException.getMessage());
                throw new BusinessException("Erreur lors du traitement du fichier.Echec du parsing du contenu du fichier (champ, ligne ou attribut incorrect).");
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
                if (isBlank(ordreDebutLimitation.getEligibilityStatus())) {
                    ordreDebutLimitation.setEligibilityStatus(EMPTY);
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
            try {
                List<OrdreLimitation> currentOrdreLimitations = !isBlank(value) ? objectMapper.readValue(value, objectMapper.getTypeFactory().constructCollectionType(List.class, OrdreLimitation.class)) : Collections.emptyList();
                if (CollectionUtils.isEmpty(currentOrdreLimitations)) {
                    errors.add(messageSource.getMessage("import.file.empty.error", new String[]{fichierOrdreLimitation.getFileName()}, null));
                    break;
                }
                currentOrdreLimitations.forEach(ordreLimitation -> {
                    List<String> currentErrors = new ArrayList<>();
                    // le champ endCreatedDateTime est obligatoire lorsqu'il s'agit d'un ordre de début-fin ou un ordre de fin seul
                    if (isBlank(ordreLimitation.getEndCreatedDateTime())) {
                        currentErrors.add(messageSource.getMessage("import.ordreLimitation.couple.endCreatedDateTime.error",
                                new String[]{fichierOrdreLimitation.getFileName()}, null));
                    } else {
                        if (isNotBlank(ordreLimitation.getStartCreatedDateTime())) {
                            // STAR-498 : contrôle de cohérence des dates.
                            try {
                                LocalDateTime startDate = toLocalDateTime(ordreLimitation.getStartCreatedDateTime());
                                LocalDateTime endDate = toLocalDateTime(ordreLimitation.getEndCreatedDateTime());
                                if (!startDate.isBefore(endDate)) {
                                    currentErrors.add(messageSource.getMessage("import.ordreLimitation.startDate.endDate.error",
                                            new String[]{fichierOrdreLimitation.getFileName()}, null));
                                }
                            } catch (DateTimeParseException dateTimeParseException) {
                                throw new BusinessException(messageSource.getMessage("import.date.format.error",
                                        new String[]{fichierOrdreLimitation.getFileName()}, null));
                            }
                        }
                    }
                    // le champ "orderEnd" doit être à false
                    if (ordreLimitation.isOrderEnd()) {
                        currentErrors.add(messageSource.getMessage("import.ordreLimitation.couple.orderEnd.error",
                                new String[]{fichierOrdreLimitation.getFileName()}, null));
                    }
                    checkEligibilityStatus(ordreLimitation.getEligibilityStatus(), currentErrors);
                    currentErrors.addAll(validator.validate(ordreLimitation).stream().map(violation ->
                            messageSource.getMessage("import.error",
                                    new String[]{fichierOrdreLimitation.getFileName(), violation.getMessage()}, null)).collect(toList()));
                    if (isNotEmpty(currentErrors)) {
                        errors.addAll(currentErrors);
                    } else {
                        ordreLimitations.addAll(currentOrdreLimitations);
                    }
                });
            } catch (JsonProcessingException jsonProcessingException) {
                log.error(jsonProcessingException.getMessage());
                throw new BusinessException("Erreur lors du traitement du fichier.Echec du parsing du contenu du fichier (champ, ligne ou attribut incorrect).");
            }
        }
        if (isNotEmpty(errors)) {
            importCoupleOrdreLimitationResult.setErrors(errors);
        } else {
            ordreLimitations.forEach(ordreLimitation -> {
                ordreLimitation.setActivationDocumentMrid(randomUUID().toString());
                ordreLimitation.setInstance(instance.getValue());
                ordreLimitation.setSubOrderList(new ArrayList<>());
                ordreLimitation.setDocType(ACTIVATION_DOCUMENT.getDocType());
                if (ordreLimitation.getOrderValue() == null) {
                    ordreLimitation.setOrderValue(EMPTY);
                }
                if (ordreLimitation.getReceiverMarketParticipantMrid() == null) {
                    ordreLimitation.setReceiverMarketParticipantMrid(EMPTY);
                }
                if (ordreLimitation.getRevisionNumber() == null) {
                    ordreLimitation.setRevisionNumber(REVISION_NUMBER);
                }
                if (ordreLimitation.getSenderMarketParticipantMrid() == null) {
                    ordreLimitation.setSenderMarketParticipantMrid(EMPTY);
                }
                if (isBlank(ordreLimitation.getEligibilityStatus())) {
                    ordreLimitation.setEligibilityStatus(EMPTY);
                }
            });
            importCoupleOrdreLimitationResult.setDatas(ordreLimitationRepository.saveOrdreLimitations(ordreLimitations));
        }
        return importCoupleOrdreLimitationResult;
    }


    public ImportOrdreLimitationResult importOrdreFinLimitation(List<FichierImportation> fichierOrdreLimitations, InstanceEnum instance) throws BusinessException, TechnicalException, IOException {
        importUtilsService.checkImportFiles(fichierOrdreLimitations, FileExtensionEnum.JSON.getValue());
        ImportOrdreLimitationResult importOrdreFinLimitationResult = new ImportOrdreLimitationResult();
        List<String> errors = new ArrayList<>();
        Validator validator = validatorFactory.getValidator();
        List<OrdreLimitation> ordreFinLimitations = new ArrayList<>();
        for (FichierImportation fichierOrdreLimitation : fichierOrdreLimitations) {
            String value = IOUtils.toString(fichierOrdreLimitation.getInputStream(), StandardCharsets.UTF_8);
            try {
                List<OrdreLimitation> currentOrdreLimitations = !isBlank(value) ? objectMapper.readValue(value, objectMapper.getTypeFactory().constructCollectionType(List.class, OrdreLimitation.class)) : Collections.emptyList();
                if (CollectionUtils.isEmpty(currentOrdreLimitations)) {
                    errors.add(messageSource.getMessage("import.file.empty.error", new String[]{fichierOrdreLimitation.getFileName()}, null));
                    break;
                }
                currentOrdreLimitations.forEach(ordreLimitation -> {
                    List<String> currentErrors = new ArrayList<>();
                    try {
                        if (DateUtils.toLocalDateTime(ordreLimitation.getStartCreatedDateTime()) != null) {
                            currentErrors.add(messageSource.getMessage("import.ordreLimitation.fin.startCreatedDateTime.error",
                                    new String[]{fichierOrdreLimitation.getFileName()}, null));
                        }
                        if (DateUtils.toLocalDateTime(ordreLimitation.getEndCreatedDateTime()) == null) {
                            currentErrors.add(messageSource.getMessage("import.ordreLimitation.fin.endCreatedDateTime.error",
                                    new String[]{fichierOrdreLimitation.getFileName()}, null));
                        }
                    } catch (DateTimeParseException dateTimeParseException) {
                        throw new BusinessException(messageSource.getMessage("import.date.format.error",
                                new String[]{fichierOrdreLimitation.getFileName()}, null));
                    }
                    checkEligibilityStatus(ordreLimitation.getEligibilityStatus(), currentErrors);
                    currentErrors.addAll(validator.validate(ordreLimitation).stream().map(violation ->
                            messageSource.getMessage("import.error",
                                    new String[]{fichierOrdreLimitation.getFileName(), violation.getMessage()}, null)).collect(toList()));
                    if (isNotEmpty(currentErrors)) {
                        errors.addAll(currentErrors);
                    } else {
                        ordreFinLimitations.addAll(currentOrdreLimitations);
                    }
                });
            } catch (JsonProcessingException jsonProcessingException) {
                log.error(jsonProcessingException.getMessage());
                throw new BusinessException(messageSource.getMessage("import.read.json.error",
                        new String[]{ExceptionUtils.getMessage(jsonProcessingException)}, null));
            }
        }
        if (isNotEmpty(errors)) {
            importOrdreFinLimitationResult.setErrors(errors);
        } else {
            ordreFinLimitations.forEach(ordreFinLimitation -> {
                ordreFinLimitation.setActivationDocumentMrid(randomUUID().toString());
                ordreFinLimitation.setInstance(instance.getValue());
                ordreFinLimitation.setDocType(ACTIVATION_DOCUMENT.getDocType());
                ordreFinLimitation.setSubOrderList(new ArrayList<>());
                ordreFinLimitation.setStartCreatedDateTime(EMPTY);
                if (ordreFinLimitation.getOrderValue() == null) {
                    ordreFinLimitation.setOrderValue(EMPTY);
                }
                if (ordreFinLimitation.getReceiverMarketParticipantMrid() == null) {
                    ordreFinLimitation.setReceiverMarketParticipantMrid(EMPTY);
                }
                if (ordreFinLimitation.getRevisionNumber() == null) {
                    ordreFinLimitation.setRevisionNumber(REVISION_NUMBER);
                }
                if (ordreFinLimitation.getSenderMarketParticipantMrid() == null) {
                    ordreFinLimitation.setSenderMarketParticipantMrid(EMPTY);
                }
                if (isBlank(ordreFinLimitation.getEligibilityStatus())) {
                    ordreFinLimitation.setEligibilityStatus(EMPTY);
                }
            });
            importOrdreFinLimitationResult.setDatas(ordreLimitationRepository.saveOrdreLimitations(ordreFinLimitations));
        }
        return importOrdreFinLimitationResult;
    }

    public List<OrdreLimitation> getOrdreDebutLimitation(InstanceEnum instance) throws TechnicalException {
        List<Selector> selectors = new ArrayList<>();
        selectors.add(Expression.eq("docType", ACTIVATION_DOCUMENT.getDocType()));
        selectors.add(Expression.eq("instance", instance.getValue()));
        selectors.add(Expression.eq("endCreatedDateTime", EMPTY));
        selectors.add(Expression.eq("orderEnd", false));
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

    private void checkEligibilityStatus(String eligibilityStatus, List<String> currentErrors) {
        log.debug("Valeur reçue pour le champ eligibilityStatus : {}", eligibilityStatus);
        log.debug("Liste des valeurs acceptées : {}", ELIGIBILITY_STATUS_LIST);
        if (StringUtils.isNotBlank(eligibilityStatus) && !ELIGIBILITY_STATUS_LIST.contains(upperCase(eligibilityStatus))) {
            log.debug("L'element {} n'est pas contenue dans la liste {}. Rejet !", eligibilityStatus, ELIGIBILITY_STATUS_LIST);
            currentErrors.add(messageSource.getMessage("import.ordreLimitation.eligibilityStatus.error",
                    new String[]{}, null));
        }
    }

    public OrdreLimitation ordreDebutEligibilityStatus(OrdreLimitationEligibilityStatus ordreLimitationEligibilityStatus) throws TechnicalException {
        Assert.notNull(ordreLimitationEligibilityStatus, "ordreLimitationEligibilityStatus must not be null");
        ordreLimitationRepository.updateOrdreDebutEligibilityStatus(ordreLimitationEligibilityStatus);
        OrdreLimitationCriteria ordreLimitationCriteria = OrdreLimitationCriteria.builder().activationDocumentMrid(ordreLimitationEligibilityStatus.getActivationDocumentMrid()).build();
        List<OrdreLimitation> ordreLimitations = findLimitationOrders(ordreLimitationCriteria);
        if (CollectionUtils.isEmpty(ordreLimitations)) {
            throw new BusinessException("Ordre limitation with id " + ordreLimitationEligibilityStatus.getActivationDocumentMrid() + " is unknown");
        }
        return ordreLimitations.get(0);
    }
}
