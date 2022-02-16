/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';

export class SystemOperator {

    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired(),
        systemOperatorMarketParticipantMrid: Yup.string().required(
            'systemOperatorMarketParticipantMrid is a compulsory string.'),
        systemOperatorMarketParticipantName: Yup.string().required(
            'systemOperatorMarketParticipantName is a compulsory string.'),
        systemOperatorMarketParticipantRoleType: Yup.string().required(
            'systemOperatorMarketParticipantRoleType is a compulsory string.'),
    });

    public docType?: string;
    public systemOperatorMarketParticipantName: string;                   // PK
    public systemOperatorMarketParticipantRoleType: string;     // FK
    public systemOperatorMarketParticipantMrid: string;     // FK
}
