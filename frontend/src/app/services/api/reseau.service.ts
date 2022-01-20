import { PaginationReponse } from './../../models/Pagination';
import { UrlService } from './../common/url.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  FormulaireRechercheReseau,
  RechercheReseauRequete,
  RechercheReseauEntite,
} from 'src/app/models/RechercheReseau';
import { environment } from 'src/environments/environment';
import { FormulairePagination } from 'src/app/models/Pagination';
import { OrdreRechercheReseau } from 'src/app/models/enum/OrdreRechercheReseau.enum';
import { TechnologyType } from 'src/app/models/enum/TechnologyType.enum';

@Injectable({
  providedIn: 'root',
})
export class ReseauService {
  private readonly CACHE_KEY = 'formulaireRechercheReseau';

  constructor(private httpClient: HttpClient, private urlService: UrlService) {}

  rechercher(
    form: FormulaireRechercheReseau,
    pagination: FormulairePagination<OrdreRechercheReseau>
  ): Observable<PaginationReponse<RechercheReseauEntite>> {
    const formToSend: RechercheReseauRequete = {
      ...form.valeursRecherchees,
      ...pagination,
    };
    if (form.typeDeRechercheSimple) {
      // Recherche simple => on place la valeur de recherche dans le bon champs
      formToSend[form.typeDeRechercheSimple] = form.champDeRechercheSimple;
    }
    let urlParams = this.urlService.toUrlParams(formToSend);

    return of({
      totalElements: 123,
      bookmark: 'Le Bookmark',
      content: [
        {
          producerMarketParticipantName: 'pro1',
          technologyType: TechnologyType.EOLIEN,
          meteringPointMrid: 'met1',
          siteAdminMRID: 'MRID1',
          siteLocation: 'loc1',
          siteType: 'type1',
          substationName: 'name1',
          substationMrid: 'subMrid1',
          systemOperatorEntityFlexibilityDomainMrid: 'soDomMrid1',
          systemOperatorEntityFlexibilityDomainName: 'soDomName1',
          systemOperatorCustomerServiceName: 'soCustName1',
          systemOperatorMarketParticipantName: 'soPartNam1',
        },
        {
          producerMarketParticipantName: 'pro2',
          technologyType: TechnologyType.EOLIEN,
          meteringPointMrid: 'met2',
          siteAdminMRID: 'MRID2',
          siteLocation: 'loc2',
          siteType: 'type2',
          substationName: 'name2',
          substationMrid: 'subMrid2',
          systemOperatorEntityFlexibilityDomainMrid: 'soDomMrid2',
          systemOperatorEntityFlexibilityDomainName: 'soDomName2',
          systemOperatorCustomerServiceName: 'soCustName2',
          systemOperatorMarketParticipantName: 'soPartNam2',
        },
        {
          producerMarketParticipantName: 'pro3',
          technologyType: TechnologyType.EOLIEN,
          meteringPointMrid: 'met3',
          siteAdminMRID: 'MRID3',
          siteLocation: 'loc3',
          siteType: 'type3',
          substationName: 'name3',
          substationMrid: 'subMrid3',
          systemOperatorEntityFlexibilityDomainMrid: 'soDomMrid3',
          systemOperatorEntityFlexibilityDomainName: 'soDomName3',
          systemOperatorCustomerServiceName: 'soCustName3',
          systemOperatorMarketParticipantName: 'soPartNam3',
        },
        {
          producerMarketParticipantName: 'pro4',
          technologyType: TechnologyType.PHOTOVOLTAIQUE,
          meteringPointMrid: 'met4',
          siteAdminMRID: 'MRID4',
          siteLocation: 'loc4',
          siteType: 'type4',
          substationName: 'name4',
          substationMrid: 'subMrid4',
          systemOperatorEntityFlexibilityDomainMrid: 'soDomMrid4',
          systemOperatorEntityFlexibilityDomainName: 'soDomName4',
          systemOperatorCustomerServiceName: 'soCustName4',
          systemOperatorMarketParticipantName: 'soPartNam4',
        },
        {
          producerMarketParticipantName: 'pro5',
          technologyType: TechnologyType.PHOTOVOLTAIQUE,
          meteringPointMrid: 'met5',
          siteAdminMRID: 'MRID5',
          siteLocation: 'loc5',
          siteType: 'type5',
          substationName: 'name5',
          substationMrid: 'subMrid5',
          systemOperatorEntityFlexibilityDomainMrid: 'soDomMrid5',
          systemOperatorEntityFlexibilityDomainName: 'soDomName5',
          systemOperatorCustomerServiceName: 'soCustName5',
          systemOperatorMarketParticipantName: 'soPartNam5',
        },
      ],
    });

    // TODO : Supprimer le mock
    return this.httpClient.get<PaginationReponse<RechercheReseauEntite>>(
      `${environment.serverUrl}/reseau?${urlParams}`
    );
  }

  pushFormulaireRecherche(form: FormulaireRechercheReseau) {
    sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(form));
  }

  popFormulaireRecherche(): FormulaireRechercheReseau {
    let form = sessionStorage.getItem(this.CACHE_KEY);
    sessionStorage.removeItem(this.CACHE_KEY);
    return form == null ? null : JSON.parse(form);
  }
}
