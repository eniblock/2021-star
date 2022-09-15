import {Site} from "./Site";
import {Producer} from "./Producer";
import {EnergyAmount} from "./EnergyAmount";
import {OrdreLimitation} from "./OrdreLimitation";

export interface TypeCriteria {
  messageType: string;
  businessType: string;
  reasonCode: string;
}

export interface FormulaireRechercheHistoriqueLimitation {
  originAutomationRegisteredResourceName: string;
  producerMarketParticipantMrid: string;
  siteName: string;
  meteringPointMrid: string;
  activationType: string | null;
  activationReasonList: string | null;
  startCreatedDateTime: string; // JSON
  endCreatedDateTime: string; // JSON
}

export interface RechercheHistoriqueLimitationEntite {
  hasSite?: boolean,
  site: Site | null,
  producer: Producer | null,
  energyAmount: EnergyAmount | null,
  activationDocument: OrdreLimitation,
  subOrderList: OrdreLimitation[],
  displayedSourceName: string,
}
