package com.star.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.FileExtensionEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.limitation.FichierOrdreLimitation;
import com.star.models.limitation.ImportOrdreDebutLimitationResult;
import com.star.models.limitation.OrdreDebutLimitation;
import com.star.repository.OrdreLimitationRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.UUID.randomUUID;
import static org.apache.commons.collections4.CollectionUtils.isEmpty;
import static org.apache.commons.collections4.CollectionUtils.isNotEmpty;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.isBlank;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Service
public class OrdreLimitationService {

    private ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();
    @Autowired
    private ImportUtilsService importUtilsService;
    @Autowired
    private OrdreLimitationRepository ordreLimitationRepository;
    @Autowired
    private MessageSource messageSource;


    public ImportOrdreDebutLimitationResult importOrdreDebutLimitation(List<FichierOrdreLimitation> fichierOrdreLimitations) throws BusinessException, TechnicalException, IOException {
        Assert.notEmpty(fichierOrdreLimitations, "La liste des fichiers d'ordre de début de limitation doit être non vide");
        fichierOrdreLimitations.forEach(fichierOrdreLimitation -> importUtilsService.checkFile(fichierOrdreLimitation.getFileName(),
                new InputStreamReader(fichierOrdreLimitation.getInputStream()), FileExtensionEnum.JSON.getValue()));
        ImportOrdreDebutLimitationResult importOrdreDebutLimitationResult = new ImportOrdreDebutLimitationResult();
        List<String> errors = new ArrayList<>();
        Validator validator = validatorFactory.getValidator();
        List<OrdreDebutLimitation> ordreDebutLimitations = new ArrayList<>();
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(JsonParser.Feature.AUTO_CLOSE_SOURCE, true);
        for (FichierOrdreLimitation fichierOrdreLimitation : fichierOrdreLimitations) {
            fichierOrdreLimitation.getInputStream();
            String value = IOUtils.toString(fichierOrdreLimitation.getInputStream(), StandardCharsets.UTF_8);
            OrdreDebutLimitation ordreDebutLimitation = !isBlank(value) ? objectMapper.readValue(value, OrdreDebutLimitation.class) : null;
            if (ordreDebutLimitation == null) {
                errors.add(messageSource.getMessage("import.file.empty.error", new String[]{fichierOrdreLimitation.getFileName()}, null));
                break;
            }
            Set<ConstraintViolation<OrdreDebutLimitation>> violations = validator.validate(ordreDebutLimitation);
            if (isEmpty(violations)) {
                ordreDebutLimitations.add(ordreDebutLimitation);
            } else {
                Map<String, String> fieldErrorMap = new HashMap<>();
                for (ConstraintViolation<OrdreDebutLimitation> violation : violations) {
                    fieldErrorMap.put(violation.getPropertyPath().toString(), violation.getMessage());
                    errors.add("Fichier " + fichierOrdreLimitation.getFileName() + " - " + violation.getMessage());
                }
            }
        }
        if (isNotEmpty(errors)) {
            importOrdreDebutLimitationResult.setErrors(errors);
        } else {
            ordreDebutLimitations.forEach(ordreDebutLimitation -> {
                ordreDebutLimitation.setActivationDocumentMrid(randomUUID().toString());
                if (ordreDebutLimitation.getEndCreatedDateTime() == null) {
                    ordreDebutLimitation.setEndCreatedDateTime(EMPTY);
                }
                if (ordreDebutLimitation.getOrderValue() == null) {
                    ordreDebutLimitation.setOrderValue(EMPTY);
                }
                if (ordreDebutLimitation.getReceiverMarketParticipantMrid() == null) {
                    ordreDebutLimitation.setReceiverMarketParticipantMrid(EMPTY);
                }
                if (ordreDebutLimitation.getRevisionNumber() == null) {
                    ordreDebutLimitation.setRevisionNumber("1");
                }
                if (ordreDebutLimitation.getSenderMarketParticipantMrid() == null) {
                    ordreDebutLimitation.setSenderMarketParticipantMrid(EMPTY);
                }
            });
            importOrdreDebutLimitationResult.setDatas(ordreLimitationRepository.saveOrdreDebutLimitations(ordreDebutLimitations));
        }
        return importOrdreDebutLimitationResult;
    }

}
