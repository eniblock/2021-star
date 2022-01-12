
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'
import { Site } from '../src/model/site';

let assert = sinon.assert;
chai.use(sinonChai);

describe('Star Tests SITES', () => {
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
                            // if (queryJson.selector.systemOperatorMarketParticipantMrId) {
                                const querySO = queryJson.selector.systemOperatorMarketParticipantMrid;
                                // console.log('querySO=', querySO);
                                const objSO = obJson.systemOperatorMarketParticipantMrid;
                                // console.log('objSO=', objSO);
                                if (querySO == objSO) {
                                    // console.log('yield=', querySO, objSO);
                                    yield {value: copied[key]};
                                }
                            // } else if (queryJson.selector.producerMarketParticipantMrid) {
                                const queryProd = queryJson.selector.producerMarketParticipantMrid;
                                // console.log('queryProd=', queryProd);
                                const objProd = obJson.producerMarketParticipantMrid;
                                // console.log('objProd=', objProd);
                                if (queryProd == objProd) {
                                    // console.log('yield=', queryProd, objProd);
                                    yield {value: copied[key]};
                                }
                            // } 
                            // else {
                            //     yield {value: copied[key]};
                            // }                           
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

    describe('Test CreateSite', () => {
        // it('should return ERROR on CreateSite', async () => {
        //     chaincodeStub.putState.rejects('failed inserting key');

        //     let star = new Star();
        //     chaincodeStub.MspiID = 'RTEMSP';
        //     try {
        //         await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
        //         // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
        //         // await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     } catch(err) {
        //         console.info(err.message)
        //         expect(err.message).to.equal('failed inserting key');
        //     }
        // });

        it('should return ERROR on CreateSite NON-JSON Value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.CreateSite(transactionContext, 'RTE01EIC');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('ERROR createSite-> Input string NON-JSON value');
            }
        });

        it('should return ERROR createSite HTB System operator missing', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');

            try {
                await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            } catch(err) {
                // console.info(err);
                // console.info(err.message);
                expect(err.message).to.equal('System Operator : 17V000000992746D does not exist for site creation');
            }
        });

        it('should return ERROR createSite HTB Producer missing', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');

            try {
                await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Producer : 17X000001309745X does not exist for site creation');
            }
        });

        it('should return ERROR createSite HTB wrong MSPID', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');

            chaincodeStub.MspiID = 'FakeMSP';
            try {
                await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access for HTB(HV) sites');
            }
        });

        it('should return ERROR createSite HTB missing marketEvaluationPointMrid optional field for HTA', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');

            try {
                // await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
                await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('marketEvaluationPointMrid and schedulingEntityRegisteredResourceMrid must be both present for HTB site or absent for HTA site.');
            }
        });

        it('should return ERROR createSite HTB missing technologyType mandatory field', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');

            try {
                // await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
                await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('technologyType is a compulsory field (string)');
            }
        });

        it('should return SUCCESS CreateSite HTB', async () => {
            let star = new Star();
            const site: Site = {
                meteringPointMrid: 'PDL00000000289766',
                systemOperatorMarketParticipantMrid: '17V000000992746D',
                producerMarketParticipantMrid: '17X000001309745X',
                technologyType: 'Eolien',
                siteType: 'Injection',
                siteName: 'Ferme éolienne de Genonville',
                substationMrid: 'GDO A4RTD',
                substationName: 'CIVRAY',
                marketEvaluationPointMrid: 'CodePPE', // optional 
                schedulingEntityRegisteredResourceMrid: 'CodeEDP', // optional 
                siteAdminMrid: '489 981 029', // optional 
                siteLocation: 'Biscarosse', // optional 
                siteIecCode: 'S7X0000013077478', // optional 
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', // optional 
                systemOperatorEntityFlexibilityDomainName: 'Départ 1', // optional 
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres', // optional 
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(site));

            let ret = JSON.parse((await chaincodeStub.getState("PDL00000000289766")).toString());
            expect(ret).to.eql( Object.assign({docType: 'site'}, site ));
        });

        it('should return SUCCESS CreateSite HTA', async () => {
            let star = new Star();
            const site: Site = {
                meteringPointMrid: 'PDL00000000289766',
                systemOperatorMarketParticipantMrid: '17V0000009927464',
                producerMarketParticipantMrid: '17X000001309745X',
                technologyType: 'Eolien',
                siteType: 'Injection',
                siteName: 'Ferme éolienne de Genonville',
                substationMrid: 'GDO A4RTD',
                substationName: 'CIVRAY',
                // marketEvaluationPointMrid: 'CodePPE', // optional 
                // schedulingEntityRegisteredResourceMrid: 'CodeEDP', // optional 
                siteAdminMrid: '489 981 029', // optional 
                siteLocation: 'Biscarosse', // optional 
                siteIecCode: 'S7X0000013077478', // optional 
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', // optional 
                systemOperatorEntityFlexibilityDomainName: 'Départ 1', // optional 
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres', // optional 
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927464\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(site));

            let ret = JSON.parse((await chaincodeStub.getState("PDL00000000289766")).toString());
            expect(ret).to.eql( Object.assign({docType: 'site'}, site ));
        });

        it('should return ERROR createSite HTA wrong MSPID', async () => {
            let star = new Star();
            const site: Site = {
                meteringPointMrid: 'PDL00000000289766',
                systemOperatorMarketParticipantMrid: '17V0000009927464',
                producerMarketParticipantMrid: '17X000001309745X',
                technologyType: 'Eolien',
                siteType: 'Injection',
                siteName: 'Ferme éolienne de Genonville',
                substationMrid: 'GDO A4RTD',
                substationName: 'CIVRAY',
                // marketEvaluationPointMrid: 'CodePPE', // optional 
                // schedulingEntityRegisteredResourceMrid: 'CodeEDP', // optional 
                siteAdminMrid: '489 981 029', // optional 
                siteLocation: 'Biscarosse', // optional 
                siteIecCode: 'S7X0000013077478', // optional 
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', // optional 
                systemOperatorEntityFlexibilityDomainName: 'Départ 1', // optional 
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres', // optional 
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927464\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            chaincodeStub.MspiID = 'FakeMSP';
            try {
                await star.CreateSite(transactionContext, JSON.stringify(site));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access for HTA(MV) sites');
            }
        });

    });

    describe('Test QuerySite', () => {
        it('should return ERROR on QuerySite', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.QuerySite(transactionContext, 'toto');
            } catch (err) {
                // console.info(err.message)
                expect(err.message).to.equal('toto does not exist');
            }
        });

        it('should return SUCCESS on QuerySite', async () => {
            let star = new Star();
            const site: Site = {
                meteringPointMrid: 'PDL00000000289766',
                systemOperatorMarketParticipantMrid: '17V000000992746D',
                producerMarketParticipantMrid: '17X000001309745X',
                technologyType: 'Eolien',
                siteType: 'Injection',
                siteName: 'Ferme éolienne de Genonville',
                substationMrid: 'GDO A4RTD',
                substationName: 'CIVRAY',
                marketEvaluationPointMrid: 'CodePPE', // optional 
                schedulingEntityRegisteredResourceMrid: 'CodeEDP', // optional 
                siteAdminMrid: '489 981 029', // optional 
                siteLocation: 'Biscarosse', // optional 
                siteIecCode: 'S7X0000013077478', // optional 
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', // optional 
                systemOperatorEntityFlexibilityDomainName: 'Départ 1', // optional 
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres', // optional 
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(site));

            let test = JSON.parse(await star.QuerySite(transactionContext, "PDL00000000289766"));
            expect(test).to.eql(Object.assign({docType: 'site'}, site));
            let ret = JSON.parse(await chaincodeStub.getState('PDL00000000289766'));
            expect(ret).to.eql(Object.assign({docType: 'site'}, site));
        });
    });

    describe('Test getSiteBySystemOperator', () => {
        it('should return OK on getSiteBySystemOperator empty', async () => {
            let star = new Star();
            const systemOperator = 'toto';
            let ret = await star.GetSitesBySystemOperator(transactionContext, systemOperator);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return success on getSiteBySystemOperator', async () => {
            let star = new Star();

            const siteHTA: Site = {meteringPointMrid: 'PDL00000000289766', systemOperatorMarketParticipantMrid: '17V0000009927464', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927464\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(siteHTA));
    
            const siteHTB: Site = {meteringPointMrid: 'PDL00000000289767', systemOperatorMarketParticipantMrid: '17V000000992746D', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', marketEvaluationPointMrid: 'CodePPE', schedulingEntityRegisteredResourceMrid: 'CodeEDP', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(siteHTB));

            let retA = await star.GetSitesBySystemOperator(transactionContext, siteHTA.systemOperatorMarketParticipantMrid);
            retA = JSON.parse(retA);
            // console.log('retA=', retA)
            expect(retA.length).to.equal(1);

            const expected: Site[] = [
                {
                    docType: "site",
                    meteringPointMrid: "PDL00000000289766",
                    producerMarketParticipantMrid: "17X000001309745X",
                    siteAdminMrid: "489 981 029",
                    siteIecCode: "S7X0000013077478",
                    siteLocation: "Biscarosse",
                    siteName: "Ferme éolienne de Genonville",
                    siteType: "Injection",
                    substationMrid: "GDO A4RTD",
                    substationName: "CIVRAY",
                    systemOperatorCustomerServiceName: "DR Nantes Deux-Sèvres",
                    systemOperatorEntityFlexibilityDomainMrid: "PSC4511",
                    systemOperatorEntityFlexibilityDomainName: "Départ 1",
                    systemOperatorMarketParticipantMrid: "17V0000009927464",
                    technologyType: "Eolien",
                }
           ];

            expect(retA).to.eql(expected);
        });

        it('should return success on getSiteBySystemOperator for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            const siteHTA: Site = {meteringPointMrid: 'PDL00000000289766', systemOperatorMarketParticipantMrid: '17V0000009927464', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927464\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(siteHTA));
    
            const siteHTB: Site = {meteringPointMrid: 'PDL00000000289767', systemOperatorMarketParticipantMrid: '17V000000992746D', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', marketEvaluationPointMrid: 'CodePPE', schedulingEntityRegisteredResourceMrid: 'CodeEDP', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(siteHTB));

            let retB = await star.GetSitesBySystemOperator(transactionContext, siteHTB.systemOperatorMarketParticipantMrid);
            retB = JSON.parse(retB);
            // console.log('retB=', retB)
            expect(retB.length).to.equal(2);

            const expected = [
                'non-json-value',
                {
                    docType: "site",
                    meteringPointMrid: "PDL00000000289767",
                    producerMarketParticipantMrid: "17X000001309745X",
                    siteAdminMrid: "489 981 029",
                    siteIecCode: "S7X0000013077478",
                    siteLocation: "Biscarosse",
                    siteName: "Ferme éolienne de Genonville",
                    siteType: "Injection",
                    substationMrid: "GDO A4RTD",
                    substationName: "CIVRAY",
                    marketEvaluationPointMrid: "CodePPE",
                    schedulingEntityRegisteredResourceMrid: "CodeEDP",
                    systemOperatorCustomerServiceName: "DR Nantes Deux-Sèvres",
                    systemOperatorEntityFlexibilityDomainMrid: "PSC4511",
                    systemOperatorEntityFlexibilityDomainName: "Départ 1",
                    systemOperatorMarketParticipantMrid: "17V000000992746D",
                    technologyType: "Eolien",
                }
           ];

            expect(retB).to.eql(expected);
        });
    });

    describe('Test getSiteByProducer', () => {
        it('should return OK on getSiteByProducer empty', async () => {
            let star = new Star();
            const producer = 'toto';
            let ret = await star.GetSitesBySystemOperator(transactionContext, producer);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return success on getSiteByProducer', async () => {
            let star = new Star();

            const siteHTA: Site = {meteringPointMrid: 'PDL00000000289766', systemOperatorMarketParticipantMrid: '17V0000009927464', producerMarketParticipantMrid: '17X0000013097450', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927464\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X0000013097450\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(siteHTA));
    
            const siteHTB: Site = {meteringPointMrid: 'PDL00000000289767', systemOperatorMarketParticipantMrid: '17V000000992746D', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', marketEvaluationPointMrid: 'CodePPE', schedulingEntityRegisteredResourceMrid: 'CodeEDP', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(siteHTB));

            let retA = await star.GetSitesByProducer(transactionContext, siteHTA.producerMarketParticipantMrid);
            retA = JSON.parse(retA);
            // console.log('retA=', retA)
            expect(retA.length).to.equal(1);

            const expected: Site[] = [
                {
                    docType: "site",
                    meteringPointMrid: "PDL00000000289766",
                    producerMarketParticipantMrid: "17X0000013097450",
                    siteAdminMrid: "489 981 029",
                    siteIecCode: "S7X0000013077478",
                    siteLocation: "Biscarosse",
                    siteName: "Ferme éolienne de Genonville",
                    siteType: "Injection",
                    substationMrid: "GDO A4RTD",
                    substationName: "CIVRAY",
                    systemOperatorCustomerServiceName: "DR Nantes Deux-Sèvres",
                    systemOperatorEntityFlexibilityDomainMrid: "PSC4511",
                    systemOperatorEntityFlexibilityDomainName: "Départ 1",
                    systemOperatorMarketParticipantMrid: "17V0000009927464",
                    technologyType: "Eolien",
                }
           ];

            expect(retA).to.eql(expected);
        });

        it('should return success on getSiteByProducer for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            const siteHTA: Site = {meteringPointMrid: 'PDL00000000289766', systemOperatorMarketParticipantMrid: '17V0000009927464', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927464\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(siteHTA));
    
            const siteHTB: Site = {meteringPointMrid: 'PDL00000000289767', systemOperatorMarketParticipantMrid: '17V000000992746D', producerMarketParticipantMrid: '17X0000013097450', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', marketEvaluationPointMrid: 'CodePPE', schedulingEntityRegisteredResourceMrid: 'CodeEDP', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X0000013097450\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(siteHTB));

            let retB = await star.GetSitesByProducer(transactionContext, siteHTB.producerMarketParticipantMrid);
            retB = JSON.parse(retB);
            // console.log('retB=', retB) //
            expect(retB.length).to.equal(2);

            const expected = [
                'non-json-value',
                {
                    docType: "site",
                    meteringPointMrid: "PDL00000000289767",
                    producerMarketParticipantMrid: "17X0000013097450",
                    siteAdminMrid: "489 981 029",
                    siteIecCode: "S7X0000013077478",
                    siteLocation: "Biscarosse",
                    siteName: "Ferme éolienne de Genonville",
                    siteType: "Injection",
                    substationMrid: "GDO A4RTD",
                    substationName: "CIVRAY",
                    marketEvaluationPointMrid: "CodePPE",
                    schedulingEntityRegisteredResourceMrid: "CodeEDP",
                    systemOperatorCustomerServiceName: "DR Nantes Deux-Sèvres",
                    systemOperatorEntityFlexibilityDomainMrid: "PSC4511",
                    systemOperatorEntityFlexibilityDomainName: "Départ 1",
                    systemOperatorMarketParticipantMrid: "17V000000992746D",
                    technologyType: "Eolien",
                }
           ];

            expect(retB).to.eql(expected);
        });

        it('should return success on getSites for producer', async () => {
            let star = new Star();

            const siteHTAprodA: Site = {
                meteringPointMrid: 'PRM00000000234766',
                systemOperatorMarketParticipantMrid: '17V0000009927468',
                producerMarketParticipantMrid: '17X000001307745X',
                technologyType: 'Eolien',
                siteType: 'Injection',
                siteName: 'Ferme éolienne de Genonville',
                substationMrid: 'GDO A4RTD',
                substationName: 'CIVRAY',
                siteAdminMrid: '489 981 029',
                siteLocation: 'Biscarosse',
                siteIecCode: 'S7X0000013077453',
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4566',
                systemOperatorEntityFlexibilityDomainName: 'Départ 1',
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres',
            }
            const siteHTAprodB: Site = {
                meteringPointMrid: 'PRM00000000234767',
                systemOperatorMarketParticipantMrid: '17V0000009927468',
                producerMarketParticipantMrid: '17X0000013077450',
                technologyType: 'Photovoltaïque',
                siteType: 'Injection',
                siteName: 'Parc photovoltaïque de Melle',
                substationMrid: 'GDO A4RTD',
                substationName: 'CIVRAY',
                siteAdminMrid: '490 981 030',
                siteLocation: 'Nantes',
                siteIecCode: 'S7X0000013077454',
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4567',
                systemOperatorEntityFlexibilityDomainName: 'Départ 2',
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres',
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927468\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X0000013077450\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001307745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(siteHTAprodA));
            await star.CreateSite(transactionContext, JSON.stringify(siteHTAprodB));
    
            const siteHTBProdA: Site = {
                meteringPointMrid: 'PDL00000000289767', 
                systemOperatorMarketParticipantMrid: '17V0000009927469', 
                producerMarketParticipantMrid: '17X000001307745X', 
                technologyType: 'Eolien', 
                siteType: 'Injection', 
                siteName: 'Ferme éolienne de Genonville', 
                substationMrid: 'GDO A4RTD', 
                substationName: 'CIVRAY', 
                marketEvaluationPointMrid: 'CodePPE', 
                schedulingEntityRegisteredResourceMrid: 'CodeEDP', 
                siteAdminMrid: '489 981 029', 
                siteLocation: 'Biscarosse', 
                siteIecCode: 'S7X0000013077478', 
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', 
                systemOperatorEntityFlexibilityDomainName: 'Départ 1', 
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'
            }

            const siteHTBProdB: Site = {
                meteringPointMrid: 'PDL00000000289768', 
                systemOperatorMarketParticipantMrid: '17V0000009927469', 
                producerMarketParticipantMrid: '17X0000013077450', 
                technologyType: 'Eolien', 
                siteType: 'Injection', 
                siteName: 'Ferme éolienne de Genonville', 
                substationMrid: 'GDO A4RTD', 
                substationName: 'CIVRAY', 
                marketEvaluationPointMrid: 'CodePPE', 
                schedulingEntityRegisteredResourceMrid: 'CodeEDP', 
                siteAdminMrid: '489 981 029', 
                siteLocation: 'Biscarosse', 
                siteIecCode: 'S7X0000013077478', 
                systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', 
                systemOperatorEntityFlexibilityDomainName: 'Départ 1', 
                systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927469\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            // await star.createProducer(transactionContext, '17X0000013097450', 'EolienFR vert Cie', 'A21');
            // await star.createProducer(transactionContext, '17X000001307745X', 'EolienFR vert Cie', 'A21');
            await star.CreateSite(transactionContext, JSON.stringify(siteHTBProdA));
            await star.CreateSite(transactionContext, JSON.stringify(siteHTBProdB));

            let retProd = await star.GetSitesByProducer(transactionContext, siteHTAprodA.producerMarketParticipantMrid);
            retProd = JSON.parse(retProd);
            // console.log('retProd=', retProd)
            expect(retProd.length).to.equal(2);

            const expected: Site[] = [
                {
                    meteringPointMrid: 'PRM00000000234766',
                    systemOperatorMarketParticipantMrid: '17V0000009927468',
                    producerMarketParticipantMrid: '17X000001307745X',
                    technologyType: 'Eolien',
                    siteType: 'Injection',
                    siteName: 'Ferme éolienne de Genonville',
                    substationMrid: 'GDO A4RTD',
                    substationName: 'CIVRAY',
                    siteAdminMrid: '489 981 029',
                    siteLocation: 'Biscarosse',
                    siteIecCode: 'S7X0000013077453',
                    systemOperatorEntityFlexibilityDomainMrid: 'PSC4566',
                    systemOperatorEntityFlexibilityDomainName: 'Départ 1',
                    systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres',
                    docType: 'site'
                  },
                  {
                    meteringPointMrid: 'PDL00000000289767',
                    systemOperatorMarketParticipantMrid: '17V0000009927469',
                    producerMarketParticipantMrid: '17X000001307745X',
                    technologyType: 'Eolien',
                    siteType: 'Injection',
                    siteName: 'Ferme éolienne de Genonville',
                    substationMrid: 'GDO A4RTD',
                    substationName: 'CIVRAY',
                    marketEvaluationPointMrid: 'CodePPE',
                    schedulingEntityRegisteredResourceMrid: 'CodeEDP',
                    siteAdminMrid: '489 981 029',
                    siteLocation: 'Biscarosse',
                    siteIecCode: 'S7X0000013077478',
                    systemOperatorEntityFlexibilityDomainMrid: 'PSC4511',
                    systemOperatorEntityFlexibilityDomainName: 'Départ 1',
                    systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres',
                    docType: 'site'
                  }
            ];

            expect(retProd).to.eql(expected);
        });
    });
});