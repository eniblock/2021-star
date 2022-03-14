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
              originAutomationRegisteredResourceMrid: 'CONFOLENS',
              producerMarketParticipantName: 'Prod2',
              siteName: 'sites 5 /dpt',
              producerMarketParticipantMrid: '17Y100A102R0629X',
              startCreatedDateTimeEnedis: '20220110T13:12:23.511Z',
              endCreatedDateTimeEnedis: '20220110T14:19:23.511Z',
              startCreatedDateTimeRte: '20220116T11:22:23.511Z',
              endCreatedDateTimeRte: '20220117T15:54:23.511Z',
              quantity: 9,
              motifRte: {
                messageType: 'A98',
                businessType: 'C55',
                reasonCode: 'Z71',
              },
              motifEnedis: {
                messageType: '',
                businessType: '',
                reasonCode: '',
              },
              typeSite: TypeSite.HTA,
            },
            {
              technologyType: TechnologyType.EOLIEN,
              originAutomationRegisteredResourceMrid: 'MANSLE',
              producerMarketParticipantName: 'Prodtest',
              siteName: 'sites 7',
              producerMarketParticipantMrid: '17Y100A101R0629X',
              startCreatedDateTimeEnedis: '20220114T13:12:23.511Z',
              endCreatedDateTimeEnedis: '20220114T15:12:23.511Z',
              startCreatedDateTimeRte: '20220113T11:12:23.511Z',
              endCreatedDateTimeRte: '20220114T13:14:23.511Z',
              quantity: 23,
              motifRte: {
                messageType: 'A54',
                businessType: 'C55',
                reasonCode: 'A70',
              },
              motifEnedis: {
                messageType: '',
                businessType: '',
                reasonCode: '',
              },
              typeSite: TypeSite.HTA,
            },
            {
              technologyType: TechnologyType.EOLIEN,
              originAutomationRegisteredResourceMrid: 'MANSLE',
              producerMarketParticipantName: 'Prod3',
              siteName: 'sites 13',
              producerMarketParticipantMrid: '17Y100A103R0629X',
              startCreatedDateTimeEnedis: '20220122T13:12:23.511Z',
              endCreatedDateTimeEnedis: '20220122T22:32:43.511Z',
              startCreatedDateTimeRte: '20220123T09:24:23.511Z',
              endCreatedDateTimeRte: '20220124T10:14:17.511Z',
              quantity: 17,
              motifRte: {
                messageType: 'A54',
                businessType: 'C55',
                reasonCode: 'A70',
              },
              motifEnedis: {
                messageType: 'D01',
                businessType: 'Z01',
                reasonCode: 'A70',
              },
              typeSite: TypeSite.HTA,
            },
            {
              technologyType: TechnologyType.EOLIEN,
              originAutomationRegisteredResourceMrid: 'LONGCHAMPS',
              producerMarketParticipantName: 'Prod2',
              siteName: 'sites 23',
              producerMarketParticipantMrid: '17Y100A102R0629X',
              startCreatedDateTimeEnedis: '20220116T13:12:23.511Z',
              endCreatedDateTimeEnedis: '20220117T15:12:23.511Z',
              startCreatedDateTimeRte: '20220121T09:24:23.511Z',
              endCreatedDateTimeRte: '20220121T15:14:23.511Z',
              quantity: 23,
              motifRte: {
                messageType: 'A98',
                businessType: 'C55',
                reasonCode: 'A70',
              },
              motifEnedis: {
                messageType: 'D01',
                businessType: 'Z01',
                reasonCode: 'A70',
              },
              typeSite: TypeSite.HTA,
            },
          ]
        : [
            {
              technologyType: TechnologyType.PHOTOVOLTAIQUE,
              originAutomationRegisteredResourceMrid: 'Poste 6',
              producerMarketParticipantName: 'Boralex',
              siteName: 'Ferme éolienne de Genonville',
              producerMarketParticipantMrid: '17X000001307745X',
              startCreatedDateTimeEnedis: '20220114T13:12:23.511Z',
              endCreatedDateTimeEnedis: '20220114T15:12:23.511Z',
              startCreatedDateTimeRte: '20220113T11:12:23.511Z',
              endCreatedDateTimeRte: '20220114T13:14:23.511Z',
              quantity: 23,
              motifRte: {
                messageType: 'A98',
                businessType: 'C55',
                reasonCode: 'A70',
              },
              motifEnedis: {
                messageType: 'A98',
                businessType: 'C55',
                reasonCode: 'A70',
              },
              typeSite: TypeSite.HTB,
            },
          ],
  });
};
