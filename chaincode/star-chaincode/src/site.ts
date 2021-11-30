/*
 * SPDX-License-Identifier: Apache-2.0
 */

export class Site {
    public docType?: string;
    public constructor(
        public meteringPointMrid: string,
        public systemOperatorMarketParticipantMrid: string,
        public producerMarketParticipantMrid: string,
        public technologyType: string,
        public siteType: string,
        public siteName: string,
        public substationMrid: string,
        public substationName: string,
        public marketEvaluationPointMrid?: string,
        public schedulingEntityRegisteredResourceMrid?: string,
        public siteAdminMrid?: string,
        public siteLocation?: string,
        public siteIecCode?: string,
        public systemOperatorEntityFlexibilityDomainMrid?: string,
        public systemOperatorEntityFlexibilityDomainName?: string,
        public systemOperatorCustomerServiceName?: string,
    ) {
        this.docType = 'site';
    }
}
