/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';
import { DataVersionType } from '../../enums/DataVersionType';

export class ActivationDocument {
    public static formatString(inputString: string) : ActivationDocument {
        let activationDocumentObj: ActivationDocument;
        try {
            activationDocumentObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ActivationDocument-> Input string NON-JSON value`);
        }

        try {
            if (!activationDocumentObj.dataVersion) {
                activationDocumentObj.dataVersion = DataVersionType.PENDING;
            }
            ActivationDocument.schema.validateSync(
                activationDocumentObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            throw error;
        }
        return activationDocumentObj;
    }

    public static formatListString(inputString: string) : ActivationDocument[] {
        let activationDocumentList: ActivationDocument[] = [];
        try {
            activationDocumentList = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ActivationDocument by list-> Input string NON-JSON value`);
        }

        if (activationDocumentList && activationDocumentList.length > 0) {
            for (var activationDocumentObj of activationDocumentList) {
                if (!activationDocumentObj.dataVersion) {
                    activationDocumentObj.dataVersion = DataVersionType.PENDING;
                }
                try {
                    ActivationDocument.schema.validateSync(
                        activationDocumentObj,
                        {strict: true, abortEarly: false},
                    );
                } catch (error) {
                    throw error;
                }
            }
        }
        return activationDocumentList;
    }

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
        potentialParent: Yup.bool().notRequired(),
        potentialChild: Yup.bool().notRequired(),
        registeredResourceMrid: Yup.string().required(
            'registeredResourceMrid is required').typeError('registeredResourceMrid must be a string'),
        revisionNumber: Yup.string().notRequired().matches(/^[0-9]*$/),
        senderMarketParticipantMrid: Yup.string().required('senderMarketParticipantMrid is required').typeError('senderMarketParticipantMrid must be a string'),
        receiverMarketParticipantMrid: Yup.string().required('receiverMarketParticipantMrid is required').typeError('receiverMarketParticipantMrid must be a string'),
        startCreatedDateTime: Yup.string().notRequired(),
        instance: Yup.string().notRequired(),
        subOrderList: Yup.array().notRequired(),
        testDateTime: Yup.string().notRequired(),
        eligibilityStatus: Yup.string().notRequired(),
        eligibilityStatusEditable: Yup.boolean().notRequired().typeError('eligibilityStatusEditable must be a boolean'),
        dataVersion: Yup.string().required('dataVersion is required').typeError('dataVersion must be a string'),
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
    public senderMarketParticipantMrid: string; // FK?
    public receiverMarketParticipantMrid: string; // FK?
    public potentialParent?: boolean;
    public potentialChild?: boolean;
    public instance?: boolean;
    public subOrderList?: string[];
    public eligibilityStatus?: string;
    public eligibilityStatusEditable: boolean;
    public dataVersion: string;
}
