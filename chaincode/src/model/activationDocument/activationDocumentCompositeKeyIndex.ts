/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';
import { DocType } from '../../enums/DocType';

export class ActivationDocumentCompositeKeyIndex {
    public docType: string = DocType.DATA_INDEXER;

    public activationDocumentCompositeKey: string;
    public activationDocumentMrid: string;
}
