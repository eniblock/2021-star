/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';

export class YellowPages {

    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired(),
        originAutomationRegisteredResourceMrid: Yup.string().required(
            'originAutomationRegisteredResourceMrid is a compulsory string.'),
        registeredResourceMrid: Yup.string().required(
            'registeredResourceMrid is a compulsory string.'),
        systemOperatorMarketParticipantMrid: Yup.string().required(
            'systemOperatorMarketParticipantMrid is a compulsory string.'),
        yellowPageMrid: Yup.string().required(
            'yellowPageMrid is a compulsory string.'),
        });

    public docType?: string;
    public yellowPageMrid: string;
    public originAutomationRegisteredResourceMrid: string; // FK1
    public registeredResourceMrid: string; // FK2
    public systemOperatorMarketParticipantMrid: string; // FK3
}
