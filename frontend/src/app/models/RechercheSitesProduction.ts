import {OrdreRechercheSitesProduction} from './enum/OrdreRechercheSitesProduction.enum';
import {TechnologyType} from './enum/TechnologyType.enum';
import {TypeDeRechercheSimple} from './enum/TypeDeRechercheSimple.enum';
import {TypeSite} from './enum/TypeSite.enum';
import {RequestForm} from "./RequestForm";

export interface FormulaireRechercheSitesProduction {
  typeDeRechercheSimple?: TypeDeRechercheSimple,
  champDeRechercheSimple?: string,
  valeursRecherchees: RechercheSitesProductionRequete,
}

export interface RechercheSitesProductionRequete
  extends RequestForm<OrdreRechercheSitesProduction> {
  siteName?: string,
  substationName?: string,
  substationMrid?: string,
  producerMarketParticipantName?: string,
  producerMarketParticipantMrid?: string,
  siteIecCode?: string,
  meteringPointMrId?: string,
}

export interface RechercheSitesProductionEntite {
  typeSite: TypeSite,
  producerMarketParticipantMrid: string,
  producerMarketParticipantName: string,
  siteName: string,
  technologyType: TechnologyType,
  meteringPointMrid: string,
  siteAdminMrid: string,
  siteLocation: string,
  siteType: string,
  substationName: string,
  substationMrid: string,
  systemOperatorEntityFlexibilityDomainMrid: string,
  systemOperatorEntityFlexibilityDomainName: string,
  systemOperatorCustomerServiceName: string,
  systemOperatorMarketParticipantName?: string,
  siteIecCode?: string, // Seulement pour les site HTB
}
