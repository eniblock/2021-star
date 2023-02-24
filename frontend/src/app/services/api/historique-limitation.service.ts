import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {TypeSite} from 'src/app/models/enum/TypeSite.enum';
import {
  FormulaireRechercheHistoriqueLimitation,
  RechercheHistoriqueLimitationEntite,
  RechercheHistoriqueLimitationEntiteWithAnnotation,
} from 'src/app/models/RechercheHistoriqueLimitation';
import {environment} from 'src/environments/environment';
import {UrlService} from '../common/url.service';
import {map} from "rxjs/operators";
import {EligibilityStatus} from "../../models/enum/EligibilityStatus.enum";
import {TechnologyType} from "../../models/enum/TechnologyType.enum";
import {MeasurementUnitName} from "../../models/enum/MeasurementUnitName.enum";
import {ReserveBidStatus} from "../../models/enum/ReserveBidStatus.enum";
import {IndeminityStatus} from "../../models/enum/IndeminityStatus.enum";
import {MarketType} from "../../models/enum/MarketTypePipe.enum";
import {FileSaverService} from "ngx-filesaver";
import {IndeminityStatusPipe} from "../../pipes/IndeminityStatus.pipe";
import {DateHelper} from "../../helpers/date.helper";
import {DatePipe} from "@angular/common";
import {ReconciliationStatus} from "../../models/enum/ReconciliationStatus.enum";

const MOCK = false;

@Injectable({
  providedIn: 'root',
})
export class HistoriqueLimitationService {
  private readonly CACHE_KEY = 'formulaireRechercheHistoriqueLimitation';

  constructor(
    private httpClient: HttpClient,
    private urlService: UrlService,
    private fileSaverService: FileSaverService,
    private indeminityStatusPipe: IndeminityStatusPipe,
    private datePipe: DatePipe,
  ) {
  }

  rechercher(form: FormulaireRechercheHistoriqueLimitation): Observable<RechercheHistoriqueLimitationEntite[]> {
    let callResult: Observable<RechercheHistoriqueLimitationEntite[]>;
    if (MOCK) {
      console.log(form);
      callResult = getMocks(form);
    } else {
      let urlParams = this.urlService.toUrlParams(form);
      callResult = this.httpClient.get<RechercheHistoriqueLimitationEntite[]>(`${environment.serverUrl}/historiqueLimitations?${urlParams}`)
    }

    return callResult
      .pipe(
        map(result => result.map(histo => ({
            ...histo,
            activationDocument: {
              ...histo.activationDocument,
              eligibilityStatus: histo.activationDocument.eligibilityStatus ? histo.activationDocument.eligibilityStatus.toUpperCase() as EligibilityStatus : null // EligibilityStatus => to upperCase
            },
            subOrderList: histo.subOrderList.filter(e => e != null) // We remove null elements
          })
        ))
      );
  }

