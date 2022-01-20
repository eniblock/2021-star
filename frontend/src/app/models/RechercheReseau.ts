import { OrdreRechercheReseau } from './enum/OrdreRechercheReseau.enum';
import { TechnologyType } from './enum/TechnologyType.enum';
import { TypeDeRechercheSimple } from './enum/TypeDeRechercheSimple.enum';
import { FormulairePagination, PaginationReponse } from './Pagination';

export interface FormulaireRechercheReseau {
  typeDeRechercheSimple: TypeDeRechercheSimple;
  champDeRechercheSimple: string;
  valeursRecherchees: RechercheReseauRequete;
}

export interface RechercheReseauRequete
  extends FormulairePagination<OrdreRechercheReseau> {
  producerMarketParticipantName: string;
  siteName: string;
  substationName: string;
  substationMrid: string;
  producerMarketParticipantMrid: string;
}

export interface RechercheReseauEntite {
  producerMarketParticipantName: string;
  technologyType: TechnologyType;
  meteringPointMrid: string;
  siteAdminMRID: string;
  siteLocation: string;
  siteType: string;
  substationName: string;
  substationMrid: string;
  systemOperatorEntityFlexibilityDomainMrid: string;
  systemOperatorEntityFlexibilityDomainName: string;
  systemOperatorCustomerServiceName: string;
  systemOperatorMarketParticipantName: string;
  /////   ?????? : code site / CART =========================> Lina doit confirmer...
}
