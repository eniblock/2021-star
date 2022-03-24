import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MeasurementUnitName } from 'src/app/models/enum/MeasurementUnitName.enum';
import { OrdreRechercheActivations } from 'src/app/models/enum/OrdreRechercheActivations.enum';
import { TechnologyType } from 'src/app/models/enum/TechnologyType.enum';
import { TypeSite } from 'src/app/models/enum/TypeSite.enum';
import {
  FormulairePagination,
  PaginationReponse,
} from 'src/app/models/Pagination';
import {
  FormulaireRechercheActivations,
  RechercheActivationsEntite,
  RechercheActivationsRequete,
} from 'src/app/models/RechercheActivations';
import { environment } from 'src/environments/environment';
import { UrlService } from '../common/url.service';

const MOCK = true;

@Injectable({
  providedIn: 'root',
})
export class ActivationsService {
  private readonly CACHE_KEY = 'formulaireRechercheActivations';

  constructor(private httpClient: HttpClient, private urlService: UrlService) {}

  rechercher(
    form: FormulaireRechercheActivations,
    pagination: FormulairePagination<OrdreRechercheActivations>
  ): Observable<PaginationReponse<RechercheActivationsEntite>> {
    if (MOCK) {
      console.log(form);
      console.log(pagination);
      return getMocks(form, pagination);
    }

    const formToSend: RechercheActivationsRequete = {
      ...form,
      ...pagination,
    };
    let urlParams = this.urlService.toUrlParams(formToSend);
    return this.httpClient.get<PaginationReponse<RechercheActivationsEntite>>(
      `${environment.serverUrl}/activations?${urlParams}`
    );
  }

  pushFormulaireRecherche(form: FormulaireRechercheActivations) {
    sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(form));
  }

  popFormulaireRecherche(): FormulaireRechercheActivations {
    let form = sessionStorage.getItem(this.CACHE_KEY);
    sessionStorage.removeItem(this.CACHE_KEY);
    return form == null ? null : JSON.parse(form);
  }
}

/* *********************************************************
                               MOCKS
   ********************************************************* */

const getMocks = (
  form: FormulaireRechercheActivations,
  pagination: FormulairePagination<OrdreRechercheActivations>
): Observable<PaginationReponse<RechercheActivationsEntite>> => {
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
                startCreatedDateTime: '2022-01-16T11:22:23.511Z',
                endCreatedDateTime: '2022-01-17T15:54:23.511Z',
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
                startCreatedDateTime: '2022-01-13T11:12:23.511Z',
                endCreatedDateTime: '2022-01-14T13:14:23',
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
                startCreatedDateTime: '2022-01-14T13:12:23.511Z',
                endCreatedDateTime: '2022-01-14T15:12:23.511Z',
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
                startCreatedDateTime: '2022-01-23T09:24:23.511Z',
                endCreatedDateTime: '2022-01-24T10:14:17.511Z',
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
                startCreatedDateTime: '2022-01-22T13:12:23.511Z',
                endCreatedDateTime: '2022-01-22T22:32:43.511Z',
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
                startCreatedDateTime: '2022-01-21T09:24:23.511Z',
                endCreatedDateTime: '2022-01-21T15:14:23.511Z',
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
                startCreatedDateTime: '2022-01-16T13:12:23.511Z',
                endCreatedDateTime: '2022-01-17T15:12:23.511Z',
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
