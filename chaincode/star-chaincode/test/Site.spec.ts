
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeServer, ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'
import { Site } from '../src/site';
import { SystemOperator } from '../src/systemOperator';

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

    describe('Test createSite', () => {
        // it('should return ERROR on createSite', async () => {
        //     chaincodeStub.putState.rejects('failed inserting key');

        //     let star = new Star();
        //     chaincodeStub.MspiID = 'RTEMSP';
        //     try {
        //         await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
        //         // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
        //         // await star.createSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     } catch(err) {
        //         console.info(err.message)
        //         expect(err.message).to.equal('failed inserting key');
        //     }
        // });

        it('should return ERROR on createSite NON-JSON Value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.createSite(transactionContext, 'RTE01EIC');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('ERROR createSite-> Input string NON-JSON value');
            }
        });

        it('should return ERROR createSite HTB System operator missing', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            try {
                await star.createSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('System Operator : 17V000000992746D does not exist');
            }
        });

        it('should return ERROR createSite HTB Producer missing', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');

            try {
                await star.createSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Producer : 17X000001309745X does not exist');
            }
        });

        it('should return ERROR createSite HTB wrong MSPID', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            chaincodeStub.MspiID = 'FakeMSP';
            try {
                await star.createSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, FakeMSP does not have write access for HTB(HV) sites');
            }
        });

        it('should return ERROR createSite HTB missing marketEvaluationPointMrid optional field for HTA', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            try {
                // await star.createSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
                await star.createSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('marketEvaluationPointMrid and schedulingEntityRegisteredResourceMrid must be both present for HTB site or absent for HTA site.');
            }
        });

        it('should return ERROR createSite HTB missing technologyType mandatory field', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            try {
                // await star.createSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
                await star.createSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Missing compulsory field');
            }
        });

        it('should return SUCCESS createSite HTB', async () => {
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
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            let ret = JSON.parse((await chaincodeStub.getState("PDL00000000289766")).toString());
            expect(ret).to.eql( Object.assign({docType: 'site'}, site ));
        });

        it('should return SUCCESS createSite HTA', async () => {
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
            await star.createSystemOperator(transactionContext, '17V0000009927464', 'Enedis', 'A50');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

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
            await star.createSystemOperator(transactionContext, '17V0000009927464', 'Enedis', 'A50');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            chaincodeStub.MspiID = 'FakeMSP';
            try {
                await star.createSite(transactionContext, JSON.stringify(site));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, FakeMSP does not have write access for HTA(MV) sites');
            }
        });

    });

    describe('Test querySite', () => {
        it('should return ERROR on querySite', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.querySite(transactionContext, 'toto');
            } catch (err) {
                // console.info(err.message)
                expect(err.message).to.equal('toto does not exist');
            }
        });

        it('should return SUCCESS on querySite', async () => {
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
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            let test = JSON.parse(await star.querySite(transactionContext, "PDL00000000289766"));
            expect(test).to.eql(Object.assign({docType: 'site'}, site));
            let ret = JSON.parse(await chaincodeStub.getState('PDL00000000289766'));
            expect(ret).to.eql(Object.assign({docType: 'site'}, site));
        });
    });

    describe('Test getSites', () => {
        it('should return error on getSites', async () => {
            let star = new Star();
            const systemOperator = 'toto';
            let ret = await star.getSites(transactionContext, systemOperator);
            ret = JSON.parse(ret);
            console.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return success on getSites', async () => {
            let star = new Star();

            const siteHTA: Site = {meteringPointMrid: 'PDL00000000289766', systemOperatorMarketParticipantMrid: '17V0000009927464', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, '17V0000009927464', 'Enedis', 'A50');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(siteHTA));
    
            const siteHTB: Site = {meteringPointMrid: 'PDL00000000289767', systemOperatorMarketParticipantMrid: '17V000000992746D', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', marketEvaluationPointMrid: 'CodePPE', schedulingEntityRegisteredResourceMrid: 'CodeEDP', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(siteHTB));

            let retA = await star.getSites(transactionContext, siteHTA.systemOperatorMarketParticipantMrid);
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

        it('should return success on GetAllAssets for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            const siteHTA: Site = {meteringPointMrid: 'PDL00000000289766', systemOperatorMarketParticipantMrid: '17V0000009927464', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createSystemOperator(transactionContext, '17V0000009927464', 'Enedis', 'A50');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(siteHTA));
    
            const siteHTB: Site = {meteringPointMrid: 'PDL00000000289767', systemOperatorMarketParticipantMrid: '17V000000992746D', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', marketEvaluationPointMrid: 'CodePPE', schedulingEntityRegisteredResourceMrid: 'CodeEDP', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(siteHTB));

            let retB = await star.getSites(transactionContext, siteHTB.systemOperatorMarketParticipantMrid);
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
});