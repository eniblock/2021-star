'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'
import { EnergyAmount } from '../src/model/energyAmount';
import { ActivationDocument } from '../src/model/activationDocument';
import { Parameters } from '../src/model/parameters';

import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';
import { ParametersType } from '../src/enums/ParametersType';
import { ParametersController } from '../src/controller/ParametersController';

class TestContext {
    clientIdentity: any;
    stub: any;

    constructor() {
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.clientIdentity.getMSPID.returns(Values.FakeMSP);
        this.stub = sinon.createStubInstance(ChaincodeStub);
    }
}

function ChaincodeMessageHandler(ChaincodeMessageHandler: any): any {
    throw new Error('Function not implemented.');
}

describe('Star Tests EnergyAmount', () => {
    let transactionContext: any;
    let mockHandler:any;
    let star: Star;
    let values: Values;
    beforeEach(() => {
        transactionContext = new TestContext();
        star = new Star();
        values = new Values();
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
////////////////////////////////////////////////////////////////////////////
///////////////////////////////     ENE      ///////////////////////////////
////////////////////////////////////////////////////////////////////////////

    describe('Test CreateTSOEnergyAmount', () => {
        it('should return ERROR CreateTSOEnergyAmount check mandatory fields', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
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

            var input: string
            input = JSON.stringify(Values.HTB_EnergyAmount);
            input = await Values.deleteJSONField(input, "activationDocumentMrid");
            input = await Values.deleteJSONField(input, 'areaDomain');
            input = await Values.deleteJSONField(input, 'createdDateTime');
            input = await Values.deleteJSONField(input, 'energyAmountMarketDocumentMrid');
            input = await Values.deleteJSONField(input, 'measurementUnitName');
            input = await Values.deleteJSONField(input, 'quantity');
            input = await Values.deleteJSONField(input, 'receiverMarketParticipantMrid');
            input = await Values.deleteJSONField(input, 'receiverMarketParticipantRole');
            input = await Values.deleteJSONField(input, 'registeredResourceMrid');
            input = await Values.deleteJSONField(input, 'senderMarketParticipantMrid');
            input = await Values.deleteJSONField(input, 'senderMarketParticipantRole');
            input = await Values.deleteJSONField(input, 'timeInterval');

            try {
                await star.CreateTSOEnergyAmount(transactionContext, input);
            } catch(err) {
                // console.info(input);
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
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.CreateTSOEnergyAmount(transactionContext, 'RTE01EIC');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createTSOEnergyAmount-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateTSOEnergyAmount Wrong MSPID', async () => {
            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(Values.HTB_EnergyAmount));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have write access for Energy Amount.');
            }
        });

        it('should return ERROR CreateTSOEnergyAmount missing Activation Document.', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(Values.HTB_EnergyAmount));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ActivationDocument : '.concat(Values.HTB_EnergyAmount.activationDocumentMrid).concat(' does not exist for Energy Amount ea4cef73-ff6b-400b-8957-d34000eb30a1 creation.'));
            }
        });

        it('should return SUCCESS CreateTSOEnergyAmount.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(energyamount.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate)));
            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_ActivationDocument_JustStartDate.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));

            let ret = JSON.parse((await transactionContext.stub.getState(energyamount.energyAmountMarketDocumentMrid)).toString());
            expect(ret).to.eql( Object.assign({docType: 'energyAmount'}, energyamount ));
        });




        it('should return ERROR CreateTSOEnergyAmount Broken ActivationDocument.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(energyamount.activationDocumentMrid).resolves(Buffer.from("XXX"));

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createTSOEnergyAmount getActivationDocument-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateTSOEnergyAmount Broken ActivationDocument.site.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const activationDocument:ActivationDocument = JSON.parse(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate));
            activationDocument.registeredResourceMrid = 'toto';
            transactionContext.stub.getState.withArgs(energyamount.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocument)));
            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_ActivationDocument_JustStartDate.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Site : toto does not exist in Activation Document : 8c56459a-794a-4ed1-a7f6-33b0064508f1 for Energy Amount : ea4cef73-ff6b-400b-8957-d34000eb30a1 creation.');
            }
        });

        it('should return ERROR CreateTSOEnergyAmount Broken Site.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(energyamount.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate)));
            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_ActivationDocument_JustStartDate.registeredResourceMrid).resolves(Buffer.from("XXX"));

            try {
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createTSOEnergyAmount getSite-> Input string NON-JSON value');
            }
        });

        it('should return ERROR CreateTSOEnergyAmount mismatch registeredResourceMrid.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(energyamount.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate)));
            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_ActivationDocument_JustStartDate.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            try {
                energyamount.registeredResourceMrid = "toto";
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createTSOEnergyAmount mismatch beetween registeredResourceMrid in Activation Document : '.concat(Values.HTB_ActivationDocument_JustStartDate.registeredResourceMrid).concat(' and Energy Amount : toto.'));
            }
        });

        //Deleted ERROR ?
        // it('should return ERROR CreateTSOEnergyAmount mismatch date timeInterval.', async () => {

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomationRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

        //     const nrj : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        //         activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V0000009927454",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-23T23:59:59.999Z",
        //     };

        //     try {
        //         await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj));
        //     } catch(err) {
        //         // console.info(err.message)
        //         expect(err.message).to.equal('ERROR createTSOEnergyAmount mismatch in timeInterval both date must be the same day.("2021-10-22T00:00:00.000Z" vs "2021-10-23T00:00:00.000Z")');
        //     }
        // });

        it('should return ERROR CreateTSOEnergyAmount mismatch date.', async () => {
            const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTB_EnergyAmount));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(energyamount.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_ActivationDocument_JustStartDate)));
            const params: Parameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = params.values.get(ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], Values.HTB_ActivationDocument_JustStartDate.registeredResourceMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_site_valid)));

            try {
                energyamount.timeInterval = "2021-10-30T01:01:01.001Z / 2021-10-23T30:59:59.999Z";
                await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createTSOEnergyAmount mismatch between ENE : "2021-10-30T00:00:00.000Z" and Activation Document : "2021-10-22T00:00:00.000Z" dates.');
            }
        });
    });
