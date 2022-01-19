import { OrdreRechercheReseau } from './enum/OrdreRechercheReseau.enum';
import { TechnologyType } from './enum/TechnologyType.enum';
import { PaginationForm, PaginationResponse } from './Pagination';

export interface RechercheReseauForm
  extends PaginationForm<OrdreRechercheReseau> {
  producerMarketParticipantName: string;
  siteName: string;
  substationName: string;
  substationMrid: string;
  producerMarketParticipantMrid: string;
}

export interface RechercheReseauResponse extends PaginationResponse {
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
