import { OrdreRechercheActivations } from './enum/OrdreRechercheActivations.enum';
import { TechnologyType } from './enum/TechnologyType.enum';
import { TypeSite } from './enum/TypeSite.enum';
import { Motif } from './Motifs';
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
  quantity?: number;
  motifRte?: Motif;
  motifEnedis?: Motif;
  typeSite: TypeSite;
}
