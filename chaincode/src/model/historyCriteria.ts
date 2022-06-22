import * as Yup from 'yup';

export class HistoryCriteria {

    public static readonly schema = Yup.object().shape({
        originAutomationRegisteredResourceMrid: Yup.string()
            .notRequired().typeError('originAutomationRegisteredResourceMrid must be a string'),
        registeredResourceMrid: Yup.string().notRequired().typeError('registeredResourceMrid must be a string'),
        startCreatedDateTime: Yup.string().notRequired().typeError('startCreatedDateTime must be a string'),
        endCreatedDateTime: Yup.string().notRequired().typeError('endCreatedDateTime must be a string'),
    });

    public originAutomationRegisteredResourceMrid?: string;
    public originAutomationRegisteredResourceList?: string[];
    public producerMarketParticipantMrid?: string;
    public siteName?: string;
    public registeredResourceMrid?: string;
    public registeredResourceList?: string[];
    public startCreatedDateTime?: string;
    public endCreatedDateTime?: string;
}
