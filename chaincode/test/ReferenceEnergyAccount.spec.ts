'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'
import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';
import { EnergyAccount } from '../src/model/energyAccount';
import { STARParameters } from '../src/model/starParameters';

import { ParametersType } from '../src/enums/ParametersType';
import { ParametersController } from '../src/controller/ParametersController';
import { DocType } from '../src/enums/DocType';
import { QueryStateService } from '../src/controller/service/QueryStateService';
import { HLFServices } from '../src/controller/service/HLFservice';

class TestLoggerMgt {
    public getLogger(arg: string): any {
        return console;
    }
}

class TestContext {
    clientIdentity: any;
    stub: any;
    logger: TestLoggerMgt= new TestLoggerMgt();

    constructor() {
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.clientIdentity.getMSPID.returns(Values.FakeMSP);
        this.stub = sinon.createStubInstance(ChaincodeStub);
    }

}
function ChaincodeMessageHandler(ChaincodeMessageHandler: any): any {
    throw new Error('Function not implemented.');
}

describe('Star Tests ReferenceEnergyAccount', () => {
    let transactionContext: any;
    let mockHandler:any;
    let star: Star;
    beforeEach(() => {
        transactionContext = new TestContext();
        star = new Star();
        mockHandler = sinon.createStubInstance(ChaincodeMessageHandler);

        chai.should();
        chai.use(chaiAsPromised);
        chai.use(sinonChai);
    });


    describe('Test false statement', () => {
        it('should avoid else flag missing', async () => {
            await transactionContext.stub.getState("EolienFRvert28EIC");
            await transactionContext.stub.getQueryResult("EolienFRvert28EIC");
        });
    });

/*
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    WRITE     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
*/

    describe('Test CreateReferenceEnergyAccount HTB', () => {
        it('should return ERROR on CreateReferenceEnergyAccount NON-JSON Value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.CreateReferenceEnergyAccount(transactionContext, 'RTE01EIC');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount Site non-JSON value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from("XXX"));

            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a3));

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(energy_account));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount : ERROR '.concat(DocType.SITE).concat(' -> Input string NON-JSON value for Reference Energy Account ea4cef73-ff6b-400b-8957-d34000eb30a3 creation.'));
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount Producer non-JSON value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from("XXX"));

            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a3));

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(energy_account));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount : ERROR '.concat(DocType.SYSTEM_OPERATOR).concat(' -> Input string NON-JSON value for Reference Energy Account ea4cef73-ff6b-400b-8957-d34000eb30a3 creation.'));
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount Wrong MSPID', async () => {

            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a3));

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(energy_account));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('Organisation, '
                    .concat(Values.FakeMSP)
                    .concat(' does not have write access for Reference Energy Account.'));
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount missing Site', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a3));

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(energy_account));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount : '.concat(DocType.SITE).concat(' : ')
                    .concat(Values.HTB_EnergyAccount_a3.meteringPointMrid)
                    .concat(' does not exist (not found in any collection). for Reference Energy Account ea4cef73-ff6b-400b-8957-d34000eb30a3 creation.'));
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount missing System Operator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a3));

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(energy_account));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount : '.concat(DocType.SYSTEM_OPERATOR).concat(' : ')
                    .concat(Values.HTB_EnergyAccount_a3.senderMarketParticipantMrid)
                    .concat(' does not exist for Reference Energy Account ea4cef73-ff6b-400b-8957-d34000eb30a3 creation.'));
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount wrong sender', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator3.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator3)));
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a5));

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(energy_account));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('Reference Energy Account, mismatch sender: rte does not have write access for Reference Energy Account '
                    .concat(energy_account.energyAccountMarketDocumentMrid).concat(' creation.'));
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount missing marketEvaluationPointMrid', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a3));

            var input = JSON.stringify(energy_account);
            input = await Values.deleteJSONField(input, "marketEvaluationPointMrid");

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, input);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount, missing marketEvaluationPointMrid.');
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount missing processType', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a3));

            var input = JSON.stringify(energy_account);
            input = await Values.deleteJSONField(input, "processType");

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, input);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount, missing processType.');
            }
        });

        it('should return ERROR CreateReferenceEnergyAccount mismatch ', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.siteHTBProdA.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.siteHTBProdA)));

            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a4));

            try {
                await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(energy_account));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('Reference Energy Account, sender: '
                    .concat(Values.HTB_EnergyAccount_a4.senderMarketParticipantMrid)
                    .concat(' is not the same as site.systemOperator: ')
                    .concat(Values.siteHTBProdA.systemOperatorMarketParticipantMrid)
                    .concat(' in EnergyAccount creation.'));
            }
        });

        it('should return SUCCESS CreateReferenceEnergyAccount HTB', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionSites: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionSites[0], Values.HTB_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a3));

            await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(energy_account));

            energy_account.docType = DocType.REFERENCE_ENERGY_ACCOUNT;

            const collections: string[] = params.values.get(ParametersType.REFERENCE_ENERGY_ACCOUNT);

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(energy_account))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.should.have.been.calledWithExactly(
                collections[0],
                energy_account.energyAccountMarketDocumentMrid,
                Buffer.from(JSON.stringify(energy_account))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);
        });
    });


