'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'


import { Star } from '../src/star'
import { Site } from "../src/model/site";
import { STARParameters } from '../src/model/starParameters';

import { DocType } from "../src/enums/DocType";
import { ParametersController } from '../src/controller/ParametersController';
import { ParametersType } from '../src/enums/ParametersType';
import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';
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

describe('Star Tests SITES', () => {
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


    /************************************************/
    /*                                              */
    /*              CREATE                          */
    /*                                              */
    /************************************************/

    describe('Test CreateSite', () => {
        // it('should return ERROR on CreateSite', async () => {
        //     transactionContext.stub.putState.rejects('failed inserting key');

        //     let star = new Star();
        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     try {
        //         await star.CreateSystemOperator(transactionContext, '17V000000992746D', 'RTE', 'A49');
        //         // await star.createProducer(transactionContext, '17X000001309745X', 'EolienFR vert Cie', 'A21');
        //         // await star.CreateSite(transactionContext, '{\"meteringPointMrid\":\"PDL00000000289766\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\": \"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Ferme éolienne de Genonville\",\"substationMrid\":\"GDO A4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"string\",\"schedulingEntityRegisteredResourceMrid\":\"string\",\"siteAdminMrid\":\"489 981 029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ 1\",\"systemOperatorCustomerServiceName\":\"DR Nantes Deux-Sèvres\"}');
        //     } catch(err) {
        //         params.logger.info(err.message)
        //         expect(err.message).to.equal('failed inserting key');
        //     }
        // });

        it('should return ERROR on CreateSite NON-JSON Value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.CreateSite(transactionContext, 'RTE01EIC');
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('ERROR '.concat(DocType.SITE).concat(' -> Input string NON-JSON value'));
            }
        });



        it('should return ERROR createSite HTB System operator missing', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            try {
                await star.CreateSite(transactionContext, JSON.stringify(Values.HTB_site_valid));
            } catch(err) {
                const msg = DocType.SYSTEM_OPERATOR.concat(' : ').concat(Values.HTB_site_valid.systemOperatorMarketParticipantMrid).concat(' does not exist for site creation');
                expect(err.message).to.equal(msg);
            }
        });



        it('should return ERROR createSite HTB Producer missing', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            try {
                await star.CreateSite(transactionContext, JSON.stringify(Values.HTB_site_valid));
            } catch(err) {
                const msg = DocType.PRODUCER.concat(' : ').concat(Values.HTB_site_valid.producerMarketParticipantMrid).concat(' does not exist for site creation');
                expect(err.message).to.equal(msg);
            }
        });



        it('should return ERROR createSite HTB wrong MSPID', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            transactionContext.stub.MspiID = Values.FakeMSP;
            try {
                await star.CreateSite(transactionContext, JSON.stringify(Values.HTB_site_valid));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access for HTB(HV) sites');
            }
        });



        it('should return ERROR createSite HTB missing marketEvaluationPointMrid optional field for HTA', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            try {
                const site = await Values.deleteJSONField(JSON.stringify(Values.HTB_site_valid), 'marketEvaluationPointMrid')
                await star.CreateSite(transactionContext, site);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('marketEvaluationPointMrid and schedulingEntityRegisteredResourceMrid must be both present for HTB site or absent for HTA site.');
            }
        });



        it('should return ERROR createSite HTB missing technologyType mandatory field', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            try {
                const site = await Values.deleteJSONField(JSON.stringify(Values.HTB_site_valid), 'technologyType')
                await star.CreateSite(transactionContext, site);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('technologyType is a compulsory field (string)');
            }
        });



        it('should return SUCCESS CreateSite HTB', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);

            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTB_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_Producer)));

            await star.CreateSite(transactionContext, JSON.stringify(Values.HTB_site_valid));

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const siteInput = JSON.parse(JSON.stringify(Values.HTB_site_valid));
            siteInput.producerMarketParticipantName = Values.HTB_Producer.producerMarketParticipantName;
            siteInput.docType = DocType.SITE;

            transactionContext.stub.putPrivateData.should.have.been.calledOnceWithExactly(collectionNames[0], siteInput.meteringPointMrid, Buffer.from(JSON.stringify(siteInput)));
        });



        it('should return SUCCESS CreateSite HTA', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            await star.CreateSite(transactionContext, JSON.stringify(Values.HTA_site_valid));

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const siteInput: Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
            siteInput.producerMarketParticipantName = Values.HTA_Producer.producerMarketParticipantName;
            siteInput.docType = DocType.SITE;

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(siteInput))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.should.have.been.calledOnceWithExactly(collectionNames[0], siteInput.meteringPointMrid, Buffer.from(JSON.stringify(siteInput)));
        });



        it('should return ERROR createSite HTA wrong MSPID', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
            transactionContext.stub.getState.withArgs(Values.HTA_Producer.producerMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_Producer)));

            transactionContext.clientIdentity.getMSPID.returns(Values.FakeMSP);

            try {
                await star.CreateSite(transactionContext, JSON.stringify(Values.HTA_site_valid));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access for HTA(MV) sites');
            }
        });

    });







    /************************************************/
    /*                                              */
    /*              QUERY                           */
    /*                                              */
    /************************************************/
    describe('Test QuerySite', () => {
        it('should return ERROR on QuerySite', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.QuerySite(transactionContext, 'toto');
            } catch (err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(DocType.SITE.concat(' : toto does not exist (not found in any collection).'));
            }
        });

        it('should return SUCCESS on QuerySite', async () => {
            let siteOutput = JSON.parse(JSON.stringify(Values.HTB_site_valid));
            siteOutput.docType = DocType.SITE;

            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionName = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionName, siteOutput.meteringPointMrid).resolves(Buffer.from(JSON.stringify(siteOutput)));

            const testValue = await star.QuerySite(transactionContext, siteOutput.meteringPointMrid);
            const test = JSON.parse(testValue);
            expect(test).to.eql(Object.assign({docType: DocType.SITE}, siteOutput));

            const allCollections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
            expect(transactionContext.stub.getPrivateData.callCount).to.eql(allCollections.length);

            for (var i = 0; i < transactionContext.stub.getPrivateData.callCount; i++) {
                // params.logger.info("-----------")
                // params.logger.info(transactionContext.stub.getPrivateData.getCall(i).args[0]);
                // params.logger.info(transactionContext.stub.getPrivateData.getCall(i).args[1]);
                // params.logger.info("-----------")

                expect(allCollections).to.include(transactionContext.stub.getPrivateData.getCall(i).args[0]);
                expect(transactionContext.stub.getPrivateData.getCall(i).args[1]).to.eql(siteOutput.meteringPointMrid);
            }

            const ret = JSON.parse(await transactionContext.stub.getPrivateData(collectionName, siteOutput.meteringPointMrid));
            expect(ret).to.eql(Object.assign({docType: DocType.SITE}, siteOutput));
        });
    });







    /************************************************/
    /*                                              */
    /*        getSiteBySystemOperator               */
    /*                                              */
    /************************************************/
    describe('Test getSiteBySystemOperator', () => {
        it('should return OK on getSiteBySystemOperator empty', async () => {
            const systemOperator = 'toto';
            let ret = await star.GetSitesBySystemOperator(transactionContext, systemOperator);
            ret = JSON.parse(ret);
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return success on getSiteBySystemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const iteratorHTA = Values.getSiteQueryMock(Values.HTA_site_valid, collectionNames[0], mockHandler)
            const queryHTA = `{"selector": {"docType": "site", "systemOperatorMarketParticipantMrid": "${Values.HTA_site_valid.systemOperatorMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], queryHTA).resolves(iteratorHTA);

            const iteratorHTB = Values.getSiteQueryMock(Values.HTB_site_valid, collectionNames[0], mockHandler)
            const queryHTB = `{"selector": {"docType": "site", "systemOperatorMarketParticipantMrid": "${Values.HTB_site_valid.systemOperatorMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], queryHTB).resolves(iteratorHTB);

            let retA = await star.GetSitesBySystemOperator(transactionContext, Values.HTA_site_valid.systemOperatorMarketParticipantMrid);
            // params.logger.log('retA=', retA)
            retA = JSON.parse(retA);
            // params.logger.log('retA=', retA)
            expect(retA.length).to.equal(1);

            const expected: Site[] = [JSON.parse(JSON.stringify(Values.HTA_site_valid))];

            expect(retA).to.eql(expected);
        });

        // it('should return success on getSiteBySystemOperator for non JSON value', async () => {
        //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
        //         transactionContext.stub.states = {};
        //         transactionContext.stub.states[key] = 'non-json-value';
        //     });

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));
        //     await star.CreateProducer(transactionContext, JSON.stringify(Values.HTA_Producer));
        //     await star.CreateSite(transactionContext, JSON.stringify(Values.HTA_site_valid));

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));
        //     await star.CreateProducer(transactionContext, JSON.stringify(Values.HTB_Producer));
        //     await star.CreateSite(transactionContext, JSON.stringify(Values.HTB_site_valid));


        //     let retB = await star.GetSitesBySystemOperator(transactionContext, Values.HTB_site_valid.systemOperatorMarketParticipantMrid);
        //     retB = JSON.parse(retB);
        //     // params.logger.log('retB=', retB)
        //     expect(retB.length).to.equal(2);

        //     const expected = [
        //         'non-json-value',
        //         {
        //             docType: "site",
        //             meteringPointMrid: "PDL00000000289767",
        //             producerMarketParticipantMrid: "17X000001309745X",
        //             siteAdminMrid: "489 981 029",
        //             siteIecCode: "S7X0000013077478",
        //             siteLocation: "Biscarosse",
        //             siteName: "Ferme éolienne de Genonville",
        //             siteType: "Injection",
        //             substationMrid: "GDO A4RTD",
        //             substationName: "CIVRAY",
        //             marketEvaluationPointMrid: "CodePPE",
        //             schedulingEntityRegisteredResourceMrid: "CodeEDP",
        //             systemOperatorCustomerServiceName: "DR Nantes Deux-Sèvres",
        //             systemOperatorEntityFlexibilityDomainMrid: "PSC4511",
        //             systemOperatorEntityFlexibilityDomainName: "Départ 1",
        //             systemOperatorMarketParticipantMrid: "17V000000992746D",
        //             technologyType: "Eolien",
        //         }
        //    ];

        //     expect(retB).to.eql(expected);
        // });
    });






    /************************************************/
    /*                                              */
    /*            getSiteByProducer                 */
    /*                                              */
    /************************************************/


    describe('Test getSiteByProducer', () => {
        it('should return OK on getSiteByProducer empty', async () => {
            const producer = 'toto';
            let ret = await star.GetSitesBySystemOperator(transactionContext, producer);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return success on getSiteByProducer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const iteratorHTA = Values.getSiteQueryMock(Values.HTA_site_valid, collectionNames[0], mockHandler)
            const queryHTA = `{"selector": {"docType": "site", "producerMarketParticipantMrid": "${Values.HTA_site_valid.producerMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], queryHTA).resolves(iteratorHTA);

            const iteratorHTB = Values.getSiteQueryMock(Values.HTB_site_valid, collectionNames[0], mockHandler)
            const queryHTB = `{"selector": {"docType": "site", "producerMarketParticipantMrid": "${Values.HTB_site_valid.producerMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], queryHTB).resolves(iteratorHTB);


            let retA = await star.GetSitesByProducer(transactionContext, Values.HTA_site_valid.producerMarketParticipantMrid);
            retA = JSON.parse(retA);
            // params.logger.log('retA=', retA)
            expect(retA.length).to.equal(1);

            const expected: Site[] = [ JSON.parse(JSON.stringify(Values.HTA_site_valid)) ];

            expect(retA).to.eql(expected);
        });

        // it('should return success on getSiteByProducer for non JSON value', async () => {
        //     let star = new Star();
        //     transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
        //         transactionContext.stub.states = {};
        //         transactionContext.stub.states[key] = 'non-json-value';
        //     });

        //     const siteHTA: Site = {meteringPointMrid: 'PDL00000000289766', systemOperatorMarketParticipantMrid: '17V0000009927464', producerMarketParticipantMrid: '17X000001309745X', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V0000009927464\",\"systemOperatorMarketParticipantName\": \"Enedis\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X000001309745X\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, JSON.stringify(siteHTA));

        //     const siteHTB: Site = {meteringPointMrid: 'PDL00000000289767', systemOperatorMarketParticipantMrid: '17V000000992746D', producerMarketParticipantMrid: '17X0000013097450', technologyType: 'Eolien', siteType: 'Injection', siteName: 'Ferme éolienne de Genonville', substationMrid: 'GDO A4RTD', substationName: 'CIVRAY', marketEvaluationPointMrid: 'CodePPE', schedulingEntityRegisteredResourceMrid: 'CodeEDP', siteAdminMrid: '489 981 029', siteLocation: 'Biscarosse', siteIecCode: 'S7X0000013077478', systemOperatorEntityFlexibilityDomainMrid: 'PSC4511', systemOperatorEntityFlexibilityDomainName: 'Départ 1', systemOperatorCustomerServiceName: 'DR Nantes Deux-Sèvres'}

        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"17V000000992746D\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
        //     await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrid\": \"17X0000013097450\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
        //     await star.CreateSite(transactionContext, JSON.stringify(siteHTB));

        //     let retB = await star.GetSitesByProducer(transactionContext, siteHTB.producerMarketParticipantMrid);
        //     retB = JSON.parse(retB);
        //     // params.logger.log('retB=', retB) //
        //     expect(retB.length).to.equal(2);

        //     const expected = [
        //         'non-json-value',
        //         {
        //             docType: "site",
        //             meteringPointMrid: "PDL00000000289767",
        //             producerMarketParticipantMrid: "17X0000013097450",
        //             siteAdminMrid: "489 981 029",
        //             siteIecCode: "S7X0000013077478",
        //             siteLocation: "Biscarosse",
        //             siteName: "Ferme éolienne de Genonville",
        //             siteType: "Injection",
        //             substationMrid: "GDO A4RTD",
        //             substationName: "CIVRAY",
        //             marketEvaluationPointMrid: "CodePPE",
        //             schedulingEntityRegisteredResourceMrid: "CodeEDP",
        //             systemOperatorCustomerServiceName: "DR Nantes Deux-Sèvres",
        //             systemOperatorEntityFlexibilityDomainMrid: "PSC4511",
        //             systemOperatorEntityFlexibilityDomainName: "Départ 1",
        //             systemOperatorMarketParticipantMrid: "17V000000992746D",
        //             technologyType: "Eolien",
        //         }
        //    ];

        //     expect(retB).to.eql(expected);
        // });

        it('should return success on getSites for producer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const producerMarketParticipantMrid = Values.HTA_site_valid_ProdA.producerMarketParticipantMrid;

            const iterator = Values.getSiteQueryMock2Values(Values.HTA_site_valid_ProdA, Values.HTA_site_valid_ProdB,collectionNames[0], mockHandler);
            const query = `{"selector": {"docType": "site", "producerMarketParticipantMrid": "${producerMarketParticipantMrid}"}}`;
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], query).resolves(iterator);

            //same producerMarketParticipantMrid for HTB and HTA but only one should can be seen by ENEDIS

            let retProd = await star.GetSitesByProducer(transactionContext, producerMarketParticipantMrid);
            retProd = JSON.parse(retProd);
            // params.logger.log('retProd=', retProd)
            expect(retProd.length).to.equal(2);

            const expected: Site[] = [JSON.parse(JSON.stringify(Values.HTA_site_valid_ProdA)), JSON.parse(JSON.stringify(Values.HTA_site_valid_ProdB))];

            expect(retProd).to.eql(expected);
        });
    });
});
function ChaincodeMessageHandler(ChaincodeMessageHandler: any): any {
    throw new Error('Function not implemented.');
}
