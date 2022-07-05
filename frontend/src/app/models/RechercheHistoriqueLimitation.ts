import {OrdreRechercheHistoriqueLimitation} from './enum/OrdreRechercheHistoriqueLimitation.enum';
import {RequestForm} from "./RequestForm";
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

export interface RechercheHistoriqueLimitationRequete
  extends RequestForm<OrdreRechercheHistoriqueLimitation>,
    FormulaireRechercheHistoriqueLimitation {
}

export interface RechercheHistoriqueLimitationEntite {
  site: Site,
  producer: Producer,
  energyAmount: EnergyAmount,
  activationDocument: OrdreLimitation,
  subOrderList: OrdreLimitation[],
}
