import { OrdreRechercheActivations } from './enum/OrdreRechercheActivations.enum';
import { FormulairePagination } from './Pagination';

export interface FormulaireRechercheActivations {
  registeredResourceMrid: string;
  producerMarketParticipantMrid: string;
  siteName: string;
  startCreatedDateTime: string;
  endCreatedDateTime: string;
}

export interface RechercheActivationsRequete
  extends FormulairePagination<OrdreRechercheActivations>,
    FormulaireRechercheActivations {}

export interface RechercheActivationsEntite {}
