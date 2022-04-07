package com.star.dto.common;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Getter
@Setter
public class PageResponse<E> {
    private List<E> content;
    private int totalElements;
    private String bookmark;
}
