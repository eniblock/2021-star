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
              originAutomationRegisteredResourceMrid: 'Poste 1',
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
              typeSite: TypeSite.HTA,
            },
            {
              technologyType: TechnologyType.EOLIEN,
              originAutomationRegisteredResourceMrid: 'Poste 2',
              producerMarketParticipantName: 'Boralex',
              siteName: 'Ferme éolienne de Genonville',
              producerMarketParticipantMrid: '17X000001307745X',
              startCreatedDateTimeEnedis: '20220114T13:12:23.511Z',
              endCreatedDateTimeEnedis: '20220114T15:12:23.511Z',
              startCreatedDateTimeRte: '20220113T11:12:23.511Z',
              endCreatedDateTimeRte: '20220114T13:14:23.511Z',
              quantity: 23,
              motifRte: undefined,
              motifEnedis: {
                messageType: 'D01',
                businessType: 'Z03',
                reasonCode: 'Y98',
              },
              typeSite: TypeSite.HTA,
            },
            {
              technologyType: TechnologyType.EOLIEN,
              originAutomationRegisteredResourceMrid: 'Poste 3',
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
              motifEnedis: undefined,
              typeSite: TypeSite.HTA,
            },
            {
              technologyType: TechnologyType.EOLIEN,
              originAutomationRegisteredResourceMrid: 'Poste 4',
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
              typeSite: TypeSite.HTA,
            },
            {
              technologyType: TechnologyType.EOLIEN,
              originAutomationRegisteredResourceMrid: 'Poste 5',
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
