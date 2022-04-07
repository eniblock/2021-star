import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MeasurementUnitName } from 'src/app/models/enum/MeasurementUnitName.enum';
import { OrdreRechercheHistoriqueLimitation } from 'src/app/models/enum/OrdreRechercheHistoriqueLimitation.enum';
import { TechnologyType } from 'src/app/models/enum/TechnologyType.enum';
import { TypeSite } from 'src/app/models/enum/TypeSite.enum';
import {
  FormulairePagination,
  PaginationReponse,
} from 'src/app/models/Pagination';
import {
  FormulaireRechercheHistoriqueLimitation,
  RechercheHistoriqueLimitationEntite,
  RechercheHistoriqueLimitationRequete,
} from 'src/app/models/RechercheHistoriqueLimitation';
import { environment } from 'src/environments/environment';
import { UrlService } from '../common/url.service';

const MOCK = false;

@Injectable({
  providedIn: 'root',
})
export class HistoriqueLimitationService {
  private readonly CACHE_KEY = 'formulaireRechercheHistoriqueLimitation';

  constructor(private httpClient: HttpClient, private urlService: UrlService) {}

  rechercher(
    form: FormulaireRechercheHistoriqueLimitation,
    pagination: FormulairePagination<OrdreRechercheHistoriqueLimitation>
  ): Observable<PaginationReponse<RechercheHistoriqueLimitationEntite>> {
    if (MOCK) {
      console.log(form);
      console.log(pagination);
      return getMocks(form, pagination);
    }

    const formToSend: RechercheHistoriqueLimitationRequete = {
      ...form,
      ...pagination,
    };
    let urlParams = this.urlService.toUrlParams(formToSend);
    return this.httpClient.get<
      PaginationReponse<RechercheHistoriqueLimitationEntite>
    >(`${environment.serverUrl}/historiqueLimitations?${urlParams}`);
  }

  pushFormulaireRecherche(form: FormulaireRechercheHistoriqueLimitation) {
    sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(form));
  }

  popFormulaireRecherche(): FormulaireRechercheHistoriqueLimitation {
    let form = sessionStorage.getItem(this.CACHE_KEY);
    sessionStorage.removeItem(this.CACHE_KEY);
    return form == null ? null : JSON.parse(form);
  }
}

/* *********************************************************
                               MOCKS
   ********************************************************* */

const getMocks = (
  form: FormulaireRechercheHistoriqueLimitation,
  pagination: FormulairePagination<OrdreRechercheHistoriqueLimitation>
): Observable<PaginationReponse<RechercheHistoriqueLimitationEntite>> => {
  return of({
    totalElements: 6,
    bookmark: 'B_' + Math.random(),
    content:
      pagination.bookmark == null
        ? [
            {
              meteringPointMrid: 'mpmrid1',
              technologyType: TechnologyType.EOLIEN,
              producerMarketParticipantName: 'Prod2',
              producerMarketParticipantMrid: '17Y100A102R0629X',
              siteName: 'sites 5 /dpt',
              typeSite: TypeSite.HTA,
              rte: {
                originAutomationRegisteredResourceMrid: 'CONFOLENS',
                startCreatedDateTime: '2020-01-01T00:00:00Z',
                endCreatedDateTime: '2020-01-02T23:59:59Z',
                quantity: 9,
                motif: {
                  messageType: 'A98',
                  businessType: 'C55',
                  reasonCode: 'Z71',
                },
                orderValue: 13,
                measurementUnitName: MeasurementUnitName.MW,
              },
              enedis: {
                originAutomationRegisteredResourceMrid: 'CONFOLENS',
                startCreatedDateTime: '2020-01-01T00:00:00Z',
                endCreatedDateTime: '2020-01-02T23:59:59Z',
                quantity: 9,
                motif: {
                  messageType: '',
                  businessType: '',
                  reasonCode: '',
                },
                orderValue: 13,
                measurementUnitName: MeasurementUnitName.MW,
              },
            },
            {
              meteringPointMrid: 'mpmrid2',
              technologyType: TechnologyType.EOLIEN,
              producerMarketParticipantName: 'Prodtest',
              producerMarketParticipantMrid: '17Y100A101R0629X',
              siteName: 'sites 7',
              typeSite: TypeSite.HTA,
              rte: {
                originAutomationRegisteredResourceMrid: 'MANSLE',
                startCreatedDateTime: '2020-01-01T00:00:00Z',
                endCreatedDateTime: '2020-01-02T23:59:59Z',
                quantity: 23,
                motif: {
                  messageType: 'A54',
                  businessType: 'C55',
                  reasonCode: 'A70',
                },
                orderValue: 13,
                measurementUnitName: MeasurementUnitName.MW,
              },
              enedis: {
                originAutomationRegisteredResourceMrid: 'MANSLE',
                startCreatedDateTime: '2020-01-01T00:00:00Z',
                endCreatedDateTime: '2020-01-02T23:59:59Z',
                quantity: 23,
                motif: {
                  messageType: '',
                  businessType: '',
                  reasonCode: '',
                },
                orderValue: 13,
                measurementUnitName: MeasurementUnitName.MW,
              },
            },
            {
              meteringPointMrid: 'mpmrid3',
              technologyType: TechnologyType.EOLIEN,
              producerMarketParticipantName: 'Prod3',
              producerMarketParticipantMrid: '17Y100A103R0629X',
              siteName: 'sites 13',
              typeSite: TypeSite.HTA,
              rte: {
                originAutomationRegisteredResourceMrid: 'MANSLE',
                startCreatedDateTime: '2020-01-01T00:00:00Z',
                endCreatedDateTime: '2020-01-02T23:59:59Z',
                quantity: 17,
                motif: {
                  messageType: 'A54',
                  businessType: 'C55',
                  reasonCode: 'A70',
                },
                orderValue: 13,
                measurementUnitName: MeasurementUnitName.MW,
              },
              enedis: {
                originAutomationRegisteredResourceMrid: 'MANSLE',
                startCreatedDateTime: '2020-01-01T00:00:00Z',
                endCreatedDateTime: '2020-01-02T23:59:59Z',
                quantity: 17,
                motif: {
                  messageType: 'D01',
                  businessType: 'Z01',
                  reasonCode: 'A70',
                },
                orderValue: 13,
                measurementUnitName: MeasurementUnitName.MW,
              },
            },
            {
              meteringPointMrid: 'mpmrid4',
              technologyType: TechnologyType.EOLIEN,
              producerMarketParticipantName: 'Prod2',
              producerMarketParticipantMrid: '17Y100A102R0629X',
              siteName: 'sites 23',
              typeSite: TypeSite.HTA,
              rte: {
                originAutomationRegisteredResourceMrid: 'LONGCHAMPS',
                startCreatedDateTime: '2020-01-01T00:00:00Z',
                endCreatedDateTime: '2020-01-02T23:59:59Z',
                quantity: 23,
                motif: {
                  messageType: 'A98',
                  businessType: 'C55',
                  reasonCode: 'A70',
                },
                orderValue: 13,
                measurementUnitName: MeasurementUnitName.MW,
              },
              enedis: {
                originAutomationRegisteredResourceMrid: 'LONGCHAMPS',
                startCreatedDateTime: '2020-01-01T00:00:00Z',
                endCreatedDateTime: '2020-01-02T23:59:59Z',
                quantity: 23,
                motif: {
                  messageType: 'D01',
                  businessType: 'Z01',
                  reasonCode: 'A70',
                },
                orderValue: 13,
                measurementUnitName: MeasurementUnitName.MW,
              },
            },
          ]
        : [],
  });
};