////////////////////////////////////////////////////////////////////////////
///////////////////////////////     ENI      ///////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test CreateDSOEnergyAmount', () => {
        it('should return ERROR CreateDSOEnergyAmount Wrong MSPID', async () => {
            try {
                await star.CreateDSOEnergyAmount(transactionContext, JSON.stringify(Values.HTA_EnergyAmount));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have write access for Energy Amount.');
            }
        });

        it('should return ERROR on CreateDSOEnergyAmount NON-JSON Value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            try {
                await star.CreateDSOEnergyAmount(transactionContext, 'RTE01EIC');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createDSOEnergyAmount-> Input string NON-JSON value');
            }
        });

        //Deleted ERROR ??
        // it('should return ERROR CreateDSOEnergyAmount no result get ActivationDocument.', async () => {
        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\": \"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"producerMarketParticipantMrid\": \"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\": \"Injection\",\"siteName\": \"Ferme éolienne de Genonville\",\"substationMrid\": \"GDO A4RTD\",\"substationName\": \"CIVRAY\",\"siteAdminMrid\": \"489 981 029\", \"siteLocation\": \"Biscarosse\", \"siteIecCode\": \"S7X0000013077478\", \"systemOperatorEntityFlexibilityDomainMrid\": \"PSC4511\", \"systemOperatorEntityFlexibilityDomainName\": \"Départ 1\", \"systemOperatorCustomerServiceName\": \"DR Nantes Deux-Sèvres\"}');

        //     await star.CreateYellowPages(transactionContext, '{\"originAutomationRegisteredResourceMrid\": \"CIVRA\",\"registeredResourceMrid\": \"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\": \"17X000001309745X\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f3\",\"originAutomationRegisteredResourceMrid\": \"CIVRA\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"KW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T11:29:10.000Z\",\"endCreatedDateTime\": \"2021-10-22T22:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V0000009927454\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

        //     const nrj : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
        //         activationDocumentMrid: "CIVRA/PRM50012536123456/2021-10-23T11:29:10.000Z/2021-10-23T22:29:10.000Z",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V0000009927454",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
        //     };

        //     try {
        //         await star.CreateDSOEnergyAmount(transactionContext, JSON.stringify(nrj));
        //     } catch(err) {
        //         // console.info(err.message)
        //         expect(err.message).to.equal('ERROR createDSOEnergyAmount : no results for get activationDocument');
        //     }
        // });

        //Deleted ERROR ??
        // it('should return ERROR CreateDSOEnergyAmount error date interval.', async () => {
        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\": \"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"producerMarketParticipantMrid\": \"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\": \"Injection\",\"siteName\": \"Ferme éolienne de Genonville\",\"substationMrid\": \"GDO A4RTD\",\"substationName\": \"CIVRAY\",\"siteAdminMrid\": \"489 981 029\", \"siteLocation\": \"Biscarosse\", \"siteIecCode\": \"S7X0000013077478\", \"systemOperatorEntityFlexibilityDomainMrid\": \"PSC4511\", \"systemOperatorEntityFlexibilityDomainName\": \"Départ 1\", \"systemOperatorCustomerServiceName\": \"DR Nantes Deux-Sèvres\"}');

        //     await star.CreateYellowPages(transactionContext, '{\"originAutomationRegisteredResourceMrid\": \"CIVRA\",\"registeredResourceMrid\": \"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\": \"17X000001309745X\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f3\",\"originAutomationRegisteredResourceMrid\": \"CIVRA\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"KW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T11:29:10.000Z\",\"endCreatedDateTime\": \"2021-10-22T22:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V0000009927454\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

        //     const nrj : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
        //         activationDocumentMrid: "CIVRA/PRM50012536123456/2021-10-22T11:29:10.000Z/2021-10-22T22:29:10.000Z",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V0000009927454",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-23T23:59:59.999Z",
        //     };

        //     try {
        //         await star.CreateDSOEnergyAmount(transactionContext, JSON.stringify(nrj));
        //     } catch(err) {
        //         // console.info(err.message)
        //         expect(err.message).to.equal('ERROR createDSOEnergyAmount mismatch in timeInterval both date must be the same day.("2021-10-22T00:00:00.000Z" vs "2021-10-23T00:00:00.000Z")');
        //     }
        // });

        //Deleted ERROR ??
        // it('should return ERROR CreateDSOEnergyAmount error date ENI / timeinterval.', async () => {
        //     transactionContext.stub.MspiID = OrganizationTypeMsp.ENEDIS;
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\": \"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"producerMarketParticipantMrid\": \"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\": \"Injection\",\"siteName\": \"Ferme éolienne de Genonville\",\"substationMrid\": \"GDO A4RTD\",\"substationName\": \"CIVRAY\",\"siteAdminMrid\": \"489 981 029\", \"siteLocation\": \"Biscarosse\", \"siteIecCode\": \"S7X0000013077478\", \"systemOperatorEntityFlexibilityDomainMrid\": \"PSC4511\", \"systemOperatorEntityFlexibilityDomainName\": \"Départ 1\", \"systemOperatorCustomerServiceName\": \"DR Nantes Deux-Sèvres\"}');

        //     await star.CreateYellowPages(transactionContext, '{\"originAutomationRegisteredResourceMrid\": \"CIVRA\",\"registeredResourceMrid\": \"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\": \"17X000001309745X\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f3\",\"originAutomationRegisteredResourceMrid\": \"CIVRA\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"KW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T11:29:10.000Z\",\"endCreatedDateTime\": \"2021-10-22T22:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V0000009927454\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

        //     const nrj : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a3",
        //         activationDocumentMrid: "CIVRA/PRM50012536123456/2021-10-22T11:29:10.000Z/2021-10-22T22:29:10.000Z",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V0000009927454",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-23T23:59:59.999Z",
        //     };

        //     try {
        //         await star.CreateDSOEnergyAmount(transactionContext, JSON.stringify(nrj));
        //     } catch(err) {
        //         // console.info(err.message)
        //         expect(err.message).to.equal('ERROR createDSOEnergyAmount mismatch in timeInterval both date must be the same day.("2021-10-22T00:00:00.000Z" vs "2021-10-23T00:00:00.000Z")');
        //     }
        // });

        it('should return ERROR CreateDSOEnergyAmount error date ENI / ActivationDocument.', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const iterator = Values.getActivationDocumentQueryMock(Values.HTA_ActivationDocument_Valid,mockHandler);
            const query = `{
            "selector":
            {
                "docType": "activationDocument",
                "originAutomationRegisteredResourceMrid": "CIVRA",
                "registeredResourceMrid": "PRM50012536123467",
                "startCreatedDateTime": "2021-10-22T11:29:10.000Z",
                "endCreatedDateTime": "2021-10-22T22:29:10.000Z"
            }
        }`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            try {
                const energyamount:EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount));
                energyamount.timeInterval = "2021-10-23T01:01:01.001Z / 2021-10-23T23:59:59.999Z";
                await star.CreateDSOEnergyAmount(transactionContext, JSON.stringify(energyamount));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createDSOEnergyAmount mismatch between ENI : "2021-10-23T00:00:00.000Z" and Activation Document : "2021-10-22T00:00:00.000Z" dates.');
            }
        });

        it('should return SUCCESS CreateDSOEnergyAmount.', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const iterator = Values.getActivationDocumentQueryMock(Values.HTA_ActivationDocument_Valid,mockHandler);
            const query = `{
            "selector":
            {
                "docType": "activationDocument",
                "originAutomationRegisteredResourceMrid": "CIVRA",
                "registeredResourceMrid": "PRM50012536123467",
                "startCreatedDateTime": "2021-10-22T11:29:10.000Z",
                "endCreatedDateTime": "2021-10-22T22:29:10.000Z"
            }
        }`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);


            await star.CreateDSOEnergyAmount(transactionContext, JSON.stringify(Values.HTA_EnergyAmount));

            let ret = JSON.parse((await transactionContext.stub.getState(Values.HTA_EnergyAmount.energyAmountMarketDocumentMrid)).toString());
            expect(ret).to.eql( Object.assign({docType: 'energyAmount'}, Values.HTA_EnergyAmount ));
        });
    });

