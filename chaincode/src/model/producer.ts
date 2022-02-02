/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';

export class Producer {

    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired(),
        producerMarketParticipantMrid: Yup.string().required(
            'producerMarketParticipantMrid is a compulsory string.'),
        producerMarketParticipantName: Yup.string().required(
            'producerMarketParticipantName is a compulsory string.'),
        producerMarketParticipantRoleType: Yup.string().required(
            'producerMarketParticipantRoleType is a compulsory string.'),
    });

    public docType?: string;
    public producerMarketParticipantMrid: string;
    public producerMarketParticipantName: string;
    public producerMarketParticipantRoleType: string;
}
