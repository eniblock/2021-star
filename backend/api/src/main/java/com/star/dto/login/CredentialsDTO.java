package com.star.dto.login;

import lombok.Getter;
import lombok.Setter;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Getter
@Setter
public class CredentialsDTO {
    private String username;
    private String password;
}
