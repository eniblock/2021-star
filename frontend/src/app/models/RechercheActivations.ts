import { OrdreRechercheActivations } from './enum/OrdreRechercheActivations.enum';
import { TechnologyType } from './enum/TechnologyType.enum';
import { TypeLimitation } from './enum/TypeLimitation.enum';
import { FormulairePagination } from './Pagination';

export interface FormulaireRechercheActivations {
  originAutomationRegisteredResourceMrid: string;
  producerMarketParticipantMrid: string;
  siteName: string;
  startCreatedDateTime: string; // JSON
  endCreatedDateTime: string; // JSON
}

export interface RechercheActivationsRequete
  extends FormulairePagination<OrdreRechercheActivations>,
    FormulaireRechercheActivations {}

export interface RechercheActivationsEntite {
  technologyType?: TechnologyType;
  originAutomationRegisteredResourceMrid?: string;
  producerMarketParticipantName?: string;
  siteName?: string;
  producerMarketParticipantMrid?: string;
  startCreatedDateTimeEnedis?: string; // JSON
  endCreatedDateTimeEnedis?: string; // JSON
  startCreatedDateTimeRte?: string; // JSON
  endCreatedDateTimeRte?: string; // JSON
  typeLimitation?: TypeLimitation;
  quantity?: number;
  motif?: {
    messageType: string;
    businessType: string;
    reasonCode: string;
  };
  systemOperatorMarketParticipantRoleType: string; // Le type d'operator et donc de site (A49 => RTE, A50 => Enedis)
}
