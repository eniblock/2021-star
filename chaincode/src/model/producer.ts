/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';

export class Producer {

    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired(),
        producerMarketParticipantMrId: Yup.string().required(
            'producerMarketParticipantMrId is a compulsory string.'),
        producerMarketParticipantName: Yup.string().required(
            'producerMarketParticipantName is a compulsory string.'),
        producerMarketParticipantRoleType: Yup.string().required(
            'producerMarketParticipantRoleType is a compulsory string.'),
    });

    public docType?: string;
    public producerMarketParticipantMrId: string;
    public producerMarketParticipantName: string;
    public producerMarketParticipantRoleType: string;
}
