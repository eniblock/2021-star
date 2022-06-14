/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';

export class STARParameters {

    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired(),
        values: Yup.object().required(),
    });

    public docType?: string;
    public values: Map<string,any>;
}
