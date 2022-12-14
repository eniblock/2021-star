package com.star.rest.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@ControllerAdvice
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = {BusinessException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected ResponseEntity<Object> handleBusinessException(BusinessException businessException, WebRequest request) {
        logError(businessException);
        return handleExceptionInternal(businessException, getErrorDetails(businessException, request),
                new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(value = {JsonProcessingException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected ResponseEntity<Object> handleJsonProcessingException(JsonProcessingException jsonProcessingException, WebRequest request) {
        logError(jsonProcessingException);
        return handleExceptionInternal(jsonProcessingException, getErrorDetails(jsonProcessingException, request), new HttpHeaders(),
                HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(value = {JsonMappingException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected ResponseEntity<Object> handleJsonMappingException(JsonMappingException jsonMappingException, WebRequest request) {
        logError(jsonMappingException);
        return handleExceptionInternal(jsonMappingException, getErrorDetails(jsonMappingException, request), new HttpHeaders(),
                HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(value = {IllegalArgumentException.class, IllegalStateException.class, MultipartException.class})
    @ResponseStatus(HttpStatus.CONFLICT)
    protected ResponseEntity<Object> handleConflict(RuntimeException runtimeException, WebRequest request) {
        logError(runtimeException);
        return handleExceptionInternal(runtimeException, getErrorDetails(runtimeException, request), new HttpHeaders(),
                HttpStatus.CONFLICT, request);
    }

    @ExceptionHandler(value = {BadCredentialsException.class})
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    protected ResponseEntity<Object> handleBadCredentialsException(BadCredentialsException badCredentialsException, WebRequest request) {
        logError(badCredentialsException);
        return handleExceptionInternal(badCredentialsException, getErrorDetails(badCredentialsException, request),
                new HttpHeaders(), HttpStatus.UNAUTHORIZED, request);
    }

    @ExceptionHandler(value = {TechnicalException.class})
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    protected ResponseEntity<Object> handleTechnicalException(RuntimeException runtimeException, WebRequest request) {
        logError(runtimeException);
        return handleExceptionInternal(runtimeException, getErrorDetails(runtimeException, request), new HttpHeaders(),
                HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    private void logError(Exception exception) {
        log.error(exception.getMessage(), exception);
    }

    private ErrorDetails getErrorDetails(Exception exception, WebRequest request) {
        return new ErrorDetails(LocalDateTime.now(), ExceptionUtils.getMessage(exception), request.getDescription(true));
    }

}
