
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'
import { Site } from '../src/model/site';
import { EnergyAmount } from '../src/model/energyAmount';
import { ActivationDocument } from '../src/model/activationDocument';

let assert = sinon.assert;
chai.use(sinonChai);

describe('Star Tests EnergyAmount', () => {
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
                // console.log('IN QUERY RESULT =', chaincodeStub.states)
                if (chaincodeStub.states) {
                    const copied = Object.assign({}, chaincodeStub.states);
                    for (let key in copied) {
                        // console.log('copied[key]=', copied[key].toString());
                        if (copied[key] == 'non-json-value') { 
                            // console.log('IN IF copied[key]=', copied[key]);

                            yield {value: copied[key]};
                            continue
                        }
                        const obJson = JSON.parse(copied[key].toString('utf8'));
                        // console.log('obJson=', obJson);
                        const objStr: string = obJson.docType;
                        // console.log('querystring=', query);
                        const queryJson = JSON.parse(query);
                        // console.log('queryJson=', queryJson);
                        const queryStr = queryJson.selector.docType
                        // console.log('queryStr=', queryStr , 'objStr=', objStr);
                        if (queryStr == objStr) {
                            // if (queryJson.selector.systemOperatorMarketParticipantMrId) {
                                const queryM = queryJson.selector.registeredResourceMrid;
                                // console.log('queryM=', queryM);
                                const objM = obJson.registeredResourceMrid;
                                // console.log('objM=', objM);
                                if (queryM == objM) {
                                    // console.log('obJson.createdDateTime=', obJson.createdDateTime);
                                    const objDate = new Date(obJson.createdDateTime)
                                    // console.log ('objDate=', objDate);

                                    // console.log('queryJson.createdDateTime=', queryJson.selector.createdDateTime);
                                    const queryDate = new Date(queryJson.selector.createdDateTime['$gte'])
                                    // console.log ('queryDate=', queryDate);

                                    // console.log('queryJson.deleteMeTime=', queryJson.selector.deleteMeTime);
                                    // console.log(queryJson.selector.deleteMeTime,'=',obJson.createdDateTime)
                                    // if (obJson.createdDateTime == queryJson.selector.deleteMeTime) {
                                    //     yield {value: copied[key]};
                                    // }
                                    // console.log(objDate.getUTCFullYear(), objDate.getUTCMonth(), objDate.getUTCDate());
                                    // console.log(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate());
                                    if (objDate.getUTCFullYear() == queryDate.getUTCFullYear() &&
                                        objDate.getUTCMonth() == queryDate.getUTCMonth() &&
                                        objDate.getUTCDate() == queryDate.getUTCDate()) 
                                    {
                                        yield {value: copied[key]};
                                    }

                                }
                                // const queryS = queryJson.selector.senderMarketParticipantMrid;
                                // // console.log('queryS=', queryS);
                                // const objS = obJson.senderMarketParticipantMrid;
                                // // console.log('objS=', objS);
                                // if (queryS == objS) {
                                //     // console.log('yield=', queryS, objS);
                                //     yield {value: copied[key]};
                                // }
                                
                                // const queryM = queryJson.selector.registeredResourceMrid;
                                // // console.log('queryM=', queryM);
                                // const objM = obJson.registeredResourceMrid;
                                // // console.log('objM=', objM);
                                // if (queryM == objM && queryJson.selector.reconciliation == obJson.reconciliation) {
                                //     // console.log('yield=', queryM, objM);
                                //     yield {value: copied[key]};
                                // }
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
                        // console.log('end of loop')
                    }
                } 
                // else {
                //     console.log('Query result =>EEEEELLLLLLLSSSSSSEEEEE')
                // }
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
///////////////////////////////     ENE      ///////////////////////////////
////////////////////////////////////////////////////////////////////////////

    describe('Test CreateTSOEnergyAmount', () => {
        it('should return ERROR CreateTSOEnergyAmount check mandatory fields', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            const errors = [
                'activationDocumentMrid is a compulsory string',
                'areaDomain is a compulsory string',
                'createdDateTime is a compulsory string',
                'energyAmountMarketDocumentMrid is a compulsory string',
                'measurementUnitName is a compulsory string',
                'quantity is a compulsory string',
                'receiverMarketParticipantMrid is a compulsory string',
                'receiverMarketParticipantRole is a compulsory string',
                'registeredResourceMrid is a compulsory string',
                'senderMarketParticipantMrid is a compulsory string',
                'senderMarketParticipantRole is a compulsory string',
                'timeInterval is a compulsory string'
            ];
              
            try {
                await star.CreateTSOEnergyAmount(transactionContext, 
                    `{\"nergyAmountMarketDocumentMrid\": \"ea4cef73-ff6b-400b-8957-d34000eb30a1\",\"ctivationDocumentMrid\": \"string\",\"egisteredResourceMrid\": \"PRM50012536123456\",\"uantity\": \"number\",\"easurementUnitName\": \"KW\",\"evisionNumber\": \"1\",\"usinessType\": \"A14 / Z14\",\"ocStatus\": \"A02\",\"rocessType\": \"A05\",\"lassificationType\": \"A02\",\"reaDomain\": \"17X100A100A0001A\",\"enderMarketParticipantMrid\": \"17V0000009927454\",\"enderMarketParticipantRole\": \"A50\",\"eceiverMarketParticipantMrid\": \"Producteur1\",\"eceiverMarketParticipantRole\": \"A32\",\"reatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"imeInterval\": \"2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z\"}`
                );
            } catch(err) {
                // console.info(err)
                expect(err.errors[0]).to.equal(errors[0]);
                expect(err.errors[1]).to.equal(errors[1]);
                expect(err.errors[2]).to.equal(errors[2]);
                expect(err.errors[3]).to.equal(errors[3]);
                expect(err.errors[4]).to.equal(errors[4]);
                expect(err.errors[5]).to.equal(errors[5]);
                expect(err.errors[6]).to.equal(errors[6]);
                expect(err.errors[7]).to.equal(errors[7]);
                expect(err.errors[8]).to.equal(errors[8]);
                expect(err.errors[9]).to.equal(errors[9]);
                expect(err.errors[10]).to.equal(errors[10]);
                expect(err.errors[11]).to.equal(errors[11]);
                expect(err.message).to.equal('12 errors occurred');
            }
        });

        it('should return ERROR on CreateTSOEnergyAmount NON-JSON Value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.CreateTSOEnergyAmount(transactionContext, 'RTE01EIC');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createEnergyAmount-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateTSOEnergyAmount Wrong MSPID', async () => {
            let star = new Star();
            const nrj : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "string",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V0000009927454",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have write access for Energy Amount.');
            }
        });

        it('should return ERROR CreateTSOEnergyAmount missing Activation Document.', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';

            const nrj : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "string",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                // revisionNumber: "1",
                // businessType: "A14 / Z14",
                // docStatus: "A02",
                // processType: "A05",
                // classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V0000009927454",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ActivationDocument : string does not exist for Energy Amount ea4cef73-ff6b-400b-8957-d34000eb30a1 creation.');
            }
        });

        it('should return SUCCESS CreateTSOEnergyAmount.', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V0000009927454",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };
            await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj));

            let ret = JSON.parse((await chaincodeStub.getState(nrj.energyAmountMarketDocumentMrid)).toString());
            expect(ret).to.eql( Object.assign({docType: 'energyAmount'}, nrj ));
        });

        it('should return ERROR CreateTSOEnergyAmount Broken ActivationDocument.', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V0000009927454",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            chaincodeStub.states['8c56459a-794a-4ed1-a7f6-33b0064508f1'] = 'non-json-value';
            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createEnergyAmount getActivationDocument-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateTSOEnergyAmount Broken ActivationDocument.site.', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V0000009927454",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            let obj : ActivationDocument = JSON.parse(chaincodeStub.states['8c56459a-794a-4ed1-a7f6-33b0064508f1'].toString());
            // console.log(obj);
            obj.registeredResourceMrid = 'toto';
            // console.log(obj);
            chaincodeStub.states['8c56459a-794a-4ed1-a7f6-33b0064508f1'] = Buffer.from(JSON.stringify(obj)); 
            // console.log(chaincodeStub.states['8c56459a-794a-4ed1-a7f6-33b0064508f1'].toString());
            // console.log(chaincodeStub.states);
            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Site : toto does not exist in Activation Document : 8c56459a-794a-4ed1-a7f6-33b0064508f1 for Energy Amount : ea4cef73-ff6b-400b-8957-d34000eb30a1 creation.');
            }
        });

        it('should return ERROR CreateTSOEnergyAmount Broken Site.', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V0000009927454",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            chaincodeStub.states['PRM50012536123456'] = 'non-json-value';
            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createEnergyAmount getSite-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateTSOEnergyAmount mismatch registeredResourceMrid.', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "toto",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V0000009927454",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createEnergyAmount mismatch beetween registeredResourceMrid in Activation Document : PRM50012536123456 and Energy Amount : toto.');
            }
        });

        it('should return ERROR CreateTSOEnergyAmount mismatch date timeInterval.', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V0000009927454",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-23T23:59:59.999Z",
            };

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createEnergyAmount mismatch in timeInterval both date must be the same day.("2021-10-22T00:00:00.000Z" vs "2021-10-23T00:00:00.000Z")');
            }
        });

        it('should return ERROR CreateTSOEnergyAmount mismatch date.', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-23T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V0000009927454",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createEnergyAmount mismatch between ENE : "2021-10-22T00:00:00.000Z" and Activation Document : "2021-10-23T00:00:00.000Z" dates.');
            }
        });
    });

