package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.feedback.FeedBack;
import com.star.models.feedback.FeedBackPostMessage;
import com.star.models.feedback.FeedBackPostMessageAnswer;
import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.concurrent.TimeoutException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Repository
public class FeedBackRepository {

    public static final String UPADTE_FEEDBACK_PRODUCER = "UpdateFeedbackProducer";

    public static final String UPADTE_FEEDBACK_PRODUCER_ANSWER = "UpdateFeedbackProducerAnswer";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Permet de stocker un feedBack dans la blockchain
     *
     * @param feedBack le feedback à enregistrer dans la blockchain
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    public FeedBack postMessage(FeedBackPostMessage feedBackPostMessage) throws BusinessException, TechnicalException {
        if (feedBackPostMessage == null) {
            return null;
        }
        log.info("Sauvegarde du feedBack {} ", feedBackPostMessage);
        try {
            byte[] response = contract.submitTransaction(UPADTE_FEEDBACK_PRODUCER, feedBackPostMessage.getActivationDocumentMrid(), feedBackPostMessage.getFeedback(), feedBackPostMessage.getFeedbackElements());
            return response != null ? objectMapper.readValue(new String(response), FeedBack.class) : null;
        } catch (TimeoutException timeoutException) {
            throw new TechnicalException("Erreur technique (Timeout exception) lors de la création du feedback ", timeoutException);
        } catch (InterruptedException interruptedException) {
            log.error("Erreur technique (Interrupted Exception) lors de la création du feedback ", interruptedException);
            Thread.currentThread().interrupt();
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        } catch (JsonProcessingException e) {
            throw new TechnicalException("Erreur technique lors de la création du feedback", e);
        }
        return null;
    }

    public FeedBack postMessageAnswer(FeedBackPostMessageAnswer feedBackPostMessageAnswer) throws TechnicalException {
        if (feedBackPostMessageAnswer == null) {
            return null;
        }
        log.info("Sauvegarde du feedBack answer {} ", feedBackPostMessageAnswer);
        try {
            byte[] response = contract.submitTransaction(UPADTE_FEEDBACK_PRODUCER_ANSWER, feedBackPostMessageAnswer.getActivationDocumentMrid(), feedBackPostMessageAnswer.getFeedbackAnswer());
            return response != null ? objectMapper.readValue(new String(response), FeedBack.class) : null;
        } catch (TimeoutException timeoutException) {
            throw new TechnicalException("Erreur technique (Timeout exception) lors de la création du feedback answer ", timeoutException);
        } catch (InterruptedException interruptedException) {
            log.error("Erreur technique (Interrupted Exception) lors de la création du feedback answer ", interruptedException);
            Thread.currentThread().interrupt();
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        } catch (JsonMappingException e) {
            throw new RuntimeException(e);
        } catch (JsonProcessingException e) {
            throw new TechnicalException("Erreur technique lors de la création du feedback answer", e);
        }
        return null;

    }
}
