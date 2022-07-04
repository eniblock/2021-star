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
  ordreLimitation: OrdreLimitation,
  subOrderList: OrdreLimitation[],
}


/*
export interface SystemOperatorData {
  originAutomationRegisteredResourceMrid?: string;
  startCreatedDateTime?: string; // JSON
  endCreatedDateTime?: string; // JSON
  quantity?: number;                           // => dans energyAmount
  motif?: Motif;
  orderValue?: number; // Consigne graph
  measurementUnitName?: MeasurementUnitName; // Consigne graph
}

export interface RechercheHistoriqueLimitationEntite {
  meteringPointMrid: string;
  technologyType?: TechnologyType;
  producerMarketParticipantMrid?: string;
  producerMarketParticipantName?: string;
  siteName?: string;
  typeSite: TypeSite;
  rte?: SystemOperatorData;
  enedis?: SystemOperatorData;
}
 */
