
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'
import { SystemOperator } from '../src/model/systemOperator';

let assert = sinon.assert;
chai.use(sinonChai);

describe('Star Tests SYSTEM OPERATORS', () => {
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
                        if (copied[key] == 'non-json-value') { 
                            yield {value: copied[key]};
                            continue
                        }
                        const obJson = JSON.parse(copied[key].toString('utf8'));
                        const objStr: string = obJson.docType;
                        const queryJson = JSON.parse(query);
                        const queryStr = queryJson.selector.docType
                        if (queryStr == objStr) {
                            yield {value: copied[key]};
                        }
                    }
                }
            }
            return Promise.resolve(internalGetQueryResult());
        });


        chaincodeStub.getMspID.callsFake(async () => {
            return Promise.resolve(chaincodeStub.MspiID);
        });
    });

    describe('Test false statement', () => {
        it('should avoid else flag missing', async () => {
            await chaincodeStub.getState("EolienFRvert28EIC");
            await chaincodeStub.getQueryResult("EolienFRvert28EIC");
        });
    });

    // describe('Test InitLedger', () => {
    //     it('should return ERROR on InitLedger', async () => {
    //         chaincodeStub.putState.rejects('failed inserting key');
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
        //     chaincodeStub.putState.rejects('failed inserting key');

        //     let star = new Star();
        //     chaincodeStub.MspiID = 'RTEMSP';
        //     try {
        //         await star.CreateSystemOperator(transactionContext, '{\"RTE01EIC\",\"RTE\",\"A49\"}');
        //     } catch(err) {
        //         console.info(err)
        //         expect(err.name).to.equal('failed inserting key');
        //     }
        // });

        it('should return ERROR wrong MSPID', async () => {
            let star = new Star();
            try {
                await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have write access to create a system operator');
            }
        });

        it('should return ERROR NON-JSON value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.CreateSystemOperator(transactionContext, 'toto');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('ERROR createSystemOperator-> Input string NON-JSON value');
            }
        });

        it('should return ERROR right MSPID TSO -> DSO', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A49\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, RTEMSP does not have write access for ENEDIS');
            }
        });

        it('should return ERROR right MSPID DSO -> TSO', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            try {
                await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, ENEDISMSP does not have write access for RTE');
            }
        });

        it('should return SUCCESS with RTE on createSystemOperator', async () => {
            let star = new Star();
            const systemOperator: SystemOperator = {
                docType: 'systemOperator',
                systemOperatorMarketParticipantMrId: 'RTE01EIC',
                marketParticipantName: 'RTE',
                marketParticipantRoleType: 'A49'
            };
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, JSON.stringify(systemOperator));

            let ret = JSON.parse((await chaincodeStub.getState("RTE01EIC")).toString());
            expect(ret).to.eql( systemOperator );
        });

        it('should return SUCCESS with Enedis on createSystemOperator', async () => {
            let star = new Star();
            const systemOperator: SystemOperator = {
                docType: 'systemOperator',
                systemOperatorMarketParticipantMrId: 'ENEDIS02EIC',
                marketParticipantName: 'ENEDIS',
                marketParticipantRoleType: 'A50'
            };

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, JSON.stringify(systemOperator));

            let ret = JSON.parse((await chaincodeStub.getState("ENEDIS02EIC")).toString());
            expect(ret).to.eql( systemOperator );
        });
    });

    describe('Test QuerySystemOperator', () => {
        it('should return ERROR on QuerySystemOperator', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');

            try {
                await star.QuerySystemOperator(transactionContext, 'toto');
            } catch (err) {
                // console.info(err.message)
                expect(err.message).to.equal('toto does not exist');
            }
        });

        it('should return SUCCESS on QuerySystemOperator', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            const systemOperator: SystemOperator = {
                docType: 'systemOperator',
                systemOperatorMarketParticipantMrId: 'RTE01EIC',
                marketParticipantName: 'RTE',
                marketParticipantRoleType: 'A49'
            };

            let test = JSON.parse(await star.QuerySystemOperator(transactionContext, "RTE01EIC"));
            expect(test).to.eql(systemOperator);
            let ret = JSON.parse(await chaincodeStub.getState('RTE01EIC'));
            expect(ret).to.eql(systemOperator);
        });
    });

    describe('Test UpdateSystemOperator', () => {
        it('should return ERROR on UpdateSystemOperator', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');

            try {
                await star.UpdateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"XXX\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            } catch (err) {
                expect(err.message).to.equal('XXX does not exist');
            }
        });

        it('should return ERROR on UpdateSystemOperator', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');

            try {
                await star.UpdateSystemOperator(transactionContext, 'toto');
            } catch (err) {
                expect(err.message).to.equal('ERROR createSystemOperator-> Input string NON-JSON value');
            }
        });

        it('should return ERROR wrong MSPID', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');

            try {
                chaincodeStub.MspiID = 'FakeMSP';
                await star.UpdateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access to update a system operator');
            }
        });

        it('should return ERROR right MSPID TSO -> DSO', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');

            try {
                await star.UpdateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A49\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, RTEMSP does not have write access for ENEDIS');
            }
        });

        it('should return ERROR right MSPID DSO -> TSO', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"ENEDIS02EIC\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');

            try {
                await star.UpdateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"ENEDIS02EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, ENEDISMSP does not have write access for RTE');
            }
        });

        it('should return SUCCESS on UpdateSystemOperator', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            await star.UpdateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"toto\"}');

            let ret = JSON.parse(await chaincodeStub.getState('RTE01EIC'));
            let expected = {
                docType: 'systemOperator',
                systemOperatorMarketParticipantMrId: 'RTE01EIC',
                marketParticipantName: 'RTE',
                marketParticipantRoleType: 'toto'
            };
            expect(ret).to.eql(expected);
        });
    });

    describe('Test GetAllSystemOperator', () => {
        it('should return SUCCESS on GetAllSystemOperator', async () => {
            let star = new Star();

            let ret = await star.GetAllSystemOperator(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return SUCCESS on GetAllSystemOperator', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert28EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"ENEDIS02EIC\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');

            let ret = await star.GetAllSystemOperator(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: SystemOperator[] = [
                { docType: 'systemOperator', marketParticipantName: 'RTE', marketParticipantRoleType: 'A49', systemOperatorMarketParticipantMrId: 'RTE01EIC'},
                { docType: 'systemOperator', marketParticipantName: 'ENEDIS', marketParticipantRoleType: 'A50', systemOperatorMarketParticipantMrId: 'ENEDIS02EIC'}
            ];

            expect(ret).to.eql(expected);
        });

        it('should return SUCCESS on GetAllAssets for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE02EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}');
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrId\": \"ENEDIS02EIC\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}');

            let ret = await star.GetAllSystemOperator(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(3);

            const expected = [
                'non-json-value',
                { docType: 'systemOperator', marketParticipantName: 'RTE', marketParticipantRoleType: 'A49', systemOperatorMarketParticipantMrId: 'RTE01EIC'},
                { docType: 'systemOperator', marketParticipantName: 'ENEDIS', marketParticipantRoleType: 'A50', systemOperatorMarketParticipantMrId: 'ENEDIS02EIC'}
            ];

            expect(ret).to.eql(expected);
        });
    });
});