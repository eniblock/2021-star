import {TypeSite} from "./enum/TypeSite.enum";
import {TechnologyType} from "./enum/TechnologyType.enum";

export interface Site {
  typeSite: TypeSite,
  producerMarketParticipantMrid: string,
  producerMarketParticipantName: string,
  siteName: string,
  technologyType: TechnologyType,
  meteringPointMrid: string,
  siteAdminMrid?: string,
  siteLocation: string,
  siteType: string,
  substationName: string,
  substationMrid: string,
  systemOperatorEntityFlexibilityDomainMrid: string,
  systemOperatorEntityFlexibilityDomainName: string,
  systemOperatorCustomerServiceName: string,
  systemOperatorMarketParticipantName?: string | null, // Seulement pour les site HTB
  siteIecCode?: string | null, // Seulement pour les site HTB
}
