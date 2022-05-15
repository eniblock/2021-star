package com.star.service;

import com.cloudant.client.api.query.Expression;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.FileExtensionEnum;
import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.common.FichierImportation;
import com.star.models.common.PageHLF;
import com.star.models.common.PaginationDto;
import com.star.models.energyamount.EnergyAmount;
import com.star.models.energyamount.EnergyAmountCriteria;
import com.star.models.energyamount.ImportEnergyAmountResult;
import com.star.models.limitation.OrdreLimitation;
import com.star.models.limitation.OrdreLimitationCriteria;
import com.star.models.participant.SystemOperator;
import com.star.models.producer.Producer;
import com.star.repository.EnergyAmountRepository;
import com.star.service.helpers.QueryBuilderHelper;
import com.star.utils.DateUtils;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;

import com.cloudant.client.api.query.Selector;
import static com.star.enums.DocTypeEnum.ENERGY_AMOUNT;
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
public class EnergyAmountService {

    private static final String REVISION_NUMBER = "1";
    private static final String ARE_DOMAIN_HTA = "17X100A100A0001A"; // TSO
    private static final String ARE_DOMAIN_HTB = "10XFR-RTE------Q"; // DSO

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ImportUtilsService importUtilsService;

    @Autowired
    private OrdreLimitationService ordreLimitationService;

    @Autowired
    private MarketParticipantService marketParticipantService;

    @Autowired
    private ProducerService producerService;

    @Autowired
    private EnergyAmountRepository energyAmountRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();

    public ImportEnergyAmountResult createEnergyAmount(List<FichierImportation> fichiers, InstanceEnum instance) throws IOException, TechnicalException {
        if (InstanceEnum.DSO.equals(instance) & fichiers == null || fichiers.size() == 0) {
            throw new IllegalArgumentException("Files must not be empty");
        }
        importUtilsService.checkImportFiles(fichiers, FileExtensionEnum.JSON.getValue());
        var importEnergyAmountResult = new ImportEnergyAmountResult();
        var errors = new LinkedList<String>();
        var validator = validatorFactory.getValidator();
        var energyAmounts = new LinkedList<EnergyAmount>();
        // Parsing files
        for (FichierImportation fichier : fichiers) {
            var fileInside = IOUtils.toString(fichier.getInputStream(), StandardCharsets.UTF_8);
            if (isBlank(fileInside)) {
                errors.add(messageSource.getMessage("import.file.empty.error", new String[]{fichier.getFileName()}, null));
                break;
            }
            var energyAmount = objectMapper.readValue(fileInside, EnergyAmount.class);
            errors.addAll(validator.validate(energyAmount).stream().map(violation ->
                    messageSource.getMessage("import.error",
                            new String[]{fichier.getFileName(), violation.getMessage()}, null)).collect(toList()));
            if (isEmpty(errors)) {
                energyAmounts.add(energyAmount);
            }
        }
        // Handling data
        if (isNotEmpty(errors)) {
            importEnergyAmountResult.setErrors(errors);
        } else {
            energyAmounts.forEach(energyAmount -> setAttributes(energyAmount));
            importEnergyAmountResult.setDatas(energyAmounts);
        }
        if (isEmpty(importEnergyAmountResult.getErrors()) && !isEmpty(importEnergyAmountResult.getDatas())) {
            importEnergyAmountResult.setDatas(energyAmountRepository.save(importEnergyAmountResult.getDatas(), instance));
        }
        return importEnergyAmountResult;
    }

