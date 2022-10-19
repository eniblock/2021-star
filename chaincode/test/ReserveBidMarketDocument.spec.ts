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
import { DocType } from '../src/enums/DocType';
import { QueryStateService } from '../src/controller/service/QueryStateService';
import { HLFServices } from '../src/controller/service/HLFservice';
import { CommonService } from '../src/controller/service/CommonService';

import { ReserveBidMarketDocument } from '../src/model/reserveBidMarketDocument';
import { ReserveBidMarketDocumentSiteDate } from '../src/model/reserveBidMarketDocumentSiteDate';
import { ReserveBidMarketDocumentFileList } from '../src/model/reserveBidMarketDocumentFileList';
import { AttachmentFile } from '../src/model/attachmentFile';
import { AttachmentFileStatus } from '../src/enums/AttachmentFileStatus';
import { ReserveBidMarketDocumentFileIdList } from '../src/model/reserveBidMarketDocumentFileIdList';
import { Site } from '../src/model/site';
import { ReserveBidMarketDocumentCreation } from '../src/model/reserveBidMarketDocumentCreation';
import { ActivationDocumentAbstract, ActivationDocumentDateMax, EnergyAmountAbstract, IndexedData, ReserveBidMarketDocumentAbstract } from '../src/model/dataIndexers';
import { ActivationEnergyAmountIndexersController, SiteActivationIndexersController, SiteReserveBidIndexersController } from '../src/controller/dataIndexersController';
import { ActivationDocument } from '../src/model/activationDocument/activationDocument';
import { EnergyAmount } from '../src/model/energyAmount';
import { BalancingDocument } from '../src/model/balancingDocument';
import { BalancingDocumentController } from '../src/controller/BalancingDocumentController';
import { ReserveBidStatus } from '../src/enums/ReserveBidStatus';
import { RoleType } from '../src/enums/RoleType';



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

