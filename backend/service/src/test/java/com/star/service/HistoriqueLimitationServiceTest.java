package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.historiquelimitation.HistoriqueLimitationCriteria;
import com.star.repository.HistoriqueLimitationRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import static com.star.enums.InstanceEnum.TSO;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

class HistoriqueLimitationServiceTest extends AbstractTest {

    @Captor
    // private ArgumentCaptor<String> queryCaptor;
    private ArgumentCaptor<HistoriqueLimitationCriteria> criteriaCaptor;

    @MockBean
    private HistoriqueLimitationRepository historiqueLimitationRepository;

    @Autowired
    private HistoriqueLimitationService historiqueLimitationService;

    @Test
    void findHistorique() throws TechnicalException {
        // GIVEN
        var historiqueLimitationCriteria = HistoriqueLimitationCriteria.builder()
                .originAutomationRegisteredResourceMrid("originAutomationRegisteredResourceMrid")
                .producerMarketParticipantMrid("producerMarketParticipantMrid")
                .siteName("site_test")
                .startCreatedDateTime("2022-08-12T00:00:00Z")
                .endCreatedDateTime("2022-08-12T00:00:00Z")
                .activationDocumentMrid("activationDocumentMrid")
                .instance(TSO)
                .build();

        // WHEN
        // var siteResponseResult =
        historiqueLimitationService.findHistorique(historiqueLimitationCriteria);

        // THEN
        verify(historiqueLimitationRepository, Mockito.times(1)).findHistoriqueByQuery(criteriaCaptor.capture());

        HistoriqueLimitationCriteria criteriaValue = criteriaCaptor.getValue();
        assertThat(criteriaValue).extracting("originAutomationRegisteredResourceMrid", "producerMarketParticipantMrid", "siteName", "startCreatedDateTime", "endCreatedDateTime", "activationDocumentMrid")
                .containsExactly("originAutomationRegisteredResourceMrid", "producerMarketParticipantMrid", "site_test", "2022-08-12T00:00:00Z", "2022-08-12T00:00:00Z", "activationDocumentMrid");
    }

    // @Test
    // void findHistorique() throws TechnicalException {
    //     // GIVEN
    //     var historiqueLimitationCriteria = HistoriqueLimitationCriteria.builder()
    //             .originAutomationRegisteredResourceMrid("originAutomationRegisteredResourceMrid")
    //             .producerMarketParticipantMrid("producerMarketParticipantMrid")
    //             .siteName("site_test")
    //             .startCreatedDateTime("2022-08-12T00:00:00Z")
    //             .endCreatedDateTime("2022-08-12T00:00:00Z")
    //             .activationDocumentMrid("activationDocumentMrid")
    //             .instance(TSO)
    //             .build();

    //     // WHEN
    //     var siteResponseResult = historiqueLimitationService.findHistorique(historiqueLimitationCriteria, "10", OrderDirection.asc);

    //     // THEN
    //     verify(historiqueLimitationRepository, Mockito.times(1)).findHistoriqueByQuery(queryCaptor.capture());

    //     String queryValue = queryCaptor.getValue();
    //     assertThat(queryValue).contains("docType", "originAutomationRegisteredResourceMrid", "producerMarketParticipantMrid", "siteName",
    //             "startCreatedDateTime", "endCreatedDateTime", "activationDocumentMrid");
    // }
}
