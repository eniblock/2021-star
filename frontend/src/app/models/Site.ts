import {TypeSite} from "./enum/TypeSite.enum";
import {TechnologyType} from "./enum/TechnologyType.enum";

export interface Site {
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
