/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';

export class ActivationDocumentEligibilityStatus {
    public static readonly schema = Yup.object().shape({
        activationDocumentMrid: Yup.string().required(
            'activationDocumentMrid is a compulsory string')/*.typeError('activationDocumentMrid must be a string')*/,
        eligibilityStatus: Yup.string().required(
            'eligibilityStatus is a compulsory string').typeError('eligibilityStatus must be a string'),
    });

    public activationDocumentMrid: string;
    public eligibilityStatus: string;
}
