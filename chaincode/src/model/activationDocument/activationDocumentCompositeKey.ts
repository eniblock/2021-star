/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';
import { DocType } from '../../enums/DocType';
import { ActivationDocument } from './activationDocument';

export class ActivationDocumentCompositeKey {

    public static readonly schema = Yup.object().shape({
        endCreatedDateTime: Yup.string().notRequired().typeError('endCreatedDateTime must be a string'),
        originAutomationRegisteredResourceMrid: Yup.string().required(
            'originAutomationRegisteredResourceMrid is required').typeError('originAutomationRegisteredResourceMrid must be a string'),
        registeredResourceMrid: Yup.string().required(
            'registeredResourceMrid is required').typeError('registeredResourceMrid must be a string'),
        revisionNumber: Yup.string().required(
            'revisionNumber is required').typeError('revisionNumber must be a string').matches(/^[0-9]*$/),
        startCreatedDateTime: Yup.string().notRequired().typeError('startCreatedDateTime must be a string'),
    });

    public static formatActivationDocument(activationDocumentObj: ActivationDocument): ActivationDocumentCompositeKey {
        const activationDocumentCompositeKey: ActivationDocumentCompositeKey = {
            endCreatedDateTime: activationDocumentObj.endCreatedDateTime,
            originAutomationRegisteredResourceMrid: activationDocumentObj.originAutomationRegisteredResourceMrid,
            registeredResourceMrid: activationDocumentObj.registeredResourceMrid,
            revisionNumber: activationDocumentObj.revisionNumber,
            startCreatedDateTime: activationDocumentObj.startCreatedDateTime,
        };

        if (!activationDocumentCompositeKey.revisionNumber
            || activationDocumentCompositeKey.revisionNumber.length === 0) {

            activationDocumentCompositeKey.revisionNumber = '0';
        }
        ActivationDocumentCompositeKey.schema.validateSync(
            activationDocumentCompositeKey,
            {strict: true, abortEarly: false},
        );

        return activationDocumentCompositeKey;
    }

    public static formatString(inputString: string): ActivationDocumentCompositeKey {
        let activationDocumentCompositeKeyObj: ActivationDocumentCompositeKey;
        try {
            activationDocumentCompositeKeyObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ${DocType.ACTIVATION_DOCUMENT_COMPOSITE_KEY} -> Input string NON-JSON value`);
        }

        if (!activationDocumentCompositeKeyObj.revisionNumber
            || activationDocumentCompositeKeyObj.revisionNumber.length === 0) {

                activationDocumentCompositeKeyObj.revisionNumber = '0';
        }

        ActivationDocumentCompositeKey.schema.validateSync(
            activationDocumentCompositeKeyObj,
            {strict: true, abortEarly: false},
        );

        return activationDocumentCompositeKeyObj;
    }

    public static formatListString(inputString: string): ActivationDocumentCompositeKey[] {
        let activationDocumentCompositeKeyList: ActivationDocumentCompositeKey[] = [];
        try {
            activationDocumentCompositeKeyList = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ${DocType.ACTIVATION_DOCUMENT_COMPOSITE_KEY} by list-> Input string NON-JSON value`);
        }

        if (activationDocumentCompositeKeyList && activationDocumentCompositeKeyList.length > 0) {
            for (const activationDocumentCompositeKeyObj of activationDocumentCompositeKeyList) {
                if (!activationDocumentCompositeKeyObj.revisionNumber
                    || activationDocumentCompositeKeyObj.revisionNumber.length === 0) {

                        activationDocumentCompositeKeyObj.revisionNumber = '0';
                }

                ActivationDocumentCompositeKey.schema.validateSync(
                    activationDocumentCompositeKeyObj,
                    {strict: true, abortEarly: false},
                );
            }
        }
        return activationDocumentCompositeKeyList;
    }

    public originAutomationRegisteredResourceMrid: string;
    public registeredResourceMrid: string;
    public startCreatedDateTime?: string;
    public endCreatedDateTime?: string;
    public revisionNumber: string;
}
