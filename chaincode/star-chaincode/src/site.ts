/*
 * SPDX-License-Identifier: Apache-2.0
 */

/*
export class EDA {
  public assetType: AssetType;

  public constructor(
    public edaRegisteredResourceId: string,
    public a46Name: string,
    public edaRegisteredResourceName: string,
    public edaRegisteredResourceMrid: string,
    public a46IEC: string
  ) {
    this.assetType = AssetType.EDA;
  }
}
*/
export class Site {
    public docType: string;
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
    // public siteId: string;
    // public ppeSiteCode: string;
    // public edpRegisteredResourceMrid: string;
}
// siteId; b7baeb17-c8c0-4ccc-943f-0ee3dd49968e;
// systemOperatorMarketParticipantMrid; 17V000000992746D;
// technologyType; Eolien;
// siteType; Injection;
// meteringPointMrid; PDL00000000289766;
// siteName; Ferme �olienne de Genonville;
// siteAdminMrid; 489 981 029;
// siteLocation; Biscarosse;
// siteIecCode; S7X0000013077478;
// producerMarketParticipantMrid; 17X000001309745X;
// substationMrid; GDO A4RTD;
// substationName; CIVRAY;
// systemOperatorEntityFlexibilityDomainMrid; PSC4511;
// systemOperatorEntityFlexibilityDomainName; D�part 1;
// systemOperatorCustomerServiceName; DR Nantes Deux-S�vres;
// ppeSiteCode -> marketEvaluationPointMrid = ???
// edpRegisteredResourceMrid -> schedulingEntityRegisteredResourceMrid = ???
