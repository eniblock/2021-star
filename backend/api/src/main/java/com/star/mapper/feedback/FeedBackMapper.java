package com.star.mapper.feedback;

import com.star.dto.feedback.FeedBackDTO;
import com.star.dto.feedback.FeedBackPostMessageDTO;
import com.star.models.feedback.FeedBack;
import com.star.models.feedback.FeedBackPostMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface FeedBackMapper {

    @Mapping(target = "indeminityStatus", source = "indeminityStatus", defaultValue = "InProgress")
    FeedBackDTO beanToDto(FeedBack feedBack);

    FeedBackPostMessage dtoToBean(FeedBackPostMessageDTO feedBackDTO);
}
