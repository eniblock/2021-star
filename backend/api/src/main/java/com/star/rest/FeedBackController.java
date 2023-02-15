package com.star.rest;

import com.star.dto.feedback.FeedBackDTO;
import com.star.dto.feedback.FeedBackPostMessageAnswerDTO;
import com.star.dto.feedback.FeedBackPostMessageDTO;
import com.star.exception.TechnicalException;
import com.star.mapper.feedback.FeedBackMapper;
import com.star.service.FeedBackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(FeedBackController.PATH)
@Tag(name="Feedback")
public class FeedBackController {
    public static final String PATH = ApiRestVersion.VERSION + "/feedback";

    @Autowired
    private FeedBackService feedBackService;

    @Autowired
    private FeedBackMapper feedBackMapper;

    /**
     * API de création d'un reserve bid.
     *
     * @param feedBackDTO
     * @return
     */
    @Operation(summary = "Post a feedback. (PRODUCER)",
            description = "Post a feedback as a producer.")
    @PostMapping()
    @PreAuthorize("@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<FeedBackDTO> createFeedbackProducer(@NotNull @RequestBody FeedBackPostMessageDTO feedBackDTO) throws TechnicalException {
        var feedback = feedBackService.postMessage(feedBackMapper.dtoToBean(feedBackDTO));
        return ResponseEntity.ok(feedBackMapper.beanToDto(feedback));
    }

    /**
     * API de création d'un reserve bid.
     *
     * @param feedBackAnswerDTO
     * @return
     */
    @Operation(summary = "Answer a feedback. (TSO, DSO)",
            description = "Answer a feedback as TSO or DSO")
    @PostMapping("/answer")
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<FeedBackDTO> answerFeedbackProducer(@NotNull @RequestBody FeedBackPostMessageAnswerDTO feedBackAnswerDTO) throws TechnicalException {
        var feedback = feedBackService.postMessageAnswer(feedBackMapper.dtoToBean(feedBackAnswerDTO));
        return ResponseEntity.ok(feedBackMapper.beanToDto(feedback));
    }

    @Operation(summary = "Get a producer feedback. (TSO, DSO, PRODUCER)",
            description = "Get a feedback and its answer.")
    @GetMapping("/{activationDocumentMrid}")
    public ResponseEntity<FeedBackDTO> getFeedbackProducerByActivationDocumentMrid(
            @Parameter(description = "activationDocumentMrid of the feedback", example = "084b5e20-9cd0-4556-9e25-1574f0b864ef")
            @PathVariable String activationDocumentMrid) throws TechnicalException {
        return ResponseEntity.status(HttpStatus.OK).body(feedBackMapper.beanToDto(feedBackService.findByActivationDocumentMrid(activationDocumentMrid)));
    }

}
