
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'
import { Site } from '../src/site';
import { YellowPages } from '../src/model/yellowPages';

let assert = sinon.assert;
chai.use(sinonChai);

describe('Star Tests YELLOW PAGES', () => {
    let transactionContext, chaincodeStub;
    beforeEach(() => {
        transactionContext = new Context();

        chaincodeStub = sinon.createStubInstance(ChaincodeStub);
        transactionContext.setChaincodeStub(chaincodeStub);
        chaincodeStub.MspiID = 'FakeMspID'

        chaincodeStub.putState.callsFake((key, value) => {
            if (!chaincodeStub.states) {
                chaincodeStub.states = {};
            }
            chaincodeStub.states[key] = value;
        });

        chaincodeStub.getState.callsFake(async (key) => {
            let ret;
            if (chaincodeStub.states) {
                ret = chaincodeStub.states[key];
            }
            return Promise.resolve(ret);
        });

        chaincodeStub.getQueryResult.callsFake(async (query) => {
            function* internalGetQueryResult() {
                if (chaincodeStub.states) {
                    const copied = Object.assign({}, chaincodeStub.states);
                    for (let key in copied) {
                        if (copied[key] == 'non-json-value') { 
                            yield {value: copied[key]};
                            continue
                        }
                        const obJson = JSON.parse(copied[key].toString('utf8'));
                        // console.log('obJson=', obJson);
                        const objStr: string = obJson.docType;
                        const queryJson = JSON.parse(query);
                        // console.log('queryJson=', queryJson);
                        const queryStr = queryJson.selector.docType
                        // console.log('queryStr=', queryStr , 'objStr=', objStr);
                        if (queryStr == objStr) {
                                yield {value: copied[key]};
                        }
                    }
                }
            }
            return Promise.resolve(internalGetQueryResult());
        });


        chaincodeStub.getMspID.callsFake(async () => {
            return Promise.resolve(chaincodeStub.MspiID);
        });
    });

    describe('Test false statement', () => {
        it('should avoid else flag missing', async () => {
            await chaincodeStub.getState("EolienFRvert28EIC");
            await chaincodeStub.getQueryResult("EolienFRvert28EIC");
        });
    });

    describe('Test createYellowPages', () => {

        it('should return ERROR on createYellowPages NON-JSON Value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            try {
                await star.CreateYellowPages(transactionContext, 'RTE01EIC');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('ERROR createYellowPages-> Input string NON-JSON value');
            }
        });

        it('should return ERROR createYellowPages System operator missing', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';

            try {
                await star.CreateYellowPages(transactionContext, '{"originAutomataRegisteredResourceMrid": "CRIVA1_ENEDIS_Y411","registeredResourceMrid": "PDL00000000289766","systemOperatorMarketParticipantMrid": "17V000000992746D"}');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('System Operator : 17V000000992746D does not exist in Yellow Pages CRIVA1_ENEDIS_Y411.');
            }
        });

        it('should return ERROR createYellowPages missing Site', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');

            try {
                await star.CreateYellowPages(transactionContext, '{"originAutomataRegisteredResourceMrid": "CRIVA1_ENEDIS_Y411","registeredResourceMrid": "PDL00000000289766","systemOperatorMarketParticipantMrid": "17V000000992746D"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Site : PDL00000000289766 does not exist in Yellow Pages CRIVA1_ENEDIS_Y411.');
            }
        });

        it('should return ERROR createYellowPages wrong MSPID', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.createSite(transactionContext, JSON.stringify(site));

            chaincodeStub.MspiID = 'FakeMSP';
            try {
                await star.CreateYellowPages(transactionContext, '{"originAutomataRegisteredResourceMrid": "CRIVA1_ENEDIS_Y411","registeredResourceMrid": "PDL00000000289766","systemOperatorMarketParticipantMrid": "17V000000992746D"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access for Yellow Pages.');
            }
        });

        it('should return ERROR createYellowPages missing originAutomataRegisteredResourceMrid mandatory field', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.createSite(transactionContext, JSON.stringify(site));

            try {
                await star.CreateYellowPages(transactionContext, '{"registeredResourceMrid": "PDL00000000289766","systemOperatorMarketParticipantMrid": "17V000000992746D"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('originAutomataRegisteredResourceMrid is a compulsory string.');
            }
        });

        it('should return ERROR createYellowPages missing registeredResourceMrid mandatory field', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.createSite(transactionContext, JSON.stringify(site));

            try {
                await star.CreateYellowPages(transactionContext, '{"originAutomataRegisteredResourceMrid": "CRIVA1_ENEDIS_Y411","systemOperatorMarketParticipantMrid": "17V000000992746D"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('registeredResourceMrid is a compulsory string.');
            }
        });

        it('should return ERROR createYellowPages missing systemOperatorMarketParticipantMrid mandatory field', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.createSite(transactionContext, JSON.stringify(site));

            try {
                await star.CreateYellowPages(transactionContext, '{"originAutomataRegisteredResourceMrid": "CRIVA1_ENEDIS_Y411","registeredResourceMrid": "PDL00000000289766"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('systemOperatorMarketParticipantMrid is a compulsory string.');
            }
        });

        it('should return ERROR createYellowPages missing all mandatory fields', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.createSite(transactionContext, JSON.stringify(site));

            try {
                await star.CreateYellowPages(transactionContext, '{}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('3 errors occurred');
            }
        });

        it('should return SUCCESS createYellowPages', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.createSite(transactionContext, JSON.stringify(site));
            
            const yellowPage = new YellowPages('CRIVA1_ENEDIS_Y411','PDL00000000289766','17V000000992746D');
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));

            let ret = JSON.parse((await chaincodeStub.getState("CRIVA1_ENEDIS_Y411")).toString());
            expect(ret).to.eql( Object.assign({docType: 'yellowPages'}, yellowPage ));
        });
    });
    describe('Test getAllYellowPages', () => {
        it('should return OK on getAllYellowPages empty', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            let ret = await star.GetAllYellowPages(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return ERROR on getAllYellowPages', async () => {
            let star = new Star();
            try {
                await star.GetAllYellowPages(transactionContext);
            } catch (err) {
                // console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have read access for Yellow Pages.');
            }
        });

        it('should return success on getAllYellowPages', async () => {
            let star = new Star();

            const siteA: Site = {meteringPointMrid: 'PDL00000000289766', systemOperatorMarketParticipantMrid: '17V0000009927464', producerMarketParticipantMrid: '17X0000013097450', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927464\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X0000013097450', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(siteA));

            const siteB: Site = {meteringPointMrid: 'PDL00000000289767', systemOperatorMarketParticipantMrid: '17V000000992746D', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', marketEvaluationPointMrid: 'CodePPE', schedulingEntityRegisteredResourceMrid: 'CodeEDP', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(siteB));

            const yellowPage: YellowPages = {
                originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
                registeredResourceMrid: "PDL00000000289766",
                systemOperatorMarketParticipantMrid: "17V000000992746D",
            };
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));

            let ret = await star.GetAllYellowPages(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: YellowPages[] = [
                {
                    docType: "yellowPages",
                    originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
                    registeredResourceMrid: "PDL00000000289766",
                    systemOperatorMarketParticipantMrid: "17V000000992746D"
                }
        ];

            expect(ret).to.eql(expected);
        });

        it('should return success on getAllYellowPages for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            const site: Site = {meteringPointMrid: 'PDL00000000289766', systemOperatorMarketParticipantMrid: '17V0000009927464', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927464\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const sit: Site = {meteringPointMrid: 'PDL00000000289767', systemOperatorMarketParticipantMrid: '17V000000992746D', producerMarketParticipantMrid: '17X0000013097450', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', marketEvaluationPointMrid: 'CodePPE', schedulingEntityRegisteredResourceMrid: 'CodeEDP', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X0000013097450', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(sit));
            const yellowPage: YellowPages = {
                originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
                registeredResourceMrid: "PDL00000000289766",
                systemOperatorMarketParticipantMrid: "17V000000992746D",
            };
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));

            let ret = await star.GetAllYellowPages(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected = [
                'non-json-value',
                {
                    docType: "yellowPages",
                    originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
                    registeredResourceMrid: "PDL00000000289766",
                    systemOperatorMarketParticipantMrid: "17V000000992746D"
                }
        ];

            expect(ret).to.eql(expected);
        });
    });
});