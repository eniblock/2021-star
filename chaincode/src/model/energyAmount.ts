/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';
import { DataActionType } from '../enums/DataActionType';

export class EnergyAmount {
    public static formatString(inputString: string) : EnergyAmount {
        let energyAmountObj: EnergyAmount;
        try {
            energyAmountObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR EnergyAmount-> Input string NON-JSON value`);
        }

        try {
            EnergyAmount.schema.validateSync(
                energyAmountObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            throw error;
        }
        return energyAmountObj;
    }

    public static formatListString(inputString: string) : EnergyAmount[] {
        let energyAmountList: EnergyAmount[] = [];
        try {
            energyAmountList = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR EnergyAmount by list-> Input string NON-JSON value`);
        }

        if (energyAmountList && energyAmountList.length > 0) {
            for (var energyAmountObj of energyAmountList) {
                try {
                    EnergyAmount.schema.validateSync(
                        energyAmountObj,
                        {strict: true, abortEarly: false},
                    );
                } catch (error) {
                    throw error;
                }
            }
        }
        return energyAmountList;
    }

    public static readonly schema = Yup.object().shape({
        activationDocumentMrid: Yup.string().required(
            'activationDocumentMrid is a compulsory string').typeError('activationDocumentMrid is a compulsory string',
        ),
        areaDomain: Yup.string().required('areaDomain is a compulsory string').typeError('areaDomain is a compulsory string'),
        businessType: Yup.string().notRequired(),
        classificationType: Yup.string().notRequired(),
        createdDateTime: Yup.string().required('createdDateTime is a compulsory string'),
        docStatus: Yup.string().notRequired(),
        docType: Yup.string().notRequired(),
        energyAmountMarketDocumentMrid: Yup.string().required(
            'energyAmountMarketDocumentMrid is a compulsory string',
        ),
        measurementUnitName: Yup.string().required('measurementUnitName is a compulsory string'),
        processType: Yup.string().notRequired(),
        quantity: Yup.string().required(
            'quantity is a compulsory string').typeError('quantity is a compulsory string',
        ),
        receiverMarketParticipantMrid: Yup.string().required(
            'receiverMarketParticipantMrid is a compulsory string').typeError('receiverMarketParticipantMrid must be a string',
        ),
        receiverMarketParticipantRole: Yup.string().required(
            'receiverMarketParticipantRole is a compulsory string').typeError('receiverMarketParticipantRole must be a string',
        ),
        registeredResourceMrid: Yup.string().notRequired(),
        revisionNumber: Yup.string().notRequired(),
        senderMarketParticipantMrid: Yup.string().required(
            'senderMarketParticipantMrid is a compulsory string').typeError('senderMarketParticipantMrid must be a string',
        ),
        senderMarketParticipantRole: Yup.string().required(
            'senderMarketParticipantRole is a compulsory string',
        ),
        timeInterval: Yup.string().required('timeInterval is a compulsory string'),
    });

    public docType?: string;
    public energyAmountMarketDocumentMrid: string; // PK
    public activationDocumentMrid: string; // FK1
    public registeredResourceMrid?: string;
    public quantity: string;
    public measurementUnitName: string;
    public revisionNumber?: string;
    public businessType?: string;
    public docStatus?: string;
    public processType?: string;
    public classificationType?: string;
    public areaDomain: string;
    public senderMarketParticipantMrid: string;
    public senderMarketParticipantRole: string;
    public receiverMarketParticipantMrid: string;
    public receiverMarketParticipantRole: string;
    public createdDateTime: string;
    public timeInterval: string;
}
