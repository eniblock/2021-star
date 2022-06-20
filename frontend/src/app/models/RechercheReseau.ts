import { OrdreRechercheReseau } from './enum/OrdreRechercheReseau.enum';
import { TechnologyType } from './enum/TechnologyType.enum';
import { TypeDeRechercheSimple } from './enum/TypeDeRechercheSimple.enum';
import { TypeSite } from './enum/TypeSite.enum';
import { FormulairePagination } from './RequestForm';

export interface FormulaireRechercheReseau {
  typeDeRechercheSimple?: TypeDeRechercheSimple;
  champDeRechercheSimple?: string;
  valeursRecherchees: RechercheReseauRequete;
}

export interface RechercheReseauRequete
  extends FormulairePagination<OrdreRechercheReseau> {
  siteName?: string;
  substationName?: string;
  substationMrid?: string;
  producerMarketParticipantName?: string;
  producerMarketParticipantMrid?: string;
  siteIecCode?: string;
  meteringPointMrId?: string;
}

export interface RechercheReseauEntite {
  typeSite: TypeSite;
  producerMarketParticipantMrid: string;
  producerMarketParticipantName: string;
  siteName: string;
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
  systemOperatorMarketParticipantName?: string; // Seulement pour les site HTB
  siteIecCode?: string; // Seulement pour les site HTB
}
