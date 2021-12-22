
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeServer, ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'
import { Site } from '../src/site';
import { ActivationDocument } from '../src/model/activationDocument';
import { SystemOperator } from '../src/systemOperator';
import { ActivationDocumentController } from '../src/controller/ActivationDocumentController';
import { YellowPages } from '../src/model/yellowPages';

let assert = sinon.assert;
chai.use(sinonChai);

describe('Star Tests ActivationDocument', () => {
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
                        console.log('copied[key]=', copied[key].toString());
                        if (copied[key] == 'non-json-value') { 
                            console.log('IN IF copied[key]=', copied[key]);

                            yield {value: copied[key]};
                            continue
                        }
                        const obJson = JSON.parse(copied[key].toString('utf8'));
                        console.log('obJson=', obJson);
                        const objStr: string = obJson.docType;
                        const queryJson = JSON.parse(query);
                        console.log('queryJson=', queryJson);
                        const queryStr = queryJson.selector.docType
                        // console.log('queryStr=', queryStr , 'objStr=', objStr);
                        if (queryStr == objStr) {
                            // if (queryJson.selector.systemOperatorMarketParticipantMrId) {
                                const queryR = queryJson.selector.receiverMarketParticipantMrid;
                                // console.log('queryR=', queryR);
                                const objR = obJson.receiverMarketParticipantMrid;
                                // console.log('objR=', objR);
                                if (queryR == objR) {
                                    // console.log('yield=', queryR, objR);
                                    yield {value: copied[key]};
                                }
                                const queryS = queryJson.selector.senderMarketParticipantMrid;
                                console.log('queryS=', queryS);
                                const objS = obJson.senderMarketParticipantMrid;
                                console.log('objS=', objS);
                                if (queryS == objS) {
                                    console.log('yield=', queryS, objS);
                                    yield {value: copied[key]};
                                }
                                
                                const queryM = queryJson.selector.registeredResourceMrid;
                                console.log('queryM=', queryM);
                                const objM = obJson.registeredResourceMrid;
                                console.log('objM=', objM);
                                if (queryM == objM && queryJson.selector.reconciliation == obJson.reconciliation) {
                                    console.log('yield=', queryM, objM);
                                    yield {value: copied[key]};
                                }
                            // } else if (queryJson.selector.producerMarketParticipantMrid) {
                                // const queryProd = queryJson.selector.producerMarketParticipantMrid;
                                // console.log('queryProd=', queryProd);
                                // const objProd = obJson.producerMarketParticipantMrid;
                                // console.log('objProd=', objProd);
                                // if (queryProd == objProd) {
                                    // console.log('yield=', queryProd, objProd);
                                    // yield {value: copied[key]};
                                // }
                            // } 
                            // else {
                            //     yield {value: copied[key]};
                            // }                           
                        }
                        console.log('end of loop')
                    }
                }
            }
            return Promise.resolve(internalGetQueryResult());
        });


        chaincodeStub.getMspID.callsFake(async () => {
            return Promise.resolve(chaincodeStub.MspiID);
        });

        // chaincodeStub.initledger.callsFake(async () => {

        // });
    });

    describe('Test false statement', () => {
        it('should avoid else flag missing', async () => {
            await chaincodeStub.getState("EolienFRvert28EIC");
            await chaincodeStub.getQueryResult("EolienFRvert28EIC");
        });
    });
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    couple     ////////////////////////////
////////////////////////////////////////////////////////////////////////////

    describe('Test CreateActivationDocument couple HTA ENEDIS', () => {
        // it('should return ERROR on CreateActivationDocument', async () => {
        //     chaincodeStub.putState.rejects('failed inserting key');

        //     let star = new Star();
        //     chaincodeStub.MspiID = 'RTEMSP';
        //     try {
        //         await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
        //         // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
        //         await star.CreateActivationDocument(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     } catch(err) {
        //         console.info(err.message)
        //         expect(err.message).to.equal('failed inserting key');
        //     }
        // });

        it('should return ERROR on CreateActivationDocument NON-JSON Value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.CreateActivationDocument(transactionContext, 'RTE01EIC');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('ERROR createActivationDocument-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateActivationDocument missing originAutomataRegisteredResourceMrid', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            // `{
            //     \"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", 
            //     \"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\", 
            //     \"registeredResourceMrid\": \"12345678901234\", 
            //     \"measurementUnitName\": \"KW\",
            //     \"messageType\": \"string\",
            //     \"businessType\": \"string\",
            //     \"orderType\": \"string\",
            //     \"orderEnd\": false,
            // }`

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"registeredResourceMrid\": \"12345678901234\", \"measurementUnitName\": \"KW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('originAutomataRegisteredResourceMrid is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing registeredResourceMrid', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\", \"measurementUnitName\": \"KW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('registeredResourceMrid is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing measurementUnitName', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\", \"registeredResourceMrid\": \"12345678901234\", \"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('measurementUnitName is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing messageType', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\", \"registeredResourceMrid\": \"12345678901234\", \"measurementUnitName\": \"KW\", \"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('messageType is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing businessType', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\", \"registeredResourceMrid\": \"12345678901234\", \"measurementUnitName\": \"KW\", \"messageType\": \"string\", \"orderType\": \"string\",\"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('businessType is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing orderType', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\", \"registeredResourceMrid\": \"12345678901234\", \"measurementUnitName\": \"KW\", \"messageType\": \"string\", \"businessType\": \"string\", \"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('orderType is required');
            }
        });

        it('should return ERROR CreateActivationDocument missing orderEnd', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            try {
                await star.CreateActivationDocument(transactionContext, `{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", \"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\", \"registeredResourceMrid\": \"12345678901234\", \"measurementUnitName\": \"KW\", \"messageType\": \"string\", \"businessType\": \"string\", \"orderType\": \"string\"}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('orderEnd is required');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA wrong MSPID -> FakeMSP', async () => {
            let star = new Star();
            const order = new ActivationDocument('string', 'string', '12345678901234', 'KW', 'string', 'string', 'string', false);

            chaincodeStub.MspiID = 'FakeMSP';
            // await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access for Activation Document');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA wrong unit measure', async () => {
            let star = new Star();
            const order: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: '12345678901234', // FK2 
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, ENEDISMSP does not have write access for MW orders');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA missing systemoperator', async () => {
            let star = new Star();
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const order: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'ENEDIS', 'A50');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('System Operator : 17V000000992746D does not exist for Activation Document 8c56459a-794a-4ed1-a7f6-33b0064508f1 creation.');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA missing producer', async () => {
            let star = new Star();
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const order: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745Y', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Producer : 17X000001309745Y does not exist for Activation Document 8c56459a-794a-4ed1-a7f6-33b0064508f1 creation.');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA missing yellow Page', async () => {
            let star = new Star();
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const order: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745Y', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745Y', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Yellow Page : CRIVA1_ENEDIS_Y411 does not exist for Activation Document 8c56459a-794a-4ed1-a7f6-33b0064508f1 creation.');
            }
        });

        it('should return SUCCESS CreateActivationDocument couple HTA', async () => {
            let star = new Star();
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const order: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }
            console.info('typeof=', new Date().toString());

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            const yellowPage = new YellowPages('CRIVA1_ENEDIS_Y411','PDL00000000289766','17V000000992746D');
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));
            await star.CreateActivationDocument(transactionContext, JSON.stringify(order));

            let ret = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(ret).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true}, order ));
        });

        it('should return ERROR CreateActivationDocument couple HTA missing to much optional fields', async () => {
            let star = new Star();
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const order: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                // orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                // senderMarketParticipantMrid: '17V000000992746D', // FK?
                // receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Order must have a limitation value');
            }
        });
    });
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    BEGIN     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test CreateActivationDocument Début HTB RTE', () => {
        it('should return ERROR on CreateActivationDocument NON-JSON Value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.CreateActivationDocument(transactionContext, 'RTE01EIC');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createActivationDocument-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateActivationDocument wrong JSON', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            const errors = [
                'activationDocumentMrid is a compulsory string',
                'businessType is required',
                'measurementUnitName is required',
                'messageType is required',
                'orderEnd is required',
                'orderType is required',
                'originAutomataRegisteredResourceMrid is required',
                'registeredResourceMrid is required'
              ];
              
            try {
                await star.CreateActivationDocument(transactionContext, `{\"riginAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\", \"egisteredResourceMrid\": \"12345678901234\", \"easurementUnitName\": \"KW\",\"essageType\": \"string\",\"usinessType\": \"string\",\"rderType\": \"string\",\"rderEnd\": false}`);
            } catch(err) {
                console.info(err)
                expect(err.errors[0]).to.equal(errors[0]);
                expect(err.errors[1]).to.equal(errors[1]);
                expect(err.errors[2]).to.equal(errors[2]);
                expect(err.errors[3]).to.equal(errors[3]);
                expect(err.errors[4]).to.equal(errors[4]);
                expect(err.errors[5]).to.equal(errors[5]);
                expect(err.errors[6]).to.equal(errors[6]);
                expect(err.errors[7]).to.equal(errors[7]);
                expect(err.message).to.equal('8 errors occurred');
            }
        });

        it('should return ERROR CreateActivationDocument missing activationDocumentMrid', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';

            // `{
            //     \"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\", 
            //     \"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\", 
            //     \"registeredResourceMrid\": \"12345678901234\", 
            //     \"measurementUnitName\": \"KW\",
            //     \"messageType\": \"string\",
            //     \"businessType\": \"string\",
            //     \"orderType\": \"string\",
            //     \"orderEnd\": false,
            // }`

            try {
                await star.CreateActivationDocument(transactionContext, `{\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\", \"registeredResourceMrid\": \"12345678901234\", \"measurementUnitName\": \"KW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('activationDocumentMrid is a compulsory string');
            }
        });

        it('should return ERROR CreateActivationDocument couple HTA wrong MSPID -> RTE', async () => {
            let star = new Star();
            const order: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2 
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            // await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, RTEMSP does not have write access for KW orders');
            }
        });

        it('should return ERROR CreateActivationDocument begin HTB site doesn\'t exist', async () => {
            let star = new Star();
            const order: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2 
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            // await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Site : PDL00000000289766 does not exist for Activation Document 8c56459a-794a-4ed1-a7f6-33b0064508f1 creation.');
            }
        });

        it('should return ERROR CreateActivationDocument begin HTB producer doesn\'t exist', async () => {
            let star = new Star();

            const site: Site = {
                meteringPointMrid: 'PDL00000000289766',
                systemOperatorMarketParticipantMrid: '17V0000009927454',
                producerMarketParticipantMrid: '17X0000013097455',
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
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X0000013097455', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const order: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2 
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            try {
                await star.CreateActivationDocument(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Producer : 17X000001309745X does not exist for Activation Document 8c56459a-794a-4ed1-a7f6-33b0064508f1 creation.');
            }
        });

        it('should return SUCCESS CreateActivationDocument Begining order HTB RTE', async () => {
            let star = new Star();
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const order: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(order));

            let ret = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(ret).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false}, order ));
        });

    });
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    GET     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test GetActivationDocumentByProducer', () => {
        it('should return OK on GetActivationDocumentByProducer empty', async () => {
            let star = new Star();
            const producer = 'toto';
            let ret = await star.GetActivationDocumentByProducer(transactionContext, producer);
            ret = JSON.parse(ret);
            // console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetActivationDocumentByProducer', async () => {
            let star = new Star();

            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const orderA: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V0000009927454', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927466\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            const yellowPage = new YellowPages('CRIVA1_ENEDIS_Y411','PDL00000000289766','17V0000009927454');
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderA));
    
            const orderB: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderB));

            let ret = await star.GetActivationDocumentByProducer(transactionContext, orderA.receiverMarketParticipantMrid);
            ret = JSON.parse(ret);
            console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: ActivationDocument[] = [
                {
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                    businessType: "string",
                    docType: "activationDocument",
                    endCreatedDateTime: new Date().toString(),
                    measurementUnitName: "KW",
                    messageType: "string",
                    orderEnd: false,
                    orderType: "string",
                    orderValue: "1",
                    originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
                    reasonCode: "string",
                    receiverMarketParticipantMrid: "17X000001309745X",
                    reconciliation: true,
                    registeredResourceMrid: "PDL00000000289766",
                    revisionNumber: "1",
                    senderMarketParticipantMrid: "17V0000009927454",
                    startCreatedDateTime: new Date().toString(),
                }, 
                {
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
                    businessType: "string",
                    docType: "activationDocument",
                    endCreatedDateTime: new Date().toString(),
                    measurementUnitName: "MW",
                    messageType: "string",
                    orderEnd: false,
                    orderType: "string",
                    orderValue: "1",
                    originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
                    reasonCode: "string",
                    receiverMarketParticipantMrid: "17X000001309745X",
                    reconciliation: false,
                    registeredResourceMrid: "PDL00000000289766",
                    revisionNumber: "1",
                    senderMarketParticipantMrid: "17V000000992746D",
                    startCreatedDateTime: new Date().toString(),
                }
           ];

            expect(ret).to.eql(expected);
        });

        it('should return SUCCESS on getActivationDocumentByproducer for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746F\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');

            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const orderA: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V0000009927454', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            const yellowPage = new YellowPages('CRIVA1_ENEDIS_Y411','PDL00000000289766','17V0000009927454');
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderA));
    
            const orderB: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745Y', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X000001309745Y', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderB));

            let retB = await star.GetActivationDocumentByProducer(transactionContext, orderB.receiverMarketParticipantMrid);
            retB = JSON.parse(retB);
            // console.log('retB=', retB)
            expect(retB.length).to.equal(2);

            const expected = [
                'non-json-value',
                {
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
                    businessType: "string",
                    docType: "activationDocument",
                    endCreatedDateTime: new Date().toString(),
                    measurementUnitName: "MW",
                    messageType: "string",
                    orderEnd: false,
                    orderType: "string",
                    orderValue: "1",
                    originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
                    reasonCode: "string",
                    receiverMarketParticipantMrid: "17X000001309745Y",
                    reconciliation: false,
                    registeredResourceMrid: "PDL00000000289766",
                    revisionNumber: "1",
                    senderMarketParticipantMrid: "17V000000992746D",
                    startCreatedDateTime: new Date().toString(),
                }
           ];

            expect(retB).to.eql(expected);
        });
   });

    describe('Test GetActivationDocumentBySystemOperator', () => {
        it('should return OK on GetActivationDocumentBySystemOperator empty', async () => {
            let star = new Star();
            const producer = 'toto';
            let ret = await star.GetActivationDocumentBySystemOperator(transactionContext, producer);
            ret = JSON.parse(ret);
            // console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetActivationDocumentBySystemOperator', async () => {
            let star = new Star();

            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const orderA: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V0000009927454', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            const yellowPage = new YellowPages('CRIVA1_ENEDIS_Y411','PDL00000000289766','17V0000009927454');
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderA));
    
            const orderB: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderB));

            let ret = await star.GetActivationDocumentBySystemOperator(transactionContext, orderA.senderMarketParticipantMrid);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: ActivationDocument[] = [
                {
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                    businessType: "string",
                    docType: "activationDocument",
                    endCreatedDateTime: new Date().toString(),
                    measurementUnitName: "KW",
                    messageType: "string",
                    orderEnd: false,
                    orderType: "string",
                    orderValue: "1",
                    originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
                    reasonCode: "string",
                    receiverMarketParticipantMrid: "17X000001309745X",
                    reconciliation: true,
                    registeredResourceMrid: "PDL00000000289766",
                    revisionNumber: "1",
                    senderMarketParticipantMrid: "17V0000009927454",
                    startCreatedDateTime: new Date().toString(),
                }
            ];

            expect(ret).to.eql(expected);
        });

        it('should return SUCCESS on getActivationDocumentBySystemOperator for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746L\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');

            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const orderA: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V0000009927454', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            const yellowPage = new YellowPages('CRIVA1_ENEDIS_Y411','PDL00000000289766','17V0000009927454');
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderA));
    
            const orderB: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V0000009927454', // FK?
                receiverMarketParticipantMrid: '17X000001309745Y', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            // await star.CreateSystemOperator(transactionContext, '17V0000009927454', 'RTE', 'A49');
            await star.createProducer(transactionContext, '17X000001309745Y', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderB));

            let retB = await star.GetActivationDocumentBySystemOperator(transactionContext, orderB.senderMarketParticipantMrid);
            retB = JSON.parse(retB);
            // console.log('retB=', retB)
            expect(retB.length).to.equal(3);

            const expected = [
                'non-json-value',
                {
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                    businessType: "string",
                    docType: "activationDocument",
                    endCreatedDateTime: new Date().toString(),
                    measurementUnitName: "MW",
                    messageType: "string",
                    orderEnd: false,
                    orderType: "string",
                    orderValue: "1",
                    originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
                    reasonCode: "string",
                    receiverMarketParticipantMrid: "17X000001309745X",
                    reconciliation: false,
                    registeredResourceMrid: "PDL00000000289766",
                    revisionNumber: "1",
                    senderMarketParticipantMrid: "17V0000009927454",
                    startCreatedDateTime: new Date().toString(),
                },
                {
              
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
                    businessType: "string",
                    docType: "activationDocument",
                    endCreatedDateTime: new Date().toString(),
                    measurementUnitName: "MW",
                    messageType: "string",
                    orderEnd: false,
                    orderType: "string",
                    orderValue: "1",
                    originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
                    reasonCode: "string",
                    receiverMarketParticipantMrid: "17X000001309745Y",
                    reconciliation: false,
                    registeredResourceMrid: "PDL00000000289766",
                    revisionNumber: "1",
                    senderMarketParticipantMrid: "17V0000009927454",
                    startCreatedDateTime: new Date().toString(),
                }
           ];

            expect(retB).to.eql(expected);
        });
    });
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    BB/BE     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test OrderEnd RTE', () => {
        it('should return SUCCESS CreateActivationDocument end order HTB RTE for NON-JSON value', async () => {
            let star = new Star();

            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });


            // chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.CreateSystemOperator(transactionContext, '17V0000009927454', 'Enedis', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');

            // const order: ActivationDocument = {

            //     activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
            //     originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
            //     registeredResourceMrid: 'PDL00000000289766', // FK2
            //     measurementUnitName: 'MW',
            //     messageType: 'string',
            //     businessType: 'string',
            //     orderType: 'string',
            //     orderEnd: false,
    
            //     orderValue: '1',
            //     startCreatedDateTime: new Date().toString(),
            //     // testDateTime: 'Date', // Test DELETE ME //////////////////////
            //     // endCreatedDateTime: new Date().toString(),
            //     revisionNumber: '1',
            //     reasonCode: 'string', // optionnal in case of TVC modulation
            //     senderMarketParticipantMrid: '17V000000992746D', // FK?
            //     receiverMarketParticipantMrid: '17X000001309745X', // FK?
            //     // reconciliation: false,
            //     // subOrderList: [],
            // }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"1\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            // await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.createSite(transactionContext, JSON.stringify(site));
            chaincodeStub.MspiID = 'RTEMSP';

            // await star.CreateActivationDocument(transactionContext, JSON.stringify(order));

            const orderEnd: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: true,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                subOrderList: [''],
            }
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderEnd));


            // let ret = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            // expect(ret).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f2']}, order ));
            let retEnd = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retEnd).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false}, orderEnd ));
        });

        it('should return SUCCESS CreateActivationDocument end order HTB RTE', async () => {
            let star = new Star();
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const order: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(order));

            const orderEnd: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: true,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderEnd));


            let ret = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(ret).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f2']}, order ));
            let retEnd = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retEnd).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f1']}, orderEnd ));
        });

        it('should return SUCCESS CreateActivationDocument end order HTB RTE for coverage', async () => {
            let star = new Star();

            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.createSite(transactionContext, JSON.stringify(site));

            const order: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                subOrderList: [],
            }

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            await star.CreateActivationDocument(transactionContext, JSON.stringify(order));

            const orderEnd: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: true,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                subOrderList: [],
            }
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderEnd));

            order.subOrderList = ['8c56459a-794a-4ed1-a7f6-33b0064508f2'];
            orderEnd.subOrderList = ['8c56459a-794a-4ed1-a7f6-33b0064508f1'];
            let ret = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(ret).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true}, order ));
            let retEnd = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retEnd).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f1']}, orderEnd ));
        });
    });
    describe('Test BB/BE reconciliations', () => {

        it('should return SUCCESS CreateActivationDocument couple HTA with BB reconciliation', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746Y\",\"marketParticipantName\": \"ENEDis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X0000013097454', 'EolienFR vert Cie', 'A21');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',marketEvaluationPointMrid: 'string',schedulingEntityRegisteredResourceMrid:'string',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.createSite(transactionContext, JSON.stringify(site));
            const yellowPage = new YellowPages('CRIVA1_ENEDIS_Y411','PDL00000000289766','17V000000992746D');
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));

            const orderBegin: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'PDL00000000289766', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17V000000992746Y', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderBegin));

            // chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.CreateSystemOperator(transactionContext, '17V0000009927454', 'Enedis', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            // await star.createSite(transactionContext, JSON.stringify(site));

            const orderCouple: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderCouple));

            let retBegin = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(retBegin).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f2']}, orderBegin ));
            let retCouple = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retCouple).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f1']}, orderCouple ));
        });

        it('should return SUCCESS CreateActivationDocument couple HTA with BB reconciliation for coverage', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746Y\",\"marketParticipantName\": \"ENEDis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X0000013097454', 'EolienFR vert Cie', 'A21');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',marketEvaluationPointMrid: 'string',schedulingEntityRegisteredResourceMrid:'string',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.createSite(transactionContext, JSON.stringify(site));
            const yellowPage = new YellowPages('CRIVA1_ENEDIS_Y411','PDL00000000289766','17V000000992746D');
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));

            const orderBegin: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'PDL00000000289766', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17V000000992746Y', // FK?
                // reconciliation: false,
                subOrderList: [],
            }
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderBegin));

            // chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.CreateSystemOperator(transactionContext, '17V0000009927454', 'Enedis', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            // await star.createSite(transactionContext, JSON.stringify(site));

            const orderCouple: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderCouple));
            
            orderBegin.subOrderList= ['8c56459a-794a-4ed1-a7f6-33b0064508f2'];
            let retBegin = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(retBegin).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false}, orderBegin ));

            orderCouple.subOrderList= ['8c56459a-794a-4ed1-a7f6-33b0064508f1'];
            let retCouple = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retCouple).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true}, orderCouple ));
        });

        it('should return SUCCESS CreateActivationDocument couple HTA with BB and BE reconciliation', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746Y\",\"marketParticipantName\": \"ENEDis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X0000013097454', 'EolienFR vert Cie', 'A21');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',marketEvaluationPointMrid: 'string',schedulingEntityRegisteredResourceMrid:'string',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.createSite(transactionContext, JSON.stringify(site));
            const yellowPage = new YellowPages('CRIVA1_ENEDIS_Y411','PDL00000000289766','17V000000992746D');
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));

            const orderBegin: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'PDL00000000289766', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17V000000992746Y', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderBegin));

            // chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.CreateSystemOperator(transactionContext, '17V0000009927454', 'Enedis', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            // await star.createSite(transactionContext, JSON.stringify(site));

            const orderCouple: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderCouple));

            const orderEnd: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f3', // PK
                originAutomataRegisteredResourceMrid: 'PDL00000000289766', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: true,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderEnd));

            let retEnd = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f3")).toString());
            expect(retEnd).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f1']}, orderEnd ));
            let retCouple = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retCouple).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f1']}, orderCouple ));
            let retBegin = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(retBegin).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f2','8c56459a-794a-4ed1-a7f6-33b0064508f3']}, orderBegin ));
        });

        it('should return SUCCESS CreateActivationDocument couple HTA with BB and BE reconciliation for coverage', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746Y\",\"marketParticipantName\": \"ENEDis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.createProducer(transactionContext, '17X0000013097454', 'EolienFR vert Cie', 'A21');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',marketEvaluationPointMrid: 'string',schedulingEntityRegisteredResourceMrid:'string',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.createSite(transactionContext, JSON.stringify(site));
            const yellowPage = new YellowPages('CRIVA1_ENEDIS_Y411','PDL00000000289766','17V000000992746D');
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));

            const orderBegin: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f1', // PK
                originAutomataRegisteredResourceMrid: 'PDL00000000289766', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17V000000992746Y', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderBegin));

            // chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.CreateSystemOperator(transactionContext, '17V0000009927454', 'Enedis', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            // await star.createSite(transactionContext, JSON.stringify(site));

            const orderCouple: ActivationDocument = {

                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f2', // PK
                originAutomataRegisteredResourceMrid: 'CRIVA1_ENEDIS_Y411', // FK1
                registeredResourceMrid: 'PDL00000000289766', // FK2
                measurementUnitName: 'KW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: false,

                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }

            chaincodeStub.MspiID = 'ENEDISMSP';
            const siteB: Site = {meteringPointMrid: 'PDL00000000289769',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.createSite(transactionContext, JSON.stringify(siteB));
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderCouple));

            const orderEnd: ActivationDocument = {
                activationDocumentMrid: '8c56459a-794a-4ed1-a7f6-33b0064508f3', // PK
                originAutomataRegisteredResourceMrid: 'PDL00000000289766', // FK1
                registeredResourceMrid: 'PDL00000000289769', // FK2
                measurementUnitName: 'MW',
                messageType: 'string',
                businessType: 'string',
                orderType: 'string',
                orderEnd: true,
    
                orderValue: '1',
                startCreatedDateTime: new Date().toString(),
                // testDateTime: 'Date', // Test DELETE ME //////////////////////
                // endCreatedDateTime: new Date().toString(),
                revisionNumber: '1',
                reasonCode: 'string', // optionnal in case of TVC modulation
                senderMarketParticipantMrid: '17V000000992746D', // FK?
                receiverMarketParticipantMrid: '17X000001309745X', // FK?
                // reconciliation: false,
                // subOrderList: [],
            }
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateActivationDocument(transactionContext, JSON.stringify(orderEnd));

            let retEnd = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f3")).toString());
            expect(retEnd).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false}, orderEnd ));
            let retCouple = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retCouple).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f1']}, orderCouple ));
            let retBegin = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(retBegin).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f2']}, orderBegin ));
        });
    });
});