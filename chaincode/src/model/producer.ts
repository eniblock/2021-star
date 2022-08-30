/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';
import { DocType } from '../enums/DocType';

export class Producer {
    public static formatString(inputString: string) : Producer {
        let producerObj: Producer;
        try {
            producerObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ${DocType.PRODUCER} -> Input string NON-JSON value`);
        }

        try {
            Producer.schema.validateSync(
                producerObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            throw error;
        }
        return producerObj;
    }

    public static formatListString(inputString: string) : Producer[] {
        let producerList: Producer[] = [];
        try {
            producerList = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ${DocType.PRODUCER} by list -> Input string NON-JSON value`);
        }

        if (producerList && producerList.length > 0) {
            for (var producerObj of producerList) {
                try {
                    Producer.schema.validateSync(
                        producerObj,
                        {strict: true, abortEarly: false},
                    );
                } catch (error) {
                    throw error;
                }
            }
        }
        return producerList;
    }

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
