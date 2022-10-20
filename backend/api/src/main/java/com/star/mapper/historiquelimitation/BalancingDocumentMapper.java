package com.star.mapper.historiquelimitation;

import com.star.dto.historiquelimitation.BalancingDocumentDTO;
import com.star.models.balancing.BalancingDocument;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface BalancingDocumentMapper {
    BalancingDocumentDTO beanToDto(BalancingDocument balancingDocument);
    List<BalancingDocumentDTO> beanToDtos(List<BalancingDocument> balancingDocuments);
}