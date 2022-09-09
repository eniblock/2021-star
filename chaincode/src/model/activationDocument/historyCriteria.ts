import * as Yup from 'yup';

export class TypeCriteria {
    public messageType?: string;
    public businessType?: string;
    public reasonCode?: string;
}

export class HistoryCriteria {

    public static readonly schema = Yup.object().shape({
        originAutomationRegisteredResourceMrid: Yup.string()
            .notRequired().typeError('originAutomationRegisteredResourceMrid must be a string'),
        producerMarketParticipantMrid: Yup.string().notRequired().typeError('producerMarketParticipantMrid must be a string'),
        producerMarketParticipantName: Yup.string().notRequired().typeError('producerMarketParticipantName must be a string'),
        meteringPointMrid: Yup.string().notRequired().typeError('meteringPointMrid must be a string'),
        siteName: Yup.string().notRequired().typeError('siteName must be a string'),
        startCreatedDateTime: Yup.string().notRequired().typeError('startCreatedDateTime must be a string'),
        endCreatedDateTime: Yup.string().notRequired().typeError('endCreatedDateTime must be a string'),

        activationReasonList: Yup.array().of(Yup.object().shape(
            {
                messageType: Yup.string().required(),
                businessType: Yup.string().required(),
                reasonCode: Yup.string().required(),
            },
        )).notRequired(),
        activationType: Yup.object().shape(
            {
                messageType: Yup.string().required(),
                businessType: Yup.string().required(),
                reasonCode: Yup.string().required(),
            },
        ).notRequired(),
    });

    public originAutomationRegisteredResourceMrid?: string;
    public producerMarketParticipantMrid?: string;
    public producerMarketParticipantName?: string;
    public meteringPointMrid?: string;
    public siteName?: string;
    public registeredResourceList?: string[];
    public startCreatedDateTime?: string;
    public endCreatedDateTime?: string;

    public activationReasonList?: TypeCriteria[];
    public activationType?: TypeCriteria;


}