////////////////////////////////////////////////////////////////////////////
/////////////////////////////     GET ENE      /////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test ENE GetEnergyAmountForSystemOperator.', () => {
        it('should return ERROR on GetEnergyAmountForSystemOperator no systemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const producer = 'toto';
            try {
                await star.GetEnergyAmountForSystemOperator(transactionContext, producer, producer, producer);
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('System Operator : toto does not exist for Energy Amount read.');
            }
        });

        it('should return SUCCESS on GetEnergyAmountForSystemOperator. empty', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927454\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
            const producer = 'toto';
            let ret = await star.GetEnergyAmountForSystemOperator(transactionContext, producer, '17V0000009927454', "date");
            ret = JSON.parse(ret);
            // console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return ERROR on GetEnergyAmountForSystemOperator. Wrong MSPID', async () => {
            transactionContext.clientIdentity.getMSPID.returns(Values.FakeMSP);

            try {
                await star.GetEnergyAmountForSystemOperator(transactionContext, 'titi', 'toto', 'tata');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Organisation, '.concat(Values.FakeMSP).concat(' does not have read access for Energy Amount.'));
            }
        });

        it('should return ERROR on GetEnergyAmountForSystemOperator. Wrong SystemOperator', async () => {
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.GetEnergyAmountForSystemOperator(transactionContext,
                    Values.HTB_EnergyAmount.registeredResourceMrid,
                    Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
                    Values.HTB_EnergyAmount.createdDateTime);
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Energy Amount, sender: rte does not provide his own systemOperatorEicCode therefore he does not have read access.');
            }
        });

        it('should return ERROR on GetEnergyAmountForSystemOperator. Broken SystemOperator', async () => {
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from("XXX"));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.GetEnergyAmountForSystemOperator(transactionContext,
                    Values.HTB_EnergyAmount.registeredResourceMrid,
                    Values.HTB_EnergyAmount.senderMarketParticipantMrid,
                    Values.HTB_EnergyAmount.createdDateTime);
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('ERROR createTSOEnergyAmount getSystemOperator-> Input string NON-JSON value');
            }
        });


        it('should return SUCCESS on GetEnergyAmountForSystemOperator.', async () => {
            const iterator = Values.getEnergyAmountQueryMock(Values.HTB_EnergyAmount,mockHandler);

            const dateUp = new Date(Values.HTB_EnergyAmount.createdDateTime);
            dateUp.setUTCMilliseconds(0);
            dateUp.setUTCSeconds(0);
            dateUp.setUTCMinutes(0);
            dateUp.setUTCHours(0);
            const dateDown = new Date(dateUp.getTime() + 86399999);
            const query = `{
            "selector":
            {
                "docType": "energyAmount",
                "registeredResourceMrid": "${Values.HTB_EnergyAmount.registeredResourceMrid}",
                "senderMarketParticipantMrid": "${Values.HTB_EnergyAmount.senderMarketParticipantMrid}",
                "createdDateTime": {
                    "$gte": ${JSON.stringify(dateUp)},
                    "$lte": ${JSON.stringify(dateDown)}
                },
                "sort": [{
                    "createdDateTime" : "desc"
                }]
            }
        }`;

            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            let ret = await star.GetEnergyAmountForSystemOperator(transactionContext,
                                                                    Values.HTB_EnergyAmount.registeredResourceMrid,
                                                                    Values.HTB_EnergyAmount.senderMarketParticipantMrid,
                                                                    Values.HTB_EnergyAmount.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAmount[] = [Values.HTB_EnergyAmount];

            expect(ret).to.eql(expected);
        });


        // it('should return SUCCESS on GetEnergyAmountForSystemOperator. for non JSON value.', async () => {

        //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
        //         transactionContext.stub.states = {};
        //         transactionContext.stub.states[key] = 'non-json-value';
        //     });

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"bulshit\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomationRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f2\",\"originAutomationRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-23T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

        //     const nrj1 : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        //         activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V000000992746D",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
        //     };

        //     await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj1));
        //     let ret1 = JSON.parse((await transactionContext.stub.getState(nrj1.energyAmountMarketDocumentMrid)).toString());
        //     // console.log("ret1=", ret1);
        //     expect(ret1).to.eql( Object.assign({docType: 'energyAmount'}, nrj1 ));

        //     const nrj2 : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
        //         activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V000000992746D",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-23T10:29:10.000Z",
        //         timeInterval: "2021-10-23T01:01:01.001Z / 2021-10-23T23:59:59.999Z",
        //     };

        //     await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj2));
        //     let ret2 = JSON.parse((await transactionContext.stub.getState(nrj2.energyAmountMarketDocumentMrid)).toString());
        //     // console.log("ret2=", ret2);
        //     expect(ret2).to.eql( Object.assign({docType: 'energyAmount'}, nrj2 ));


        //     let ret = await star.GetEnergyAmountForSystemOperator(transactionContext, nrj1.registeredResourceMrid, nrj1.senderMarketParticipantMrid, nrj1.createdDateTime);
        //     ret = JSON.parse(ret);
        //     console.log('ret=', ret)
        //     expect(ret.length).to.equal(2);

        //     const expected = [
        //         "non-json-value",
        //         {
        //             docType: "energyAmount",
        //             energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        //             activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        //             registeredResourceMrid: "PRM50012536123456",
        //             quantity: "number",
        //             measurementUnitName: "KW",
        //             revisionNumber: "1",
        //             businessType: "A14 / Z14",
        //             docStatus: "A02",
        //             processType: "A05",
        //             classificationType: "A02",
        //             areaDomain: "17X100A100A0001A",
        //             senderMarketParticipantMrid: "17V000000992746D",
        //             senderMarketParticipantRole: "A50",
        //             receiverMarketParticipantMrid: "Producteur1",
        //             receiverMarketParticipantRole: "A32",
        //             createdDateTime: "2021-10-22T10:29:10.000Z",
        //             timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
        //         }
        //     ];

        //     expect(ret).to.eql(expected);
        // });
    });

    describe('Test ENE GetEnergyAmountByProducer', () => {
        it('should return ERROR on GetEnergyAmountByProducer Wrong MSPID', async () => {
            try {
                await star.GetEnergyAmountByProducer(transactionContext, 'titi', 'toto', 'tata');
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have read access for producer\'s Energy Amount.');
            }
        });

        it('should return OK on GetEnergyAmountByProducer empty', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
            const producer = 'toto';
            let ret = await star.GetEnergyAmountByProducer(transactionContext, producer, '17V0000009927454', "date");
            ret = JSON.parse(ret);
            // console.log('retADproducer=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetEnergyAmountByProducer', async () => {
            const iterator = Values.getEnergyAmountQueryMock(Values.HTB_EnergyAmount,mockHandler);

            const dateUp = new Date(Values.HTB_EnergyAmount.createdDateTime);
            dateUp.setUTCMilliseconds(0);
            dateUp.setUTCSeconds(0);
            dateUp.setUTCMinutes(0);
            dateUp.setUTCHours(0);
            const dateDown = new Date(dateUp.getTime() + 86399999);
            const query = `{
                "selector":
                {
                    "docType": "energyAmount",
                    "registeredResourceMrid": "${Values.HTB_EnergyAmount.registeredResourceMrid}",
                    "receiverMarketParticipantMrid": "${Values.HTB_EnergyAmount.receiverMarketParticipantMrid}",
                    "createdDateTime": {
                        "$gte": ${JSON.stringify(dateUp)},
                        "$lte": ${JSON.stringify(dateDown)}
                    },
                    "sort": [{
                        "createdDateTime" : "desc"
                    }]
                }
            }`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            let ret = await star.GetEnergyAmountByProducer(transactionContext,
                                                            Values.HTB_EnergyAmount.registeredResourceMrid,
                                                            Values.HTB_EnergyAmount.receiverMarketParticipantMrid,
                                                            Values.HTB_EnergyAmount.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAmount[] = [Values.HTB_EnergyAmount];

            expect(ret).to.eql(expected);
        });

        // it('should return SUCCESS on getEnergyAmountByProducer for non JSON value', async () => {
        //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
        //         transactionContext.stub.states = {};
        //         transactionContext.stub.states[key] = 'non-json-value';
        //     });

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"bulshit\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123456\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f1\",\"originAutomationRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123456\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');

        //     const nrj1 : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        //         activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        //         registeredResourceMrid: "PRM50012536123456",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V000000992746D",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
        //     };

        //     await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj1));
        //     let ret1 = JSON.parse((await transactionContext.stub.getState(nrj1.energyAmountMarketDocumentMrid)).toString());
        //     // console.log("ret1=", ret1);
        //     expect(ret1).to.eql( Object.assign({docType: 'energyAmount'}, nrj1 ));

        //     await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PRM50012536123457\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     await star.CreateActivationDocument(transactionContext, '{\"activationDocumentMrid\": \"8c56459a-794a-4ed1-a7f6-33b0064508f2\",\"originAutomationRegisteredResourceMrid\": \"CRIVA1_ENEDIS_Y411\",\"registeredResourceMrid\": \"PRM50012536123457\",\"measurementUnitName\": \"MW\",\"messageType\": \"string\",\"businessType\": \"string\",\"orderType\": \"string\",\"orderEnd\": false,\"orderValue\": \"1\",\"startCreatedDateTime\": \"2021-10-22T10:29:10.000Z\",\"revisionNumber\": \"1\",\"reasonCode\": \"string\",\"senderMarketParticipantMrid\": \"17V000000992746D\",\"receiverMarketParticipantMrid\": \"17X000001309745X\"}');
        //     const nrj2 : EnergyAmount = {
        //         energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a2",
        //         activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f2",
        //         registeredResourceMrid: "PRM50012536123457",
        //         quantity: "number",
        //         measurementUnitName: "KW",
        //         revisionNumber: "1",
        //         businessType: "A14 / Z14",
        //         docStatus: "A02",
        //         processType: "A05",
        //         classificationType: "A02",
        //         areaDomain: "17X100A100A0001A",
        //         senderMarketParticipantMrid: "17V000000992746D",
        //         senderMarketParticipantRole: "A50",
        //         receiverMarketParticipantMrid: "Producteur1",
        //         receiverMarketParticipantRole: "A32",
        //         createdDateTime: "2021-10-22T10:29:10.000Z",
        //         timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
        //     };

        //     await star.CreateTSOEnergyAmount(transactionContext, JSON.stringify(nrj2));
        //     let ret2 = JSON.parse((await transactionContext.stub.getState(nrj2.energyAmountMarketDocumentMrid)).toString());
        //     // console.log("ret2=", ret2);
        //     expect(ret2).to.eql( Object.assign({docType: 'energyAmount'}, nrj2 ));

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
        //     let ret = await star.GetEnergyAmountByProducer(transactionContext, nrj1.registeredResourceMrid, nrj1.receiverMarketParticipantMrid, nrj1.createdDateTime);
        //     ret = JSON.parse(ret);
        //     // console.log('ret=', ret)
        //     expect(ret.length).to.equal(2);

        //     const expected = [
        //         'non-json-value',
        //         {
        //             docType: "energyAmount",
        //             energyAmountMarketDocumentMrid: "ea4cef73-ff6b-400b-8957-d34000eb30a1",
        //             activationDocumentMrid: "8c56459a-794a-4ed1-a7f6-33b0064508f1",
        //             registeredResourceMrid: "PRM50012536123456",
        //             quantity: "number",
        //             measurementUnitName: "KW",
        //             revisionNumber: "1",
        //             businessType: "A14 / Z14",
        //             docStatus: "A02",
        //             processType: "A05",
        //             classificationType: "A02",
        //             areaDomain: "17X100A100A0001A",
        //             senderMarketParticipantMrid: "17V000000992746D",
        //             senderMarketParticipantRole: "A50",
        //             receiverMarketParticipantMrid: "Producteur1",
        //             receiverMarketParticipantRole: "A32",
        //             createdDateTime: "2021-10-22T10:29:10.000Z",
        //             timeInterval: "2021-10-22T01:01:01.001Z / 2021-10-22T23:59:59.999Z",
        //         }
        //    ];

        //     expect(ret).to.eql(expected);
        // });
    });
