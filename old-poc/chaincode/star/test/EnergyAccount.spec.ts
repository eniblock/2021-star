
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

describe('Star Tests EnergyAccount', () => {
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
                                const queryM = queryJson.selector.meteringPointMrid;
                                // console.log('queryM=', queryM);
                                const objM = obJson.meteringPointMrid;
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
////////////////////////////////////    HTA     ////////////////////////////
////////////////////////////////////////////////////////////////////////////

    describe('Test CreateEnergyAccount HTA', () => {
        // it('should return ERROR on CreateEnergyAccount', async () => {
        //     chaincodeStub.putState.rejects('failed inserting key');

        //     let star = new Star();
        //     chaincodeStub.MspiID = 'RTEMSP';
        //     try {
        //         await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
        //         // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
        //         await star.CreateEnergyAccount(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     } catch(err) {
        //         console.info(err.message)
        //         expect(err.message).to.equal('failed inserting key');
        //     }
        // });

        it('should return ERROR on CreateEnergyAccount NON-JSON Value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.CreateEnergyAccount(transactionContext, 'RTE01EIC');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('ERROR createEnergyAccount-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateEnergyAccount missing energyAccountMarketDocumentMrid', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // const date = new Date(1634898550000);
            // console.log("date=", date);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123456",
                // marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "code EIC Enedis",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "STAR",
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

            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
                // await star.CreateEnergyAccount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('energyAccountMarketDocumentMrid is a compulsory string');
            }
        });

        it('should return ERROR CreateEnergyAccount missing meteringPointMrid', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('meteringPointMrid is a compulsory string');
            }
        });

        it('should return ERROR CreateEnergyAccount missing senderMarketParticipantMrid', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('senderMarketParticipantMrid is a compulsory string');
            }
        });

        it('should return ERROR CreateEnergyAccount missing senderMarketParticipantRole', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('senderMarketParticipantRole is a compulsory string');
            }
        });

        it('should return ERROR CreateEnergyAccount missing receiverMarketParticipantMrid', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('receiverMarketParticipantMrid is a compulsory string');
            }
        });

        it('should return ERROR CreateEnergyAccount missing receiverMarketParticipantRole', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('receiverMarketParticipantRole is a compulsory string');
            }
        });

        it('should return ERROR CreateEnergyAccount missing createdDateTime', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('createdDateTime is a required field');
            }
        });

        it('should return ERROR CreateEnergyAccount missing measurementUnitName', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('measurementUnitName is a compulsory string');
            }
        });

        it('should return ERROR CreateEnergyAccount missing timeInterval', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('timeInterval is a required field');
            }
        });

        it('should return ERROR CreateEnergyAccount missing resolution', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('resolution is a compulsory string');
            }
        });

        it('should return ERROR CreateEnergyAccount missing timeSeries', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('timeSeries is a required field');
            }
        });

        it('should return ERROR CreateEnergyAccount missing inQuantity in timeSeries', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('timeSeries[0].inQuantity is a required field');
            }
        });

        it('should return ERROR CreateEnergyAccount missing position in timeSeries', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            // `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500,\"position\":3}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`

            try {
                await star.CreateEnergyAccount(transactionContext, 
                 `{\"energyAccountMarketDocumentMrid\":\"ea4cef73-ff6b-400b-8957-d34000eb30a3\",\"meteringPointMrid\":\"PRM50012536123456\",\"areaDomain\":\"17X100A100A0001A\",\"senderMarketParticipantMrid\":\"code EIC Enedis\",\"senderMarketParticipantRole\":\"A50\",\"receiverMarketParticipantMrid\":\"STAR\",\"receiverMarketParticipantRole\":\"A32\",\"createdDateTime\":\"2021-10-22T10:29:10.000Z\",\"measurementUnitName\":\"KW\",\"timeInterval\":\"2021-10-22T10:29:10.000Z\",\"resolution\":\"PT10M\",\"timeSeries\":[{\"inQuantity\":7500,\"position\":3},{\"inQuantity\":7500}],\"revisionNumber\":\"1\",\"businessType\":\"A14 / Z14\",\"docStatus\":\"A02\",\"processType\":\"A05\",\"classificationType\":\"A02\",\"product\":\"Energie active/Réactive\"}`
                 );
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('timeSeries[1].position is a required field');
            }
        });

        it('should return ERROR CreateEnergyAccount Wrong MSPID', async () => {
            let star = new Star();
            // const date = new Date(1634898550000);
            // console.log("date=", date);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123456",
                // marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "code EIC Enedis",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "STAR",
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
                await star.CreateEnergyAccount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have write access for Energy Account.');
            }
        });

        it('should return ERROR CreateEnergyAccount missing Site', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'ENEDISMSP';

            // const date = new Date(1634898550000);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123456",
                // marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "code EIC Enedis",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "STAR",
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
                await star.CreateEnergyAccount(transactionContext, JSON.stringify(nrj));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Site : PRM50012536123456 does not exist for Energy Account ea4cef73-ff6b-400b-8957-d34000eb30a3 creation.');
            }
        });

        it('should return SUCCESS CreateEnergyAccount couple HTA', async () => {
            let star = new Star();
            const site: Site = {meteringPointMrid: 'PRM50012536123456',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(site));

            // const date = new Date(1634898550000);
            const nrj : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
                meteringPointMrid: "PRM50012536123456",
                // marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "code EIC Enedis",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "STAR",
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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(nrj));

            let ret = JSON.parse((await chaincodeStub.getState(nrj.energyAccountMarketDocumentMrid)).toString());
            expect(ret).to.eql( Object.assign({docType: 'energyAccount'}, nrj ));
        });
    });
