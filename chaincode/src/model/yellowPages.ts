/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';

export class YellowPages {

    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired(),
        originAutomataRegisteredResourceMrid: Yup.string().required(
            'originAutomataRegisteredResourceMrid is a compulsory string.'),
        registeredResourceMrid: Yup.array().required(
            'registeredResourceMrid is a compulsory string array.'),
        systemOperatorMarketParticipantMrid: Yup.string().required(
            'systemOperatorMarketParticipantMrid is a compulsory string.'),
    });

    public docType?: string;
    public originAutomataRegisteredResourceMrid: string; // PK
    public registeredResourceMrid: string[]; // FK1 ???
    public systemOperatorMarketParticipantMrid: string; // FK2
}
