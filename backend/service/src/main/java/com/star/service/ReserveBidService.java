package com.star.service;

import com.star.enums.FileExtensionEnum;
import com.star.enums.ReserveBidStatusEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.common.FichierImportation;
import com.star.models.reservebid.AttachmentFile;
import com.star.models.reservebid.ImportReserveBidResult;
import com.star.models.reservebid.ReserveBid;
import com.star.models.reservebid.ReserveBidMarketDocumentCreation;
import com.star.repository.ReserveBidRepository;
import com.star.utils.InfoUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;

import static java.util.UUID.randomUUID;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.collections4.CollectionUtils.isNotEmpty;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.apache.commons.lang3.StringUtils.upperCase;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Service
public class ReserveBidService {

    private static final List<String> RESERVE_BID_STATUS_LIST = Arrays.asList(ReserveBidStatusEnum.values())
            .stream()
            .map(ReserveBidStatusEnum::name)
            .collect(toList());

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ImportUtilsService importUtilsService;

    @Autowired
    private ReserveBidRepository reserveBidRepository;

    @Autowired
    private BalancingDocumentService balancingDocumentService;

    private ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();

    public ImportReserveBidResult createReserveBid(ReserveBid reserveBid, List<FichierImportation> fichierImportations) throws IOException, TechnicalException, BusinessException {
        log.debug("Service de traitement du reservebid  {}", reserveBid);
        log.debug("Traitement de(s) fichier(s) pour le reservebid DTO {}", fichierImportations);
        boolean hasFiles = CollectionUtils.isNotEmpty(fichierImportations);
        if (hasFiles) {
            importUtilsService.checkImportFiles(fichierImportations, FileExtensionEnum.PDF.getValue());
        }
        ImportReserveBidResult importReserveBidResult = new ImportReserveBidResult();
        Assert.notNull(reserveBid, messageSource.getMessage("import.reserveBid.not.null", null, null));
        Validator validator = validatorFactory.getValidator();
        List<String> errors = new ArrayList<>();
        errors.addAll(validator.validate(reserveBid).stream().map(violation -> violation.getPropertyPath() + StringUtils.SPACE + violation.getMessage())
                .collect(Collectors.toList()));
        if (isNotEmpty(errors)) {
            importReserveBidResult.setErrors(errors);
        } else {
            reserveBid.setReserveBidMrid(randomUUID().toString());
            reserveBid.setAttachmentsWithStatus(new ArrayList<>());
            if (StringUtils.isBlank(reserveBid.getFlowDirection())) {
                reserveBid.setFlowDirection(StringUtils.EMPTY);
            }
            if (StringUtils.isBlank(reserveBid.getCreatedDateTime())) {
                reserveBid.setCreatedDateTime(LocalDateTime.now().toString());
            }
            if (StringUtils.isBlank(reserveBid.getRevisionNumber())) {
                reserveBid.setRevisionNumber(InfoUtils.REVISION_NUMBER);
            }
            if (isBlank(reserveBid.getMessageType())) {
                reserveBid.setMessageType(EMPTY);
            }
            if (isBlank(reserveBid.getProcessType())) {
                reserveBid.setProcessType(EMPTY);
            }
            if (isBlank(reserveBid.getSenderMarketParticipantMrid())) {
                reserveBid.setSenderMarketParticipantMrid(EMPTY);
            }
            if (isBlank(reserveBid.getReceiverMarketParticipantMrid())) {
                reserveBid.setReceiverMarketParticipantMrid(EMPTY);
            }
            if (isBlank(reserveBid.getValidityPeriodStartDateTime())) {
                reserveBid.setValidityPeriodStartDateTime(EMPTY);
            }
            if (isBlank(reserveBid.getValidityPeriodEndDateTime())) {
                reserveBid.setValidityPeriodEndDateTime(EMPTY);
            }
            if (isBlank(reserveBid.getBusinessType())) {
                reserveBid.setBusinessType(EMPTY);
            }
            if (isBlank(reserveBid.getQuantityMeasureUnitName())) {
                reserveBid.setQuantityMeasureUnitName(EMPTY);
            }
            if (isBlank(reserveBid.getPriceMeasureUnitName())) {
                reserveBid.setPriceMeasureUnitName(EMPTY);
            }
            if (isBlank(reserveBid.getCurrencyUnitName())) {
                reserveBid.setCurrencyUnitName(EMPTY);
            }
            if (isBlank(reserveBid.getReserveBidStatus())) {
                reserveBid.setReserveBidStatus(EMPTY);
            }
            if (isBlank(reserveBid.getMarketType())) {
                reserveBid.setMarketType(EMPTY);
            }
            ReserveBidMarketDocumentCreation reserveBidMarketDocumentCreation = new ReserveBidMarketDocumentCreation();
            List<String> attachments = new ArrayList<>();
            List<AttachmentFile> attachmentFileList = new ArrayList<>();
            if (hasFiles) {
                for (FichierImportation fichierImportation : fichierImportations) {
                    String fileUUID = randomUUID().toString() + "_" + fichierImportation.getFileName();
                    attachments.add(fileUUID);
                    AttachmentFile attachmentFile = new AttachmentFile();
                    attachmentFile.setFileContent(Base64.getEncoder().encodeToString(fichierImportation.getInputStream().readAllBytes()));
                    attachmentFile.setFileId(fileUUID);
                    attachmentFileList.add(attachmentFile);
                }
            }
            // S'il n'y a pas de fichiers en PJ, on aura 2 listes vides MAIS NON NULLES car les 2 listes ont été initialisées ci-dessus.
            reserveBid.setAttachments(attachments);
            reserveBidMarketDocumentCreation.setAttachmentFileList(attachmentFileList);
            reserveBidMarketDocumentCreation.setReserveBid(reserveBid);
            importReserveBidResult.setReserveBid(reserveBid);
            reserveBidRepository.save(reserveBidMarketDocumentCreation);
        }
        return importReserveBidResult;
    }

    public List<ReserveBid> getReserveBid(String meteringPointMrid) throws TechnicalException {
        Assert.notNull(meteringPointMrid, "MeteringPointMrid must be non null");
        return reserveBidRepository.getReserveBid(meteringPointMrid);
    }

    public AttachmentFile getFile(String fileId) throws TechnicalException {
        Assert.notNull(fileId, "fileId must be non null");
        return reserveBidRepository.getFile(fileId);
    }

    public void updateStatus(String reserveBidMrid, String newStatus) throws TechnicalException, BusinessException, ContractException, InterruptedException, TimeoutException {
        Assert.notNull(reserveBidMrid, "reserveBidMrid must be non null");
        Assert.notNull(newStatus, "newStatus must be non null");
        if (StringUtils.isNotBlank(newStatus) && !RESERVE_BID_STATUS_LIST.contains(upperCase(newStatus))) {
            throw new BusinessException(messageSource.getMessage(messageSource.getMessage("update.reserveBid.status.error",
                    new String[]{}, null), null, null));
        }
        reserveBidRepository.updateStatus(reserveBidMrid, newStatus);
        balancingDocumentService.reconciliateBalancingDocument(reserveBidMrid);
    }
}
