package com.star.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.imports.ImportResult;
import com.star.models.participant.ImportMarketParticipantResult;
import com.star.models.participant.SystemOperator;
import com.star.models.participant.dso.ImportMarketParticipantDsoResult;
import com.star.models.participant.dso.MarketParticipantDso;
import com.star.models.participant.tso.ImportMarketParticipantTsoResult;
import com.star.models.participant.tso.MarketParticipantTso;
import com.star.repository.MarketParticipantRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.Reader;
import java.util.Collections;
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
     * Permet d'importer les market participants DSO selon les informations contenues dans le fichier CSV passé en paramètre.
     *
     * @param fileName     nom du fichier CSV à traiter.
     * @param streamReader le contenu du fichier CSV à traiter, en tant qu'objet {@link Reader}
     * @return {@link ImportMarketParticipantDsoResult} contenant les participants importés et les éventuelles erreurs des lignes ne respectant pas le format.
     * @throws IOException
     * @throws TechnicalException
     */
//    public ImportMarketParticipantDsoResult importMarketParticipantDso(String fileName, Reader streamReader) throws IOException, TechnicalException {
//        importUtilsService.checkFile(fileName, streamReader);
//        ImportMarketParticipantDsoResult importMarketParticipantDsoResult = new ImportMarketParticipantDsoResult();
//        CSVParser csvParser = importUtilsService.getCsvParser(streamReader);
//        // Vérifier le header du fichier
//        importUtilsService.validateHeader(fileName, csvParser, new MarketParticipantDso(), importMarketParticipantDsoResult);
//        if (isNotEmpty(importMarketParticipantDsoResult.getErrors())) {
//            return importMarketParticipantDsoResult;
//        }
//        // Vérifier le contenu du fichier
//        this.validateBody(fileName, csvParser, importMarketParticipantDsoResult, false);
//        if (isNotEmpty(importMarketParticipantDsoResult.getErrors())) {
//            return importMarketParticipantDsoResult;
//        }
//        if (CollectionUtils.isEmpty(importMarketParticipantDsoResult.getErrors()) && CollectionUtils.isEmpty(importMarketParticipantDsoResult.getDatas())) {
//            throw new IllegalArgumentException(messageSource.getMessage("import.file.data.not.empty", null, null));
//        }
//        importMarketParticipantDsoResult.setDatas(marketParticipantRepository.saveMarketParticipantDso(importMarketParticipantDsoResult.getDatas()));
//        return importMarketParticipantDsoResult;
//    }

    /**
     * Permet d'importer les market participants TSO selon les informations contenues dans le fichier CSV passé en paramètre.
     *
     * @param fileName     nom du fichier CSV à traiter.
     * @param streamReader le contenu du fichier CSV à traiter, en tant qu'objet {@link Reader}
     * @return {@link ImportMarketParticipantTsoResult} contenant les participants importés et les éventuelles erreurs des lignes ne respectant pas le format.
     * @throws IOException
     */
//    public ImportMarketParticipantTsoResult importMarketParticipantTso(String fileName, Reader streamReader) throws IOException, TechnicalException {
//        importUtilsService.checkFile(fileName, streamReader);
//        ImportMarketParticipantTsoResult importMarketParticipantTsoResult = new ImportMarketParticipantTsoResult();
//        CSVParser csvParser = importUtilsService.getCsvParser(streamReader);
//        // Vérifier le header du fichier
//        importUtilsService.validateHeader(fileName, csvParser, new MarketParticipantTso(), importMarketParticipantTsoResult);
//        if (isNotEmpty(importMarketParticipantTsoResult.getErrors())) {
//            return importMarketParticipantTsoResult;
//        }
//        // Vérifier le contenu du fichier
//        this.validateBody(fileName, csvParser, importMarketParticipantTsoResult, true);
//        if (isNotEmpty(importMarketParticipantTsoResult.getErrors())) {
//            return importMarketParticipantTsoResult;
//        }
//        if (CollectionUtils.isEmpty(importMarketParticipantTsoResult.getErrors()) && CollectionUtils.isEmpty(importMarketParticipantTsoResult.getDatas())) {
//            throw new IllegalArgumentException(messageSource.getMessage("import.file.data.not.empty", null, null));
//        }
//        importMarketParticipantTsoResult.setDatas(marketParticipantRepository.saveMarketParticipantTso(importMarketParticipantTsoResult.getDatas()));
//        return importMarketParticipantTsoResult;
//    }



    /**
     * Permet d'importer les market participants TSO selon les informations contenues dans le fichier CSV passé en paramètre.
     *
     * @param fileName     nom du fichier CSV à traiter.
     * @param streamReader le contenu du fichier CSV à traiter, en tant qu'objet {@link Reader}
     * @return {@link ImportMarketParticipantTsoResult} contenant les participants importés et les éventuelles erreurs des lignes ne respectant pas le format.
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
     * Retourne un objet contenant la liste des market participant DSO et des market participant TSO
     *
     * @return
     */
    public List<SystemOperator> getSystemOperators() throws JsonProcessingException, ContractException {
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

//    private void validateBody(String fileName, CSVParser csvParser, ImportResult importResult, boolean isTso) {
//        // Vérifier le contenu du fichier
//        for (CSVRecord csvRecord : csvParser) {
//            MarketParticipantTso marketParticipantTso = null;
//            MarketParticipantDso marketParticipantDso = null;
//            Long lineNumber = csvRecord.getRecordNumber() + 1;
//            // Le constructeur peut échouer dans le cas ou le record ne correspond pas à tous les paramètres attendus
//            try {
//                if (isTso) {
//                    marketParticipantTso = new MarketParticipantTso();
//                    marketParticipantTso.setData(csvRecord);
//                } else {
//                    marketParticipantDso = new MarketParticipantDso();
//                    marketParticipantDso.setData(csvRecord);
//                }
//            } catch (IllegalArgumentException illegalArgumentException) {
//                importUtilsService.handleConstructorException(fileName, importResult, lineNumber, illegalArgumentException);
//            }
//            // Erreur de validation des annotations
//            String errorRecord;
//            if (isTso) {
//                errorRecord = importUtilsService.validateRecord(fileName, csvRecord, marketParticipantTso);
//            } else {
//                errorRecord = importUtilsService.validateRecord(fileName, csvRecord, marketParticipantDso);
//            }
//            if (errorRecord != null) {
//                log.error(errorRecord);
//                importResult.getErrors().add(errorRecord);
//            } else {
//                importResult.getDatas().add(marketParticipantTso != null ? marketParticipantTso : marketParticipantDso);
//            }
//        }
//    }
}
