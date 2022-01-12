/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';

export class SystemOperator {

    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired(),
        marketParticipantName: Yup.string().required(
            'marketParticipantName is a compulsory string.'),
            marketParticipantRoleType: Yup.string().required(
            'marketParticipantRoleType is a compulsory string.'),
        systemOperatorMarketParticipantMrId: Yup.string().required(
            'systemOperatorMarketParticipantMrId is a compulsory string.'),
    });

    public docType?: string;
    public marketParticipantName: string;                   // PK
    public marketParticipantRoleType: string;               // FK
    public systemOperatorMarketParticipantMrId: string;     // FK
}
