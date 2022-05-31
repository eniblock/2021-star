
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'
import { YellowPages } from '../src/model/yellowPages';

import { ParametersController } from '../src/controller/ParametersController';
import { ParametersType } from '../src/enums/ParametersType';
import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';


class TestContext {
    clientIdentity: any;
    stub: any;

    constructor() {
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.clientIdentity.getMSPID.returns('FakeMspID');
        this.stub = sinon.createStubInstance(ChaincodeStub);

        this.stub.putState.callsFake((key, value) => {
            if (!this.stub.states) {
                this.stub.states = {};
            }
            this.stub.states[key] = value;
        });

        this.stub.getState.callsFake(async (key) => {
            let ret;
            if (this.stub.states) {
                ret = this.stub.states[key];
            }
            return Promise.resolve(ret);
        });
    }
}

function ChaincodeMessageHandler(ChaincodeMessageHandler: any): any {
    throw new Error('Function not implemented.');
}


describe('Star Tests YELLOW PAGES', () => {
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


    describe('Test createYellowPages', () => {

        it('should return ERROR on createYellowPages NON-JSON Value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            try {
                await star.CreateYellowPages(transactionContext, 'RTE01EIC');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('ERROR createYellowPages-> Input string NON-JSON value');
            }
        });

        it('should return ERROR createYellowPages System operator missing', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            try {
                await star.CreateYellowPages(transactionContext, JSON.stringify(Values.HTB_yellowPage));
            } catch(err) {
                // console.info(err.message)
                expect(err.message).to.equal('System Operator : '.concat(Values.HTB_yellowPage.systemOperatorMarketParticipantMrid).concat(' does not exist in Yellow Pages ').concat(Values.HTB_yellowPage.originAutomationRegisteredResourceMrid).concat('.'));
            }
        });

        it('should return ERROR createYellowPages missing Site', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            try {
                await star.CreateYellowPages(transactionContext, JSON.stringify(Values.HTB_yellowPage));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Site : '.concat(Values.HTB_yellowPage.registeredResourceMrid).concat(' does not exist in Yellow Pages ').concat(Values.HTB_yellowPage.originAutomationRegisteredResourceMrid).concat('.'));
            }
        });

        it('should return ERROR createYellowPages wrong MSPID', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));
            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            transactionContext.clientIdentity.getMSPID.returns(Values.FakeMSP);
            try {
                await star.CreateYellowPages(transactionContext, JSON.stringify(Values.HTA_yellowPage));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access for Yellow Pages.');
            }
        });

        it('should return ERROR createYellowPages missing originAutomationRegisteredResourceMrid mandatory field', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));
            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            const input = await Values.deleteJSONField(JSON.stringify(Values.HTA_yellowPage), 'originAutomationRegisteredResourceMrid');

            try {
                await star.CreateYellowPages(transactionContext, input);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('originAutomationRegisteredResourceMrid is a compulsory string.');
            }
        });

        it('should return ERROR createYellowPages missing registeredResourceMrid mandatory field', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));
            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            const input = await Values.deleteJSONField(JSON.stringify(Values.HTA_yellowPage), 'registeredResourceMrid');

            try {
                await star.CreateYellowPages(transactionContext, input);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('registeredResourceMrid is a compulsory string.');
            }
        });

        it('should return ERROR createYellowPages missing systemOperatorMarketParticipantMrid mandatory field', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));
            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            const input = await Values.deleteJSONField(JSON.stringify(Values.HTA_yellowPage), 'systemOperatorMarketParticipantMrid');

            try {
                await star.CreateYellowPages(transactionContext, input);
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('systemOperatorMarketParticipantMrid is a compulsory string.');
            }
        });

        it('should return ERROR createYellowPages missing all mandatory fields', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));
            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            try {
                await star.CreateYellowPages(transactionContext, '{}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('4 errors occurred');
            }
        });

        it('should return SUCCESS createYellowPages', async () => {

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));
            const collectionName=await ParametersController.getParameter(transactionContext, ParametersType.SITE);
            transactionContext.stub.getPrivateData.withArgs(collectionName, Values.HTA_site_valid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_site_valid)));

            await star.CreateYellowPages(transactionContext, JSON.stringify(Values.HTA_yellowPage));

            let ret = JSON.parse((await transactionContext.stub.getState(Values.HTA_yellowPage.yellowPageMrid)).toString());
            expect(ret).to.eql( Object.assign({docType: 'yellowPages'}, Values.HTA_yellowPage ));
        });
    });





    describe('Test getAllYellowPages', () => {
        it('should return OK on getAllYellowPages empty', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            let ret = await star.GetAllYellowPages(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return ERROR on getAllYellowPages', async () => {
            try {
                await star.GetAllYellowPages(transactionContext);
            } catch (err) {
                // console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have read access for Yellow Pages.');
            }
        });

        it('should return success on getAllYellowPages', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            const iterator = Values.getYellowPageQueryMock(Values.HTB_yellowPage,mockHandler);
            const query = `{"selector": {"docType": "yellowPages"}}`;
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);


            let ret = await star.GetAllYellowPages(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(1);

            const expected: YellowPages[] = [Values.HTB_yellowPage];

            expect(ret).to.eql(expected);
        });

        // it('should return success on getAllYellowPages for non JSON value', async () => {
        //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
        //         transactionContext.stub.states = {};
        //         transactionContext.stub.states[key] = 'non-json-value';
        //     });

        //     const site: Site = {meteringPointMrid: 'PDL00000000289766', systemOperatorMarketParticipantMrid: '17V0000009927464', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927464\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, JSON.stringify(site));

        //     const sit: Site = {meteringPointMrid: 'PDL00000000289767', systemOperatorMarketParticipantMrid: '17V000000992746D', producerMarketParticipantMrid: '17X0000013097450', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', marketEvaluationPointMrid: 'CodePPE', schedulingEntityRegisteredResourceMrid: 'CodeEDP', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"Rte\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X0000013097450\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, JSON.stringify(sit));
        //     const yellowPage: YellowPages = {
        //         originAutomationRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
        //         registeredResourceMrid: "PDL00000000289766",
        //         systemOperatorMarketParticipantMrid: "17V000000992746D",
        //     };
        //     await star.CreateYellowPages(transactionContext, JSON.stringify(yellowPage));

        //     let ret = await star.GetAllYellowPages(transactionContext);
        //     ret = JSON.parse(ret);
        //     // console.log('ret=', ret)
        //     expect(ret.length).to.equal(2);

        //     const expected = [
        //         'non-json-value',
        //         {
        //             docType: "yellowPages",
        //             originAutomationRegisteredResourceMrid: "CRIVA1_ENEDIS_Y411",
        //             registeredResourceMrid: "PDL00000000289766",
        //             systemOperatorMarketParticipantMrid: "17V000000992746D"
        //         }
        // ];

        //     expect(ret).to.eql(expected);
        // });
    });
});
