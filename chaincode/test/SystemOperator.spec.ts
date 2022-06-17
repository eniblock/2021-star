
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import { Star } from '../src/star'
import { SystemOperator } from '../src/model/systemOperator';

import { OrganizationTypeMsp } from '../src/enums/OrganizationMspType';

import { Values } from './Values';
import { DocType } from '../src/enums/DocType';


class TestContext {
    clientIdentity: any;
    stub: any;

    constructor() {
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.clientIdentity.getMSPID.returns(Values.FakeMSP);
        this.stub = sinon.createStubInstance(ChaincodeStub);
    }

}



describe('Star Tests SYSTEM OPERATORS', () => {
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

    // describe('Test InitLedger', () => {
    //     it('should return ERROR on InitLedger', async () => {
    //         transactionContext.stub.putState.rejects('failed inserting key');
    //         let star = new Star();
    //         try {
    //             await star.initLedger(transactionContext);
    //         } catch (err) {
    //             // console.info(err.message)
    //             expect(err.name).to.equal('failed inserting key');
    //         }
    //     });

    //     it('should return SUCCESS on InitLedger', async () => {

    //         let star = new Star();
    //         await star.initLedger(transactionContext);
    //     });
    // });

    describe('Test createSystemOperator', () => {
        // it('should return ERROR on createSystemOperator', async () => {
        //     transactionContext.stub.putState.rejects('failed inserting key');

        //     let star = new Star();
        //     transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
        //     try {
        //         await star.CreateSystemOperator(transactionContext, '{\"RTE01EIC\",\"RTE\",\"A49\"}');
        //     } catch(err) {
        //         console.info(err)
        //         expect(err.name).to.equal('failed inserting key');
        //     }
        // });

        it('should return ERROR wrong MSPID', async () => {
            transactionContext.clientIdentity.getMSPID.returns(Values.FakeMSP);
            try {
                await star.CreateSystemOperator(transactionContext, JSON.stringify(Values.HTB_systemoperator));
            } catch(err) {
                console.info(err.message)
                const msg = 'Organisation, '.concat(Values.FakeMSP).concat(' does not have write access to create a system operator');
                expect(err.message).to.equal(msg);
            }
        });

        it('should return ERROR NON-JSON value', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.CreateSystemOperator(transactionContext, 'toto');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('ERROR createSystemOperator-> Input string NON-JSON value');
            }
        });

        it('should return ERROR right MSPID TSO -> DSO', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            try {
                await star.CreateSystemOperator(transactionContext, JSON.stringify(Values.HTA_systemoperator));
            } catch(err) {
                console.info(err.message)
                const msg = 'Organisation, '.concat(OrganizationTypeMsp.RTE).concat(' does not have write access for ').concat(OrganizationTypeMsp.ENEDIS);
                expect(err.message).to.equal(msg);
            }
        });

        it('should return ERROR right MSPID DSO -> TSO', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            try {
                await star.CreateSystemOperator(transactionContext, JSON.stringify(Values.HTB_systemoperator));
            } catch(err) {
                console.info(err.message)
                const msg = 'Organisation, '.concat(OrganizationTypeMsp.ENEDIS).concat(' does not have write access for ').concat(OrganizationTypeMsp.RTE);
                expect(err.message).to.equal(msg);
            }
        });

        it('should return SUCCESS with RTE on createSystemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            await star.CreateSystemOperator(transactionContext, JSON.stringify(Values.HTB_systemoperator));

            const expected = JSON.parse(JSON.stringify(Values.HTB_systemoperator))
            expected.docType = DocType.SYSTEM_OPERATOR;
            transactionContext.stub.putState.should.have.been.calledOnceWithExactly(
                Values.HTB_systemoperator.systemOperatorMarketParticipantMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putState.callCount).to.equal(1);
        });

        it('should return SUCCESS with Enedis on createSystemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            await star.CreateSystemOperator(transactionContext, JSON.stringify(Values.HTA_systemoperator));

            const expected = JSON.parse(JSON.stringify(Values.HTA_systemoperator))
            expected.docType = DocType.SYSTEM_OPERATOR;
            transactionContext.stub.putState.should.have.been.calledOnceWithExactly(
                Values.HTA_systemoperator.systemOperatorMarketParticipantMrid,
                Buffer.from(JSON.stringify(expected))
            );

            expect(transactionContext.stub.putState.callCount).to.equal(1);
        });
    });

    describe('Test QuerySystemOperator', () => {
        it('should return ERROR on QuerySystemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            try {
                await star.QuerySystemOperator(transactionContext, 'toto');
            } catch (err) {
                // console.info(err.message)
                expect(err.message).to.equal('System Operator : toto does not exist');
            }
        });

        it('should return SUCCESS on QuerySystemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            let test = JSON.parse(await star.QuerySystemOperator(transactionContext, Values.HTB_systemoperator.systemOperatorMarketParticipantMrid));
            expect(test).to.eql(Values.HTB_systemoperator);
        });
    });

    describe('Test UpdateSystemOperator', () => {
        it('should return ERROR on UpdateSystemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            const systemoperator = JSON.parse(JSON.stringify(Values.HTB_systemoperator));
            systemoperator.systemOperatorMarketParticipantMrid = "XXX";

            try {
                await star.UpdateSystemOperator(transactionContext, JSON.stringify(systemoperator));
            } catch (err) {
                expect(err.message).to.equal('System Operator : XXX does not exist');
            }
        });

        it('should return ERROR on UpdateSystemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            try {
                await star.UpdateSystemOperator(transactionContext, 'toto');
            } catch (err) {
                expect(err.message).to.equal('ERROR createSystemOperator-> Input string NON-JSON value');
            }
        });

        it('should return ERROR wrong MSPID', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            try {
                transactionContext.clientIdentity.getMSPID.returns(Values.FakeMSP);
                await star.UpdateSystemOperator(transactionContext, JSON.stringify(Values.HTB_systemoperator));
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access to update a system operator');
            }
        });

        it('should return ERROR right MSPID TSO -> DSO', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            const systemoperator = JSON.parse(JSON.stringify(Values.HTB_systemoperator));
            systemoperator.systemOperatorMarketParticipantName = OrganizationTypeMsp.ENEDIS;

            try {
                await star.UpdateSystemOperator(transactionContext, JSON.stringify(systemoperator));
            } catch(err) {
                console.info(err.message)
                const msg = 'Organisation, '.concat(OrganizationTypeMsp.RTE).concat(' does not have write access for ').concat(OrganizationTypeMsp.ENEDIS);
                expect(err.message).to.equal(msg);
            }
        });

        it('should return ERROR right MSPID DSO -> TSO', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
            transactionContext.stub.getState.withArgs(Values.HTA_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTA_systemoperator)));

            const systemoperator = JSON.parse(JSON.stringify(Values.HTA_systemoperator));
            systemoperator.systemOperatorMarketParticipantName = OrganizationTypeMsp.RTE;

            try {
                await star.UpdateSystemOperator(transactionContext, JSON.stringify(systemoperator));
            } catch(err) {
                console.info(err.message)
                const msg = 'Organisation, '.concat(OrganizationTypeMsp.ENEDIS).concat(' does not have write access for ').concat(OrganizationTypeMsp.RTE);
                expect(err.message).to.equal(msg);
            }
        });

        it('should return SUCCESS on UpdateSystemOperator', async () => {
            transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
            transactionContext.stub.getState.withArgs(Values.HTB_systemoperator.systemOperatorMarketParticipantMrid).resolves(Buffer.from(JSON.stringify(Values.HTB_systemoperator)));

            const systemoperator = JSON.parse(JSON.stringify(Values.HTB_systemoperator));
            systemoperator.systemOperatorMarketParticipantRoleType = "XXX";

            await star.UpdateSystemOperator(transactionContext, JSON.stringify(systemoperator));

            systemoperator.docType = 'systemOperator';

            transactionContext.stub.putState.should.have.been.calledOnceWithExactly(systemoperator.systemOperatorMarketParticipantMrid, Buffer.from(JSON.stringify(systemoperator)));
        });
    });

    describe('Test GetAllSystemOperator', () => {
        it('should return SUCCESS on GetAllSystemOperator', async () => {

            let ret = await star.GetAllSystemOperator(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetAllSystemOperator', async () => {

            const query = `{"selector": {"docType": "systemOperator"}}`;
            const iterator = Values.getSystemOperatorQueryMock2Values(Values.HTA_systemoperator, Values.HTB_systemoperator2, mockHandler);
            transactionContext.stub.getQueryResult.withArgs(query).resolves(iterator);


            let ret = await star.GetAllSystemOperator(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: SystemOperator[] = [ Values.HTA_systemoperator, Values.HTB_systemoperator2 ];

            expect(ret).to.eql(expected);
        });

    //     it('should return SUCCESS on GetAllAssets for non JSON value', async () => {
    //         transactionContext.stub.putState.onFirstCall().callsFake((key, value) => {
    //             transactionContext.stub.states = {};
    //             transactionContext.stub.states[key] = 'non-json-value';
    //         });

    //         transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
    //         await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"RTE02EIC\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
    //         transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.RTE);
    //         await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"RTE01EIC\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
    //         transactionContext.clientIdentity.getMSPID.returns(OrganizationTypeMsp.ENEDIS);
    //         await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"ENEDIS02EIC\",\"systemOperatorMarketParticipantName\": \"ENEDIS\",\"systemOperatorMarketParticipantRoleType\": \"A50\"}');

    //         let ret = await star.GetAllSystemOperator(transactionContext);
    //         ret = JSON.parse(ret);
    //         // console.log('ret=', ret)
    //         expect(ret.length).to.equal(3);

    //         const expected = [
    //             'non-json-value',
    //             { docType: 'systemOperator', systemOperatorMarketParticipantName: 'RTE', systemOperatorMarketParticipantRoleType: 'A49', systemOperatorMarketParticipantMrid: 'RTE01EIC'},
    //             { docType: 'systemOperator', systemOperatorMarketParticipantName: 'ENEDIS', systemOperatorMarketParticipantRoleType: 'A50', systemOperatorMarketParticipantMrid: 'ENEDIS02EIC'}
    //         ];

    //         expect(ret).to.eql(expected);
    //     });
    });
});
function ChaincodeMessageHandler(ChaincodeMessageHandler: any): any {
    throw new Error('Function not implemented.');
}