////////////////////////////////////////////////////////////////////////////
/////////////////////////////     GET ENI      /////////////////////////////
////////////////////////////////////////////////////////////////////////////
    describe('Test ENI GetEnergyAmountForSystemOperator.', () => {
        it('should return SUCCESS on GetEnergyAmountForSystemOperator.', async () => {
            const iterator = Values.getEnergyAmountQueryMock(Values.HTA_EnergyAmount,mockHandler);

            const dateUp = new Date(Values.HTA_EnergyAmount.createdDateTime);
            dateUp.setUTCMilliseconds(0);
            dateUp.setUTCSeconds(0);
            dateUp.setUTCMinutes(0);
            dateUp.setUTCHours(0);
            const dateDown = new Date(dateUp.getTime() + 86399999);
            const query = `{
            "selector":
            {
                "docType": "energyAmount",
                "registeredResourceMrid": "${Values.HTA_EnergyAmount.registeredResourceMrid}",
                "senderMarketParticipantMrid": "${Values.HTA_EnergyAmount.senderMarketParticipantMrid}",
                "createdDateTime": {
                    "$gte": ${JSON.stringify(dateUp)},
                    "$lte": ${JSON.stringify(dateDown)}
                },
                "sort": [{
                    "createdDateTime" : "desc"
                }]
            }
        }`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            let ret = await star.GetEnergyAmountForSystemOperator(transactionContext,
                                                                    Values.HTA_EnergyAmount.registeredResourceMrid,
                                                                    Values.HTA_EnergyAmount.senderMarketParticipantMrid,
                                                                    Values.HTA_EnergyAmount.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAmount[] = [Values.HTA_EnergyAmount];

            expect(ret).to.eql(expected);
        });

     });



    describe('Test ENI GetEnergyAmountByProducer', () => {
        it('should return SUCCESS on GetEnergyAmountByProducer', async () => {
            const iterator = Values.getEnergyAmountQueryMock(Values.HTA_EnergyAmount,mockHandler);

            const dateUp = new Date(Values.HTA_EnergyAmount.createdDateTime);
            dateUp.setUTCMilliseconds(0);
            dateUp.setUTCSeconds(0);
            dateUp.setUTCMinutes(0);
            dateUp.setUTCHours(0);
            const dateDown = new Date(dateUp.getTime() + 86399999);
            const query = `{
                "selector":
                {
                    "docType": "energyAmount",
                    "registeredResourceMrid": "${Values.HTA_EnergyAmount.registeredResourceMrid}",
                    "receiverMarketParticipantMrid": "${Values.HTA_EnergyAmount.receiverMarketParticipantMrid}",
                    "createdDateTime": {
                        "$gte": ${JSON.stringify(dateUp)},
                        "$lte": ${JSON.stringify(dateDown)}
                    },
                    "sort": [{
                        "createdDateTime" : "desc"
                    }]
                }
            }`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            let ret = await star.GetEnergyAmountByProducer(transactionContext,
                                                            Values.HTA_EnergyAmount.registeredResourceMrid,
                                                            Values.HTA_EnergyAmount.receiverMarketParticipantMrid,
                                                            Values.HTA_EnergyAmount.createdDateTime);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: EnergyAmount[] = [Values.HTA_EnergyAmount];

            expect(ret).to.eql(expected);
        });
    });
});
