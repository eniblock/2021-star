import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {MeasurementUnitName} from 'src/app/models/enum/MeasurementUnitName.enum';
import {OrdreRechercheHistoriqueLimitation} from 'src/app/models/enum/OrdreRechercheHistoriqueLimitation.enum';
import {TechnologyType} from 'src/app/models/enum/TechnologyType.enum';
import {TypeSite} from 'src/app/models/enum/TypeSite.enum';
import {
  FormulaireRechercheHistoriqueLimitation,
  RechercheHistoriqueLimitationEntite,
  RechercheHistoriqueLimitationRequete,
} from 'src/app/models/RechercheHistoriqueLimitation';
import {environment} from 'src/environments/environment';
import {UrlService} from '../common/url.service';
import {RequestForm} from "../../models/RequestForm";
import {Motif, motifIsEqualTo} from "../../models/Motifs";
import {TypeLimitation} from "../../models/enum/TypeLimitation.enum";

const MOCK = true;

@Injectable({
  providedIn: 'root',
})
export class HistoriqueLimitationService {
  private readonly CACHE_KEY = 'formulaireRechercheHistoriqueLimitation';

  constructor(private httpClient: HttpClient, private urlService: UrlService) {
  }

  rechercher(
    form: FormulaireRechercheHistoriqueLimitation,
    requestForm: RequestForm<OrdreRechercheHistoriqueLimitation>
  ): Observable<RechercheHistoriqueLimitationEntite[]> {
    if (MOCK) {
      console.log(form);
      console.log(requestForm);
      return getMocks(form, requestForm);
    }

    const formToSend: RechercheHistoriqueLimitationRequete = {
      ...form,
      ...requestForm,
    };
    let urlParams = this.urlService.toUrlParams(formToSend);
    return this.httpClient.get<RechercheHistoriqueLimitationEntite[]>(`${environment.serverUrl}/historiqueLimitations?${urlParams}`);
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

/**
 * Transforme un historique de limitation en en historique où chaque ordre ayant plusieurs suborders
 * sont splités en des ordres ayant 1 suborder
 */
export const flatHistoriqueLimitation = (histo: RechercheHistoriqueLimitationEntite[]): RechercheHistoriqueLimitationEntite[] => {
  const h = histo
    .map(r => r.subOrderList.length == 0
      ? r
      : r.subOrderList.map(subOrder => ({...r, subOrderList: [subOrder]}))
    );
  return (h as any).flat();
};

/* *********************************************************
                               MOCKS
   ********************************************************* */

const getMocks = (
  form: FormulaireRechercheHistoriqueLimitation,
  requestForm: RequestForm<OrdreRechercheHistoriqueLimitation>
): Observable<RechercheHistoriqueLimitationEntite[]> => {
  return of([
    {
      site: {
        typeSite: TypeSite.HTA,
        producerMarketParticipantMrid: '---',
        producerMarketParticipantName: '---',
        siteName: 'sites 5 /dpt',
        technologyType: TechnologyType.EOLIEN,
        meteringPointMrid: 'mpmrid1',
        siteAdminMRID: '',
        siteLocation: '',
        siteType: '',
        substationName: '',
        substationMrid: '',
        systemOperatorEntityFlexibilityDomainMrid: '',
        systemOperatorEntityFlexibilityDomainName: '',
        systemOperatorCustomerServiceName: '',
        systemOperatorMarketParticipantName: '',
        siteIecCode: '',
      },
      producer: {
        producerMarketParticipantMrid: '17Y100A102R0629X',
        producerMarketParticipantName: 'Prod2',
        producerMarketParticipantRoleType: '',
      },
      energyAmount: {
        quantity: '9'
      },
      ordreLimitation: {
        originAutomationRegisteredResourceMrid: 'CONFOLENS',
        startCreatedDateTime: '2020-01-01T00:00:00Z',
        endCreatedDateTime: '2020-01-02T23:59:59Z',
        messageType: 'A98',
        businessType: 'C55',
        reasonCode: 'Z71',
        orderValue: '13',
        measurementUnitName: MeasurementUnitName.MW,
        senderMarketParticipantMrid: '10XFR-RTE------Q', // 10XFR-RTE------Q    17X100A100A0001A
      },
      subOrderList: []
    },

    {
      site: {
        typeSite: TypeSite.HTA,
        producerMarketParticipantMrid: '---',
        producerMarketParticipantName: '---',
        siteName: 'sites 7',
        technologyType: TechnologyType.PHOTOVOLTAIQUE,
        meteringPointMrid: 'mpmrid2',
        siteAdminMRID: '',
        siteLocation: '',
        siteType: '',
        substationName: '',
        substationMrid: '',
        systemOperatorEntityFlexibilityDomainMrid: '',
        systemOperatorEntityFlexibilityDomainName: '',
        systemOperatorCustomerServiceName: '',
        systemOperatorMarketParticipantName: '',
        siteIecCode: '',
      },
      producer: {
        producerMarketParticipantMrid: '17Y100A101R0629X',
        producerMarketParticipantName: 'Prodtest',
        producerMarketParticipantRoleType: '',
      },
      energyAmount: {
        quantity: '23'
      },
      ordreLimitation: {
        originAutomationRegisteredResourceMrid: 'MANSLE',
        startCreatedDateTime: '2020-01-01T00:00:00Z',
        endCreatedDateTime: '2020-01-02T23:59:59Z',
        messageType: 'D01',
        businessType: 'Z02',
        reasonCode: 'A70',
        orderValue: '13',
        measurementUnitName: MeasurementUnitName.MW,
        senderMarketParticipantMrid: '17X100A100A0001A', // 10XFR-RTE------Q    17X100A100A0001A
      },
      subOrderList: [
        {
          originAutomationRegisteredResourceMrid: 'MANSLE2',
          startCreatedDateTime: '2020-01-01T01:00:00Z',
          endCreatedDateTime: '2020-01-02T20:59:59Z',
          messageType: 'D01',
          businessType: 'Z01',
          reasonCode: 'A70',
          orderValue: '12',
          measurementUnitName: MeasurementUnitName.MW,
          senderMarketParticipantMrid: '10XFR-RTE------Q',
        }, {
          originAutomationRegisteredResourceMrid: 'MANSLE3',
          startCreatedDateTime: '2020-01-01T02:00:00Z',
          endCreatedDateTime: '2020-01-02T22:59:59Z',
          messageType: 'D01',
          businessType: 'Z01',
          reasonCode: 'A70',
          orderValue: '11',
          measurementUnitName: MeasurementUnitName.MW,
          senderMarketParticipantMrid: '10XFR-RTE------Q',
        }
      ]
    },


  ]);
};
