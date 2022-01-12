package com.star;

import com.star.configuration.TestConfiguration;
import org.junit.Ignore;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Ignore("Base class for Service test.")
@ContextConfiguration(classes = {TestConfiguration.class})
@ActiveProfiles("test")
@SpringBootTest
public class AbstractTest {
}