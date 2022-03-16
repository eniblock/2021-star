import { MeasurementUnitName } from './enum/MeasurementUnitName.enum';
import { OrdreRechercheActivations } from './enum/OrdreRechercheActivations.enum';
import { TechnologyType } from './enum/TechnologyType.enum';
import { TypeSite } from './enum/TypeSite.enum';
import { Motif } from './Motifs';
import { FormulairePagination } from './Pagination';

export interface FormulaireRechercheActivations {
  originAutomationRegisteredResourceMrid: string;
  producerMarketParticipantMrid: string;
  startCreatedDateTime: string; // JSON
  endCreatedDateTime: string; // JSON
}

export interface RechercheActivationsRequete
  extends FormulairePagination<OrdreRechercheActivations>,
    FormulaireRechercheActivations {}

export interface SystemOperatorData {
  originAutomationRegisteredResourceMrid?: string;
  startCreatedDateTime?: string; // JSON
  endCreatedDateTime?: string; // JSON
  quantity?: number;
  motif?: Motif;
  orderValue?: number; // Consigne graph
  measurementUnitName?: MeasurementUnitName; // Consigne graph
}

export interface RechercheActivationsEntite {
  meteringPointMrid: string;
  technologyType?: TechnologyType;
  producerMarketParticipantMrid?: string;
  producerMarketParticipantName?: string;
  siteName?: string;
  typeSite: TypeSite;
  rte?: SystemOperatorData;
  enedis?: SystemOperatorData;
}
