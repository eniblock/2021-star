import { OrdreRechercheActivations } from './enum/OrdreRechercheActivations.enum';
import { TechnologyType } from './enum/TechnologyType.enum';
import { TypeLimitation } from './enum/TypeLimitation.enum';
import { TypeSite } from './enum/TypeSite.enum';
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
  typeSite: TypeSite;
}
