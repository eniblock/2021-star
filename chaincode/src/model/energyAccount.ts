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
        areaDomain: Yup.string().required('areaDomain is a compulsory string').typeError('areaDomain is a compulsory string'),
        businessType: Yup.string().notRequired(),
        classificationType: Yup.string().notRequired(),
        createdDateTime: Yup.string().required(),
        docStatus: Yup.string().notRequired(),
        docType: Yup.string().notRequired(),
        energyAccountMarketDocumentMrid: Yup.string().required(
            'energyAccountMarketDocumentMrid is a compulsory string',
        ),
        marketEvaluationPointMrid: Yup.string().notRequired(),
        measurementUnitName: Yup.string().required('measurementUnitName is a compulsory string'),
        meteringPointMrid: Yup.string().required(
            'meteringPointMrid is a compulsory string',
        ),
        processType: Yup.string().notRequired(),
        product: Yup.string().notRequired(),
        receiverMarketParticipantMrid: Yup.string().required(
            'receiverMarketParticipantMrid is a compulsory string').typeError('receiverMarketParticipantMrid must be a string'),
        receiverMarketParticipantRole: Yup.string().required(
            'receiverMarketParticipantRole is a compulsory string').typeError('receiverMarketParticipantRole must be a string'),
        resolution: Yup.string().required('resolution is a compulsory string'),
        revisionNumber: Yup.string().notRequired(),
        senderMarketParticipantMrid: Yup.string().required(
            'senderMarketParticipantMrid is a compulsory string').typeError('senderMarketParticipantMrid must be a string'),
        senderMarketParticipantRole: Yup.string().required(
            'senderMarketParticipantRole is a compulsory string',
        ),
        timeInterval: Yup.string().required(),
        timeSeries: Yup.array().of(Yup.object().shape(
            {
                inQuantity: Yup.number().required(),
                position: Yup.number().required(),
            },
        )).required(),
    });

    public docType?: string;
    public energyAccountMarketDocumentMrid: string; // PK
    public meteringPointMrid: string; // FK1
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
    public startCreatedDateTime: string;
    public endCreatedDateTime: string;
    public revisionNumber?: string;
    public businessType?: string;
    public docStatus?: string;
    public marketEvaluationPointMrid?: string; // FK2
    public processType?: string;
    public classificationType?: string;
    public product?: string;
}
