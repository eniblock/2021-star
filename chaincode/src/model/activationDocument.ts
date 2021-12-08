/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';

export class ActivationDocument {

    public static readonly schema = Yup.object().shape({
        activationDocumentMrid: Yup.string().required('activationDocumentMrid is required').typeError('activationDocumentMrid must be a string'),
        businessType: Yup.string().required('businessType is required').typeError('businessType must be a string'),
        docType: Yup.string().notRequired(),
        endCreatedDateTime: Yup.string().notRequired(),
        measurementUnitName: Yup.string().required('measurementUnitName is required').matches(/\bMW|\bKW/).typeError('measurementUnitName must be a Enumerator MW or KW'),
        messageType: Yup.string().required('messageType is required').typeError('messageType must be a string'),
        orderEnd: Yup.boolean().required('orderEnd is required').typeError('orderEnd must be a boolean'),
        orderType: Yup.string().required('orderType is required').typeError('orderType must be a string'),
        orderValue: Yup.string().notRequired().matches(/^[0-9]*.[0-9]*$/),
        originAutomataRegisteredResourceMrid: Yup.string().required(
            'originAutomataRegisteredResourceMrid is required').typeError('originAutomataRegisteredResourceMrid must be a string'),
        reasonCode: Yup.string().notRequired(),
        receiverMarketParticipantMrid: Yup.string().notRequired(),
        reconciliation: Yup.bool().notRequired(),
        registeredResourceMrid: Yup.string().required(
            'registeredResourceMrid is required')/*.matches(/^[0-9]{14}$/)*/.typeError('registeredResourceMrid must be a string'),
        revisionNumber: Yup.string().notRequired().matches(/^[0-9]*$/),
        senderMarketParticipantMrid: Yup.string().notRequired(),
        startCreatedDateTime: Yup.string().notRequired(),
        subOrderList: Yup.array().notRequired(),
        testDateTime: Yup.string().notRequired(),
    });

    public docType?: string;
    public constructor(
        public activationDocumentMrid: string, // PK
        public originAutomataRegisteredResourceMrid: string, // FK1
        public registeredResourceMrid: string, // FK2
        public measurementUnitName: string,
        public messageType: string,
        public businessType: string,
        public orderType: string,
        public orderEnd: boolean,
        public orderValue?: string,
        public startCreatedDateTime?: string,
        public testDateTime?: Date, // Test DELETE ME //////////////////////
        public endCreatedDateTime?: string,
        public revisionNumber?: string,
        public reasonCode?: string, // optionnal in case of TVC modulation
        public senderMarketParticipantMrid?: string, // FK?
        public receiverMarketParticipantMrid?: string, // FK?
        public reconciliation?: boolean,
        public subOrderList?: string[],
    ) {
        this.docType = 'activationDocument';
        this.reconciliation = false;
    }
}
