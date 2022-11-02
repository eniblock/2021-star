'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'
import { STARParameters } from '../src/model/starParameters';

import { ParametersController } from '../src/controller/ParametersController';
import { ParametersType } from '../src/enums/ParametersType';
import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';
import { HLFServices } from '../src/controller/service/HLFservice';
import { AttachmentFile } from '../src/model/attachmentFile';



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

describe('Star Tests AttachmentFile', () => {
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

    // // /*
    // //     inputStr : file[]
    // // */
    // // public async CreateFiles(ctx: Context, inputStr: string) {
    // describe('Test CreateFiles', () => {

    // });

    // /*
    //     inputStr : file id - string
    //     output : File
    // */
    // public async GetFileById(ctx: Context, inputStr: string)
    describe('Test GetFileById', () => {

        it('should return success on GetFileById Enedis', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const attachmentFile:AttachmentFile = JSON.parse(JSON.stringify(Values.AttachmentFile_1));
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], attachmentFile.fileId).resolves(Buffer.from(JSON.stringify(attachmentFile)));

            let retA = await star.GetFileById(transactionContext, attachmentFile.fileId);
            retA = JSON.parse(retA);
            // params.logger.log('retA=', retA)

            const expected: AttachmentFile = JSON.parse(JSON.stringify(attachmentFile));
            // params.logger.log('expected=', expected)

            expect(retA).to.eql(expected);
        });

        it('should return success on GetFileById RTE', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const attachmentFile:AttachmentFile = JSON.parse(JSON.stringify(Values.AttachmentFile_1));
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], attachmentFile.fileId).resolves(Buffer.from(JSON.stringify(attachmentFile)));

            let retA = await star.GetFileById(transactionContext, attachmentFile.fileId);
            retA = JSON.parse(retA);
            // params.logger.log('retA=', retA)

            const expected: AttachmentFile = JSON.parse(JSON.stringify(attachmentFile));
            // params.logger.log('expected=', expected)

            expect(retA).to.eql(expected);
        });

        it('should return success on GetFileById Producer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const attachmentFile:AttachmentFile = JSON.parse(JSON.stringify(Values.AttachmentFile_1));
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], attachmentFile.fileId).resolves(Buffer.from(JSON.stringify(attachmentFile)));

            let retA = await star.GetFileById(transactionContext, attachmentFile.fileId);
            retA = JSON.parse(retA);
            // params.logger.log('retA=', retA)

            const expected: AttachmentFile = JSON.parse(JSON.stringify(attachmentFile));
            // params.logger.log('expected=', expected)

            expect(retA).to.eql(expected);
        });

    });



});
