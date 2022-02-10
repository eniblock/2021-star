package com.star.service;

import com.star.enums.FileExtensionEnum;
import com.star.exception.TechnicalException;
import com.star.models.participant.ImportCSV;
import com.star.models.participant.ImportResult;
import com.star.models.participant.MarketParticipant;
import com.star.models.participant.dso.ImportMarketParticipantDsoResult;
import com.star.models.participant.dso.MarketParticipantDso;
import com.star.models.participant.tso.ImportMarketParticipantTsoResult;
import com.star.models.participant.tso.MarketParticipantTso;
import com.star.repository.MarketParticipantRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.stream.Collectors.joining;
import static org.apache.commons.collections4.CollectionUtils.isEmpty;
import static org.apache.commons.collections4.CollectionUtils.isNotEmpty;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Service
public class MarketParticipantService {

    private static final String LINE_ERROR_KEY = "import.market.participant.file.line.error";
    private static final char CSV_COLUMN_SEPARATOR = ';';
    private ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();

    @Autowired
    private MarketParticipantRepository marketParticipantRepository;

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
    public ImportMarketParticipantDsoResult importMarketParticipantDso(String fileName, Reader streamReader) throws IOException, TechnicalException {
        checkFile(fileName, streamReader);
        ImportMarketParticipantDsoResult importMarketParticipantDsoResult = new ImportMarketParticipantDsoResult();
        CSVParser csvParser = getCsvParser(streamReader);
        // Vérifier le header du fichier
        validateHeader(fileName, csvParser, new MarketParticipantDso(), importMarketParticipantDsoResult);
        if (isNotEmpty(importMarketParticipantDsoResult.getErrors())) {
            return importMarketParticipantDsoResult;
        }
        // Vérifier le contenu du fichier
        validateBody(fileName, csvParser, new MarketParticipantDso(), importMarketParticipantDsoResult);
        if (isNotEmpty(importMarketParticipantDsoResult.getErrors())) {
            return importMarketParticipantDsoResult;
        }
        if (CollectionUtils.isEmpty(importMarketParticipantDsoResult.getErrors()) && CollectionUtils.isEmpty(importMarketParticipantDsoResult.getDatas())) {
            throw new IllegalArgumentException(messageSource.getMessage("import.market.participant.file.data.not.empty", null, null));
        }
        importMarketParticipantDsoResult.setDatas(marketParticipantRepository.saveMarketParticipantDso(importMarketParticipantDsoResult.getDatas(), null));
        return importMarketParticipantDsoResult;
    }


    /**
     * Permet d'importer les market participants TSO selon les informations contenues dans le fichier CSV passé en paramètre.
     *
     * @param fileName     nom du fichier CSV à traiter.
     * @param streamReader le contenu du fichier CSV à traiter, en tant qu'objet {@link Reader}
     * @return {@link ImportMarketParticipantTsoResult} contenant les participants importés et les éventuelles erreurs des lignes ne respectant pas le format.
     * @throws IOException
     */
    public ImportMarketParticipantTsoResult importMarketParticipantTso(String fileName, Reader streamReader) throws IOException, TechnicalException {
        checkFile(fileName, streamReader);
        ImportMarketParticipantTsoResult importMarketParticipantTsoResult = new ImportMarketParticipantTsoResult();
        CSVParser csvParser = getCsvParser(streamReader);
        // Vérifier le header du fichier
        validateHeader(fileName, csvParser, new MarketParticipantTso(), importMarketParticipantTsoResult);
        if (isNotEmpty(importMarketParticipantTsoResult.getErrors())) {
            return importMarketParticipantTsoResult;
        }
        // Vérifier le contenu du fichier
        validateBody(fileName, csvParser, new MarketParticipantTso(), importMarketParticipantTsoResult);
        if (isNotEmpty(importMarketParticipantTsoResult.getErrors())) {
            return importMarketParticipantTsoResult;
        }
        if (CollectionUtils.isEmpty(importMarketParticipantTsoResult.getErrors()) && CollectionUtils.isEmpty(importMarketParticipantTsoResult.getDatas())) {
            throw new IllegalArgumentException(messageSource.getMessage("import.market.participant.file.data.not.empty", null, null));
        }
        importMarketParticipantTsoResult.setDatas(marketParticipantRepository.saveMarketParticipantTso(importMarketParticipantTsoResult.getDatas(), null));
        return importMarketParticipantTsoResult;
    }

