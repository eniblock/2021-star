import {Site} from "./Site";
import {Producer} from "./Producer";
import {EnergyAmount} from "./EnergyAmount";
import {OrdreLimitation} from "./OrdreLimitation";

export interface FormulaireRechercheHistoriqueLimitation {
  originAutomationRegisteredResourceName: string;
  producerMarketParticipantMrid: string;
  siteName: string;
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
