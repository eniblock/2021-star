/*
 * SPDX-License-Identifier: Apache-2.0
 */

export class ActivationDocument {
    public docType?: string;
    public constructor(
        public activationDocumentMrid: string, // PK
        public originAutomataRegisteredResourceMrid: string, // FK1
        public registeredResourceMrid: string, // FK2
        public measurementUnitName: Enumerator,
        public messageType: string,
        public businessType: string,
        public orderType: string,
        public orderEnd: boolean,
        public orderValue?: string,
        public startCreatedDateTime?: string,
        public testDateTime?: Date, // Test DELETE ME //////////////////////
        public endCreatedDateTime?: string,
        public revisionNumber?: string,
        public reasonCode?: string, // optionnal in case of TVC modulation
        public senderMarketParticipantMrid?: string, // FK?
        public receiverMarketParticipantMrid?: string, // FK?
        public reconciliation?: boolean,
        public subOrderList?: string[],
    ) {
        this.docType = 'activationDocument';
        this.reconciliation = false;
    }
}
