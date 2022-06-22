import {MeasurementUnitName} from './enum/MeasurementUnitName.enum';
import {OrdreRechercheHistoriqueLimitation} from './enum/OrdreRechercheHistoriqueLimitation.enum';
import {TechnologyType} from './enum/TechnologyType.enum';
import {TypeSite} from './enum/TypeSite.enum';
import {Motif} from './Motifs';
import {RequestForm} from "./RequestForm";

export interface FormulaireRechercheHistoriqueLimitation {
  originAutomationRegisteredResourceName: string;
  producerMarketParticipantMrid: string;
  siteName: string;
  startCreatedDateTime: string; // JSON
  endCreatedDateTime: string; // JSON
}

export interface RechercheHistoriqueLimitationRequete
  extends RequestForm<OrdreRechercheHistoriqueLimitation>,
    FormulaireRechercheHistoriqueLimitation {}

export interface SystemOperatorData {
  originAutomationRegisteredResourceMrid?: string;
  startCreatedDateTime?: string; // JSON
  endCreatedDateTime?: string; // JSON
  quantity?: number;
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
