package com.star.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.common.OrderDirection;
import com.star.models.common.PageHLF;
import com.star.models.common.PaginationDto;
import com.star.models.historiquelimitation.HistoriqueLimitation;
import com.star.models.historiquelimitation.HistoriqueLimitationCriteria;
import com.star.repository.HistoriqueLimitationRepository;
import org.hyperledger.fabric.gateway.ContractException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Arrays;

import static com.star.enums.InstanceEnum.TSO;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

class HistoriqueLimitationServiceTest extends AbstractTest {

    @Captor
    private ArgumentCaptor<String> queryCaptor;

    @Captor
    private ArgumentCaptor<String> pageSizeCaptor;

    @Captor
    private ArgumentCaptor<String> bookmarkCaptor;

    @MockBean
    private HistoriqueLimitationRepository historiqueLimitationRepository;

    @Autowired
    private HistoriqueLimitationService historiqueLimitationService;

    @Test
    void findHistorique() throws JsonProcessingException, ContractException, TechnicalException {
        // GIVEN
        String bookmark = "kBHIYBiy198";
        var historiqueLimitationCriteria = HistoriqueLimitationCriteria.builder()
                .originAutomationRegisteredResourceMrid("originAutomationRegisteredResourceMrid")
                .producerMarketParticipantMrid("producerMarketParticipantMrid")
                .siteName("site_test")
                .startCreatedDateTime("2022-08-12T00:00:00Z")
                .endCreatedDateTime("2022-08-12T00:00:00Z")
                .activationDocumentMrid("activationDocumentMrid")
                .instance(TSO)
                .build();
        var historiqueLimitationResponse = PageHLF.builder().bookmark(bookmark).fetchedRecordsCount(1).records(Arrays.asList(new HistoriqueLimitation())).build();
        var paginationDto = PaginationDto.builder()
                .order("siteName")
                .pageSize(10)
                .orderDirection(OrderDirection.asc)
                .build();

        // WHEN
        var siteResponseResult = historiqueLimitationService.findHistorique(historiqueLimitationCriteria, bookmark, paginationDto);

        // THEN
        verify(historiqueLimitationRepository, Mockito.times(1)).findHistoriqueByQuery(queryCaptor.capture(), pageSizeCaptor.capture(), bookmarkCaptor.capture());

        assertThat(pageSizeCaptor.getValue()).isEqualTo(String.valueOf(paginationDto.getPageSize()));
        assertThat(bookmarkCaptor.getValue()).isEqualTo(bookmark);
        String queryValue = queryCaptor.getValue();
        assertThat(queryValue).contains("docType", "originAutomationRegisteredResourceMrid", "producerMarketParticipantMrid", "siteName",
                "startCreatedDateTime", "endCreatedDateTime", "activationDocumentMrid");
    }

}