// ////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////    READ     ////////////////////////////
// ////////////////////////////////////////////////////////////////////////////
    describe('Test GetReferenceEnergyAccountForSystemOperator', () => {
        it('should return ERROR on GetReferenceEnergyAccount no systemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const producer = 'toto';
            try {
                await star.GetReferenceEnergyAccountForSystemOperator(transactionContext, producer, producer, producer);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount : '.concat(DocType.SYSTEM_OPERATOR).concat(' : toto does not exist'));
            }
        });

        it('should return ERROR on GetReferenceEnergyAccountForSystemOperator wrong MSPID', async () => {

            transactionContext.clientIdentity.getMSPID.returns(Values.FakeMSP);
            try {
                await star.GetReferenceEnergyAccountForSystemOperator(transactionContext,
                    "v1",
                    "v2",
                    "v3");

            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('Organisation, '.concat(Values.FakeMSP).concat(' does not have read access for Reference Energy Account.'));
            }
        });

        it('should return ERROR on GetReferenceEnergyAccountForSystemOperator Broken SystemOperator', async () => {
            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a3));

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from("XXX"));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.GetReferenceEnergyAccountForSystemOperator(transactionContext,
                    energy_account.meteringPointMrid,
                    energy_account.senderMarketParticipantMrid,
                    energy_account.createdDateTime);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR createReferenceEnergyAccount : ERROR '.concat(DocType.SYSTEM_OPERATOR).concat(' -> Input string NON-JSON value'));
            }
        });

        it('should return SUCCESS on GetReferenceEnergyAccountForSystemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a3));

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            const dateUp = new Date(energy_account.createdDateTime);
            dateUp.setUTCHours(0,0,0,0);
            const dateDown = new Date(dateUp.getTime() + 86399999);

            var args: string[] = [];
            args.push(`"meteringPointMrid": "${energy_account.meteringPointMrid}"`);
            args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
            const query = await QueryStateService.buildQuery(DocType.REFERENCE_ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);

            const iterator = Values.getEnergyAccountQueryMock2Values(energy_account, Values.HTB_EnergyAccount_a4, mockHandler);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collections: string[] = params.values.get(ParametersType.REFERENCE_ENERGY_ACCOUNT);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collections[0], query).resolves(iterator);

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            let ret = await star.GetReferenceEnergyAccountForSystemOperator(transactionContext,
                energy_account.meteringPointMrid,
                energy_account.senderMarketParticipantMrid,
                energy_account.createdDateTime);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: EnergyAccount[] = [ energy_account, JSON.parse(JSON.stringify(Values.HTB_EnergyAccount_a4)) ];

            expect(ret).to.eql(expected);
        });

//         it('should return SUCCESS on GetReferenceEnergyAccountForSystemOperator for non JSON value', async () => {
//             transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
//                 transactionContext.stub.states = {};
//                 transactionContext.stub.states[key] = 'non-json-value';
//             });

//             transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
//             await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"toto\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
//             await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
//             await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
//             await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

//             // const date = new Date(1634898550000);
//             const nrj1 : EnergyAccount = {
//                 energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
//                 meteringPointMrid: "PRM50012536123456",
//                 marketEvaluationPointMrid: "CodePPE",
//                 areaDomain: "17X100A100A0001A",
//                 senderMarketParticipantMrid: "17V000000992746D",
//                 senderMarketParticipantRole: "A50",
//                 receiverMarketParticipantMrid: "Producteur1",
//                 receiverMarketParticipantRole: "A32",
//                 createdDateTime: "2021-10-21T10:29:10.000Z",
//                 measurementUnitName: "KW",
//                 timeInterval: "2021-10-21T10:29:10.000Z",
//                 resolution: "PT10M",
//                 timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
//                 revisionNumber: "1",
//                 businessType: "A14 / Z14",
//                 docStatus: "A02",
//                 processType: "A05",
//                 classificationType: "A02",
//                 product: "Energie active/Réactive",
//             };

//             await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj1));
//             let ret1 = JSON.parse((await transactionContext.stub.getState(nrj1.energyAccountMarketDocumentMrid)).toString());
//             // params.logger.log("ret1=", ret1);
//             expect(ret1).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj1 ));