  pushFormulaireRecherche(form: FormulaireRechercheHistoriqueLimitation) {
    sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(form));
  }

  popFormulaireRecherche(): FormulaireRechercheHistoriqueLimitation {
    let form = sessionStorage.getItem(this.CACHE_KEY);
    sessionStorage.removeItem(this.CACHE_KEY);
    return form == null ? null : JSON.parse(form);
  }

  exportCSV(researchResultsWithOnlyOneSuborderFiltered: RechercheHistoriqueLimitationEntiteWithAnnotation[]) {
    let fileContain = "Filière;Poste Source;Nom Producteur;Nom Site;Code Site;Code Producteur;Début limitation RTE;Début limitation Enedis;Fin limitation RTE;Fin limitation Enedis;Eligible indemnisation;Type de limitation;ENE/I (MWh);Tarif unitaire;Montant indemnisation;Motif;Commentaires (sujets);Commentaires (question);Commentaires (réponse);Statut de l'indemnisation";
    for (const element of researchResultsWithOnlyOneSuborderFiltered) {
      // Dates
      const ordreLimitation = element.activationDocument;
      const ordreLimitationLinked = element.subOrderList[0];
      let dateDebutRte, dateDebutEnedis, dateFinRte, dateFinEnedis;
      if (ordreLimitationLinked == undefined) {
        dateDebutRte = this.toCsvDatetime(ordreLimitation.startCreatedDateTime);
        dateFinRte = this.toCsvDatetime(ordreLimitation.endCreatedDateTime);
      } else {
        const ordreLimitationStartTimestamp = DateHelper.stringToTimestamp(ordreLimitation.startCreatedDateTime);
        const ordreLimitationEndTimestamp = DateHelper.stringToTimestamp(ordreLimitation.endCreatedDateTime);
        const ordreLimitationLieStartTimestamp = DateHelper.stringToTimestamp(ordreLimitationLinked.startCreatedDateTime);
        const ordreLimitationLieEndTimestamp = DateHelper.stringToTimestamp(ordreLimitationLinked.endCreatedDateTime);
        if ((ordreLimitationStartTimestamp < ordreLimitationLieStartTimestamp)
          || (ordreLimitationStartTimestamp == ordreLimitationLieStartTimestamp && ordreLimitationEndTimestamp < ordreLimitationLieEndTimestamp)) {
          dateDebutRte = this.toCsvDatetime(ordreLimitation.startCreatedDateTime);
          dateFinRte = this.toCsvDatetime(ordreLimitation.endCreatedDateTime);
          dateDebutEnedis = this.toCsvDatetime(ordreLimitationLinked.startCreatedDateTime);
          dateFinEnedis = this.toCsvDatetime(ordreLimitationLinked.endCreatedDateTime);
        } else {
          dateDebutRte = this.toCsvDatetime(ordreLimitationLinked.startCreatedDateTime);
          dateFinRte = this.toCsvDatetime(ordreLimitationLinked.endCreatedDateTime);
          dateDebutEnedis = this.toCsvDatetime(ordreLimitation.startCreatedDateTime);
          dateFinEnedis = this.toCsvDatetime(ordreLimitation.endCreatedDateTime);
        }
      }

      // CSV
      fileContain += "\n";
      fileContain += this.csvPrint(element.site?.technologyType) + ";";
      fileContain += this.csvPrint(element.displayedSourceName) + ";";
      fileContain += this.csvPrint(element.producer?.producerMarketParticipantName) + ";";
      fileContain += this.csvPrint(element.site?.siteName) + ";";
      fileContain += this.csvPrint(element.site?.meteringPointMrid) + ";";
      fileContain += this.csvPrint(element.producer?.producerMarketParticipantMrid) + ";";
      fileContain += this.csvDatePrint(dateDebutRte) + ";";
      fileContain += this.csvDatePrint(dateDebutEnedis) + ";";
      fileContain += this.csvDatePrint(dateFinRte) + ";";
      fileContain += this.csvDatePrint(dateFinEnedis) + ";";
      fileContain += this.csvPrint(element.activationDocument?.eligibilityStatus) + ";";
      fileContain += this.csvPrint(element.limitationType) + ";";
      fileContain += this.csvPrint(element.energyAmount?.quantity) + ";";
      fileContain += (element.reserveBidMarketDocument != null ? element.reserveBidMarketDocument.energyPriceAmount + ' ' + element.reserveBidMarketDocument.priceMeasureUnitName : '') + ";";
      fileContain += (element.balancingDocument != null ? element.balancingDocument.financialPriceAmount + ' ' + element.balancingDocument.currencyUnitName : '') + ";";
      fileContain += this.csvPrint(element.motifName) + ";";
      fileContain += this.csvPrint(element.feedbackProducer?.feedbackElements) + ";";
      fileContain += this.csvPrint(element.feedbackProducer?.feedback) + ";";
      fileContain += this.csvPrint(element.feedbackProducer?.feedbackAnswer) + ";";
      fileContain += this.csvPrint(this.indeminityStatusPipe.transform(element?.feedbackProducer?.indeminityStatus)) + ";";
    }
    const blob = new Blob([fileContain], {type: "text/plain;charset=utf-8"});
    this.fileSaverService.save(blob, "export-Star.csv");
  }

  private csvPrint(str: any) {
    if (str == null || str == undefined) {
      return "";
    }
    const strModify = str
      .replaceAll("\"", "\'\'")
      .replaceAll("\n", " "); // Pas de retour à la ligne pour Alette : elle n'en veut pas à cause de son Excel.
    return `"${strModify}"`;
  }

  private toCsvDatetime(dateTime: string) {
    if (dateTime == null || dateTime == undefined) {
      return "";
    }
    return this.datePipe.transform(dateTime, 'shortDate') + " " + this.datePipe.transform(dateTime, 'mediumTime');
  }

  private csvDatePrint(dateTime: string | undefined) {
    if (dateTime == null || dateTime == undefined) {
      return "";
    }
    return dateTime;
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
const getMocks = (form: FormulaireRechercheHistoriqueLimitation): Observable<RechercheHistoriqueLimitationEntite[]> => {
  //return of ([{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"07f33521-cd8b-44b1-aae0-8652514905c4","originAutomationRegisteredResourceMrid":"CIVRA","registeredResourceMrid":"CIVRA-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-09-11T05:22:00Z","endCreatedDateTime":"2023-09-11T06:03:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["fe979fa4-a38e-4c02-ba5f-e53fd86b46cd","8bfda0d2-4832-47fa-8450-22f66f3d1e96"]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"09ff477e-c65a-4106-a715-acf9aa262bcf","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"","endCreatedDateTime":"","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":false,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"0b05a814-70bd-40aa-97ee-e25752ac9f2a","originAutomationRegisteredResourceMrid":"CONF6","registeredResourceMrid":"CONF6-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-06-16T22:29:00Z","endCreatedDateTime":"2023-06-17T01:42:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"0d8bb65f-e8ae-408d-88c3-a41dd276a656","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"","endCreatedDateTime":"","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":false,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"1143516e-cd62-4729-a955-f62919e2b19e","originAutomationRegisteredResourceMrid":"CIVRA","registeredResourceMrid":"CIVRA-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-08-06T14:43:00Z","endCreatedDateTime":"2023-08-06T16:19:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["a1aa9ec4-2f5e-4291-bbf1-b7fe3d79f50c","d3e28436-32fb-4b1f-a2d6-9f3479169cc5"]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"11e13903-9a9c-4bc6-85f0-47d68b30f8af","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"1999-07-30T08:00:45Z","endCreatedDateTime":"","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"1e5426b2-89b6-4405-bc67-ae3e4e7021ec","originAutomationRegisteredResourceMrid":"CIVRA","registeredResourceMrid":"CIVRA-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-09-27T10:56:00Z","endCreatedDateTime":"2023-09-27T15:43:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["ca35ed89-cb9a-4a64-aec3-644715c9cb09","5c2592f2-fd54-404c-8e0f-14301d603007"]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":{"energyAmountMarketDocumentMrid":"0bb4cf6c-8f35-4fb7-a16f-1536dddc0495","activationDocumentMrid":"2a860a85-dc33-48ca-8551-629dcc4c84e8","registeredResourceMrid":"","quantity":"250","measurementUnitName":"MW","revisionNumber":"1","businessType":"C55","docStatus":"A02","processType":"A42","classificationType":"ZXX","areaDomain":"10XFR-RTE------Q","senderMarketParticipantMrid":"10XFR-RTE------Q","senderMarketParticipantRole":"A50","receiverMarketParticipantMrid":"STAR","receiverMarketParticipantRole":"A32","createdDateTime":"2009-09-30T08:00:45Z","timeInterval":"2009-09-30T08:00:45Z/2009-09-30T09:03:45Z"},"activationDocument":{"activationDocumentMrid":"2a860a85-dc33-48ca-8551-629dcc4c84e8","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2009-09-30T08:00:45Z","endCreatedDateTime":"2009-09-30T09:03:45Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":{"energyAmountMarketDocumentMrid":"0a324f78-73f3-417f-88ca-9acc073803d4","activationDocumentMrid":"2cb4171e-7941-41c4-aa0c-6424a32812e5","registeredResourceMrid":"","quantity":"12","measurementUnitName":"MW","revisionNumber":"1","businessType":"C55","docStatus":"A02","processType":"A42","classificationType":"ZXX","areaDomain":"10XFR-RTE------Q","senderMarketParticipantMrid":"10XFR-RTE------Q","senderMarketParticipantRole":"A50","receiverMarketParticipantMrid":"STAR","receiverMarketParticipantRole":"A32","createdDateTime":"2008-08-30T08:00:45Z","timeInterval":"2008-08-30T08:00:45Z/2008-08-30T09:03:45Z"},"activationDocument":{"activationDocumentMrid":"2cb4171e-7941-41c4-aa0c-6424a32812e5","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2008-08-30T08:00:45Z","endCreatedDateTime":"2008-08-30T09:03:45Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"3a54dbcc-c21b-493c-b9d3-88b63f115181","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"","endCreatedDateTime":"","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":false,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"3de7e1a9-fdbd-4e0a-93e0-c46322a14087","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2008-09-30T08:00:45Z","endCreatedDateTime":"2008-09-30T09:03:45Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"404ea863-1cea-4726-a5f8-6ed49543b14f","originAutomationRegisteredResourceMrid":"LONGC","registeredResourceMrid":"LONGC-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-10-02T17:01:00Z","endCreatedDateTime":"2023-10-02T17:22:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"41288698-55c5-4ff3-a094-356ee34d711d","originAutomationRegisteredResourceMrid":"CIVRA","registeredResourceMrid":"CIVRA-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-09-02T06:31:00Z","endCreatedDateTime":"2023-09-02T06:38:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["e39ca672-3d1b-4f32-8a72-d86826c828c1","f87e8ff8-91ba-43b5-803c-5248e39a23ff"]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"439894f9-4081-42ac-818f-770ae93c7533","originAutomationRegisteredResourceMrid":"CIVRA","registeredResourceMrid":"CIVRA-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-08-05T16:26:00Z","endCreatedDateTime":"2023-08-05T17:15:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["e77996d3-417c-4791-9857-9947370acd24","518a716f-891a-40cc-8366-c9ff251f3f08"]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"4535b3a7-f1db-4f08-bea4-701fac7ff735","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"","endCreatedDateTime":"","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":false,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"4fe57066-c3f1-4a38-b201-008d04cee76b","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2008-11-30T08:00:45Z","endCreatedDateTime":"2008-11-30T22:03:45Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"514e34f2-710c-4707-abe2-794572db6d08","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2001-06-30T08:00:45Z","endCreatedDateTime":"2001-06-30T09:03:45Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"5fcb1f11-0ee9-44b7-aa55-b839351ef9aa","originAutomationRegisteredResourceMrid":"MANSL","registeredResourceMrid":"MANSL-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-10-02T17:01:00Z","endCreatedDateTime":"2023-10-03T07:18:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["895b6009-e168-40d9-bdc8-c20aedf0f89b","91f86083-4593-48ee-b115-04ca9047bd0e"]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"5fd4dafd-39fa-4b67-b398-5ef17123fe54","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"","endCreatedDateTime":"","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":false,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"60ad7694-6940-4549-8bb4-166cc4bf02c5","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"","endCreatedDateTime":"","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":false,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"6a88601c-dd4f-4287-a36d-37a33806f7e8","originAutomationRegisteredResourceMrid":"LONGC","registeredResourceMrid":"LONGC-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-06-16T22:29:00Z","endCreatedDateTime":"2023-06-17T01:42:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":{"energyAmountMarketDocumentMrid":"06c09a9d-2cd6-4e39-afb5-ba06baaa772b","activationDocumentMrid":"6b613e8d-45b2-4b1d-8725-619ce27473db","registeredResourceMrid":"","quantity":"40","measurementUnitName":"MW","revisionNumber":"1","businessType":"C55","docStatus":"A02","processType":"A42","classificationType":"ZXX","areaDomain":"10XFR-RTE------Q","senderMarketParticipantMrid":"10XFR-RTE------Q","senderMarketParticipantRole":"A50","receiverMarketParticipantMrid":"STAR","receiverMarketParticipantRole":"A32","createdDateTime":"2008-06-30T08:00:45Z","timeInterval":"2008-06-30T08:00:45Z/2008-06-30T09:03:45Z"},"activationDocument":{"activationDocumentMrid":"6b613e8d-45b2-4b1d-8725-619ce27473db","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2008-06-30T08:00:45Z","endCreatedDateTime":"2008-06-30T09:03:45Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"7313429d-c71f-4de8-8541-bb48c9676954","originAutomationRegisteredResourceMrid":"CONF6","registeredResourceMrid":"CONF6-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-06-20T06:07:00Z","endCreatedDateTime":"2023-06-20T06:20:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["596c3ba8-1de1-4673-928a-940a44a33277","069dac2a-4c99-40cc-a070-d1db0a425b03"]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"73f4f9f4-9b88-4f4d-9727-09d02491639a","originAutomationRegisteredResourceMrid":"CONF6","registeredResourceMrid":"CONF6-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-07-22T20:05:00Z","endCreatedDateTime":"2023-07-22T20:15:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["241eb797-3d98-43d4-812c-741f604cdd8a","533e7684-462d-4c3a-88c5-427d5c74310c"]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"7a8ed66c-b546-4ce5-8188-4f1fed860020","originAutomationRegisteredResourceMrid":"CIVRA","registeredResourceMrid":"CIVRA-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-08-07T11:37:00Z","endCreatedDateTime":"2023-08-07T16:49:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["b008e7e8-3436-4330-a103-850c9faaaa7f","a4c48e4a-b823-4a5a-921f-b7fa6506172a"]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"813cf7f0-bbc4-4f83-82e8-7b60f88c9cb4","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"","endCreatedDateTime":"","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":false,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"83253e33-4abc-4684-b320-2bb68bc82d16","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"","endCreatedDateTime":"","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":false,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"89c55c91-10b2-4bae-927c-0f6613d88570","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"","endCreatedDateTime":"","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":false,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"8aa260d4-131d-4ca2-8fb8-c57788124f1a","originAutomationRegisteredResourceMrid":"MANSL","registeredResourceMrid":"MANSL-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-06-20T06:07:00Z","endCreatedDateTime":"2023-06-20T06:20:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"8e7da5f7-d4f4-4192-8644-c41b0f7538a9","originAutomationRegisteredResourceMrid":"AIGRE","registeredResourceMrid":"AIGRE-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-08-07T11:37:00Z","endCreatedDateTime":"2023-08-07T12:29:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["d813e34b-3911-439e-bb2d-14f5918be7ed","08973629-25d1-4a0f-9ef7-9925d0354bd2"]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"8f8ed33c-6ee2-4286-9154-7f6606de8d8d","originAutomationRegisteredResourceMrid":"MANSL","registeredResourceMrid":"MANSL-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-08-07T11:37:00Z","endCreatedDateTime":"2023-08-07T15:39:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["f86456b8-471b-481c-bd20-fc7ae51a5ce7","f5ea4d7d-a935-4f86-9aea-a38c284cc0ce"]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"96a944d1-2a8a-4c9a-8c64-25c70c3cd0b2","originAutomationRegisteredResourceMrid":"LONGC","registeredResourceMrid":"LONGC-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-08-07T11:37:00Z","endCreatedDateTime":"2023-08-07T16:49:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"b18941a1-ca4c-45ea-9fd4-2a760c5f5138","originAutomationRegisteredResourceMrid":"CIVRA","registeredResourceMrid":"CIVRA-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-08-25T11:23:00Z","endCreatedDateTime":"2023-08-25T13:35:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["fad4abca-03a4-40b6-ac77-faf16040d4e6","cc168384-53e4-420b-9a4d-14529be647d4"]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"b2446239-064d-4449-b591-26becfa7ea04","originAutomationRegisteredResourceMrid":"LONGC","registeredResourceMrid":"LONGC-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-07-22T20:05:00Z","endCreatedDateTime":"2023-07-23T00:30:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"b508ec3c-ed70-4475-b5cf-142333894156","originAutomationRegisteredResourceMrid":"I.JOU","registeredResourceMrid":"I.JOU-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-06-16T22:29:00Z","endCreatedDateTime":"2023-06-17T01:42:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"b78ac0ed-69a5-41b7-97c6-53163ab6969b","originAutomationRegisteredResourceMrid":"CIVRA","registeredResourceMrid":"CIVRA-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-09-08T13:26:00Z","endCreatedDateTime":"2023-09-08T13:36:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["86063743-c5f6-4bf6-8300-2ee5d42390ae","fd1fb753-495c-4ec4-97f6-a282e7466c9e"]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"b8ec2dce-1b27-4333-bff9-003e1907c1c3","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2009-10-30T08:00:45Z","endCreatedDateTime":"2009-10-30T09:03:45Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"ba8be680-66ec-4880-8bd2-25a424e5bb3e","originAutomationRegisteredResourceMrid":"CIVRA","registeredResourceMrid":"CIVRA-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-10-02T17:01:00Z","endCreatedDateTime":"2023-10-03T07:18:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["42607fed-ecb9-4499-a6c0-5c444f85d13c","36717362-0829-43e7-be69-5c15b5135cf0"]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"c3f781cd-650f-4e9a-aeda-1a257efe6cf6","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2002-06-30T08:00:45Z","endCreatedDateTime":"2002-06-30T09:03:45Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"c7867a43-9d6f-44db-9e83-086e4863b098","originAutomationRegisteredResourceMrid":"AIGRE","registeredResourceMrid":"AIGRE-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-09-27T11:18:00Z","endCreatedDateTime":"2023-09-27T15:13:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"ed5f1421-ab68-480f-9ea8-fd8a7d156755","originAutomationRegisteredResourceMrid":"MANSL","registeredResourceMrid":"MANSL-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-09-27T10:56:00Z","endCreatedDateTime":"2023-09-27T15:13:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"f10e27a0-4dc8-4bae-a57c-c77141bf32ad","originAutomationRegisteredResourceMrid":"LONGC","registeredResourceMrid":"LONGC-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-06-20T06:07:00Z","endCreatedDateTime":"2023-06-20T06:20:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"f6caf062-2448-428d-aa86-d846437967c8","originAutomationRegisteredResourceMrid":"LONGC","registeredResourceMrid":"LONGC-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-09-27T10:56:00Z","endCreatedDateTime":"2023-09-27T15:30:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.PHOTOVOLTAIQUE,"siteType":"Injection","meteringPointMrid":"PDL00000000300005","siteName":"Parc Eolien RTE N5","siteAdminMrid":"610 200 005","siteLocation":"20005","siteIecCode":null,"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","substationMrid":"AIGRE","substationName":"AIGRE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA5","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17Y100A101R0003X","producerMarketParticipantName":"Prodrecettemd2","producerMarketParticipantRoleType":"A21 - Producer"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"f8447f21-2cbd-4ae9-beff-e4b354e21364","originAutomationRegisteredResourceMrid":"NAZA","registeredResourceMrid":"PDL00000000300005","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"","endCreatedDateTime":"","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A98","orderEnd":false,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":null,"producer":null,"energyAmount":null,"activationDocument":{"activationDocumentMrid":"fcd32f46-2a6a-4297-a464-3aab7aaa3094","originAutomationRegisteredResourceMrid":"CIVRA","registeredResourceMrid":"CIVRA-P41","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-08-15T15:00:00Z","endCreatedDateTime":"2023-08-15T16:49:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X100A100A0001A","instance":"tso","subOrderList":["d6c3098a-2781-4a32-ad80-0430e0d50c3e","e0e493b2-2b4a-42f6-aab9-cf9012fe7471"]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.EOLIEN,"siteType":"Injection","meteringPointMrid":"CART112861","siteName":"Parc Eolien de Montjean","siteAdminMrid":"50 329 864 800 042","siteLocation":"Lieu-dit Vall�e Rateau 16240 LA MAGDELEINE","siteIecCode":null,"producerMarketParticipantMrid":"17X000000031065W","producerMarketParticipantName":"PRODUCTEUR B","substationMrid":"MAGDE","substationName":"MAGDELEINE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA1","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17X000000031065W","producerMarketParticipantName":"PRODUCTEUR B","producerMarketParticipantRoleType":"A21"},"energyAmount":{"energyAmountMarketDocumentMrid":"41a0dede-dcea-47f8-b35e-52b58889c936","activationDocumentMrid":"56c3a9ba-2b82-4b6b-b61f-8689e463e68b","registeredResourceMrid":"CART112861","quantity":"15","measurementUnitName":"MW","revisionNumber":"1","businessType":"C55","docStatus":"","processType":"A42","classificationType":"ZXX","areaDomain":"17X100A100A0001A","senderMarketParticipantMrid":"10XFR-RTE------Q","senderMarketParticipantRole":"A49","receiverMarketParticipantMrid":"17X000000031065W","receiverMarketParticipantRole":"A21","createdDateTime":"2022-07-21T12:45:37Z","timeInterval":"2023-06-20T06:07:00Z/2023-06-21T13:50:00Z"},"activationDocument":{"activationDocumentMrid":"56c3a9ba-2b82-4b6b-b61f-8689e463e68b","originAutomationRegisteredResourceMrid":"NAZA_MELLE_LONGC","registeredResourceMrid":"CART112861","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-06-20T06:07:00Z","endCreatedDateTime":"2023-06-21T13:50:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X000000031065W","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.EOLIEN,"siteType":"Injection","meteringPointMrid":"CART112861","siteName":"Parc Eolien de Montjean","siteAdminMrid":"50 329 864 800 042","siteLocation":"Lieu-dit Vall�e Rateau 16240 LA MAGDELEINE","siteIecCode":null,"producerMarketParticipantMrid":"17X000000031065W","producerMarketParticipantName":"PRODUCTEUR B","substationMrid":"MAGDE","substationName":"MAGDELEINE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA1","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17X000000031065W","producerMarketParticipantName":"PRODUCTEUR B","producerMarketParticipantRoleType":"A21"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"7eab6eb1-f7d2-41bd-ab67-b84d258350bd","originAutomationRegisteredResourceMrid":"NAZA_MELLE_LONGC","registeredResourceMrid":"CART112861","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-07-22T20:05:00Z","endCreatedDateTime":"2023-07-23T00:00:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X000000031065W","instance":"tso","subOrderList":[]},"subOrderList":[]},{"site":{"typeSite":TypeSite.HTB,"systemOperatorMarketParticipantMrid":"10XFR-RTE------Q","technologyType":TechnologyType.EOLIEN,"siteType":"Injection","meteringPointMrid":"CART112861","siteName":"Parc Eolien de Montjean","siteAdminMrid":"50 329 864 800 042","siteLocation":"Lieu-dit Vall�e Rateau 16240 LA MAGDELEINE","siteIecCode":null,"producerMarketParticipantMrid":"17X000000031065W","producerMarketParticipantName":"PRODUCTEUR B","substationMrid":"MAGDE","substationName":"MAGDELEINE","systemOperatorEntityFlexibilityDomainMrid":"NAZA NANTES","systemOperatorEntityFlexibilityDomainName":"NAZA1","systemOperatorCustomerServiceName":"CE NANTES","systemOperatorMarketParticipantName":null},"producer":{"producerMarketParticipantMrid":"17X000000031065W","producerMarketParticipantName":"PRODUCTEUR B","producerMarketParticipantRoleType":"A21"},"energyAmount":null,"activationDocument":{"activationDocumentMrid":"8e714d7d-05c7-4540-a4ed-7a93f7302dfb","originAutomationRegisteredResourceMrid":"NAZA_MELLE_LONGC","registeredResourceMrid":"CART112861","orderValue":"0","measurementUnitName":"MW","startCreatedDateTime":"2023-06-16T22:29:00Z","endCreatedDateTime":"2023-06-16T23:26:00Z","revisionNumber":"","messageType":"A54","businessType":"C55","reasonCode":"A70","orderEnd":true,"senderMarketParticipantMrid":"10XFR-RTE------Q","receiverMarketParticipantMrid":"17X000000031065W","instance":"tso","subOrderList":[]},"subOrderList":[]}]);
  return of([
    {
      site: {
        typeSite: TypeSite.HTA,
        producerMarketParticipantMrid: '---',
        producerMarketParticipantName: '---',
        siteName: 'sites 5 /dpt"\ncoucou;,42',
        technologyType: TechnologyType.EOLIEN,
        meteringPointMrid: 'mpmrid1',
        siteAdminMrid: '',
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
      activationDocument: {
        activationDocumentMrid: "A1",
        originAutomationRegisteredResourceMrid: 'CONFOLENS',
        registeredResourceMrid: "B1",
        eligibilityStatus: EligibilityStatus.OUI, ////////////////////////////////////////////////// null,
        eligibilityStatusEditable: true,
        startCreatedDateTime: '2020-01-01T00:00:00Z',
        endCreatedDateTime: '2020-01-02T23:59:59Z',
        messageType: 'A98',
        businessType: 'C55',
        reasonCode: 'Z71',
        orderValue: '13',
        measurementUnitName: MeasurementUnitName.MW,
        senderMarketParticipantMrid: '10XFR-RTE------Q', // 10XFR-RTE------Q    17X100A100A0001A
        revisionNumber: "12",
        reconciliationStatus: ReconciliationStatus.NONE,
      },
      subOrderList: [],
      displayedSourceName: "displayedSourceName1",
      reserveBidMarketDocument: {
        reserveBidMrid: 'string',
        meteringPointMrid: 'string',
        revisionNumber: 'string',
        messageType: 'string',
        processType: 'string',
        senderMarketParticipantMrid: 'string',
        receiverMarketParticipantMrid: 'string',
        createdDateTime: 'string',
        validityPeriodStartDateTime: 'string',
        validityPeriodEndDateTime: 'string',
        businessType: 'string',
        quantityMeasureUnitName: 'string',
        priceMeasureUnitName: '€/MWh',
        currencyUnitName: 'string',
        flowDirection: 'string',
        energyPriceAmount: 1.23,
        attachments: [],
        reserveBidStatus: ReserveBidStatus.VALIDATED,
        marketType: MarketType.OA,
      },
      balancingDocument: {
        docType: "balancingDocument",
        balancingDocumentMrid: "BaDoc_26056d50-db4f-4e29-8075-d83fa47fb7a8",
        activationDocumentMrid: "26056d50-db4f-4e29-8075-d83fa47fb7a8",
        energyAmountMarketDocumentMrid: "3297c76e-d7b4-4b20-b98c-3e196f68dc99",
        reserveBidMrid: "67253abc-7cd6-4cd7-8cea-d258bc370e56",
        revisionNumber: "1",
        messageType: "B44",
        processsType: "Z42",
        senderMarketParticipantMrid: "10XFR-RTE------Q",
        receiverMarketParticipantMrid: "17Y100A101R0629X",
        createdDateTime: "2022-11-07T13:46:40.250040",
        period: "2019-09-07T15:50:15Z/2019-09-08T15:50:15Z",
        businessType: "B77",
        quantityMeasureUnitName: "MW",
        priceMeasureUnitName: "€/MWh",
        currencyUnitName: "€",
        meteringPointMrid: "PDL00000000289772",
        direction: "A02",
        quantity: 15,
        activationPriceAmount: 14,
        financialPriceAmount: 210
      },
      feedbackProducer: {
        feedbackProducerMrid: "f1",
        activationDocumentMrid: "string",
        messageType: "string",
        processType: "string",
        revisionNumber: "1",
        senderMarketParticipantMrid: "string",
        receiverMarketParticipantMrid: "string",
        createdDateTime: "string",
        validityPeriodStartDateTime: "2022-11-07T13:46:40",
        validityPeriodEndDateTime: "2024-11-08T13:46:40",
        feedback: "ezaeazaez\ndzijdaz\nooiio",
        feedbackAnswer: "",
        feedbackElements: "dqsdsd|poipoi|poi",
        indeminityStatus: IndeminityStatus.Agreement,//Agreement   WaitingInvoice
      }
    },

    {
      site: {
        typeSite: TypeSite.HTB,
        producerMarketParticipantMrid: '---',
        producerMarketParticipantName: '---',
        siteName: 'sites 7',
        technologyType: TechnologyType.PHOTOVOLTAIQUE,
        meteringPointMrid: 'mpmrid2',
        siteAdminMrid: '',
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
      energyAmount: null,
      activationDocument: {
        activationDocumentMrid: "A2",
        originAutomationRegisteredResourceMrid: 'MANSLE',
        registeredResourceMrid: "B2",
        eligibilityStatus: null as any,/////////////////////////////////////////////// EligibilityStatus.NON,
        eligibilityStatusEditable: true,
        startCreatedDateTime: '2020-01-01T01:00:00Z',
        endCreatedDateTime: '2020-01-02T23:59:58Z',
        messageType: 'D01',
        businessType: 'Z02',
        reasonCode: 'A70',
        orderValue: '13',
        measurementUnitName: MeasurementUnitName.MW,
        senderMarketParticipantMrid: '17X100A100A0001A', // 10XFR-RTE------Q    17X100A100A0001A
        revisionNumber: "12",
        reconciliationStatus: ReconciliationStatus.NONE,
      },
      subOrderList: [
        {
          activationDocumentMrid: "A3",
          originAutomationRegisteredResourceMrid: 'MANSLE2',
          registeredResourceMrid: "B3",
          eligibilityStatus: EligibilityStatus.OUI,
          eligibilityStatusEditable: false,
          startCreatedDateTime: '2020-01-01T01:00:00Z',
          endCreatedDateTime: '2020-01-02T23:59:59Z',
          messageType: 'D01',
          businessType: 'Z01',
          reasonCode: 'A70',
          orderValue: '12',
          measurementUnitName: MeasurementUnitName.MW,
          senderMarketParticipantMrid: '10XFR-RTE------Q',
          revisionNumber: "12",
          reconciliationStatus: ReconciliationStatus.NONE,
        }, {
          activationDocumentMrid: "A4",
          originAutomationRegisteredResourceMrid: 'MANSLE3',
          registeredResourceMrid: "B4",
          eligibilityStatus: EligibilityStatus.OUI,
          eligibilityStatusEditable: true,
          startCreatedDateTime: '2020-01-01T02:00:00Z',
          endCreatedDateTime: '2020-01-02T22:59:59Z',
          messageType: 'D01',
          businessType: 'Z01',
          reasonCode: 'A70',
          orderValue: '11',
          measurementUnitName: MeasurementUnitName.MW,
          senderMarketParticipantMrid: '10XFR-RTE------Q',
          revisionNumber: "12",
          reconciliationStatus: ReconciliationStatus.NONE,
        }
      ],
      displayedSourceName: "displayedSourceName2",
      reserveBidMarketDocument: {
        reserveBidMrid: 'string',
        meteringPointMrid: 'string',
        revisionNumber: 'string',
        messageType: 'string',
        processType: 'string',
        senderMarketParticipantMrid: 'string',
        receiverMarketParticipantMrid: 'string',
        createdDateTime: 'string',
        validityPeriodStartDateTime: 'string',
        validityPeriodEndDateTime: 'string',
        businessType: 'string',
        quantityMeasureUnitName: 'string',
        priceMeasureUnitName: '€/MWh',
        currencyUnitName: 'string',
        flowDirection: 'string',
        energyPriceAmount: 1.23,
        attachments: [],
        reserveBidStatus: ReserveBidStatus.VALIDATED,
        marketType: MarketType.CR,
      },
      balancingDocument: {
        docType: "balancingDocument",
        balancingDocumentMrid: "BaDoc_26056d50-db4f-4e29-8075-d83fa47fb7a8",
        activationDocumentMrid: "26056d50-db4f-4e29-8075-d83fa47fb7a8",
        energyAmountMarketDocumentMrid: "3297c76e-d7b4-4b20-b98c-3e196f68dc99",
        reserveBidMrid: "67253abc-7cd6-4cd7-8cea-d258bc370e56",
        revisionNumber: "1",
        messageType: "B44",
        processsType: "Z42",
        senderMarketParticipantMrid: "10XFR-RTE------Q",
        receiverMarketParticipantMrid: "17Y100A101R0629X",
        createdDateTime: "2022-11-07T13:46:40.250040",
        period: "2019-09-07T15:50:15Z/2019-09-08T15:50:15Z",
        businessType: "B77",
        quantityMeasureUnitName: "MW",
        priceMeasureUnitName: "€/MWh",
        currencyUnitName: "€",
        meteringPointMrid: "PDL00000000289772",
        direction: "A02",
        quantity: 15,
        activationPriceAmount: 14,
        financialPriceAmount: 210
      },
      feedbackProducer: {
        feedbackProducerMrid: "f1",
        activationDocumentMrid: "string",
        messageType: "string",
        processType: "string",
        revisionNumber: "1",
        senderMarketParticipantMrid: "string",
        receiverMarketParticipantMrid: "string",
        createdDateTime: "string",
        validityPeriodStartDateTime: "2022-11-07T13:46:40",
        validityPeriodEndDateTime: "2024-11-07T13:46:40",
        feedback: "",
        feedbackAnswer: "",
        feedbackElements: "",
        indeminityStatus: IndeminityStatus.Agreement,
      },
    },
  ]);
};

