package com.star.service;

import com.cloudant.client.api.query.Expression;
import com.cloudant.client.api.query.Selector;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.FileExtensionEnum;
import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.common.FichierImportation;
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
import com.star.utils.InfoUtils;
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

import static com.star.enums.DocTypeEnum.ENERGY_AMOUNT;
import static com.star.enums.InstanceEnum.DSO;
import static com.star.enums.InstanceEnum.TSO;
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

    private static final String ARE_DOMAIN_HTA = "17X100A100A0001A"; // TSO

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
    private SiteService siteService;

    @Autowired
    private ObjectMapper objectMapper;

    private ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();

    /**
     * Méthode pour enregistrer une liste d'energy amount contenus dans des fichiers
     *
     * @param fichiers Fichiers JSON contenant les données des energy amounts à enregistrer
     * @param instance instance (TSO/DSO)
     * @return la liste des energy amounts enregistrés dans la blockchain
     * @throws IOException
     * @throws TechnicalException
     */
    public ImportEnergyAmountResult createEnergyAmounts(List<FichierImportation> fichiers, InstanceEnum instance,
                                                        String systemOperatorMarketParticipantMrid) throws IOException, TechnicalException {
        var importEnergyAmountResult = checkFiles(fichiers, instance, true, systemOperatorMarketParticipantMrid);
        if (isEmpty(importEnergyAmountResult.getErrors()) && !isEmpty(importEnergyAmountResult.getDatas())) {
            importEnergyAmountResult.setDatas(energyAmountRepository.save(importEnergyAmountResult.getDatas(), instance));
        }
        return importEnergyAmountResult;
    }

    /**
     * Méthode pour modifier une liste d'energy amounts contenus dans des fichiers JSON
     *
     * @param fichiers Fichiers JSON contenant les données des energy amounts à modifier
     * @param instance instance (TSO/DSO)
     * @return la liste des energy amounts modifiés dans la blockchain
     * @throws IOException
     * @throws TechnicalException
     */
    public ImportEnergyAmountResult updateEnergyAmounts(List<FichierImportation> fichiers, InstanceEnum instance,
                                                        String systemOperatorMarketParticipantMrid) throws IOException, TechnicalException {
        var importEnergyAmountResult = checkFiles(fichiers, instance, false, systemOperatorMarketParticipantMrid);
        if (isEmpty(importEnergyAmountResult.getErrors()) && !isEmpty(importEnergyAmountResult.getDatas())) {
            importEnergyAmountResult.setDatas(energyAmountRepository.update(importEnergyAmountResult.getDatas(), instance));
        }
        return importEnergyAmountResult;
    }

    /**
     * Méthode vérifiant les formats et contenus des fichiers JSON
     *
     * @param fichiers
     * @param instance
     * @param creation
     * @return
     * @throws IOException
     */
    private ImportEnergyAmountResult checkFiles(List<FichierImportation> fichiers, InstanceEnum instance,
                                                boolean creation, String systemOperatorMarketParticipantMrid) throws IOException {
        if (InstanceEnum.DSO.equals(instance) && CollectionUtils.isEmpty(fichiers)) {
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
            try {
                List<EnergyAmount> currentEnergyAmounts = objectMapper.readValue(fileInside, objectMapper.getTypeFactory().constructCollectionType(List.class, EnergyAmount.class));
                if (CollectionUtils.isEmpty(currentEnergyAmounts)) {
                    errors.add(messageSource.getMessage("import.file.empty.error", new String[]{fichier.getFileName()}, null));
                    break;
                }
                currentEnergyAmounts.forEach(currentEnergyAmount -> {
                    List<String> currentErrors = new ArrayList<>();
                    currentErrors.addAll(validator.validate(currentEnergyAmount).stream().map(violation ->
                            messageSource.getMessage("import.error",
                                    new String[]{fichier.getFileName(), violation.getMessage()}, null)).collect(toList()));
                    if (creation && DSO.equals(instance) && isBlank(currentEnergyAmount.getActivationDocumentMrid())) {
                        currentErrors.add(messageSource.getMessage("import.error",
                                new String[]{fichier.getFileName(), "ActivationDocumentMrid est obligatoire."}, null));
                    }
                    // Vérifier que l'ID du document est fourni quand on est en modification
                    if (!creation && StringUtils.isBlank(currentEnergyAmount.getActivationDocumentMrid())) {
                        currentErrors.add(messageSource.getMessage("import.error",
                                new String[]{fichier.getFileName(), "ActivationDocumentMrid est obligatoire."}, null));
                    }
                    String registeredResourceMrid = currentEnergyAmount.getRegisteredResourceMrid();
                    if (isBlank(registeredResourceMrid)) {
                        currentEnergyAmount.setRegisteredResourceMrid(EMPTY);
                    } else {
                        try {
                            if (!siteService.existSite(registeredResourceMrid)) {
                                currentErrors.add(messageSource.getMessage("import.file.energy.amount.unknown.site",
                                        new String[]{registeredResourceMrid}, null));
                            }
                        } catch (TechnicalException technicalException) {
                            log.error(technicalException.getMessage());
                            currentErrors.add(technicalException.getMessage());
                        }
                    }
                    // Vérification du champ senderMarketParticipantMrid
                    String senderMarketParticipantMrid = currentEnergyAmount.getSenderMarketParticipantMrid();
                    if (!StringUtils.equalsIgnoreCase(systemOperatorMarketParticipantMrid, senderMarketParticipantMrid)) {
                        currentErrors.add(messageSource.getMessage("import.file.energy.amount.senderMarketParticipantMrid.error",
                                new String[]{senderMarketParticipantMrid}, null));
                    }
                    if (isNotEmpty(currentErrors)) {
                        errors.addAll(currentErrors);
                    } else {
                        energyAmounts.add(currentEnergyAmount);
                    }
                });
            } catch (JsonProcessingException jsonProcessingException) {
                log.error(jsonProcessingException.getMessage());
                throw new BusinessException(messageSource.getMessage("import.read.json.error", null, null));
            }
        }
        // Handling data
        if (isNotEmpty(errors)) {
            importEnergyAmountResult.setErrors(errors);
        } else {
            energyAmounts.forEach(energyAmount -> setAttributes(energyAmount, creation, instance));
            importEnergyAmountResult.setDatas(energyAmounts);
        }
        return importEnergyAmountResult;
    }

    /**
     * Méthode permettant d'enregistrer ou de modifier un seul energy amount.
     *
     * @param energyAmount Energy amount à enregistrer ou modifier dans la blockchain
     * @param instance
     * @param creation     booléen inquant la nature de l'opération : création ou modification
     * @return
     * @throws TechnicalException
     */
    public ImportEnergyAmountResult saveEnergyAmount(EnergyAmount energyAmount, InstanceEnum instance, boolean creation) throws TechnicalException {
        if (TSO.equals(instance) && energyAmount == null) {
            throw new IllegalArgumentException("Object energyAmount must not be empty");
        }
        // Rechercher l'ordre de limitation à partir du champ activationDocumentMrid
        OrdreLimitationCriteria ordreLimitationCriteria = OrdreLimitationCriteria.builder().activationDocumentMrid(energyAmount.getActivationDocumentMrid()).build();
        List<OrdreLimitation> ordreLimitations = ordreLimitationService.findLimitationOrders(ordreLimitationCriteria);
        if (CollectionUtils.isEmpty(ordreLimitations)) {
            throw new IllegalArgumentException("Erreur - ActivationDocumentMrid " + energyAmount.getActivationDocumentMrid() + " ne correspond à aucun ordre de limitation.");
        }
        OrdreLimitation ordreLimitation = ordreLimitations.get(0);
        List<SystemOperator> systemOperators = marketParticipantService.getSystemOperators();
        Optional<SystemOperator> optionalSystemOperator =
                systemOperators.stream().filter(systemOperator ->
                        StringUtils.equals(systemOperator.getSystemOperatorMarketParticipantMrid(),
                                ordreLimitation.getSenderMarketParticipantMrid())).findFirst();
        if (optionalSystemOperator.isPresent()) {
            SystemOperator systemOperator = optionalSystemOperator.get();
            energyAmount.setSenderMarketParticipantMrid(systemOperator.getSystemOperatorMarketParticipantMrid());
            energyAmount.setSenderMarketParticipantRole(systemOperator.getSystemOperatorMarketParticipantRoleType());
        }
        String receiverMarketParticipantMrid = ordreLimitation.getReceiverMarketParticipantMrid();
        try {
            Producer producer = producerService.getProducer(receiverMarketParticipantMrid);
            if (producer != null) {
                energyAmount.setReceiverMarketParticipantMrid(producer.getProducerMarketParticipantMrid());
                energyAmount.setReceiverMarketParticipantRole(producer.getProducerMarketParticipantRoleType());
            }
        } catch (TechnicalException tecnicalException) {
            // STAR-495 - le receiver n'est pas un producer mais un systemOperator.
            Optional<SystemOperator> optional =
                    systemOperators.stream().filter(systemOperator ->
                            StringUtils.equals(systemOperator.getSystemOperatorMarketParticipantMrid(),
                                    receiverMarketParticipantMrid)).findFirst();
            if (optional.isPresent() && optionalSystemOperator.isPresent()) {
                SystemOperator systemOperatorReceiverMarketParticipantMrid = optionalSystemOperator.get();
                energyAmount.setReceiverMarketParticipantMrid(systemOperatorReceiverMarketParticipantMrid.getSystemOperatorMarketParticipantMrid());
                energyAmount.setReceiverMarketParticipantRole(systemOperatorReceiverMarketParticipantMrid.getSystemOperatorMarketParticipantRoleType());
            }
        }
        energyAmount.setAreaDomain(ARE_DOMAIN_HTA);
        energyAmount.setRegisteredResourceMrid(ordreLimitation.getRegisteredResourceMrid());
        if (creation) {
            energyAmount.setCreatedDateTime(DateUtils.toJson(LocalDateTime.now()));
        }
        var importEnergyAmountResult = new ImportEnergyAmountResult();
        var errors = new LinkedList<String>();
        errors.addAll(validatorFactory.getValidator().validate(energyAmount).stream().map(violation ->
                messageSource.getMessage("energyAmount.error",
                        new String[]{violation.getMessage()}, null)).collect(toList()));
        if (!creation && StringUtils.isBlank(energyAmount.getEnergyAmountMarketDocumentMrid())) {
            errors.add(messageSource.getMessage("energyAmount.error",
                    new String[]{"En modification, le champ energyAmountMarketDocumentMrid est obligatoire."}, null));
        }
        if (isNotEmpty(errors)) {
            importEnergyAmountResult.setErrors(errors);
        } else {
            setAttributes(energyAmount, creation, instance);
            if (creation) {
                importEnergyAmountResult.setDatas(energyAmountRepository.save(Arrays.asList(energyAmount), instance));
            } else {
                importEnergyAmountResult.setDatas(energyAmountRepository.update(Arrays.asList(energyAmount), instance));
            }
        }
        return importEnergyAmountResult;
    }

    private void setAttributes(EnergyAmount energyAmount, boolean creation, InstanceEnum instance) {
        if (energyAmount == null) {
            return;
        }
        if (creation) {
            energyAmount.setEnergyAmountMarketDocumentMrid(randomUUID().toString());
            if (TSO.equals(instance)) {
                if (isBlank(energyAmount.getActivationDocumentMrid())) {
                    String activationDocumentMrid = randomUUID().toString();
                    log.info("Cas d'initialisation de l'ActivationDocumentMrid pour un appel TSO (RTE). activationDocumentMrid = {}", activationDocumentMrid);
                    energyAmount.setActivationDocumentMrid(activationDocumentMrid);
                } else {
                    log.info("appel TSO (RTE) - l'ActivationDocumentMrid est déjà rempli. activationDocumentMrid = {}. Inutile de l'initialiser", energyAmount.getActivationDocumentMrid());
                }
            } else {
                log.info("Cas d'appel pour DSO (ENEDIS). On n'initialise pas activationDocumentMrid (clé composite). activationDocumentMrid = {}", energyAmount.getActivationDocumentMrid());
            }
        }
        energyAmount.setDocType(ENERGY_AMOUNT.getDocType());
        if (energyAmount.getRevisionNumber() == null) {
            energyAmount.setRevisionNumber(InfoUtils.REVISION_NUMBER);
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

    /**
     * Méthode de recherche des energy amounts à partir des critères de recherche.
     *
     * @param energyAmountCriteria
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    public EnergyAmount[] findEnergyAmount(EnergyAmountCriteria energyAmountCriteria) throws BusinessException, TechnicalException {
        var selectors = new ArrayList<Selector>();
        selectors.add(Expression.eq("docType", ENERGY_AMOUNT.getDocType()));

        if (isNotBlank(energyAmountCriteria.getEnergyAmountMarketDocumentMrid())) {
            selectors.add(Expression.eq("energyAmountMarketDocumentMrid", energyAmountCriteria.getEnergyAmountMarketDocumentMrid()));
        }
        var queryBuilder = QueryBuilderHelper.toQueryBuilder(selectors);
        String query = queryBuilder.build();
        log.debug("Transaction query: " + query);
        return energyAmountRepository.findEnergyAmountByQuery(query);
    }
}
