'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'
import { EnergyAccount } from '../src/model/energyAccount';
import { STARParameters } from '../src/model/starParameters';

import { ParametersController } from '../src/controller/ParametersController';
import { ParametersType } from '../src/enums/ParametersType';
import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';
import { DocType } from '../src/enums/DocType';
import { QueryStateService } from '../src/controller/service/QueryStateService';
import { HLFServices } from '../src/controller/service/HLFservice';
import { AttachmentFile } from '../src/model/attachmentFile';
import { BalancingDocumentSearchCriteria } from '../src/model/BalancingDocumentSearchCriteria';
import { BalancingDocument } from '../src/model/balancingDocument';



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

async function prepareSearchQuery(criteriaObj: BalancingDocumentSearchCriteria): Promise<string> {
    var args: string[] = [];
    if (criteriaObj.meteringPointMrid && criteriaObj.meteringPointMrid.length > 0) {
        args.push(`"meteringPointMrid":"${criteriaObj.meteringPointMrid}"`);
    }
    if (criteriaObj.activationDocumentMrid && criteriaObj.activationDocumentMrid.length > 0) {
        args.push(`"activationDocumentMrid":"${criteriaObj.activationDocumentMrid}"`);
    }
    if (criteriaObj.startCreatedDateTime && criteriaObj.startCreatedDateTime.length > 0) {
        args.push(`"createdDateTime":{"$gte": ${JSON.stringify(criteriaObj.startCreatedDateTime)}}`);
    }
    if (criteriaObj.endCreatedDateTime && criteriaObj.endCreatedDateTime.length > 0) {
        args.push(`"createdDateTime":{"$lte": ${JSON.stringify(criteriaObj.endCreatedDateTime)}}`);
    }

    const query = await QueryStateService.buildQuery({documentType: DocType.BALANCING_DOCUMENT, queryArgs: args});

    return query;
}


describe('Star Tests Balancing Document', () => {
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



    // /*
    //     inputStr : BalancingDocumentSearchCriteria
    //     output : BalancingDocument[]
    // */
    // public async SearchBalancingDocumentByCriteria(ctx: Context, inputStr: string)
    describe('Test SearchBalancingDocumentByCriteria', () => {

        it('should return ERROR', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const criteriaObj: BalancingDocumentSearchCriteria = {};

            try {
                await star.SearchBalancingDocumentByCriteria(transactionContext, JSON.stringify(criteriaObj));
            } catch (err) {
                // params.logger.log('err=', err)
                expect(err.message).to.equal(`Balancing Document Search criteria needs, at least, 1 criteria`);
            }
        });



        it('should return success on meteringPointMrid', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const balancingDocument: BalancingDocument = JSON.parse(JSON.stringify(Values.BalancingDocument_1));

            const criteriaObj: BalancingDocumentSearchCriteria = {meteringPointMrid:balancingDocument.meteringPointMrid};
            const query = await prepareSearchQuery(criteriaObj);

            const iterator = Values.getQueryMockArrayValues([balancingDocument], mockHandler);

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], query).resolves(iterator);



            let ret = await star.SearchBalancingDocumentByCriteria(transactionContext, JSON.stringify(criteriaObj));
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            expect(ret.length).to.equal(1);

            const excepted1: BalancingDocument = JSON.parse(JSON.stringify(balancingDocument));
            const expected: [BalancingDocument] = [excepted1];
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });



        it('should return success on activationDocumentMrid', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const balancingDocument: BalancingDocument = JSON.parse(JSON.stringify(Values.BalancingDocument_1));

            const criteriaObj: BalancingDocumentSearchCriteria = {activationDocumentMrid:balancingDocument.activationDocumentMrid};
            const query = await prepareSearchQuery(criteriaObj);

            const iterator = Values.getQueryMockArrayValues([balancingDocument], mockHandler);

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], query).resolves(iterator);



            let ret = await star.SearchBalancingDocumentByCriteria(transactionContext, JSON.stringify(criteriaObj));
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            expect(ret.length).to.equal(1);

            const excepted1: BalancingDocument = JSON.parse(JSON.stringify(balancingDocument));
            const expected: [BalancingDocument] = [excepted1];
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });



        it('should return success on startCreatedDateTime', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const balancingDocument: BalancingDocument = JSON.parse(JSON.stringify(Values.BalancingDocument_1));

            const startCreatedDateTime = Values.reduceDateDaysStr(balancingDocument.createdDateTime as string, 1);
            const criteriaObj: BalancingDocumentSearchCriteria = {startCreatedDateTime:startCreatedDateTime};
            const query = await prepareSearchQuery(criteriaObj);

            const iterator = Values.getQueryMockArrayValues([balancingDocument], mockHandler);

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], query).resolves(iterator);



            let ret = await star.SearchBalancingDocumentByCriteria(transactionContext, JSON.stringify(criteriaObj));
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            expect(ret.length).to.equal(1);

            const excepted1: BalancingDocument = JSON.parse(JSON.stringify(balancingDocument));
            const expected: [BalancingDocument] = [excepted1];
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });



        it('should return success on startCreatedDateTime and endCreatedDateTime', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const balancingDocument: BalancingDocument = JSON.parse(JSON.stringify(Values.BalancingDocument_1));

            const startCreatedDateTime = Values.reduceDateDaysStr(balancingDocument.createdDateTime as string, 1);
            const endCreatedDateTime = Values.increaseDateDaysStr(balancingDocument.createdDateTime as string, 1);
            const criteriaObj: BalancingDocumentSearchCriteria = {startCreatedDateTime:startCreatedDateTime, endCreatedDateTime: endCreatedDateTime};
            const query = await prepareSearchQuery(criteriaObj);

            const iterator = Values.getQueryMockArrayValues([balancingDocument], mockHandler);

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], query).resolves(iterator);



            let ret = await star.SearchBalancingDocumentByCriteria(transactionContext, JSON.stringify(criteriaObj));
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            expect(ret.length).to.equal(1);

            const excepted1: BalancingDocument = JSON.parse(JSON.stringify(balancingDocument));
            const expected: [BalancingDocument] = [excepted1];
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });

    });



});
