package com.star.service;

import com.star.enums.FileExtensionEnum;
import com.star.models.imports.ImportCSV;
import com.star.models.imports.ImportResult;
import lombok.extern.slf4j.Slf4j;
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

import static org.apache.commons.collections4.CollectionUtils.isEmpty;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Service
@Slf4j
public class ImportUtilsService {

    private static final String LINE_ERROR_KEY = "import.file.line.error";
    private static final char CSV_COLUMN_SEPARATOR = ';';
    private ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();

    @Autowired
    private MessageSource messageSource;

    /**
     * Vérifier que le nom du fichier est non nul et que celui-ci contient des données
     *
     * @param fileName
     * @param streamReader
     */
    public void checkFile(String fileName, Reader streamReader) {
        Assert.notNull(fileName, messageSource.getMessage("import.fileName.not.null", null, null));
        Assert.notNull(streamReader, messageSource.getMessage("import.file.not.empty", null, null));
        if (!StringUtils.equalsIgnoreCase(FilenameUtils.getExtension(fileName), FileExtensionEnum.CSV.getValue())) {
            throw new IllegalArgumentException(messageSource.getMessage("import.file.extension.error",
                    new String[]{FileExtensionEnum.CSV.getValue()}, null));
        }
    }

    /**
     * Vérifier que le header du fichier respecte le format attendu
     *
     * @param fileName
     * @param csvParser
     * @param importCSV
     * @param importResult
     */
    public void validateHeader(String fileName, CSVParser csvParser, ImportCSV importCSV, ImportResult importResult) {
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
            log.error("Erreur lors de l'import :  {}", errorMessage);
            importResult.getErrors().add(errorMessage);
        }
    }

    public CSVParser getCsvParser(Reader streamReader) throws IOException {
        return CSVFormat.EXCEL
                .withDelimiter(CSV_COLUMN_SEPARATOR)
                .withFirstRecordAsHeader()
                .withTrim()
                .parse(streamReader);
    }

    /**
     * Vérifier une ligne du corps du fichier
     */
    public List<String> validateRecord(String fileName, CSVRecord csvRecord, ImportCSV importCSV) {
        Validator validator = validatorFactory.getValidator();
        Set<ConstraintViolation<ImportCSV>> violations = validator.validate(importCSV);
        if (isEmpty(violations)) {
            return new ArrayList<>();
        }
        List<String> errors = new ArrayList<>();
        Map<String, String> fieldErrorMap = new HashMap<>();
        long lineNumber = csvRecord.getRecordNumber() + 1;
        String error = messageSource.getMessage(LINE_ERROR_KEY,
                new String[]{fileName, String.valueOf(lineNumber)}, null);
        for (ConstraintViolation<ImportCSV> violation : violations) {
            fieldErrorMap.put(violation.getPropertyPath().toString(), violation.getMessage());
            errors.add(error + " - " + violation.getMessage());
        }
        return errors;
    }

    public void handleConstructorException(String fileName, ImportResult importResult, Long lineNumber,
                                           Exception exception) {
        String error = messageSource.getMessage(LINE_ERROR_KEY,
                new String[]{fileName, String.valueOf(lineNumber)}, null) + exception.getMessage();
        importResult.getErrors().add(error);
        log.error("Fichier {} : {}", fileName, error);
    }
}
