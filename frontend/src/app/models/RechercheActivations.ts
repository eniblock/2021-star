import { OrdreRechercheActivations } from './enum/OrdreRechercheActivations.enum';
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

export interface RechercheActivationsEntite {}
