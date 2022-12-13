package com.star.service;

import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.feedback.FeedBack;
import com.star.models.feedback.FeedBackPostMessage;
import com.star.models.feedback.FeedBackPostMessageAnswer;
import com.star.repository.FeedBackRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import javax.validation.Valid;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.apache.commons.collections4.CollectionUtils.isNotEmpty;

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
     * Permet de créer un nouveau feedback
     * <p>
     * feedBackPostMessage
     */
    public FeedBack postMessage(@Valid FeedBackPostMessage feedBackPostMessage) throws TechnicalException {
        Validator validator = validatorFactory.getValidator();
        List<String> errors = new ArrayList<>();
        errors.addAll(validator.validate(feedBackPostMessage).stream().map(violation -> violation.getPropertyPath() + StringUtils.SPACE + violation.getMessage())
                .collect(Collectors.toList()));
        if (isNotEmpty(errors)) {
            throw new BusinessException(StringUtils.join(errors, ","));
        }
        return feedBackRepository.postMessage(feedBackPostMessage);
    }

    public FeedBack postMessageAnswer(@Valid FeedBackPostMessageAnswer feedBackPostMessageAnswer) throws TechnicalException {
        Validator validator = validatorFactory.getValidator();
        List<String> errors = new ArrayList<>();
        errors.addAll(validator.validate(feedBackPostMessageAnswer).stream().map(violation -> violation.getPropertyPath() + StringUtils.SPACE + violation.getMessage())
                .collect(Collectors.toList()));
        if (isNotEmpty(errors)) {
            throw new BusinessException(StringUtils.join(errors, ","));
        }
        return feedBackRepository.postMessageAnswer(feedBackPostMessageAnswer);
    }
}
