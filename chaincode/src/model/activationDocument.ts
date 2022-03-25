/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';

export class ActivationDocument {

    public static readonly schema = Yup.object().shape({
        activationDocumentMrid: Yup.string().required(
            'activationDocumentMrid is a compulsory string')/*.typeError('activationDocumentMrid must be a string')*/,
        businessType: Yup.string().required('businessType is required').typeError('businessType must be a string'),
        docType: Yup.string().notRequired(),
        endCreatedDateTime: Yup.string().notRequired(),
        measurementUnitName: Yup.string().required('measurementUnitName is required').matches(/\bMW|\bKW/).typeError('measurementUnitName must be a Enumerator MW or KW'),
        messageType: Yup.string().required('messageType is required').typeError('messageType must be a string'),
        orderEnd: Yup.boolean().required('orderEnd is required').typeError('orderEnd must be a boolean'),
        orderValue: Yup.string().notRequired(),
        originAutomationRegisteredResourceMrid: Yup.string().required(
            'originAutomationRegisteredResourceMrid is required').typeError('originAutomationRegisteredResourceMrid must be a string'),
        reasonCode: Yup.string().notRequired(),
        receiverMarketParticipantMrid: Yup.string().notRequired(),
        reconciliation: Yup.bool().notRequired(),
        registeredResourceMrid: Yup.string().required(
            'registeredResourceMrid is required').typeError('registeredResourceMrid must be a string'),
        revisionNumber: Yup.string().notRequired().matches(/^[0-9]*$/),
        senderMarketParticipantMrid: Yup.string().notRequired(),
        instance: Yup.string().notRequired(), // Colonne à supprimer dès qu'on passera sur l'architecture PDC
        startCreatedDateTime: Yup.string().notRequired(),
        subOrderList: Yup.array().notRequired(),
        testDateTime: Yup.string().notRequired(),
    });

    public docType?: string;
    public activationDocumentMrid: string; // PK
    public originAutomationRegisteredResourceMrid: string; // FK1
    public registeredResourceMrid: string; // FK2
    public measurementUnitName: string;
    public messageType: string;
    public businessType: string;
    public orderEnd: boolean;
    public orderValue?: string;
    public startCreatedDateTime?: string;
    public endCreatedDateTime?: string;
    public revisionNumber?: string;
    public reasonCode?: string; // optionnal in case of TVC modulation
    public senderMarketParticipantMrid?: string; // FK?
    public receiverMarketParticipantMrid?: string; // FK?
    public reconciliation?: boolean;
    public instance?: string; // TODO bien préciser ici que j'ai eu l'accord de Guillaume Saluden (lundi 16:40 à la fin de la réunions sur la nouvelle archiecture) pour ajouter l'instance
    public subOrderList?: string[];
}