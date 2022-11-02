import { HistoryInformation } from '../../model/activationDocument/historyInformation';

export class HistoryInformationInBuilding {
    public historyInformation: Map<string, HistoryInformation> = new Map();
    public eligibilityToDefine: string[] = [];
    public eligibilityDefined: string[] = [];
    public reconciliated: string[] = [];
    public others: string[] = [];
}
