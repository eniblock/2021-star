
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'
import { Site } from '../src/model/site';
import { EnergyAccount } from '../src/model/energyAccount';
import { YellowPages } from '../src/model/yellowPages';
import { date } from 'yup/lib/locale';

let assert = sinon.assert;
chai.use(sinonChai);

describe('Star Tests ReferenceEnergyAccount', () => {
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
                        console.log('queryStr=', queryStr , 'objStr=', objStr);
                        if (queryStr == objStr) {
                            // if (queryJson.selector.systemOperatorMarketParticipantMrid) {
                                const queryM = queryJson.selector.meteringPointMrid;
                                console.log('queryM=', queryM);
                                const objM = obJson.meteringPointMrid;
                                console.log('objM=', objM);
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

/*
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    WRITE     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
*/

    describe('Test CreateReferenceEnergyAccount HTB', () => {
        it('should return ERROR on CreateReferenceEnergyAccount NON-JSON Value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'rte';
            try {
                await star.CreateReferenceEnergyAccount(transactionContext, 'RTE01EIC');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount Site non-JSON value', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123457",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            chaincodeStub.states['PRM50012536123457'] = 'non-json-value';
            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount getSite-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount Producer non-JSON value', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123457",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            chaincodeStub.states['17V000000992746D'] = 'non-json-value';
            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount getSystemOperator-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount Wrong MSPID', async () => {
            let star = new Star();

            // const date = new Date(1634898550000);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123457",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have write access for Reference Energy Account.');
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount missing Site', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            // await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123457",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Site : PRM50012536123457 does not exist for Reference Energy Account ea4cef73-ff6b-400b-8957-d34000eb30a3 creation.');
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount missing System Operator', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123457",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746666",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('System Operator : 17V000000992746666 does not exist for Reference Energy Account ea4cef73-ff6b-400b-8957-d34000eb30a3 creation.');
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount wrong sender', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'enedis';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123457",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V0000009927454",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Reference Energy Account, mismatch sender: rte does not have write access for ea4cef73-ff6b-400b-8957-d34000eb30a3 creation.');
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount missing marketEvaluationPointMrid', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123457",
                // marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount, missing marketEvaluationPointMrid.');
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount missing processType', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123457",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                // processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount, missing processType.');
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount mismatch ', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            chaincodeStub.MspiID = 'enedis';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            const site2: Site = {meteringPointMrid: 'PRM50012536123456',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.CreateSite(transactionContext, JSON.stringify(site2));

            // const date = new Date(1634898550000);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123456",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };


            chaincodeStub.MspiID = 'rte';
            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Reference Energy Account, sender: 17V000000992746D is not the same as site.systemOperator: 17V0000009927454 in EnergyAccount creation.');
            }
        });

        it('should return SUCCESS CreateReferenceEnergyAccount HTB', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123457",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };
            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj));

            let ret = JSON.parse((await chaincodeStub.getState(nrj.energyAccountMarketDocumentMrid)).toString());
            expect(ret).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj ));
        });
    });