/*
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    HTB     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test CreateEnergyAccount HTB', () => {
        it('should return ERROR on CreateEnergyAccount NON-JSON Value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.CreateEnergyAccount(transactionContext, 'RTE01EIC');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createEnergyAccount-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateEnergyAccount wrong JSON', async () => {
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
                await star.CreateEnergyAccount(transactionContext, `{\"riginAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\", \"egisteredResourceMrid\": \"12345678901234\", \"easurementUnitName\": \"KW\",\"essageType\": \"string\",\"usinessType\": \"string\",\"rderType\": \"string\",\"rderEnd\": false}`);
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

        it('should return ERROR CreateEnergyAccount missing activationDocumentMrid', async () => {
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
                await star.CreateEnergyAccount(transactionContext, `{\"originAutomataRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\", \"registeredResourceMrid\": \"12345678901234\", \"measurementUnitName\": \"KW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false}`);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('activationDocumentMrid is a compulsory string');
            }
        });

        it('should return ERROR CreateEnergyAccount couple HTA wrong MSPID -> RTE', async () => {
            let star = new Star();
            const order: EnergyAccount = {
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
                await star.CreateEnergyAccount(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, RTEMSP does not have write access for KW orders');
            }
        });

        it('should return ERROR CreateEnergyAccount begin HTB site doesn\'t exist', async () => {
            let star = new Star();
            const order: EnergyAccount = {
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
                await star.CreateEnergyAccount(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Site : PDL00000000289766 does not exist for Activation Document 8c56459a-794a-4ed1-a7f6-33b0064508f1 creation.');
            }
        });

        it('should return ERROR CreateEnergyAccount begin HTB producer doesn\'t exist', async () => {
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
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X0000013097455\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(site));

            const order: EnergyAccount = {
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
                await star.CreateEnergyAccount(transactionContext, JSON.stringify(order));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Producer : 17X000001309745X does not exist for Activation Document 8c56459a-794a-4ed1-a7f6-33b0064508f1 creation.');
            }
        });

        it('should return SUCCESS CreateEnergyAccount Begining order HTB RTE', async () => {
            let star = new Star();
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(site));

            const order: EnergyAccount = {

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
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(order));

            let ret = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(ret).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false}, order ));
        });

    });
*/
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    GET     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test GetEnergyAccount', () => {
        it('should return OK on GetEnergyAccount empty', async () => {
            let star = new Star();
            const producer = 'toto';
            let ret = await star.GetEnergyAccount(transactionContext, producer, "date");
            ret = JSON.parse(ret);
            // console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetEnergyAccount', async () => {
            let star = new Star();

            const site: Site = {meteringPointMrid: 'PRM50012536123456',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(site));

            // const date = new Date(1634898550000);
            const nrj1 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                meteringPointMrid: "PRM50012536123456",
                // marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "code EIC Enedis",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "STAR",
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

            await star.CreateEnergyAccount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'energyAccount'}, nrj1 ));

            const nrj2 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
                meteringPointMrid: "PRM50012536123456",
                // marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "code EIC Enedis",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "STAR",
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

            await star.CreateEnergyAccount(transactionContext, JSON.stringify(nrj2));
            let ret2 = JSON.parse((await chaincodeStub.getState(nrj2.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret2=", ret2);
            expect(ret2).to.eql( Object.assign({docType: 'energyAccount'}, nrj2 ));

            let ret = await star.GetEnergyAccount(transactionContext, nrj1.meteringPointMrid, nrj1.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAccount[] = [
                {
                    docType: "energyAccount",
                    energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                    meteringPointMrid: "PRM50012536123456",
                    // marketEvaluationPointMrid: "CodePPE",
                    areaDomain: "17X100A100A0001A",
                    senderMarketParticipantMrid: "code EIC Enedis",
                    senderMarketParticipantRole: "A50",
                    receiverMarketParticipantMrid: "STAR",
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

        it('should return SUCCESS on getEnergyAccountByproducer for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            const site: Site = {meteringPointMrid: 'PRM50012536123456',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"bullshit\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(site));

            // const date = new Date(1634898550000);
            const nrj1 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                meteringPointMrid: "PRM50012536123456",
                // marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "code EIC Enedis",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "STAR",
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

            await star.CreateEnergyAccount(transactionContext, JSON.stringify(nrj1));
            let ret1 = JSON.parse((await chaincodeStub.getState(nrj1.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret1=", ret1);
            expect(ret1).to.eql( Object.assign({docType: 'energyAccount'}, nrj1 ));

            const nrj2 : EnergyAccount = {
                energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
                meteringPointMrid: "PRM50012536123456",
                // marketEvaluationPointMrid: "CodePPE",
                areaDomain: "17X100A100A0001A",
                senderMarketParticipantMrid: "code EIC Enedis",
                senderMarketParticipantRole: "A50",
                receiverMarketParticipantMrid: "STAR",
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

            await star.CreateEnergyAccount(transactionContext, JSON.stringify(nrj2));
            let ret2 = JSON.parse((await chaincodeStub.getState(nrj2.energyAccountMarketDocumentMrid)).toString());
            // console.log("ret2=", ret2);
            expect(ret2).to.eql( Object.assign({docType: 'energyAccount'}, nrj2 ));

            await star.GetEnergyAccount(transactionContext, 'toto', nrj1.createdDateTime);
            let ret = await star.GetEnergyAccount(transactionContext, nrj1.meteringPointMrid, nrj1.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected = [
                "non-json-value",
                {
                    docType: "energyAccount",
                    energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
                    meteringPointMrid: "PRM50012536123456",
                    // marketEvaluationPointMrid: "CodePPE",
                    areaDomain: "17X100A100A0001A",
                    senderMarketParticipantMrid: "code EIC Enedis",
                    senderMarketParticipantRole: "A50",
                    receiverMarketParticipantMrid: "STAR",
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

/*
    describe('Test GetEnergyAccountBySystemOperator', () => {
        it('should return OK on GetEnergyAccountBySystemOperator empty', async () => {
            let star = new Star();
            const producer = 'toto';
            let ret = await star.GetEnergyAccountBySystemOperator(transactionContext, producer);
            ret = JSON.parse(ret);
            // console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetEnergyAccountBySystemOperator', async () => {
            let star = new Star();

            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(site));

            const orderA: EnergyAccount = {
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
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');

            const yellowPage: YellowPages = {originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",registeredResourceMrid: "PDL00000000289766",systemOperatorMarketParticipantMrid: "17V000000992746D"};
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderA));
    
            const orderB: EnergyAccount = {
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
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderB));

            let ret = await star.GetEnergyAccountBySystemOperator(transactionContext, orderA.senderMarketParticipantMrid);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAccount[] = [
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

        it('should return SUCCESS on getEnergyAccountBySystemOperator for non JSON value', async () => {
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
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(site));

            const orderA: EnergyAccount = {
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
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745Y\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');

            const yellowPage: YellowPages = {originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",registeredResourceMrid: "PDL00000000289766",systemOperatorMarketParticipantMrid: "17V000000992746D"};
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderA));
    
            const orderB: EnergyAccount = {
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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderB));

            let retB = await star.GetEnergyAccountBySystemOperator(transactionContext, orderB.senderMarketParticipantMrid);
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
        it('should return SUCCESS CreateEnergyAccount end order HTB RTE for NON-JSON value', async () => {
            let star = new Star();

            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"1\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            // await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.CreateSite(transactionContext, JSON.stringify(site));
            chaincodeStub.MspiID = 'RTEMSP';

            // await star.CreateEnergyAccount(transactionContext, JSON.stringify(order));

            const orderEnd: EnergyAccount = {

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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderEnd));


            // let ret = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            // expect(ret).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f2']}, order ));
            let retEnd = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retEnd).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false}, orderEnd ));
        });

        it('should return SUCCESS CreateEnergyAccount end order HTB RTE', async () => {
            let star = new Star();
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(site));

            const order: EnergyAccount = {

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
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(order));

            const orderEnd: EnergyAccount = {

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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderEnd));


            let ret = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(ret).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f2']}, order ));
            let retEnd = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retEnd).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f1']}, orderEnd ));
        });

        it('should return SUCCESS CreateEnergyAccount end order HTB RTE for coverage', async () => {
            let star = new Star();

            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V0000009927454',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V0000009927454\",\"marketParticipantName\": \"Enedis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateSite(transactionContext, JSON.stringify(site));

            const order: EnergyAccount = {

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
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(order));

            const orderEnd: EnergyAccount = {

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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderEnd));

            order.subOrderList = ['8c56459a-794a-4ed1-a7f6-33b0064508f2'];
            orderEnd.subOrderList = ['8c56459a-794a-4ed1-a7f6-33b0064508f1'];
            let ret = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(ret).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true}, order ));
            let retEnd = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retEnd).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f1']}, orderEnd ));
        });
    });
    describe('Test BB/BE reconciliations', () => {

        it('should return SUCCESS CreateEnergyAccount couple HTA with BB reconciliation', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746Y\",\"marketParticipantName\": \"ENEDis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X0000013097454\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',marketEvaluationPointMrid: 'string',schedulingEntityRegisteredResourceMrid:'string',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.CreateSite(transactionContext, JSON.stringify(site));
            const yellowPage: YellowPages = {originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",registeredResourceMrid: "PDL00000000289766",systemOperatorMarketParticipantMrid: "17V000000992746D"};
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));

            const orderBegin: EnergyAccount = {

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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderBegin));

            // chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.CreateSystemOperator(transactionContext, '17V0000009927454', 'Enedis', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            // await star.CreateSite(transactionContext, JSON.stringify(site));

            const orderCouple: EnergyAccount = {

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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderCouple));

            let retBegin = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(retBegin).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f2']}, orderBegin ));
            let retCouple = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retCouple).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f1']}, orderCouple ));
        });

        it('should return SUCCESS CreateEnergyAccount couple HTA with BB reconciliation for coverage', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746Y\",\"marketParticipantName\": \"ENEDis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X0000013097454\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',marketEvaluationPointMrid: 'string',schedulingEntityRegisteredResourceMrid:'string',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.CreateSite(transactionContext, JSON.stringify(site));
            const yellowPage: YellowPages = {originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",registeredResourceMrid: "PDL00000000289766",systemOperatorMarketParticipantMrid: "17V000000992746D"};
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));

            const orderBegin: EnergyAccount = {

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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderBegin));

            // chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.CreateSystemOperator(transactionContext, '17V0000009927454', 'Enedis', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            // await star.CreateSite(transactionContext, JSON.stringify(site));

            const orderCouple: EnergyAccount = {

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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderCouple));
            
            orderBegin.subOrderList= ['8c56459a-794a-4ed1-a7f6-33b0064508f2'];
            let retBegin = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(retBegin).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false}, orderBegin ));

            orderCouple.subOrderList= ['8c56459a-794a-4ed1-a7f6-33b0064508f1'];
            let retCouple = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retCouple).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true}, orderCouple ));
        });

        it('should return SUCCESS CreateEnergyAccount couple HTA with BB and BE reconciliation', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746Y\",\"marketParticipantName\": \"ENEDis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X0000013097454\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',marketEvaluationPointMrid: 'string',schedulingEntityRegisteredResourceMrid:'string',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.CreateSite(transactionContext, JSON.stringify(site));
            const yellowPage: YellowPages = {originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",registeredResourceMrid: "PDL00000000289766",systemOperatorMarketParticipantMrid: "17V000000992746D"};
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));

            const orderBegin: EnergyAccount = {

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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderBegin));

            // chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.CreateSystemOperator(transactionContext, '17V0000009927454', 'Enedis', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            // await star.CreateSite(transactionContext, JSON.stringify(site));

            const orderCouple: EnergyAccount = {

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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderCouple));

            const orderEnd: EnergyAccount = {
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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderEnd));

            let retEnd = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f3")).toString());
            expect(retEnd).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f1']}, orderEnd ));
            let retCouple = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retCouple).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f1']}, orderCouple ));
            let retBegin = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(retBegin).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f2','8c56459a-794a-4ed1-a7f6-33b0064508f3']}, orderBegin ));
        });

        it('should return SUCCESS CreateEnergyAccount couple HTA with BB and BE reconciliation for coverage', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746Y\",\"marketParticipantName\": \"ENEDis\",\"marketParticipantRoleType\": \"A50\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"17V000000992746D\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"17X0000013097454\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            const site: Site = {meteringPointMrid: 'PDL00000000289766',systemOperatorMarketParticipantMrid: '17V000000992746D',producerMarketParticipantMrid: '17X000001309745X',technologyType: 'Eolien',siteType: 'Injection',siteName: 'Ferme éolienne de Genonville',substationMrid: 'GDO A4RTD',substationName: 'CIVRAY',marketEvaluationPointMrid: 'string',schedulingEntityRegisteredResourceMrid:'string',siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'};
            await star.CreateSite(transactionContext, JSON.stringify(site));
            const yellowPage: YellowPages = {originAutomataRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",registeredResourceMrid: "PDL00000000289766",systemOperatorMarketParticipantMrid: "17V000000992746D"};
            await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));

            const orderBegin: EnergyAccount = {

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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderBegin));

            // chaincodeStub.MspiID = 'ENEDISMSP';
            // await star.CreateSystemOperator(transactionContext, '17V0000009927454', 'Enedis', 'A50');
            // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
            // await star.CreateSite(transactionContext, JSON.stringify(site));

            const orderCouple: EnergyAccount = {

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
            await star.CreateSite(transactionContext, JSON.stringify(siteB));
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderCouple));

            const orderEnd: EnergyAccount = {
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
            await star.CreateEnergyAccount(transactionContext, JSON.stringify(orderEnd));

            let retEnd = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f3")).toString());
            expect(retEnd).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false}, orderEnd ));
            let retCouple = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f2")).toString());
            expect(retCouple).to.eql( Object.assign({docType: 'activationDocument', reconciliation: true, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f1']}, orderCouple ));
            let retBegin = JSON.parse((await chaincodeStub.getState("8c56459a-794a-4ed1-a7f6-33b0064508f1")).toString());
            expect(retBegin).to.eql( Object.assign({docType: 'activationDocument', reconciliation: false, subOrderList: ['8c56459a-794a-4ed1-a7f6-33b0064508f2']}, orderBegin ));
        });
    });
*/
});