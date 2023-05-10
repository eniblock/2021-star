import { HistoryInformation } from './historyInformation';

export class HistoryInformationInBuilding {
    public historyInformation: Map<string, HistoryInformation> = new Map();
    public eligibilityToDefine: string[] = [];
    public eligibilityDefined: string[] = [];
    public reconciliated: string[] = [];
    public others: string[] = [];

    public roleTable: Map<string, string>;
    public identity: string;
    public roleUser: string;

    public allInformation: Map<string, any> = new Map();
    public activationDocumentMridList: string[] = [];
    public suborderActivationDocumentMridList: string[] = [];
    public registeredResourceMridList: string[] = [];
    public producerMarketParticipantMridList: string[] = [];
}