////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    READ     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test GetReferenceEnergyAccountForSystemOperator', () => {
        it('should return ERROR on GetReferenceEnergyAccount no systemOperator', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'rte';
            const producer = 'toto';
            try {
                await star.GetReferenceEnergyAccountForSystemOperator(transactionContext, producer, producer, producer);
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('System Operator : toto does not exist for Reference Energy Account read.');
            }
        });

        it('should return ERROR on GetReferenceEnergyAccountForSystemOperator wrong MSPID', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj1 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123457",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj1 ));

            chaincodeStub.MspiID = 'TOTOMSP';
            try {
                await star.GetReferenceEnergyAccountForSystemOperator(transactionContext, nrj1.meteringPointMrid, nrj1.senderMarketParticipantMrid, nrj1.createdDateTime);
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Organisation, TOTOMSP does not have read access for Reference Energy Account.');
            }
        });

        it('should return ERROR on GetReferenceEnergyAccountForSystemOperator Broken SystemOperator', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj1 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123457",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };
            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj1 ));

            chaincodeStub.states['17V000000992746D'] = 'non-json-value';
            try {
                await star.GetReferenceEnergyAccountForSystemOperator(transactionContext, nrj1.meteringPointMrid, nrj1.senderMarketParticipantMrid, nrj1.createdDateTime);
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount getSystemOperator-> Input string NON-JSON value');
            }
        });

        it('should return SUCCESS on GetReferenceEnergyAccountForSystemOperator', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj1 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123457",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };
            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj1));


            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj1 ));

            const nrj2 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a4",
                meteringPointMrid: "PRM50012536123457",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj2));
            let ret2 = JSON.parse((await chaincodeStub.getState(nrj2.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret2=", ret2);
            expect(ret2).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj2 ));

            let ret = await star.GetReferenceEnergyAccountForSystemOperator(transactionContext, nrj1.meteringPointMrid, nrj1.senderMarketParticipantMrid, nrj1.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: EnergyAccount[] = [
                {
                    docType: "referenceEnergyAccount",
                    energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                    meteringPointMrid: "PRM50012536123457",
                    marketEvaluationPointMrid: "CodePPE",
                    areaDomain: "17X100A100A0001A",
                    senderMarketParticipantMrid: "17V000000992746D",
                    senderMarketParticipantRole: "A50",
                    receiverMarketParticipantMrid: "Producteur1",
                    receiverMarketParticipantRole: "A32",
                    createdDateTime: "2021-10-22T10:29:10.000Z",
                    measurementUnitName: "KW",
                    timeInterval: "2021-10-22T10:29:10.000Z",
                    resolution: "PT10M",
                    timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                    revisionNumber: "1",
                    businessType: "A14 / Z14",
                    docStatus: "A02",
                    processType: "A05",
                    classificationType: "A02",
                    product: "Energie active/Réactive",
                },
                {
                    docType: "referenceEnergyAccount",
                    energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a4",
                    meteringPointMrid: "PRM50012536123457",
                    marketEvaluationPointMrid: "CodePPE",
                    areaDomain: "17X100A100A0001A",
                    senderMarketParticipantMrid: "17V000000992746D",
                    senderMarketParticipantRole: "A50",
                    receiverMarketParticipantMrid: "Producteur2",
                    receiverMarketParticipantRole: "A32",
                    createdDateTime: "2021-10-22T10:29:10.000Z",
                    measurementUnitName: "KW",
                    timeInterval: "2021-10-22T10:29:10.000Z",
                    resolution: "PT10M",
                    timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                    revisionNumber: "1",
                    businessType: "A14 / Z14",
                    docStatus: "A02",
                    processType: "A05",
                    classificationType: "A02",
                    product: "Energie active/Réactive",
                }
           ];

            expect(ret).to.eql(expected);
        });

        it('should return SUCCESS on GetReferenceEnergyAccountForSystemOperator for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"toto\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj1 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                meteringPointMrid: "PRM50012536123456",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-21T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-21T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj1 ));

            const nrj2 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
                meteringPointMrid: "PRM50012536123456",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj2));
            let ret2 = JSON.parse((await chaincodeStub.getState(nrj2.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret2=", ret2);
            expect(ret2).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj2 ));

            let ret = await star.GetReferenceEnergyAccountForSystemOperator(transactionContext, nrj1.meteringPointMrid, nrj1.senderMarketParticipantMrid, nrj1.createdDateTime);
            ret = JSON.parse(ret);
        //     // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected = [
                "non-json-value",
                {
                    docType: "referenceEnergyAccount",
                    energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                    meteringPointMrid: "PRM50012536123456",
                    marketEvaluationPointMrid: "CodePPE",
                    areaDomain: "17X100A100A0001A",
                    senderMarketParticipantMrid: "17V000000992746D",
                    senderMarketParticipantRole: "A50",
                    receiverMarketParticipantMrid: "Producteur1",
                    receiverMarketParticipantRole: "A32",
                    createdDateTime: "2021-10-21T10:29:10.000Z",
                    measurementUnitName: "KW",
                    timeInterval: "2021-10-21T10:29:10.000Z",
                    resolution: "PT10M",
                    timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                    revisionNumber: "1",
                    businessType: "A14 / Z14",
                    docStatus: "A02",
                    processType: "A05",
                    classificationType: "A02",
                    product: "Energie active/Réactive",
                }
           ];

            expect(ret).to.eql(expected);
        });
    });

    describe('Test GetReferenceEnergyAccountByProducer', () => {
        it('should return Error on GetReferenceEnergyAccountByProducer Wrong MSPID', async () => {
            let star = new Star();
            try {
                await star.GetReferenceEnergyAccountByProducer(transactionContext, 'titi', 'toto', 'tata');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have read access for producer\'s Reference Energy Account.');
            }
        });

        it('should return OK on GetReferenceEnergyAccountByProducer empty', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'producer';
            const producer = 'toto';
            let ret = await star.GetReferenceEnergyAccountByProducer(transactionContext, producer, '17V0000009927454', "date");
            ret = JSON.parse(ret);
            // console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetReferenceEnergyAccountByProducer', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            const nrj1 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                meteringPointMrid: "PRM50012536123456",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-21T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-21T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj1 ));

            const nrj2 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
                meteringPointMrid: "PRM50012536123456",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj2));
            let ret2 = JSON.parse((await chaincodeStub.getState(nrj2.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret2=", ret2);
            expect(ret2).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj2 ));

            chaincodeStub.MspiID = 'producer';
            let ret = await star.GetReferenceEnergyAccountByProducer(transactionContext, nrj1.meteringPointMrid, nrj1.receiverMarketParticipantMrid, nrj1.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAccount[] = [
                {
                    docType: "referenceEnergyAccount",
                    energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                    meteringPointMrid: "PRM50012536123456",
                    marketEvaluationPointMrid: "CodePPE",
                    areaDomain: "17X100A100A0001A",
                    senderMarketParticipantMrid: "17V000000992746D",
                    senderMarketParticipantRole: "A50",
                    receiverMarketParticipantMrid: "Producteur1",
                    receiverMarketParticipantRole: "A32",
                    createdDateTime: "2021-10-21T10:29:10.000Z",
                    measurementUnitName: "KW",
                    timeInterval: "2021-10-21T10:29:10.000Z",
                    resolution: "PT10M",
                    timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                    revisionNumber: "1",
                    businessType: "A14 / Z14",
                    docStatus: "A02",
                    processType: "A05",
                    classificationType: "A02",
                    product: "Energie active/Réactive",
                }
           ];

            expect(ret).to.eql(expected);
        });

        it('should return SUCCESS on GetReferenceEnergyAccountByProducer for coverage purpose', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj1 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                meteringPointMrid: "PRM50012536123456",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-21T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-21T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj1 ));

            chaincodeStub.MspiID = 'producer';
            let get = await star.GetReferenceEnergyAccountByProducer(transactionContext, 'toto', nrj1.receiverMarketParticipantMrid, nrj1.createdDateTime);
            let ret = JSON.parse(get);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(0);

        });

        it('should return SUCCESS on getEnergyAccountByProducer for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            chaincodeStub.MspiID = 'rte';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"toto\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

            // const date = new Date(1634898550000);
            const nrj1 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                meteringPointMrid: "PRM50012536123456",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur1",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-21T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-21T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj1 ));

            const nrj2 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
                meteringPointMrid: "PRM50012536123456",
                marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "17V000000992746D",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "Producteur2",
                receiverMarketParticipantRole: "A32",
                createdDateTime: "2021-10-22T10:29:10.000Z",
                measurementUnitName: "KW",
                timeInterval: "2021-10-22T10:29:10.000Z",
                resolution: "PT10M",
                timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                revisionNumber: "1",
                businessType: "A14 / Z14",
                docStatus: "A02",
                processType: "A05",
                classificationType: "A02",
                product: "Energie active/Réactive",
            };

            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj2));
            let ret2 = JSON.parse((await chaincodeStub.getState(nrj2.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret2=", ret2);
            expect(ret2).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj2 ));

            chaincodeStub.MspiID = 'producer';
            let ret = await star.GetReferenceEnergyAccountByProducer(transactionContext, nrj1.meteringPointMrid, nrj1.receiverMarketParticipantMrid, nrj1.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected = [
                'non-json-value',
                {
                    docType: "referenceEnergyAccount",
                    energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                    meteringPointMrid: "PRM50012536123456",
                    marketEvaluationPointMrid: "CodePPE",
                    areaDomain: "17X100A100A0001A",
                    senderMarketParticipantMrid: "17V000000992746D",
                    senderMarketParticipantRole: "A50",
                    receiverMarketParticipantMrid: "Producteur1",
                    receiverMarketParticipantRole: "A32",
                    createdDateTime: "2021-10-21T10:29:10.000Z",
                    measurementUnitName: "KW",
                    timeInterval: "2021-10-21T10:29:10.000Z",
                    resolution: "PT10M",
                    timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
                    revisionNumber: "1",
                    businessType: "A14 / Z14",
                    docStatus: "A02",
                    processType: "A05",
                    classificationType: "A02",
                    product: "Energie active/Réactive",
                }
           ];
            expect(ret).to.eql(expected);
        });
    });
});
