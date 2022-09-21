import * as Yup from 'yup';


export class FeedbackProducer {

    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired(),

        feedbackProducerMrid: Yup.string().required(
            'feedbackProducerMrid is a compulsory string').typeError('feedbackProducerMrid must be a string'),
        activationDocumentMrid: Yup.string().required('activationDocumentMrid is required').typeError('activationDocumentMrid must be a string'),

        messageType: Yup.string().notRequired().typeError('messageType must be a string'),
        processType: Yup.string().notRequired().typeError('processType must be a string'),
        revisionNumber: Yup.string().notRequired().matches(/^[0-9]*$/),

        senderMarketParticipantMrid: Yup.string().notRequired().typeError('senderMarketParticipantMrid must be a string'),
        receiverMarketParticipantMrid: Yup.string().notRequired().typeError('receiverMarketParticipantMrid must be a string'),

        createdDateTime: Yup.string().notRequired(),
        validityPeriodStartDateTime: Yup.string().notRequired(),
        validityPeriodEndDateTime: Yup.string().notRequired(),

        feedback: Yup.string().notRequired().typeError('feedback must be a string'),
        feedbackAnswer: Yup.string().notRequired().typeError('feedbackAnswer must be a string'),
        feedbackElements: Yup.string().notRequired().typeError('feedbackElements must be a string')
    });


    public docType?: string;

    public feedbackProducerMrid: string;
    public activationDocumentMrid: string;

    public messageType?: string;
    public processType?: string;
    public revisionNumber?: string;

    public senderMarketParticipantMrid?: string;
    public receiverMarketParticipantMrid?: string;

    public createdDateTime?: string;
    public validityPeriodStartDateTime: string;
    public validityPeriodEndDateTime: string;

    public feedback?: string;
    public feedbackAnswer?: string;
    public feedbackElements?: string;
}