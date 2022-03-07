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
  motifRte?: {
    messageType: string;
    businessType: string;
    reasonCode: string;
  };
  motifEnedis?: {
    messageType: string;
    businessType: string;
    reasonCode: string;
  };
  systemOperatorMarketParticipantRoleType: string; // The operator, so the type of site (A49 => RTE, A50 => Enedis)
  // For RTE => the motif to considered is "motifRte"
  // For Enedis => the motif to considered is "motifEnedis"
  // For a producer => look at "systemOperatorMarketParticipantRoleType", that allows us to know if the producer is HTA (so "motifEnedis") or HTB (so "motifRTE")
}
