package com.star.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.FileExtensionEnum;
import com.star.enums.InstanceEnum;
import com.star.exception.TechnicalException;
import com.star.models.common.FichierImportation;
import com.star.models.energyaccount.EnergyAccount;
import com.star.models.energyaccount.ImportEnergyAccountResult;
import com.star.repository.EnergyAccountRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import javax.validation.Validation;
import javax.validation.ValidatorFactory;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.LinkedList;
import java.util.List;

import static com.star.enums.DocTypeEnum.ENERGY_ACCOUNT;
import static java.util.UUID.randomUUID;
import static java.util.stream.Collectors.toList;
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

    public ImportEnergyAccountResult importFichiers(List<FichierImportation> fichiers, InstanceEnum instance) throws IOException, TechnicalException {
        Assert.notEmpty(fichiers, messageSource.getMessage("import.energyAccount.files.empty", new String[]{}, null));
        fichiers.forEach(fichierOrdreLimitation -> importUtilsService.checkFile(fichierOrdreLimitation.getFileName(),
                new InputStreamReader(fichierOrdreLimitation.getInputStream()), FileExtensionEnum.JSON.getValue()));

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
            var energyAccount = objectMapper.readValue(fileInside, EnergyAccount.class);
            errors.addAll(validator.validate(energyAccount).stream().map(violation ->
                    messageSource.getMessage("import.error",
                            new String[]{fichier.getFileName(), violation.getMessage()}, null)).collect(toList()));
            if (isEmpty(errors)) {
                energyAccounts.add(energyAccount);
            }
        }

        // Handling data
        if (isNotEmpty(errors)) {
            importEnergyAccountResult.setErrors(errors);
        } else {
            energyAccounts.forEach(energyAccount -> {
                energyAccount.setEnergyAccountMarketDocumentMrid(randomUUID().toString());
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
            importEnergyAccountResult.setDatas(energyAccountRepository.save(energyAccounts));
        }
        return importEnergyAccountResult;
    }

}
