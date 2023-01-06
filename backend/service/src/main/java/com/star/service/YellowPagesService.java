package com.star.service;

import com.star.enums.DocTypeEnum;
import com.star.enums.FileExtensionEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.imports.ImportResult;
import com.star.models.producer.ImportProducerResult;
import com.star.models.yellowpages.ImportYellowPagesResult;
import com.star.models.yellowpages.YellowPages;
import com.star.repository.YellowPagesRepository;
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
public class YellowPagesService {

    @Autowired
    private YellowPagesRepository yellowPagesRepository;
    @Autowired
    private ImportUtilsService importUtilsService;
    @Autowired
    private MessageSource messageSource;

    /**
     * Permet d'importer les yellow pages selon les informations contenues dans le fichier CSV passé en paramètre.
     *
     * @param fileName     nom du fichier CSV à traiter.
     * @param streamReader le contenu du fichier CSV à traiter, en tant qu'objet {@link Reader}
     * @return {@link ImportProducerResult} contenant les producers importés et les éventuelles erreurs des lignes ne respectant pas le format.
     * @throws IOException
     * @throws BusinessException
     * @throws TechnicalException
     */
    public ImportYellowPagesResult importYellowPages(String fileName, Reader streamReader) throws IOException, BusinessException, TechnicalException {
        importUtilsService.checkFile(fileName, streamReader, FileExtensionEnum.CSV.getValue());
        ImportYellowPagesResult importYellowPagesResult = new ImportYellowPagesResult();
        CSVParser csvParser = importUtilsService.getCsvParser(streamReader);
        // Vérifier le header du fichier
        importUtilsService.validateHeader(fileName, csvParser, new YellowPages(), importYellowPagesResult);
        if (isNotEmpty(importYellowPagesResult.getErrors())) {
            return importYellowPagesResult;
        }
        // Vérifier le contenu du fichier
        this.validateBody(fileName, csvParser, importYellowPagesResult);
        if (isNotEmpty(importYellowPagesResult.getErrors())) {
            importYellowPagesResult.setDatas(emptyList());
            return importYellowPagesResult;
        }
        if (CollectionUtils.isEmpty(importYellowPagesResult.getErrors()) && CollectionUtils.isEmpty(importYellowPagesResult.getDatas())) {
            throw new IllegalArgumentException(messageSource.getMessage("import.file.data.not.empty", null, null));
        }
        importYellowPagesResult.getDatas().forEach(yellowPages -> yellowPages.setDocType(DocTypeEnum.YELLOW_PAGES.getDocType()));
        importYellowPagesResult.setDatas(yellowPagesRepository.saveYellowPages(importYellowPagesResult.getDatas()));
        return importYellowPagesResult;
    }


    public List<YellowPages> getYellowPages() throws BusinessException, TechnicalException {
        return yellowPagesRepository.getYellowPages();
    }

    private void validateBody(String fileName, CSVParser csvParser, ImportResult importResult) {
        // Vérifier le contenu du fichier
        for (CSVRecord csvRecord : csvParser) {
            YellowPages yellowPages = null;
            Long lineNumber = csvRecord.getRecordNumber() + 1;
            // Le constructeur peut échouer dans le cas ou le record ne correspond pas à tous les paramètres attendus
            try {
                yellowPages = new YellowPages();
                yellowPages.defineData(csvRecord);
            } catch (IllegalArgumentException illegalArgumentException) {
                importUtilsService.handleConstructorException(fileName, importResult, lineNumber, illegalArgumentException);
            }
            // Erreur de validation des annotations
            List<String> errors = importUtilsService.validateRecord(fileName, csvRecord, yellowPages);
            if (CollectionUtils.isNotEmpty(errors)) {
                importResult.getErrors().addAll(errors);
            } else {
                importResult.getDatas().add(yellowPages);
            }
        }
    }
}
