/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { Producer } from './producer';
import { SystemOperator } from './systemOperator';

export class ViewMarketParticipant {
    public systemOperators: SystemOperator[];
    public producers: Producer[];
}
