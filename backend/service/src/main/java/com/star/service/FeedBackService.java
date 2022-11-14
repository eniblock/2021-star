package com.star.service;

import com.star.enums.DocTypeEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.feedback.FeedBack;
import com.star.repository.FeedBackRepository;
import com.star.utils.InfoUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import javax.validation.Valid;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.UUID.randomUUID;
import static org.apache.commons.collections4.CollectionUtils.isNotEmpty;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.isBlank;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Service
public class FeedBackService {

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private FeedBackRepository feedBackRepository;

    private ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();

    /**
     * Permet d'enregistrer un nouveau feedback
     *
     * @param feedBack
     */
    public void create(@Valid FeedBack feedBack) throws BusinessException, TechnicalException {
        Assert.notNull(feedBack, messageSource.getMessage("create.feedback.not.null", null, null));
        Validator validator = validatorFactory.getValidator();
        List<String> errors = new ArrayList<>();
        errors.addAll(validator.validate(feedBack).stream().map(violation -> violation.getPropertyPath() + StringUtils.SPACE + violation.getMessage())
                .collect(Collectors.toList()));
        if (isNotEmpty(errors)) {
            throw new BusinessException(StringUtils.join(errors, ","));
        }
        feedBack.setFeedbackProducerMrid(randomUUID().toString());
        feedBack.setDocType(DocTypeEnum.FEEDBACK.getDocType());
        if (StringUtils.isBlank(feedBack.getCreatedDateTime())) {
            feedBack.setCreatedDateTime(LocalDateTime.now().toString());
        }
        if (StringUtils.isBlank(feedBack.getRevisionNumber())) {
            feedBack.setRevisionNumber(InfoUtils.REVISION_NUMBER);
        }
        if (isBlank(feedBack.getFeedback())) {
            feedBack.setFeedback(EMPTY);
        }
        if (isBlank(feedBack.getFeedbackAnswer())) {
            feedBack.setFeedbackAnswer(EMPTY);
        }
        if (isBlank(feedBack.getFeedbackElements())) {
            feedBack.setFeedbackElements(EMPTY);
        }
        feedBackRepository.saveFeedBack(feedBack);
    }
}