    /**
     * Retourne un objet contenant la liste des market participant DSO et des market participant TSO
     *
     * @return
     */
    public MarketParticipant getMarketParticipant() throws TechnicalException {
        return new MarketParticipant(marketParticipantRepository.getMarketParticipantDsos(), marketParticipantRepository.getMarketParticipantTsos());
    }

    /**
     * Vérifier que le nom du fichier est non nul et que celui-ci contient des données
     */
    private void checkFile(String fileName, Reader streamReader) {
        Assert.notNull(fileName, messageSource.getMessage("import.market.participant.fileName.not.null", null, null));
        Assert.notNull(streamReader, messageSource.getMessage("import.market.participant.file.not.empty", null, null));
        if (!StringUtils.equalsIgnoreCase(FilenameUtils.getExtension(fileName), FileExtensionEnum.CSV.getValue())) {
            throw new IllegalArgumentException(messageSource.getMessage("import.market.participant.file.extension.error",
                    new String[]{FileExtensionEnum.CSV.getValue()}, null));
        }
    }

    /**
     * Vérifier que le header du fichier respecte le format attendu
     */
    private void validateHeader(String fileName, CSVParser csvParser, ImportCSV importCSV, ImportResult importResult) {
        boolean isStructureErrorDetected = false;
        String errorMessage = null;
        Set<String> actualHeaders = csvParser.getHeaderMap().keySet();
        List<String> expectedHeaders = importCSV.getHeaders();
        if (actualHeaders.size() != expectedHeaders.size()) {
            isStructureErrorDetected = true;
        }
        if (!expectedHeaders.containsAll(actualHeaders)) {
            isStructureErrorDetected = true;
        }

        if (isStructureErrorDetected) {
            errorMessage = messageSource.getMessage(LINE_ERROR_KEY,
                    new String[]{fileName, "1"}, null) + "Structure attendue : " + expectedHeaders + " , reçue : " + actualHeaders;
        }
        if (errorMessage != null) {
            log.error("Erreur lors de l'import :  {}", errorMessage);
            importResult.getErrors().add(errorMessage);
        }
    }

    /**
     * Vérifier que le corps du fichier respecte le format attendu
     */
    private void validateBody(String fileName, CSVParser csvParser, ImportCSV importCSV, ImportResult importResult) {
        // Vérifier le contenu du fichier
        for (CSVRecord csvRecord : csvParser) {
            Long lineNumber = csvRecord.getRecordNumber() + 1;
            // Le constructeur peut échouer dans le cas ou le record ne correspond pas à tous les paramètres attendus
            try {
                importCSV.setData(csvRecord);
            } catch (IllegalArgumentException illegalArgumentException) {
                handleConstructorException(fileName, importResult, lineNumber, illegalArgumentException);
            }
            // Erreur de validation des annotations
            String errorRecord = validateRecord(fileName, csvRecord, importCSV);
            if (errorRecord != null) {
                log.error(errorRecord);
                importResult.getErrors().add(errorRecord);
            } else {
                importResult.getDatas().add(importCSV);
            }
        }
    }

    /**
     * Vérifier une ligne du corps du fichier
     */
    private String validateRecord(String fileName, CSVRecord csvRecord, ImportCSV importCSV) {
        Validator validator = validatorFactory.getValidator();
        Set<ConstraintViolation<ImportCSV>> violations = validator.validate(importCSV);
        if (isEmpty(violations)) {
            return null;
        }
        Map<String, String> fieldErrorMap = new HashMap<>();
        long lineNumber = csvRecord.getRecordNumber() + 1;
        String error = messageSource.getMessage(LINE_ERROR_KEY,
                new String[]{fileName, String.valueOf(lineNumber)}, null);
        List<String> errors = new ArrayList<>();
        for (ConstraintViolation<ImportCSV> violation : violations) {
            fieldErrorMap.put(violation.getPropertyPath().toString(), violation.getMessage());
            errors.add(error + violation.getPropertyPath().toString() + " - " + violation.getMessage());
        }
        return errors.stream().collect(joining(System.getProperty("line.separator")));
    }

    private CSVParser getCsvParser(Reader streamReader) throws IOException {
        return CSVFormat.EXCEL
                .withDelimiter(CSV_COLUMN_SEPARATOR)
                .withFirstRecordAsHeader()
                .withTrim()
                .parse(streamReader);
    }

    private void handleConstructorException(String fileName, ImportResult importResult, Long lineNumber,
                                            Exception exception) {
        String error = messageSource.getMessage(LINE_ERROR_KEY,
                new String[]{fileName, String.valueOf(lineNumber)}, null) + exception.getMessage();
        importResult.getErrors().add(error);
        log.error("Fichier {} : {}", fileName, error);
    }
}
