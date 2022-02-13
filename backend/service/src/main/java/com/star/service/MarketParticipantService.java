package com.star.service;

import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.imports.ImportResult;
import com.star.models.participant.ImportMarketParticipantResult;
import com.star.models.participant.SystemOperator;
import com.star.repository.MarketParticipantRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.Reader;
import java.util.List;

import static java.util.Collections.emptyList;
import static org.apache.commons.collections4.CollectionUtils.isNotEmpty;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Service
public class MarketParticipantService {

    @Autowired
    private MarketParticipantRepository marketParticipantRepository;
    @Autowired
    private ImportUtilsService importUtilsService;
    @Autowired
    private MessageSource messageSource;

    /**
     * Permet d'importer les market participants selon les informations contenues dans le fichier CSV passé en paramètre.
     *
     * @param fileName     nom du fichier CSV à traiter.
     * @param streamReader le contenu du fichier CSV à traiter, en tant qu'objet {@link Reader}
     * @return {@link ImportMarketParticipantResult} contenant les participants importés et les éventuelles erreurs des lignes ne respectant pas le format.
     * @throws IOException
     */
    public ImportMarketParticipantResult importMarketParticipant(String fileName, Reader streamReader) throws BusinessException, TechnicalException, IOException {
        importUtilsService.checkFile(fileName, streamReader);
        ImportMarketParticipantResult importMarketParticipantResult = new ImportMarketParticipantResult();
        CSVParser csvParser = importUtilsService.getCsvParser(streamReader);
        // Vérifier le header du fichier
        importUtilsService.validateHeader(fileName, csvParser, new SystemOperator(), importMarketParticipantResult);
        if (isNotEmpty(importMarketParticipantResult.getErrors())) {
            importMarketParticipantResult.setDatas(emptyList());
            return importMarketParticipantResult;
        }
        // Vérifier le contenu du fichier
        this.validateBody(fileName, csvParser, importMarketParticipantResult);
        if (isNotEmpty(importMarketParticipantResult.getErrors())) {
            importMarketParticipantResult.setDatas(emptyList());
            return importMarketParticipantResult;
        }
        if (CollectionUtils.isEmpty(importMarketParticipantResult.getErrors()) && CollectionUtils.isEmpty(importMarketParticipantResult.getDatas())) {
            throw new IllegalArgumentException(messageSource.getMessage("import.file.data.not.empty", null, null));
        }
        importMarketParticipantResult.setDatas(marketParticipantRepository.saveMarketParticipant(importMarketParticipantResult.getDatas()));
        return importMarketParticipantResult;
    }

    /**
     * Retourne un objet contenant la liste les market participant
     *
     * @return
     */
    public List<SystemOperator> getSystemOperators() throws TechnicalException, BusinessException {
        return marketParticipantRepository.getSystemOperators();
    }

    private void validateBody(String fileName, CSVParser csvParser, ImportResult importResult) {
        // Vérifier le contenu du fichier
        for (CSVRecord csvRecord : csvParser) {
            SystemOperator systemOperator = null;
            Long lineNumber = csvRecord.getRecordNumber() + 1;
            // Le constructeur peut échouer dans le cas ou le record ne correspond pas à tous les paramètres attendus
            try {
                systemOperator = new SystemOperator();
                systemOperator.setData(csvRecord);
            } catch (IllegalArgumentException illegalArgumentException) {
                importUtilsService.handleConstructorException(fileName, importResult, lineNumber, illegalArgumentException);
            }
            // Erreur de validation des annotations
            String errorRecord = importUtilsService.validateRecord(fileName, csvRecord, systemOperator);
            if (errorRecord != null) {
                log.error(errorRecord);
                importResult.getErrors().add(errorRecord);
            } else {
                importResult.getDatas().add(systemOperator);
            }
        }
    }
}
