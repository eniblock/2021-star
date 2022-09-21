package com.star.service;

import com.star.enums.FileExtensionEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.common.FichierImportation;
import com.star.models.reservebid.AttachmentFile;
import com.star.models.reservebid.ImportReserveBidResult;
import com.star.models.reservebid.ReserveBid;
import com.star.models.reservebid.ReserveBidMarketDocumentCreation;
import com.star.repository.ReserveBidRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.UUID.randomUUID;
import static org.apache.commons.collections4.CollectionUtils.isNotEmpty;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Service
public class ReserveBidService {

    private static final String REVISION_NUMBER = "1";

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ImportUtilsService importUtilsService;

    @Autowired
    private ReserveBidRepository reserveBidRepository;

    private ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();

    public ImportReserveBidResult createReserveBid(ReserveBid reserveBid, List<FichierImportation> fichiers) throws TechnicalException, BusinessException {
        boolean hasFiles = CollectionUtils.isNotEmpty(fichiers);
        if (hasFiles) {
            importUtilsService.checkImportFiles(fichiers, FileExtensionEnum.PDF.getValue());
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
            if (StringUtils.isBlank(reserveBid.getRevisionNumber())) {
                reserveBid.setRevisionNumber(REVISION_NUMBER);
            }
            ReserveBidMarketDocumentCreation reserveBidMarketDocumentCreation = new ReserveBidMarketDocumentCreation();
            if (hasFiles) {
                List<String> attachments = new ArrayList<>();
                List<AttachmentFile> attachmentFileList = new ArrayList<>();
                fichiers.forEach(fichier -> {
                    String fileUUID = randomUUID().toString() + "_" + fichier.getFileName();
                    attachmentFileList.add(new AttachmentFile(fileUUID, fichier.getInputStream().toString()));
                    attachments.add(fileUUID);
                });
                reserveBid.setAttachments(attachments);
                reserveBidMarketDocumentCreation.setAttachmentFileList(attachmentFileList);
            }
            reserveBidMarketDocumentCreation.setReserveBid(reserveBid);
            importReserveBidResult.setReserveBid(reserveBid);
            reserveBidRepository.save(reserveBidMarketDocumentCreation);
        }
        return importReserveBidResult;
    }
}