    public ImportEnergyAmountResult createEnergyAmount(EnergyAmount energyAmount, InstanceEnum instance) throws TechnicalException {
        if (InstanceEnum.TSO.equals(instance) && energyAmount == null) {
            throw new IllegalArgumentException("Object energyAmount must not be empty");
        }
        // Rechercher l'ordre de limitation à partir du champ activationDocumentMrid
        OrdreLimitationCriteria ordreLimitationCriteria = OrdreLimitationCriteria.builder().activationDocumentMrid(energyAmount.getActivationDocumentMrid()).build();
        List<OrdreLimitation> ordreLimitations = ordreLimitationService.findLimitationOrders(ordreLimitationCriteria);
        if (CollectionUtils.isEmpty(ordreLimitations)) {
            throw new IllegalArgumentException("ActivationDocumentMrid "+energyAmount.getActivationDocumentMrid()+" is unknown.");
        }
        OrdreLimitation ordreLimitation = ordreLimitations.get(0);
        Optional<SystemOperator> optionalSystemOperator =
        marketParticipantService.getSystemOperators().stream().filter(systemOperator ->
                StringUtils.equals(systemOperator.getSystemOperatorMarketParticipantMrid(),
                        ordreLimitation.getSenderMarketParticipantMrid())).findFirst();
        if (optionalSystemOperator.isPresent()) {
            SystemOperator systemOperator = optionalSystemOperator.get();
            energyAmount.setSenderMarketParticipantMrid(systemOperator.getSystemOperatorMarketParticipantMrid());
            energyAmount.setSenderMarketParticipantRole(systemOperator.getSystemOperatorMarketParticipantRoleType());
        }
        Producer producer = producerService.getProducer(ordreLimitation.getReceiverMarketParticipantMrid());
        if (producer != null) {
            energyAmount.setReceiverMarketParticipantMrid(producer.getProducerMarketParticipantMrid());
            energyAmount.setReceiverMarketParticipantRole(producer.getProducerMarketParticipantRoleType());
        }
        energyAmount.setAreaDomain(ARE_DOMAIN_HTA);
        energyAmount.setRegisteredResourceMrid(ordreLimitation.getRegisteredResourceMrid());
        energyAmount.setCreatedDateTime(DateUtils.toJson(LocalDateTime.now()));
        var importEnergyAmountResult = new ImportEnergyAmountResult();
        var validator = validatorFactory.getValidator();
        var errors = new LinkedList<String>();
        errors.addAll(validator.validate(energyAmount).stream().map(violation ->
                messageSource.getMessage("create.energyAmount.error",
                        new String[]{violation.getMessage()}, null)).collect(toList()));
        if (isNotEmpty(errors)) {
            importEnergyAmountResult.setErrors(errors);
        } else {
            setAttributes(energyAmount);
            importEnergyAmountResult.setDatas(energyAmountRepository.save(Arrays.asList(energyAmount), instance));
        }
        return importEnergyAmountResult;
    }

    private void setAttributes(EnergyAmount energyAmount) {
        if (energyAmount == null) {
            return;
        }
        energyAmount.setEnergyAmountMarketDocumentMrid(randomUUID().toString());
        energyAmount.setDocType(ENERGY_AMOUNT.getDocType());
        if (energyAmount.getRevisionNumber() == null) {
            energyAmount.setRevisionNumber(REVISION_NUMBER);
        }
        if (energyAmount.getDocStatus() == null) {
            energyAmount.setDocStatus(EMPTY);
        }
        if (energyAmount.getProcessType() == null) {
            energyAmount.setProcessType(EMPTY);
        }
        if (energyAmount.getClassificationType() == null) {
            energyAmount.setClassificationType(EMPTY);
        }
    }
    public PageHLF<EnergyAmount> findEnergyAmount(EnergyAmountCriteria energyAmountCriteria, String bookmark, PaginationDto paginationDto) throws BusinessException, TechnicalException {
        var selectors = new ArrayList<Selector>();
        selectors.add(Expression.eq("docType", ENERGY_AMOUNT.getDocType()));

        if (isNotBlank(energyAmountCriteria.getEnergyAmountMarketDocumentMrid())) {
            selectors.add(Expression.eq("energyAmountMarketDocumentMrid", energyAmountCriteria.getEnergyAmountMarketDocumentMrid()));
        }
        var queryBuilder = QueryBuilderHelper.toQueryBuilder(selectors);
        String query = queryBuilder.build();
        log.debug("Transaction query: " + query);
        return energyAmountRepository.findEnergyAmountByQuery(query, String.valueOf(paginationDto.getPageSize()), bookmark);
    }
}