//             const nrj2 : EnergyAccount = {
//                 energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
//                 meteringPointMrid: "PRM50012536123456",
//                 marketEvaluationPointMrid: "CodePPE",
//                 areaDomain: "17X100A100A0001A",
//                 senderMarketParticipantMrid: "17V000000992746D",
//                 senderMarketParticipantRole: "A50",
//                 receiverMarketParticipantMrid: "Producteur1",
//                 receiverMarketParticipantRole: "A32",
//                 createdDateTime: "2021-10-22T10:29:10.000Z",
//                 measurementUnitName: "KW",
//                 timeInterval: "2021-10-22T10:29:10.000Z",
//                 resolution: "PT10M",
//                 timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
//                 revisionNumber: "1",
//                 businessType: "A14 / Z14",
//                 docStatus: "A02",
//                 processType: "A05",
//                 classificationType: "A02",
//                 product: "Energie active/Réactive",
//             };

//             await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj2));
//             let ret2 = JSON.parse((await transactionContext.stub.getState(nrj2.energyAccountMarketDocumentMrid)).toString());
//             // params.logger.log("ret2=", ret2);
//             expect(ret2).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj2 ));

//             let ret = await star.GetReferenceEnergyAccountForSystemOperator(transactionContext, nrj1.meteringPointMrid, nrj1.senderMarketParticipantMrid, nrj1.createdDateTime);
//             ret = JSON.parse(ret);
//         //     // params.logger.log('ret=', ret)
//             expect(ret.length).to.equal(2);

//             const expected = [
//                 "non-json-value",
//                 {
//                     docType: "referenceEnergyAccount",
//                     energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
//                     meteringPointMrid: "PRM50012536123456",
//                     marketEvaluationPointMrid: "CodePPE",
//                     areaDomain: "17X100A100A0001A",
//                     senderMarketParticipantMrid: "17V000000992746D",
//                     senderMarketParticipantRole: "A50",
//                     receiverMarketParticipantMrid: "Producteur1",
//                     receiverMarketParticipantRole: "A32",
//                     createdDateTime: "2021-10-21T10:29:10.000Z",
//                     measurementUnitName: "KW",
//                     timeInterval: "2021-10-21T10:29:10.000Z",
//                     resolution: "PT10M",
//                     timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
//                     revisionNumber: "1",
//                     businessType: "A14 / Z14",
//                     docStatus: "A02",
//                     processType: "A05",
//                     classificationType: "A02",
//                     product: "Energie active/Réactive",
//                 }
//            ];