////////////////////////////////////////////////////////////////////////////
///////////////////////////////     ENI      ///////////////////////////////
////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////
/////////////////////////////     GET ENE      /////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test GetEnergyAmountForSystemOperator.', () => {
        it('should return ERROR on GetEnergyAmountForSystemOperator no systemOperator', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            const producer = 'toto';
            try {
                await star.GetEnergyAmountForSystemOperator(transactionContext, producer, producer, producer);
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('System Operator : toto does not exist for Energy Amount read.');
            }
        });

        it('should return SUCCESS on GetEnergyAmountForSystemOperator. empty', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            const producer = 'toto';
            let ret = await star.GetEnergyAmountForSystemOperator(transactionContext, producer, '17V0000009927454', "date");
            ret = JSON.parse(ret);
            // console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return ERROR on GetEnergyAmountForSystemOperator. Wrong MSPID', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'FakeMspID';
            try {
                await star.GetEnergyAmountForSystemOperator(transactionContext, 'titi', 'toto', 'tata');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have read access for Energy Amount.');
            }
        });

        it('should return ERROR on GetEnergyAmountForSystemOperator. Wrong SystemOperator', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj1 : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };
            await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj1));

            try {
                await star.GetEnergyAmountForSystemOperator(transactionContext, nrj1.registeredResourceMrid, '17V0000009927454', nrj1.createdDateTime);
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Energy Amount, sender: RTEMSP does not provide his own systemOperatorEicCode therefore he does not have read access.');
            }
        });

        it('should return ERROR on GetEnergyAmountForSystemOperator. Broken SystemOperator', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj1 : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };
            await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj1));

            chaincodeStub.states['17V000000992746D'] = 'non-json-value';
            try {
                await star.GetEnergyAmountForSystemOperator(transactionContext, nrj1.registeredResourceMrid, nrj1.senderMarketParticipantMrid, nrj1.createdDateTime);
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createEnergyAmount getSystemOperator-> Input string NON-JSON value');
            }
        });

        it('should return SUCCESS on GetEnergyAmountForSystemOperator.', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj1 : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAmountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'energyAmount'}, nrj1 ));

            // const nrj2 : EnergyAmount = {
            //     energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
            //     meteringPointMrid: "PRM50012536123456",
            //     // marketEvaluationPointMrid: "CodePPE",
            //     areaDomain: "17X100A100A0001A",
            //     senderMarketParticipantMrid: "17V0000009927454",
            //     senderMarketParticipantRole: "A50",
            //     receiverMarketParticipantMrid: "Producteur1",
            //     receiverMarketParticipantRole: "A32",
            //     createdDateTime: "2021-10-22T10:29:10.000Z",
            //     measurementUnitName: "KW",
            //     timeInterval: "2021-10-22T10:29:10.000Z",
            //     resolution: "PT10M",
            //     timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
            //     revisionNumber: "1",
            //     businessType: "A14 / Z14",
            //     docStatus: "A02",
            //     processType: "A05",
            //     classificationType: "A02",
            //     product: "Energie active/Réactive",
            // };

            // await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj2));
            // let ret2 = JSON.parse((await chaincodeStub.getState(nrj2.energyAmountMarketDocumentMrid)).toString());
            // // console.log("ret2=", ret2);
            // expect(ret2).to.eql( Object.assign({docType: 'energyAmount'}, nrj2 ));

            let ret = await star.GetEnergyAmountForSystemOperator(transactionContext, nrj1.registeredResourceMrid, nrj1.senderMarketParticipantMrid, nrj1.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAmount[] = [
                {
                    docType: "energyAmount",
                    energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                    registeredResourceMrid: "PRM50012536123456",
                    quantity: "number",
                    measurementUnitName: "KW",
                    revisionNumber: "1",
                    businessType: "A14 / Z14",
                    docStatus: "A02",
                    processType: "A05",
                    classificationType: "A02",
                    areaDomain: "17X100A100A0001A",
                    senderMarketParticipantMrid: "17V000000992746D",
                    senderMarketParticipantRole: "A50",
                    receiverMarketParticipantMrid: "Producteur1",
                    receiverMarketParticipantRole: "A32",
                    createdDateTime: "2021-10-22T10:29:10.000Z",
                    timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
                }
            ];

            expect(ret).to.eql(expected);
        });

        it('should return SUCCESS on GetEnergyAmountForSystemOperator. for non JSON value.', async () => {
            let star = new Star();

            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"bulshit\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f2\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-23T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj1 : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAmountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'energyAmount'}, nrj1 ));

            const nrj2 : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-23T10:29:10.000Z",
                timeInterval: "2021-10-23T01:01:01.001Z / 2021-10-23T23:59:59.999Z",
            };

            await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj2));
            let ret2 = JSON.parse((await chaincodeStub.getState(nrj2.energyAmountMarketDocumentMrid)).toString());
            // console.log("ret2=", ret2);
            expect(ret2).to.eql( Object.assign({docType: 'energyAmount'}, nrj2 ));


            let ret = await star.GetEnergyAmountForSystemOperator(transactionContext, nrj1.registeredResourceMrid, nrj1.senderMarketParticipantMrid, nrj1.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected = [
                "non-json-value",
                {
                    docType: "energyAmount",
                    energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                    registeredResourceMrid: "PRM50012536123456",
                    quantity: "number",
                    measurementUnitName: "KW",
                    revisionNumber: "1",
                    businessType: "A14 / Z14",
                    docStatus: "A02",
                    processType: "A05",
                    classificationType: "A02",
                    areaDomain: "17X100A100A0001A",
                    senderMarketParticipantMrid: "17V000000992746D",
                    senderMarketParticipantRole: "A50",
                    receiverMarketParticipantMrid: "Producteur1",
                    receiverMarketParticipantRole: "A32",
                    createdDateTime: "2021-10-22T10:29:10.000Z",
                    timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
                }
            ];

            expect(ret).to.eql(expected);
        });
    });

    describe('Test GetEnergyAmountByProducer', () => {
        it('should return ERROR on GetEnergyAmountByProducer Wrong MSPID', async () => {
            let star = new Star();
            try {
                await star.GetEnergyAmountByProducer(transactionContext, 'titi', 'toto', 'tata');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have read access for producer\'s Energy Amount.');
            }
        });

        it('should return OK on GetEnergyAmountByProducer empty', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'PRODUCERMSP';
            const producer = 'toto';
            let ret = await star.GetEnergyAmountByProducer(transactionContext, producer, '17V0000009927454', "date");
            ret = JSON.parse(ret);
            // console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetEnergyAmountByProducer', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj1 : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAmountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'energyAmount'}, nrj1 ));

            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f2\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123457\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');
            const nrj2 : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
                registeredResourceMrid: "PRM50012536123457",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj2));
            let ret2 = JSON.parse((await chaincodeStub.getState(nrj2.energyAmountMarketDocumentMrid)).toString());
            // console.log("ret2=", ret2);
            expect(ret2).to.eql( Object.assign({docType: 'energyAmount'}, nrj2 ));

            chaincodeStub.MspiID = 'PRODUCERMSP';
            let ret = await star.GetEnergyAmountByProducer(transactionContext, nrj1.registeredResourceMrid, nrj1.receiverMarketParticipantMrid, nrj1.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAmount[] = [
                {
                    docType: "energyAmount",
                    energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                    registeredResourceMrid: "PRM50012536123456",
                    quantity: "number",
                    measurementUnitName: "KW",
                    revisionNumber: "1",
                    businessType: "A14 / Z14",
                    docStatus: "A02",
                    processType: "A05",
                    classificationType: "A02",
                    areaDomain: "17X100A100A0001A",
                    senderMarketParticipantMrid: "17V000000992746D",
                    senderMarketParticipantRole: "A50",
                    receiverMarketParticipantMrid: "Producteur1",
                    receiverMarketParticipantRole: "A32",
                    createdDateTime: "2021-10-22T10:29:10.000Z",
                    timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
                }
           ];

            expect(ret).to.eql(expected);
        });

        it('should return SUCCESS on getEnergyAmountByProducer for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"bulshit\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

            const nrj1 : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                registeredResourceMrid: "PRM50012536123456",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAmountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'energyAmount'}, nrj1 ));

            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
            await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f2\",\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123457\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');
            const nrj2 : EnergyAmount = {
                energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
                activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
                registeredResourceMrid: "PRM50012536123457",
                quantity: "number",
                measurementUnitName: "KW",
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
            };

            await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj2));
            let ret2 = JSON.parse((await chaincodeStub.getState(nrj2.energyAmountMarketDocumentMrid)).toString());
            // console.log("ret2=", ret2);
            expect(ret2).to.eql( Object.assign({docType: 'energyAmount'}, nrj2 ));

            chaincodeStub.MspiID = 'PRODUCERMSP';
            let ret = await star.GetEnergyAmountByProducer(transactionContext, nrj1.registeredResourceMrid, nrj1.receiverMarketParticipantMrid, nrj1.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected = [
                'non-json-value',
                {
                    docType: "energyAmount",
                    energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                    activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
                    registeredResourceMrid: "PRM50012536123456",
                    quantity: "number",
                    measurementUnitName: "KW",
                    revisionNumber: "1",
                    businessType: "A14 / Z14",
                    docStatus: "A02",
                    processType: "A05",
                    classificationType: "A02",
                    areaDomain: "17X100A100A0001A",
                    senderMarketParticipantMrid: "17V000000992746D",
                    senderMarketParticipantRole: "A50",
                    receiverMarketParticipantMrid: "Producteur1",
                    receiverMarketParticipantRole: "A32",
                    createdDateTime: "2021-10-22T10:29:10.000Z",
                    timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
                }
           ];

            expect(ret).to.eql(expected);
        });
    });
});