package com.star.service;

import com.cloudant.client.api.query.Expression;
import com.cloudant.client.api.query.Selector;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.FileExtensionEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.common.FichierImportation;
import com.star.models.energyaccount.EnergyAccount;
import com.star.models.energyaccount.EnergyAccountCriteria;
import com.star.models.energyaccount.ImportEnergyAccountResult;
import com.star.repository.EnergyAccountRepository;
import com.star.service.helpers.QueryBuilderHelper;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import javax.validation.Validation;
import javax.validation.ValidatorFactory;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import static com.star.enums.DocTypeEnum.ENERGY_ACCOUNT;
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
public class EnergyAccountService {

    private static final String REVISION_NUMBER = "1";

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ImportUtilsService importUtilsService;

    @Autowired
    private EnergyAccountRepository energyAccountRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();

    public ImportEnergyAccountResult createEnergyAccount(List<FichierImportation> fichiers) throws IOException, TechnicalException, BusinessException {
        var importEnergyAccountResult = checkFiles(fichiers, true);
        if (isEmpty(importEnergyAccountResult.getErrors()) && !isEmpty(importEnergyAccountResult.getDatas())) {
            importEnergyAccountResult.setDatas(energyAccountRepository.save(importEnergyAccountResult.getDatas()));
        }
        return importEnergyAccountResult;
    }

    public ImportEnergyAccountResult updateEnergyAccount(List<FichierImportation> fichiers) throws IOException, TechnicalException, BusinessException {
        var importEnergyAccountResult = checkFiles(fichiers, false);
        if (isEmpty(importEnergyAccountResult.getErrors()) && !isEmpty(importEnergyAccountResult.getDatas())) {
            importEnergyAccountResult.setDatas(energyAccountRepository.update(importEnergyAccountResult.getDatas()));
        }
        return importEnergyAccountResult;
    }

    private ImportEnergyAccountResult checkFiles(List<FichierImportation> fichiers, boolean creation) throws IOException, BusinessException {
        importUtilsService.checkImportFiles(fichiers, FileExtensionEnum.JSON.getValue());

        var importEnergyAccountResult = new ImportEnergyAccountResult();
        var errors = new LinkedList<String>();
        var validator = validatorFactory.getValidator();
        var energyAccounts = new LinkedList<EnergyAccount>();

        // Parsing files
        for (FichierImportation fichier : fichiers) {
            var fileInside = IOUtils.toString(fichier.getInputStream(), StandardCharsets.UTF_8);
            if (isBlank(fileInside)) {
                errors.add(messageSource.getMessage("import.file.empty.error", new String[]{fichier.getFileName()}, null));
                break;
            }
            try {
                List<EnergyAccount> currentEnergyAccounts = objectMapper.readValue(fileInside, objectMapper.getTypeFactory().constructCollectionType(List.class, EnergyAccount.class));
                if (CollectionUtils.isEmpty(currentEnergyAccounts)) {
                    errors.add(messageSource.getMessage("import.file.empty.error", new String[]{fichier.getFileName()}, null));
                    break;
                }
                currentEnergyAccounts.forEach(currentEnergyAccount -> {
                    List<String> currentErrors = new ArrayList<>();
                    currentErrors.addAll(validator.validate(currentEnergyAccount).stream().map(violation ->
                            messageSource.getMessage("import.error",
                                    new String[]{fichier.getFileName(), violation.getMessage()}, null)).collect(toList()));
                    // En modification, il faut vérifier que le champ energyAccountMarketDocumentMrid est renseigné.
                    if (!creation && StringUtils.isBlank(currentEnergyAccount.getEnergyAccountMarketDocumentMrid())) {
                        currentErrors.add(messageSource.getMessage("import.error",
                                new String[]{fichier.getFileName(), "energyAccountMarketDocumentMrid est obligatoire."}, null));
                    }
                    if (isNotEmpty(currentErrors)) {
                        errors.addAll(currentErrors);
                    } else {
                        energyAccounts.add(currentEnergyAccount);
                    }
                });
            } catch (JsonProcessingException jsonProcessingException) {
                log.error(jsonProcessingException.getMessage());
                throw new BusinessException(messageSource.getMessage("import.read.json.error", null, null));
            }
        }
        // Handling data
        if (isNotEmpty(errors)) {
            importEnergyAccountResult.setErrors(errors);
        } else {
            energyAccounts.forEach(energyAccount -> {
                if (creation) {
                    energyAccount.setEnergyAccountMarketDocumentMrid(randomUUID().toString());
                }
                String[] splitDates = energyAccount.getTimeInterval().split("/");
                energyAccount.setStartCreatedDateTime(splitDates[0]);
                energyAccount.setEndCreatedDateTime(splitDates[1]);
                energyAccount.setDocType(ENERGY_ACCOUNT.getDocType());
                if (energyAccount.getRevisionNumber() == null) {
                    energyAccount.setRevisionNumber(REVISION_NUMBER);
                }
                if (energyAccount.getMarketEvaluationPointMrid() == null) {
                    energyAccount.setMarketEvaluationPointMrid(EMPTY);
                }
                if (energyAccount.getDocStatus() == null) {
                    energyAccount.setDocStatus(EMPTY);
                }
                if (energyAccount.getProcessType() == null) {
                    energyAccount.setProcessType(EMPTY);
                }
                if (energyAccount.getClassificationType() == null) {
                    energyAccount.setClassificationType(EMPTY);
                }
                if (energyAccount.getProduct() == null) {
                    energyAccount.setProduct(EMPTY);
                }
            });
            importEnergyAccountResult.setDatas(energyAccounts);
        }
        return importEnergyAccountResult;
    }

    public EnergyAccount[] findEnergyAccount(EnergyAccountCriteria energyAccountCriteria) throws
            BusinessException, TechnicalException {
        log.debug("Recherche des energy acount. Valeur de energyAccountCriteria : {}", energyAccountCriteria);
        var selectors = new ArrayList<Selector>();
        selectors.add(Expression.eq("docType", ENERGY_ACCOUNT.getDocType()));
        if (isNotBlank(energyAccountCriteria.getMeteringPointMrid())) {
            selectors.add(Expression.eq("meteringPointMrid", energyAccountCriteria.getMeteringPointMrid()));
        }
        if (isNotBlank(energyAccountCriteria.getEndCreatedDateTime())) {
            selectors.add(Expression.lte("startCreatedDateTime", energyAccountCriteria.getEndCreatedDateTime()));
        }
        if (isNotBlank(energyAccountCriteria.getStartCreatedDateTime())) {
            selectors.add(Expression.gte("endCreatedDateTime", energyAccountCriteria.getStartCreatedDateTime()));
        }
        if (isNotBlank(energyAccountCriteria.getProducerMarketParticipantMrid())) {
            selectors.add(Expression.eq("receiverMarketParticipantRole", energyAccountCriteria.getProducerMarketParticipantMrid()));
        }
        var queryBuilder = QueryBuilderHelper.toQueryBuilder(selectors);
        String query = queryBuilder.build();
        log.debug("Transaction query: " + query);
        return energyAccountRepository.findEnergyAccountByQuery(query);
    }
}
