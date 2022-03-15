import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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
              technologyType: TechnologyType.EOLIEN,
              producerMarketParticipantName: 'Prod2',
              producerMarketParticipantMrid: '17Y100A102R0629X',
              siteName: 'sites 5 /dpt',
              typeSite: TypeSite.HTA,
              rte: {
                originAutomationRegisteredResourceMrid: 'CONFOLENS',
                startCreatedDateTime: '20220116T11:22:23.511Z',
                endCreatedDateTime: '20220117T15:54:23.511Z',
                quantity: 9,
                motif: {
                  messageType: 'A98',
                  businessType: 'C55',
                  reasonCode: 'Z71',
                },
              },
              enedis: {
                originAutomationRegisteredResourceMrid: 'CONFOLENS',
                startCreatedDateTime: '20220110T13:12:23.511Z',
                endCreatedDateTime: '20220110T14:19:23.511Z',
                quantity: 9,
                motif: {
                  messageType: '',
                  businessType: '',
                  reasonCode: '',
                },
              },
            },
            {
              technologyType: TechnologyType.EOLIEN,
              producerMarketParticipantName: 'Prodtest',
              producerMarketParticipantMrid: '17Y100A101R0629X',
              siteName: 'sites 7',
              typeSite: TypeSite.HTA,
              rte: {
                originAutomationRegisteredResourceMrid: 'MANSLE',
                startCreatedDateTime: '20220113T11:12:23.511Z',
                endCreatedDateTime: '20220114T13:14:23',
                quantity: 23,
                motif: {
                  messageType: 'A54',
                  businessType: 'C55',
                  reasonCode: 'A70',
                },
              },
              enedis: {
                originAutomationRegisteredResourceMrid: 'MANSLE',
                startCreatedDateTime: '20220114T13:12:23.511Z',
                endCreatedDateTime: '20220114T15:12:23.511Z',
                quantity: 23,
                motif: {
                  messageType: '',
                  businessType: '',
                  reasonCode: '',
                },
              },
            },
            {
              technologyType: TechnologyType.EOLIEN,
              producerMarketParticipantName: 'Prod3',
              producerMarketParticipantMrid: '17Y100A103R0629X',
              siteName: 'sites 13',
              typeSite: TypeSite.HTA,
              rte: {
                originAutomationRegisteredResourceMrid: 'MANSLE',
                startCreatedDateTime: '20220123T09:24:23.511Z',
                endCreatedDateTime: '20220124T10:14:17.511Z',
                quantity: 17,
                motif: {
                  messageType: 'A54',
                  businessType: 'C55',
                  reasonCode: 'A70',
                },
              },
              enedis: {
                originAutomationRegisteredResourceMrid: 'MANSLE',
                startCreatedDateTime: '20220122T13:12:23.511Z',
                endCreatedDateTime: '20220122T22:32:43.511Z',
                quantity: 17,
                motif: {
                  messageType: 'D01',
                  businessType: 'Z01',
                  reasonCode: 'A70',
                },
              },
            },
            {
              technologyType: TechnologyType.EOLIEN,
              producerMarketParticipantName: 'Prod2',
              producerMarketParticipantMrid: '17Y100A102R0629X',
              siteName: 'sites 23',
              typeSite: TypeSite.HTA,
              rte: {
                originAutomationRegisteredResourceMrid: 'LONGCHAMPS',
                startCreatedDateTime: '20220121T09:24:23.511Z',
                endCreatedDateTime: '20220121T15:14:23.511Z',
                quantity: 23,
                motif: {
                  messageType: 'A98',
                  businessType: 'C55',
                  reasonCode: 'A70',
                },
              },
              enedis: {
                originAutomationRegisteredResourceMrid: 'LONGCHAMPS',
                startCreatedDateTime: '20220116T13:12:23.511Z',
                endCreatedDateTime: '20220117T15:12:23.511Z',
                quantity: 23,
                motif: {
                  messageType: 'D01',
                  businessType: 'Z01',
                  reasonCode: 'A70',
                },
              },
            },
          ]
        : [],
  });
};
