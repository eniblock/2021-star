/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';

/* tslint:disable:max-classes-per-file */

export class EnergyAccountPoint {
    public inQuantity: number;
    public position: number;
}

export class EnergyAccount {

    public static readonly schema = Yup.object().shape({
        areaDomain: Yup.string().required('areaDomain is required').matches(/\bMW|\bKW/).typeError('areaDomain must be a Enumerator MW or KW'),
        businessType: Yup.string().notRequired(),
        classificationType: Yup.string().notRequired(),
        createdDateTime: Yup.string().required(),
        docStatus: Yup.string().notRequired(),
        docType: Yup.string().notRequired(),
        energyAccountMarketDocumentMrid: Yup.string().required(
            'energyAccountMarketDocumentMrid is a compulsory string',
        ),
        marketEvaluationPointMrid: Yup.string().required(
            'marketEvaluationPointMrid is required',
        ),
        measurementUnitName: Yup.string().required(),
        meteringPointMrid: Yup.string().required(
            'meteringPointMrid is required',
        ),
        processType: Yup.string().notRequired(),
        product: Yup.string().notRequired(),
        receiverMarketParticipantMrid: Yup.string().required('receiverMarketParticipantMrid is required').typeError('receiverMarketParticipantMrid must be a string'),
        receiverMarketParticipantRole: Yup.string().required('receiverMarketParticipantRole is required').typeError('receiverMarketParticipantRole must be a string'),
        resolution: Yup.string().required('resolution is required'),
        revisionNumber: Yup.string().notRequired(),
        senderMarketParticipantMrid: Yup.string().required('senderMarketParticipantMrid is required').typeError('senderMarketParticipantMrid must be a string'),
        senderMarketParticipantRole: Yup.string().required(
            'senderMarketParticipantRole is required',
        ),
        timeInterval: Yup.string().required('timeInterval is required'),
        timeSeries: Yup.object().required('timeSeries is required'),
    });

    public docType?: string;
    public energyAccountMarketDocumentMrid: string; // PK
    public meteringPointMrid: string; // FK1
    public marketEvaluationPointMrid: string; // FK2
    public areaDomain: string;
    public senderMarketParticipantMrid: string;
    public senderMarketParticipantRole: string;
    public receiverMarketParticipantMrid: string;
    public receiverMarketParticipantRole: string;
    public createdDateTime: string;
    public measurementUnitName: string;
    public timeInterval: string;
    public resolution: string;
    public timeSeries: EnergyAccountPoint[];

    public revisionNumber?: string;
    public businessType?: string;
    public docStatus?: string;
    public processType?: string;
    public classificationType?: string;
    public product?: string;
}