//             expect(ret).to.eql(expected);
//         });
    });

    describe('Test GetReferenceEnergyAccountByProducer', () => {
        it('should return Error on GetReferenceEnergyAccountByProducer Wrong MSPID', async () => {
            try {
                await star.GetReferenceEnergyAccountByProducer(transactionContext, 'titi', 'toto', 'tata');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have read access for producer\'s Reference Energy Account.');
            }
        });

        it('should return OK on GetReferenceEnergyAccountByProducer empty', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
            const producer = 'toto';
            let ret = await star.GetReferenceEnergyAccountByProducer(transactionContext, producer, '17V0000009927454', "date");
            ret = JSON.parse(ret);
            // params.logger.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetReferenceEnergyAccountByProducer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTA_EnergyAccount_a1));
            const dateUp = new Date(energy_account.createdDateTime);
            dateUp.setUTCHours(0,0,0,0);
            const dateDown = new Date(dateUp.getTime() + 86399999);

            var args: string[] = [];
            args.push(`"meteringPointMrid": "${energy_account.meteringPointMrid}"`);
            args.push(`"receiverMarketParticipantMrid": "${energy_account.receiverMarketParticipantMrid}"`);
            args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
            const query = await QueryStateService.buildQuery(DocType.REFERENCE_ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);

            // const query = `{
            //     "selector":
            //     {
            //         "docType": "referenceEnergyAccount",
            //         "meteringPointMrid": "${energy_account.meteringPointMrid}",
            //         "receiverMarketParticipantMrid": "${energy_account.receiverMarketParticipantMrid}",
            //         "createdDateTime": {
            //             "$gte": ${JSON.stringify(dateUp)},
            //             "$lte": ${JSON.stringify(dateDown)}
            //         },
            //         "sort": [{
            //             "createdDateTime" : "desc"
            //         }]
            //     }
            // }`;

            const iterator = Values.getEnergyAccountQueryMock(energy_account,mockHandler);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collections: string[] = params.values.get(ParametersType.REFERENCE_ENERGY_ACCOUNT);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collections[0], query).resolves(iterator);

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
            let ret = await star.GetReferenceEnergyAccountByProducer(transactionContext,
                energy_account.meteringPointMrid,
                energy_account.receiverMarketParticipantMrid,
                energy_account.createdDateTime);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAccount[] = [ energy_account ];

            expect(ret).to.eql(expected);
        });

        it('should return SUCCESS on GetReferenceEnergyAccountByProducer for coverage purpose', async () => {
            const energy_account: EnergyAccount = JSON.parse(JSON.stringify(Values.HTA_EnergyAccount_a1));
            const dateUp = new Date(energy_account.createdDateTime);
            dateUp.setUTCHours(0,0,0,0);
            const dateDown = new Date(dateUp.getTime() + 86399999);

            const query = `{
                "selector":
                {
                    "docType": "referenceEnergyAccount",
                    "meteringPointMrid": "${energy_account.meteringPointMrid}",
                    "receiverMarketParticipantMrid": "${energy_account.receiverMarketParticipantMrid}",
                    "createdDateTime": {
                        "$gte": ${JSON.stringify(dateUp)},
                        "$lte": ${JSON.stringify(dateDown)}
                    },
                    "sort": [{
                        "createdDateTime" : "desc"
                    }]
                }
            }`;

            const iterator = Values.getEnergyAccountQueryMock(energy_account,mockHandler);
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            let get = await star.GetReferenceEnergyAccountByProducer(transactionContext, 'XXX', energy_account.receiverMarketParticipantMrid, energy_account.createdDateTime);
            let ret = JSON.parse(get);
            // params.logger.log('ret=', ret)
            expect(ret.length).to.equal(0);

        });

        // it('should return SUCCESS on getEnergyAccountByProducer for non JSON value', async () => {
        //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
        //         transactionContext.stub.states = {};
        //         transactionContext.stub.states[key] = 'non-json-value';
        //     });

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"toto\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');

        //     // const date = new Date(1634898550000);
        //     const nrj1 : EnergyAccount = {
        //         energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        //         meteringPointMrid: "PRM50012536123456",
        //         marketEvaluationPointMrid: "CodePPE",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V000000992746D",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-21T10:29:10.000Z",
        //         measurementUnitName: "KW",
        //         timeInterval: "2021-10-21T10:29:10.000Z",
        //         resolution: "PT10M",
        //         timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         product: "Energie active/Réactive",
        //     };

        //     await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj1));
        //     let ret1 = JSON.parse((await transactionContext.stub.getState(nrj1.energyAccountMarketDocumentMrid)).toString());
        //     // params.logger.log("ret1=", ret1);
        //     expect(ret1).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj1 ));

        //     const nrj2 : EnergyAccount = {
        //         energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
        //         meteringPointMrid: "PRM50012536123456",
        //         marketEvaluationPointMrid: "CodePPE",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V000000992746D",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur2",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         measurementUnitName: "KW",
        //         timeInterval: "2021-10-22T10:29:10.000Z",
        //         resolution: "PT10M",
        //         timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         product: "Energie active/Réactive",
        //     };

        //     await star.CreateReferenceEnergyAccount(transactionContext, JSON.stringify(nrj2));
        //     let ret2 = JSON.parse((await transactionContext.stub.getState(nrj2.energyAccountMarketDocumentMrid)).toString());
        //     // params.logger.log("ret2=", ret2);
        //     expect(ret2).to.eql( Object.assign({docType: 'referenceEnergyAccount'}, nrj2 ));

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
        //     let ret = await star.GetReferenceEnergyAccountByProducer(transactionContext, nrj1.meteringPointMrid, nrj1.receiverMarketParticipantMrid, nrj1.createdDateTime);
        //     ret = JSON.parse(ret);
        //     // params.logger.log('ret=', ret)
        //     expect(ret.length).to.equal(2);

        //     const expected = [
        //         'non-json-value',
        //         {
        //             docType: "referenceEnergyAccount",
        //             energyAccountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        //             meteringPointMrid: "PRM50012536123456",
        //             marketEvaluationPointMrid: "CodePPE",
        //             areaDomain: "17X100A100A0001A",
        //             senderMarketParticipantMrid: "17V000000992746D",
        //             senderMarketParticipantRole: "A50",
        //             receiverMarketParticipantMrid: "Producteur1",
        //             receiverMarketParticipantRole: "A32",
        //             createdDateTime: "2021-10-21T10:29:10.000Z",
        //             measurementUnitName: "KW",
        //             timeInterval: "2021-10-21T10:29:10.000Z",
        //             resolution: "PT10M",
        //             timeSeries: [{inQuantity: 7500, position: 3},{inQuantity: 7500, position: 3}],
        //             revisionNumber: "1",
        //             businessType: "A14 / Z14",
        //             docStatus: "A02",
        //             processType: "A05",
        //             classificationType: "A02",
        //             product: "Energie active/Réactive",
        //         }
        //    ];
        //     expect(ret).to.eql(expected);
        // });
    });
});