describe('Star Tests ReserveBidMarketDocument', () => {
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

    // /* RESERVE BID MARKET DOCUMENT EXPOSED FUNCTIONS */
    // /*
    //     inputStr : reserveBidMarketDocumentCreation
    // */
    // public async CreateReserveBidMarketDocument(ctx: Context, inputStr: string)
    describe('Test CreateReserveBidMarketDocument', () => {
        it('should return ERROR on CreateReserveBidMarketDocument initial creation by Enedis', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const siteReserveBid: Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], siteReserveBid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(siteReserveBid)));

            const attachmentFile: AttachmentFile = JSON.parse(JSON.stringify(Values.AttachmentFile_1));
            const attachmentFileList: AttachmentFile[] = [attachmentFile];

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            reserveBidObj.attachments = [attachmentFile.fileId];

            const reserveBidCreationObj: ReserveBidMarketDocumentCreation = {
                reserveBid: reserveBidObj,
                attachmentFileList: attachmentFileList
            }

            try {
                await star.CreateReserveBidMarketDocument(transactionContext, JSON.stringify(reserveBidCreationObj));
            } catch (err) {
                // params.logger.info('err: ', err.message)
                expect(err.message).to.equal(`Organisation, ${OrganizationTypeMsp.ENEDIS} does not have write access to create a reserve bid market document`);
            }

        });





        it('should return ERROR on CreateReserveBidMarketDocument initial creation by RTE', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const siteReserveBid: Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], siteReserveBid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(siteReserveBid)));

            const attachmentFile: AttachmentFile = JSON.parse(JSON.stringify(Values.AttachmentFile_1));
            const attachmentFileList: AttachmentFile[] = [attachmentFile];

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            reserveBidObj.attachments = [attachmentFile.fileId];

            const reserveBidCreationObj: ReserveBidMarketDocumentCreation = {
                reserveBid: reserveBidObj,
                attachmentFileList: attachmentFileList
            }

            try {
                await star.CreateReserveBidMarketDocument(transactionContext, JSON.stringify(reserveBidCreationObj));
            } catch (err) {
                // params.logger.info('err: ', err.message)
                expect(err.message).to.equal(`Organisation, ${OrganizationTypeMsp.RTE} does not have write access to create a reserve bid market document`);
            }

        });




        it('should return ERROR on CreateReserveBidMarketDocument initial creation - site does not exist', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const attachmentFile: AttachmentFile = JSON.parse(JSON.stringify(Values.AttachmentFile_1));
            const attachmentFileList: AttachmentFile[] = [attachmentFile];

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            reserveBidObj.attachments = [attachmentFile.fileId];

            const reserveBidCreationObj: ReserveBidMarketDocumentCreation = {
                reserveBid: reserveBidObj,
                attachmentFileList: attachmentFileList
            }

            try {
                await star.CreateReserveBidMarketDocument(transactionContext, JSON.stringify(reserveBidCreationObj));
            } catch (err) {
                // params.logger.info('err: ', err.message)
                expect(err.message).to.equal(`site : ${reserveBidObj.meteringPointMrid} does not exist (not found in any collection). for reserve bid creation`);
            }

        });




        it('should return ERROR on CreateReserveBidMarketDocument initial creation', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const siteReserveBid: Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], siteReserveBid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(siteReserveBid)));

            const attachmentFile: AttachmentFile = JSON.parse(JSON.stringify(Values.AttachmentFile_1));

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            reserveBidObj.attachments = [attachmentFile.fileId];

            const reserveBidCreationObj: ReserveBidMarketDocumentCreation = {
                reserveBid: reserveBidObj
            }

            try {
                await star.CreateReserveBidMarketDocument(transactionContext, JSON.stringify(reserveBidCreationObj));
            } catch (err) {
                // params.logger.info('err: ', err.message)
                expect(err.message).to.equal(`attachmentFile : ${attachmentFile.fileId} does not exist (not found in any collection). for reserve bid creation`);
            }

        });





        it('should return SUCCESS on CreateReserveBidMarketDocument initial creation with attachment by Producer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const siteReserveBid: Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], siteReserveBid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(siteReserveBid)));

            const attachmentFile: AttachmentFile = JSON.parse(JSON.stringify(Values.AttachmentFile_1));
            const attachmentFileList: AttachmentFile[] = [attachmentFile];

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            reserveBidObj.attachments = [attachmentFile.fileId];

            const reserveBidCreationObj: ReserveBidMarketDocumentCreation = {
                reserveBid: reserveBidObj,
                attachmentFileList: attachmentFileList
            }

            await star.CreateReserveBidMarketDocument(transactionContext, JSON.stringify(reserveBidCreationObj));


            const expected: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj));
            expected.attachmentsWithStatus = [];
            expected.attachments = [attachmentFile.fileId];
            expected.attachmentsWithStatus = [{fileId:attachmentFile.fileId, status:AttachmentFileStatus.ACTIVE}];
            expected.reserveBidStatus = '';
            // params.logger.log('expected=', expected)

            const expectedFile: AttachmentFile = JSON.parse(JSON.stringify(attachmentFile));

            const indexedDataAbstract: ReserveBidMarketDocumentAbstract = {
                reserveBidMrid: expected.reserveBidMrid,
                reserveBidStatus: expected.reserveBidStatus,
                validityPeriodStartDateTime: expected.validityPeriodStartDateTime,
                createdDateTime: expected.createdDateTime
            };

            const expectedIndexer: IndexedData = {
                docType: DocType.DATA_INDEXER,
                indexedDataAbstractList: [indexedDataAbstract],
                indexId: SiteReserveBidIndexersController.getKey(expected.meteringPointMrid)
            };


            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expectedFile))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.getCall(2).args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(2).args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expectedIndexer))
            // params.logger.info("-----------")


            transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
                "enedis-producer",
                expected.reserveBidMrid,
                Buffer.from(JSON.stringify(expected))
            );
            transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
                "enedis-producer",
                expectedFile.fileId,
                Buffer.from(JSON.stringify(expectedFile))
            );
            transactionContext.stub.putPrivateData.getCall(2).should.have.been.calledWithExactly(
                "enedis-producer",
                expectedIndexer.indexId,
                Buffer.from(JSON.stringify(expectedIndexer))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(3);

        });




        it('should return SUCCESS on CreateReserveBidMarketDocument initial creation with existing attachment by Producer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const siteReserveBid: Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], siteReserveBid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(siteReserveBid)));

            const attachmentFile: AttachmentFile = JSON.parse(JSON.stringify(Values.AttachmentFile_1));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], attachmentFile.fileId).resolves(Buffer.from(JSON.stringify(attachmentFile)));

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            reserveBidObj.attachments = [attachmentFile.fileId];

            const reserveBidCreationObj: ReserveBidMarketDocumentCreation = {
                reserveBid: reserveBidObj
            }

            await star.CreateReserveBidMarketDocument(transactionContext, JSON.stringify(reserveBidCreationObj));


            const expected: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj));
            expected.attachmentsWithStatus = [];
            expected.attachments = [attachmentFile.fileId];
            expected.attachmentsWithStatus = [{fileId:attachmentFile.fileId, status:AttachmentFileStatus.ACTIVE}];
            expected.reserveBidStatus = '';
            // params.logger.log('expected=', expected)

            const indexedDataAbstract: ReserveBidMarketDocumentAbstract = {
                reserveBidMrid: expected.reserveBidMrid,
                reserveBidStatus: expected.reserveBidStatus,
                validityPeriodStartDateTime: expected.validityPeriodStartDateTime,
                createdDateTime: expected.createdDateTime
            };

            const expectedIndexer: IndexedData = {
                docType: DocType.DATA_INDEXER,
                indexedDataAbstractList: [indexedDataAbstract],
                indexId: SiteReserveBidIndexersController.getKey(expected.meteringPointMrid)
            };


            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expectedIndexer))
            // params.logger.info("-----------")


            transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
                "enedis-producer",
                expected.reserveBidMrid,
                Buffer.from(JSON.stringify(expected))
            );
            transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
                "enedis-producer",
                expectedIndexer.indexId,
                Buffer.from(JSON.stringify(expectedIndexer))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(2);

        });


    });





    // /*
    //     inputStr : ReserveBidMarketDocumentFileList
    //     output : reserveBidMarketDocument
    // */
    // public async AddFileToReserveBidMarketDocument(ctx: Context, inputStr: string)
    describe('Test AddFileToReserveBidMarketDocument', () => {
        it('should return SUCCESS on AddFileToReserveBidMarketDocument', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            reserveBidObj.attachmentsWithStatus = [];
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));

            const attachmentFile: AttachmentFile = JSON.parse(JSON.stringify(Values.AttachmentFile_1));

            const attachmentFileList: AttachmentFile[] = [attachmentFile];

            const reserveBidFileObj: ReserveBidMarketDocumentFileList = {
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                attachmentFileList: attachmentFileList
            }


            let ret = await star.AddFileToReserveBidMarketDocument(transactionContext, JSON.stringify(reserveBidFileObj));
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            const expected: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj));
            expected.attachmentsWithStatus = [];
            expected.attachments = [attachmentFile.fileId];
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);


            const expectedWritten: ReserveBidMarketDocument = JSON.parse(JSON.stringify(expected));
            expectedWritten.attachmentsWithStatus = [{fileId:attachmentFile.fileId, status:AttachmentFileStatus.ACTIVE}];
            const expectedFile: AttachmentFile = JSON.parse(JSON.stringify(attachmentFile));

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.secondCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.secondCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expectedFile))
            // params.logger.info("-----------")


            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "enedis-producer",
                expectedWritten.reserveBidMrid,
                Buffer.from(JSON.stringify(expectedWritten))
            );
            transactionContext.stub.putPrivateData.secondCall.should.have.been.calledWithExactly(
                "enedis-producer",
                expectedFile.fileId,
                Buffer.from(JSON.stringify(expectedFile))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(2);

        });

    });

    // /*
    //     inputStr : ReserveBidMarketDocumentFileList
    // */
    // public async RemoveFileFromReserveBidMarketDocument(ctx: Context, inputStr: string)
    describe('Test RemoveFileFromReserveBidMarketDocument', () => {
        it('should return SUCCESS on AddFileToReserveBidMarketDocument', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const attachmentFile: AttachmentFile = JSON.parse(JSON.stringify(Values.AttachmentFile_1));

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            reserveBidObj.attachmentsWithStatus = [{fileId:attachmentFile.fileId, status:AttachmentFileStatus.ACTIVE}];

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));


            const attachmentFileIdList: string[] = [attachmentFile.fileId];

            const reserveBidFileObj: ReserveBidMarketDocumentFileIdList = {
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                attachmentFileIdList: attachmentFileIdList
            }


            let ret = await star.RemoveFileFromReserveBidMarketDocument(transactionContext, JSON.stringify(reserveBidFileObj));
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            const expected: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj));
            expected.attachmentsWithStatus = [];
            expected.attachments = [];
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);


            const expectedWritten: ReserveBidMarketDocument = JSON.parse(JSON.stringify(expected));
            expectedWritten.attachmentsWithStatus = [{fileId:attachmentFile.fileId, status:AttachmentFileStatus.REMOVED}];

            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.firstCall.args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.firstCall.args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")


            transactionContext.stub.putPrivateData.firstCall.should.have.been.calledWithExactly(
                "enedis-producer",
                expectedWritten.reserveBidMrid,
                Buffer.from(JSON.stringify(expectedWritten))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(1);

        });

    });

    // /*
    //  inputStr : reserveBidMrid, newStatus
    //  output : ReserveBidMarketDocument
    // */
    // public async UpdateStatus(ctx: Context, reserveBidMrid: string, newStatus: string)
    describe('Test UpdateStatus', () => {
        it('should return ERROR on UpdateStatus - newStatus value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));

            const newStatus = "XXX";

            try {
                await star.UpdateStatusReserveBidMarketDocument(transactionContext, reserveBidObj.reserveBidMrid, newStatus);
            } catch (err) {
                // params.logger.info('err: ', err.message)
                expect(err.message).to.equal(`UpdateStatus : unkown bew Status ${newStatus}`);
            }
        });




        it('should return ERROR on UpdateStatus - Producer', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.PRODUCER);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));

            const newStatus = ReserveBidStatus.VALIDATED;

            try {
                await star.UpdateStatusReserveBidMarketDocument(transactionContext, reserveBidObj.reserveBidMrid, newStatus);
            } catch (err) {
                // params.logger.info('err: ', err.message)
                expect(err.message).to.equal(`Organisation, ${RoleType.Role_Producer} does not have write access to create a reserve bid market document`);
            }
        });




        it('should return SUCCESS on UpdateStatus - Enedis', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));

            const indexedDataAbstract: ReserveBidMarketDocumentAbstract = {
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime,
                reserveBidStatus: reserveBidObj.reserveBidStatus as string,
                createdDateTime: reserveBidObj.createdDateTime
            };
            const indexedDataAbstract2: ReserveBidMarketDocumentAbstract = {
                reserveBidMrid: Values.HTA_ReserveBidMarketDocument_2_Full.reserveBidMrid,
                validityPeriodStartDateTime: Values.HTA_ReserveBidMarketDocument_2_Full.validityPeriodStartDateTime,
                reserveBidStatus: Values.HTA_ReserveBidMarketDocument_2_Full.reserveBidStatus as string,
                createdDateTime: Values.HTA_ReserveBidMarketDocument_2_Full.createdDateTime
            };

            const indexedData: IndexedData = {
                docType: DocType.DATA_INDEXER,
                indexedDataAbstractList: [indexedDataAbstract, indexedDataAbstract2],
                indexId: SiteReserveBidIndexersController.getKey(reserveBidObj.meteringPointMrid)
            };

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            for (const collectionName of collectionNames) {
                transactionContext.stub.getPrivateData.withArgs(collectionName, reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));
                transactionContext.stub.getPrivateData.withArgs(collectionName, indexedData.indexId).resolves(Buffer.from(JSON.stringify(indexedData)));
            }


            const newStatus = ReserveBidStatus.VALIDATED;

            let ret = await star.UpdateStatusReserveBidMarketDocument(transactionContext, reserveBidObj.reserveBidMrid, newStatus);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            const expected: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj));
            expected.attachmentsWithStatus = [];
            expected.attachments = [];
            expected.reserveBidStatus = newStatus;
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);

            const expectedIndexedData: IndexedData = JSON.parse(JSON.stringify(indexedData));

            const expectedIndexedDataAbstract: ReserveBidMarketDocumentAbstract = {
                reserveBidMrid: expected.reserveBidMrid,
                reserveBidStatus: expected.reserveBidStatus as string,
                validityPeriodStartDateTime: expected.validityPeriodStartDateTime,
                createdDateTime: expected.createdDateTime
            };

            expectedIndexedData.indexedDataAbstractList = [expectedIndexedDataAbstract, indexedDataAbstract2];

            var i: number = 0;
            for (const collectionName of collectionNames) {
                // params.logger.info("-----------")
                // params.logger.info(transactionContext.stub.putPrivateData.getCall(i).args);
                // params.logger.info("ooooooooo")
                // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(i).args[2].toString()).toString('utf8'));
                // params.logger.info(JSON.stringify(expected))
                // params.logger.info("-----------")
                // params.logger.info(transactionContext.stub.putPrivateData.getCall(i+1).args);
                // params.logger.info("ooooooooo")
                // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(i+1).args[2].toString()).toString('utf8'));
                // params.logger.info(JSON.stringify(expectedIndexedData))

                transactionContext.stub.putPrivateData.getCall(i).should.have.been.calledWithExactly(
                    collectionName,
                    expected.reserveBidMrid,
                    Buffer.from(JSON.stringify(expected))
                );
                transactionContext.stub.putPrivateData.getCall(i+1).should.have.been.calledWithExactly(
                    collectionName,
                    indexedData.indexId,
                    Buffer.from(JSON.stringify(expectedIndexedData))
                );

                i=i+2;
            }
            // params.logger.info("-----------")

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(2*collectionNames.length);

        });




        it('should return SUCCESS on UpdateStatus with attachment and existing Activation Document - Enedis', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const siteReserveBid: Site = JSON.parse(JSON.stringify(Values.HTA_site_valid));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], siteReserveBid.meteringPointMrid).resolves(Buffer.from(JSON.stringify(siteReserveBid)));

            // Add ReserveBid and indexes in Transaction Context
            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));

            const indexedDataAbstract: ReserveBidMarketDocumentAbstract = {
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime,
                reserveBidStatus: reserveBidObj.reserveBidStatus as string,
                createdDateTime: reserveBidObj.createdDateTime
            };
            const indexedDataAbstract2: ReserveBidMarketDocumentAbstract = {
                reserveBidMrid: Values.HTA_ReserveBidMarketDocument_2_Full.reserveBidMrid,
                validityPeriodStartDateTime: Values.HTA_ReserveBidMarketDocument_2_Full.validityPeriodStartDateTime,
                reserveBidStatus: Values.HTA_ReserveBidMarketDocument_2_Full.reserveBidStatus as string,
                createdDateTime: Values.HTA_ReserveBidMarketDocument_2_Full.createdDateTime
            };

            const indexedData: IndexedData = {
                docType: DocType.DATA_INDEXER,
                indexedDataAbstractList: [indexedDataAbstract, indexedDataAbstract2],
                indexId: SiteReserveBidIndexersController.getKey(reserveBidObj.meteringPointMrid)
            };

            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], indexedData.indexId).resolves(Buffer.from(JSON.stringify(indexedData)));



            /// Add Max Date in transaction Context
            const maxDateId = SiteActivationIndexersController.getMaxKey(reserveBidObj.meteringPointMrid);
            const maxDate: ActivationDocumentDateMax = {
                docType: DocType.INDEXER_MAX_DATE,
                dateTime: reserveBidObj.validityPeriodStartDateTime as string,
            };

            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], maxDateId).resolves(Buffer.from(JSON.stringify(maxDate)));


            //Add Avaliable Activation Document in transaction context
            const activationDocumentObj: ActivationDocument = JSON.parse(JSON.stringify(Values.HTA_ActivationDocument_Valid));
            //New date after ReserveBidDate
            const newDate = CommonService.increaseDateDaysStr(reserveBidObj.validityPeriodStartDateTime as string, 1)
            activationDocumentObj.startCreatedDateTime = newDate;
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], activationDocumentObj.activationDocumentMrid).resolves(Buffer.from(JSON.stringify(activationDocumentObj)));


            //Add corresponding eneryAmount in transaction context
            const energyAmountObj: EnergyAmount = JSON.parse(JSON.stringify(Values.HTA_EnergyAmount));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], energyAmountObj.energyAmountMarketDocumentMrid).resolves(Buffer.from(JSON.stringify(energyAmountObj)));

            //Add Indexed enery Amount in transaction context
            const energyAmountIndexKey = ActivationEnergyAmountIndexersController.getKey(activationDocumentObj.activationDocumentMrid)
            const energyAmountAbstract : EnergyAmountAbstract = {energyAmountMarketDocumentMrid:energyAmountObj.energyAmountMarketDocumentMrid};
            const energyAmountIndexedData: IndexedData = {
                docType: DocType.DATA_INDEXER,
                indexedDataAbstractList:[energyAmountAbstract],
                indexId:energyAmountIndexKey
            };
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], energyAmountIndexKey).resolves(Buffer.from(JSON.stringify(energyAmountIndexedData)));


            /// Add Indexed Activation Document in transaction Context
            const indexedActivationDataId = SiteActivationIndexersController.getKey(reserveBidObj.meteringPointMrid, new Date(reserveBidObj.validityPeriodStartDateTime as string));

            const activationAbstract: ActivationDocumentAbstract =
                {activationDocumentMrid: activationDocumentObj.activationDocumentMrid, startCreatedDateTime: activationDocumentObj.startCreatedDateTime};

            const indexedDataActivation: IndexedData = {
                docType: DocType.DATA_INDEXER,
                indexId: indexedActivationDataId,
                indexedDataAbstractList : [activationAbstract],
            };

            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], indexedActivationDataId).resolves(Buffer.from(JSON.stringify(indexedDataActivation)));


            const newStatus = ReserveBidStatus.VALIDATED;

            let ret = await star.UpdateStatusReserveBidMarketDocument(transactionContext, reserveBidObj.reserveBidMrid, newStatus);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            const expected: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj));
            expected.attachmentsWithStatus = [];
            expected.attachments = [];
            expected.reserveBidStatus = newStatus;
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);

            const expectedIndexedData: IndexedData = JSON.parse(JSON.stringify(indexedData));

            const expectedIndexedDataAbstract: ReserveBidMarketDocumentAbstract = {
                reserveBidMrid: expected.reserveBidMrid,
                reserveBidStatus: expected.reserveBidStatus as string,
                validityPeriodStartDateTime: expected.validityPeriodStartDateTime,
                createdDateTime: expected.createdDateTime
            };

            expectedIndexedData.indexedDataAbstractList = [expectedIndexedDataAbstract, indexedDataAbstract2];


            // const expectedIndexer: IndexedData = {
            //     docType: DocType.DATA_INDEXER,
            //     indexedDataAbstractList: [indexedDataAbstract],
            //     indexId: SiteReserveBidIndexersController.getKey(expected.meteringPointMrid)
            // };


            const expectedBalancingDocument: BalancingDocument = params.values.get(ParametersType.BALANCING_DOCUMENT);

            const balancingDocumentMrid = BalancingDocumentController.getBalancingDocumentMrid(params, activationDocumentObj.activationDocumentMrid);
            expectedBalancingDocument.balancingDocumentMrid = balancingDocumentMrid;
            expectedBalancingDocument.activationDocumentMrid = activationDocumentObj.activationDocumentMrid;
            expectedBalancingDocument.energyAmountMarketDocumentMrid = energyAmountObj.energyAmountMarketDocumentMrid;
            expectedBalancingDocument.reserveBidMrid = reserveBidObj.reserveBidMrid;
            expectedBalancingDocument.senderMarketParticipantMrid = activationDocumentObj.senderMarketParticipantMrid;
            expectedBalancingDocument.receiverMarketParticipantMrid = activationDocumentObj.receiverMarketParticipantMrid;
            expectedBalancingDocument.createdDateTime = reserveBidObj.createdDateTime;
            expectedBalancingDocument.period = activationDocumentObj.startCreatedDateTime.concat("/").concat(activationDocumentObj.endCreatedDateTime as string);
            expectedBalancingDocument.quantityMeasureUnitName = energyAmountObj.measurementUnitName;
            expectedBalancingDocument.priceMeasureUnitName = reserveBidObj.priceMeasureUnitName;
            expectedBalancingDocument.currencyUnitName = reserveBidObj.currencyUnitName;
            expectedBalancingDocument.meteringPointMrid = activationDocumentObj.registeredResourceMrid;
            expectedBalancingDocument.quantity = Number(energyAmountObj.quantity);
            expectedBalancingDocument.activationPriceAmount = reserveBidObj.energyPriceAmount;
            expectedBalancingDocument.financialPriceAmount = expectedBalancingDocument.quantity * expectedBalancingDocument.activationPriceAmount;


            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.getCall(0).args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(0).args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expected))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.getCall(1).args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(1).args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expectedIndexedData))
            // params.logger.info("-----------")
            // params.logger.info(transactionContext.stub.putPrivateData.getCall(2).args);
            // params.logger.info("ooooooooo")
            // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(2).args[2].toString()).toString('utf8'));
            // params.logger.info(JSON.stringify(expectedBalancingDocument))
            // params.logger.info("-----------")

            transactionContext.stub.putPrivateData.getCall(0).should.have.been.calledWithExactly(
                "enedis-producer",
                expected.reserveBidMrid,
                Buffer.from(JSON.stringify(expected))
            );
            transactionContext.stub.putPrivateData.getCall(1).should.have.been.calledWithExactly(
                "enedis-producer",
                expectedIndexedData.indexId,
                Buffer.from(JSON.stringify(expectedIndexedData))
            );
            transactionContext.stub.putPrivateData.getCall(2).should.have.been.calledWithExactly(
                "enedis-producer",
                expectedBalancingDocument.balancingDocumentMrid,
                Buffer.from(JSON.stringify(expectedBalancingDocument))
            );

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(3);

        });




        it('should return SUCCESS on UpdateStatus - RTE', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));

            const indexedDataAbstract: ReserveBidMarketDocumentAbstract = {
                reserveBidMrid: reserveBidObj.reserveBidMrid,
                validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime,
                reserveBidStatus: reserveBidObj.reserveBidStatus as string,
                createdDateTime: reserveBidObj.createdDateTime
            };
            const indexedDataAbstract2: ReserveBidMarketDocumentAbstract = {
                reserveBidMrid: Values.HTA_ReserveBidMarketDocument_2_Full.reserveBidMrid,
                validityPeriodStartDateTime: Values.HTA_ReserveBidMarketDocument_2_Full.validityPeriodStartDateTime,
                reserveBidStatus: Values.HTA_ReserveBidMarketDocument_2_Full.reserveBidStatus as string,
                createdDateTime: Values.HTA_ReserveBidMarketDocument_2_Full.createdDateTime
            };

            const indexedData: IndexedData = {
                docType: DocType.DATA_INDEXER,
                indexedDataAbstractList: [indexedDataAbstract, indexedDataAbstract2],
                indexId: SiteReserveBidIndexersController.getKey(reserveBidObj.meteringPointMrid)
            };

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            for (const collectionName of collectionNames) {
                transactionContext.stub.getPrivateData.withArgs(collectionName, reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));
                transactionContext.stub.getPrivateData.withArgs(collectionName, indexedData.indexId).resolves(Buffer.from(JSON.stringify(indexedData)));
            }


            const newStatus = ReserveBidStatus.REFUSED;

            let ret = await star.UpdateStatusReserveBidMarketDocument(transactionContext, reserveBidObj.reserveBidMrid, newStatus);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            const expected: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj));
            expected.attachmentsWithStatus = [];
            expected.attachments = [];
            expected.reserveBidStatus = newStatus;
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);

            const expectedIndexedData: IndexedData = JSON.parse(JSON.stringify(indexedData));
            expectedIndexedData.indexedDataAbstractList = [indexedDataAbstract2];


            var i: number = 0;
            for (const collectionName of collectionNames) {
                // params.logger.info("-----------")
                // params.logger.info(transactionContext.stub.putPrivateData.getCall(i).args);
                // params.logger.info("ooooooooo")
                // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(i).args[2].toString()).toString('utf8'));
                // params.logger.info(JSON.stringify(expected))
                // params.logger.info("-----------")
                // params.logger.info(transactionContext.stub.putPrivateData.getCall(i+1).args);
                // params.logger.info("ooooooooo")
                // params.logger.info(Buffer.from(transactionContext.stub.putPrivateData.getCall(i+1).args[2].toString()).toString('utf8'));
                // params.logger.info(JSON.stringify(expectedIndexedData))

                transactionContext.stub.putPrivateData.getCall(i).should.have.been.calledWithExactly(
                    collectionName,
                    expected.reserveBidMrid,
                    Buffer.from(JSON.stringify(expected))
                );
                transactionContext.stub.putPrivateData.getCall(i+1).should.have.been.calledWithExactly(
                    collectionName,
                    indexedData.indexId,
                    Buffer.from(JSON.stringify(expectedIndexedData))
                );

                i=i+2;

            }
            // params.logger.info("-----------")

            expect(transactionContext.stub.putPrivateData.callCount).to.equal(2*collectionNames.length);

        });

    });

    // /*
    //     inputStr : reserveBidMarketDocumentCreationList
    // */
    // public async CreateReserveBidMarketDocumentList(ctx: Context, inputStr: string)
    describe('Test CreateReserveBidMarketDocumentList', () => {

    });

    // /*
    //     inputStr : ReserveBidMrid - string
    //     output : ReserveBidMarketDocument
    // */
    // public async getReserveBidMarketDocumentById(ctx: Context, inputStr: string)
    describe('Test getReserveBidMarketDocumentById', () => {
        it('should return ERROR on getReserveBidMarketDocumentById - not exists', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));

            try {
                await star.GetReserveBidMarketDocumentById(transactionContext, reserveBidObj.reserveBidMrid);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`reserveBidMarketDocument : ${reserveBidObj.reserveBidMrid} does not exist (not found in any collection).`);
            }
        });



        it('should return ERROR on getReserveBidMarketDocumentById - NON-JSON value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], reserveBidObj.reserveBidMrid).resolves(Buffer.from("x"));

            try {
                await star.GetReserveBidMarketDocumentById(transactionContext, reserveBidObj.reserveBidMrid);
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`ERROR reserveBidMarketDocument -> Input string NON-JSON value`);
            }
        });



        it('should return SUCCESS on getReserveBidMarketDocumentById', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const reserveBidObj:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], reserveBidObj.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj)));



            let retA = await star.GetReserveBidMarketDocumentById(transactionContext, reserveBidObj.reserveBidMrid);
            retA = JSON.parse(retA);
            // params.logger.log('retA=', retA)

            const expected: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj));
            expected.attachmentsWithStatus = [];
            // params.logger.log('expected=', expected)

            expect(retA).to.eql(expected);
        });

    });







    // /*
    //     inputStr : ReserveBidMrid[] - string[]
    //     output : ReserveBidMarketDocument[]
    // */
    // public async getReserveBidMarketDocumentListById(ctx: Context, inputStr: string)
    describe('Test getReserveBidMarketDocumentListById', () => {
        it('should return ERROR on getReserveBidMarketDocumentById - not exists', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);

            const reserveBidObj1:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            const reserveBidObj2:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_2_Full));


            const idList: string[] = [reserveBidObj1.reserveBidMrid, reserveBidObj2.reserveBidMrid];

            try {
                await star.GetReserveBidMarketDocumentListById(transactionContext, JSON.stringify(idList));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`reserveBidMarketDocument : ${reserveBidObj1.reserveBidMrid} does not exist (not found in any collection).`);
            }
        });



        it('should return ERROR on getReserveBidMarketDocumentById - NON-JSON value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const reserveBidObj1:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], reserveBidObj1.reserveBidMrid).resolves(Buffer.from("x"));
            const reserveBidObj2:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_2_Full));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], reserveBidObj2.reserveBidMrid).resolves(Buffer.from("x"));


            const idList: string[] = [reserveBidObj1.reserveBidMrid, reserveBidObj2.reserveBidMrid];

            try {
                await star.GetReserveBidMarketDocumentListById(transactionContext, JSON.stringify(idList));
            } catch(err) {
                // params.logger.info(err.message)
                expect(err.message).to.equal(`ERROR reserveBidMarketDocument -> Input string NON-JSON value`);
            }
        });



        it('should return SUCCESS on getReserveBidMarketDocumentById', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const reserveBidObj1:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], reserveBidObj1.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj1)));
            const reserveBidObj2:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_2_Full));
            transactionContext.stub.getPrivateData.withArgs(collectionNames[0], reserveBidObj2.reserveBidMrid).resolves(Buffer.from(JSON.stringify(reserveBidObj2)));


            const idList: string[] = [reserveBidObj1.reserveBidMrid, reserveBidObj2.reserveBidMrid];
            let ret = await star.GetReserveBidMarketDocumentListById(transactionContext, JSON.stringify(idList));
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            expect(ret.length).to.equal(2);

            const expected1: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj1));
            expected1.attachmentsWithStatus = [];
            const expected2: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj2));
            expected2.attachmentsWithStatus = [];

            const expected: ReserveBidMarketDocument[] = [expected1, expected2];
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });


    });




    // /*
    //     inputStr : meteringPointMrid - string
    //     output : ReserveBidMarketDocument[]
    // */
    // public async getReserveBidMarketDocumentBySite(ctx: Context, inputStr: string)
    describe('Test getReserveBidMarketDocumentBySite', () => {
        it('should return ERROR on getReserveBidMarketDocumentBySite - not exists', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const reserveBidObj1:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));

            let ret = await star.GetReserveBidMarketDocumentBySite(transactionContext, reserveBidObj1.meteringPointMrid);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            expect(ret.length).to.equal(0);
        });



        it('should return SUCCESS on getReserveBidMarketDocumentBySite', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const reserveBidObj1:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));
            const reserveBidObj2:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_2_Full));

            const query = `{"selector": {"docType": "${DocType.RESERVE_BID_MARKET_DOCUMENT}", "meteringPointMrid": "${reserveBidObj1.meteringPointMrid}"}}`;
            const iterator = Values.getQueryMockArrayValues([reserveBidObj1, reserveBidObj2], mockHandler);

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], query).resolves(iterator);


            let ret = await star.GetReserveBidMarketDocumentBySite(transactionContext, reserveBidObj1.meteringPointMrid);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            expect(ret.length).to.equal(2);

            const expected1: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj1));
            expected1.attachmentsWithStatus = [];
            const expected2: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj2));
            expected2.attachmentsWithStatus = [];

            const expected: ReserveBidMarketDocument[] = [expected1, expected2];
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });

    });




    // /*
    //     inputStr : meteringPointMrid - string
    //     output : ReserveBidMarketDocument[]
    // */
    // public async getValidReserveBidMarketDocumentBySite(ctx: Context, inputStr: string)
    describe('Test getValidReserveBidMarketDocumentBySite', () => {
        it('should return SUCCESS on getValidReserveBidMarketDocumentBySite', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const date = new Date();
            date.setUTCHours(0,0,0,0);
            const criteriaDate = date.toISOString();

            const reserveBidObj1:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));

            var args: string[] = [];
            args.push(`"meteringPointMrid":"${reserveBidObj1.meteringPointMrid}"`);

            args.push(`"reserveBidStatus":"${ReserveBidStatus.VALIDATED}"`);

            args.push(`"validityPeriodStartDateTime":{"$lte": ${JSON.stringify(criteriaDate)}}`);

            var argOrEnd: string[] = [];
            argOrEnd.push(`"validityPeriodEndDateTime":{"$gte": ${JSON.stringify(criteriaDate)}}`);
            argOrEnd.push(`"validityPeriodEndDateTime":""`);
            argOrEnd.push(`"validityPeriodEndDateTime":{"$exists": false}`);
            args.push(await QueryStateService.buildORCriteria(argOrEnd));


            const query = await QueryStateService.buildQuery(
                {documentType: DocType.RESERVE_BID_MARKET_DOCUMENT,
                queryArgs: args,
                sort: [`"validityPeriodStartDateTime":"desc"`,`"createdDateTime":"desc"`],
                limit:1});

            const iterator1 = Values.getQueryMockArrayValues([reserveBidObj1], mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], query).resolves(iterator1);



            const reserveBidObj2:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_2_Full));


            var argsNext: string[] = [];
            argsNext.push(`"meteringPointMrid":"${reserveBidObj2.meteringPointMrid}"`);

            args.push(`"reserveBidStatus":"${ReserveBidStatus.VALIDATED}"`);

            argsNext.push(`"validityPeriodStartDateTime":{"$gte": ${JSON.stringify(criteriaDate)}}`);

            var argOrEnd: string[] = [];
            argOrEnd.push(`"validityPeriodEndDateTime":{"$gte": ${JSON.stringify(criteriaDate)}}`);
            argOrEnd.push(`"validityPeriodEndDateTime":""`);
            argOrEnd.push(`"validityPeriodEndDateTime":{"$exists": false}`);
            argsNext.push(await QueryStateService.buildORCriteria(argOrEnd));

            const queryNext = await QueryStateService.buildQuery(
                {documentType: DocType.RESERVE_BID_MARKET_DOCUMENT,
                queryArgs: argsNext,
                sort: [`"validityPeriodStartDateTime":"asc"`,`"createdDateTime":"desc"`]});

            const iteratorNext = Values.getQueryMockArrayValues([reserveBidObj2], mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], queryNext).resolves(iteratorNext);

            // params.logger.log('query=', query)
            // params.logger.log('queryNext=', queryNext)

            let ret = await star.GetValidReserveBidMarketDocumentBySite(transactionContext, reserveBidObj1.meteringPointMrid);
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            expect(ret.length).to.equal(2);

            const expected1: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj1));
            expected1.attachmentsWithStatus = [];
            const expected2: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj2));
            expected2.attachmentsWithStatus = [];

            const expected: ReserveBidMarketDocument[] = [expected1, expected2];
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });
    });




    // /*
    //     inputStr : reserveBidMarketDocumentSiteDate
    //     output : ReserveBidMarketDocument[]
    // */
    // public async getAtDateReserveBidMarketDocumentBySite(ctx: Context, inputStr: string)
    describe('Test getAtDateReserveBidMarketDocumentBySite', () => {
        it('should return SUCCESS on getAtDateReserveBidMarketDocumentBySite With Next', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const date = new Date();
            date.setUTCHours(0,0,0,0);
            const criteriaDate = date.toISOString();

            const reserveBidObj1:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));

            var args: string[] = [];
            args.push(`"meteringPointMrid":"${reserveBidObj1.meteringPointMrid}"`);

            args.push(`"reserveBidStatus":"${ReserveBidStatus.VALIDATED}"`);

            args.push(`"validityPeriodStartDateTime":{"$lte": ${JSON.stringify(criteriaDate)}}`);

            var argOrEnd: string[] = [];
            argOrEnd.push(`"validityPeriodEndDateTime":{"$gte": ${JSON.stringify(criteriaDate)}}`);
            argOrEnd.push(`"validityPeriodEndDateTime":""`);
            argOrEnd.push(`"validityPeriodEndDateTime":{"$exists": false}`);
            args.push(await QueryStateService.buildORCriteria(argOrEnd));


            const query = await QueryStateService.buildQuery(
                {documentType: DocType.RESERVE_BID_MARKET_DOCUMENT,
                queryArgs: args,
                sort: [`"validityPeriodStartDateTime":"desc"`,`"createdDateTime":"desc"`],
                limit:1});

            const iterator1 = Values.getQueryMockArrayValues([reserveBidObj1], mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], query).resolves(iterator1);



            const reserveBidObj2:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_2_Full));


            var argsNext: string[] = [];
            argsNext.push(`"meteringPointMrid":"${reserveBidObj2.meteringPointMrid}"`);

            args.push(`"reserveBidStatus":"${ReserveBidStatus.VALIDATED}"`);

            argsNext.push(`"validityPeriodStartDateTime":{"$gte": ${JSON.stringify(criteriaDate)}}`);

            var argOrEnd: string[] = [];
            argOrEnd.push(`"validityPeriodEndDateTime":{"$gte": ${JSON.stringify(criteriaDate)}}`);
            argOrEnd.push(`"validityPeriodEndDateTime":""`);
            argOrEnd.push(`"validityPeriodEndDateTime":{"$exists": false}`);
            argsNext.push(await QueryStateService.buildORCriteria(argOrEnd));

            const queryNext = await QueryStateService.buildQuery(
                {documentType: DocType.RESERVE_BID_MARKET_DOCUMENT,
                queryArgs: argsNext,
                sort: [`"validityPeriodStartDateTime":"asc"`,`"createdDateTime":"desc"`]});

            const iteratorNext = Values.getQueryMockArrayValues([reserveBidObj2], mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], queryNext).resolves(iteratorNext);


            const criteriaObj: ReserveBidMarketDocumentSiteDate = {
                meteringPointMrid: reserveBidObj1.meteringPointMrid,
                includeNext: true,
                referenceDateTime: JSON.stringify(criteriaDate)
            };

            let ret = await star.GetAtDateReserveBidMarketDocumentBySite(transactionContext, JSON.stringify(criteriaObj));
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            expect(ret.length).to.equal(2);

            const expected1: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj1));
            expected1.attachmentsWithStatus = [];
            const expected2: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj2));
            expected2.attachmentsWithStatus = [];

            const expected: ReserveBidMarketDocument[] = [expected1, expected2];
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });




        it('should return SUCCESS on getAtDateReserveBidMarketDocumentBySite Without Next', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            const params: STARParameters = await ParametersController.getParameterValues(transactionContext);

            const collectionNames: string[] = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET);

            const date = new Date();
            date.setUTCHours(0,0,0,0);
            const criteriaDate = date.toISOString();

            const reserveBidObj1:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_1_Full));

            var args: string[] = [];
            args.push(`"meteringPointMrid":"${reserveBidObj1.meteringPointMrid}"`);

            args.push(`"reserveBidStatus":"${ReserveBidStatus.VALIDATED}"`);

            args.push(`"validityPeriodStartDateTime":{"$lte": ${JSON.stringify(criteriaDate)}}`);

            var argOrEnd: string[] = [];
            argOrEnd.push(`"validityPeriodEndDateTime":{"$gte": ${JSON.stringify(criteriaDate)}}`);
            argOrEnd.push(`"validityPeriodEndDateTime":""`);
            argOrEnd.push(`"validityPeriodEndDateTime":{"$exists": false}`);
            args.push(await QueryStateService.buildORCriteria(argOrEnd));


            const query = await QueryStateService.buildQuery(
                {documentType: DocType.RESERVE_BID_MARKET_DOCUMENT,
                queryArgs: args,
                sort: [`"validityPeriodStartDateTime":"desc"`,`"createdDateTime":"desc"`],
                limit:1});

            // params.logger.log("test query: ", query)

            const iterator1 = Values.getQueryMockArrayValues([reserveBidObj1], mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], query).resolves(iterator1);



            const reserveBidObj2:ReserveBidMarketDocument = JSON.parse(JSON.stringify(Values.HTA_ReserveBidMarketDocument_2_Full));


            var argsNext: string[] = [];
            argsNext.push(`"meteringPointMrid":"${reserveBidObj2.meteringPointMrid}"`);

            args.push(`"reserveBidStatus":"${ReserveBidStatus.VALIDATED}"`);

            argsNext.push(`"validityPeriodStartDateTime":{"$gte": ${JSON.stringify(criteriaDate)}}`);

            var argOrEnd: string[] = [];
            argOrEnd.push(`"validityPeriodEndDateTime":{"$gte": ${JSON.stringify(criteriaDate)}}`);
            argOrEnd.push(`"validityPeriodEndDateTime":""`);
            argOrEnd.push(`"validityPeriodEndDateTime":{"$exists": false}`);
            argsNext.push(await QueryStateService.buildORCriteria(argOrEnd));

            const queryNext = await QueryStateService.buildQuery(
                {documentType: DocType.RESERVE_BID_MARKET_DOCUMENT,
                queryArgs: argsNext,
                sort: [`"validityPeriodStartDateTime":"asc"`,`"createdDateTime":"desc"`]});

            // params.logger.log("test queryNext: ", queryNext);

            const iteratorNext = Values.getQueryMockArrayValues([reserveBidObj2], mockHandler);
            transactionContext.stub.getPrivateDataQueryResult.withArgs(collectionNames[0], queryNext).resolves(iteratorNext);


            const criteriaObj: ReserveBidMarketDocumentSiteDate = {
                meteringPointMrid: reserveBidObj1.meteringPointMrid,
                includeNext: false,
                referenceDateTime: JSON.stringify(criteriaDate)
            };

            let ret = await star.GetAtDateReserveBidMarketDocumentBySite(transactionContext, JSON.stringify(criteriaObj));
            ret = JSON.parse(ret);
            // params.logger.log('ret=', ret)

            expect(ret.length).to.equal(1);

            const expected1: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj1));
            expected1.attachmentsWithStatus = [];

            const expected: ReserveBidMarketDocument[] = [expected1];
            // params.logger.log('expected=', expected)

            expect(ret).to.eql(expected);
        });
    });



});
