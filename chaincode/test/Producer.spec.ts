
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'
import { Producer } from '../src/model/producer';

let assert = sinon.assert;
chai.use(sinonChai);

describe('Star Tests PRODUCERS', () => {
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

    describe('Test createProducer', () => {
        // it('should return ERROR on createProducer', async () => {
        //     chaincodeStub.putState.rejects('failed inserting key');

        //     let star = new Star();
        //     chaincodeStub.MspiID = 'RTEMSP';
        //     try {
        //         await star.CreateProducer(transactionContext, '{\"producerMarketParticipantName\": \"EolienFRvert28EIC\",\"producerMarketParticipantRoleType\": \"EolienFR vert Cie\",\"marketParticipantRoleType\": \"A21\"}');
        //     } catch(err) {
        //         console.info(err.message)
        //         expect(err.name).to.equal('failed inserting key');
        //     }
        // });

        it('should return ERROR wrong MSPID', async () => {
            let star = new Star();
            try {
                await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert28EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMspID does not have write access to create a producer');
            }
        });

        it('should return ERROR NON-JSON value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.CreateProducer(transactionContext, 'toto');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('ERROR createProducer-> Input string NON-JSON value');
            }
        });

        it('should return SUCCESS wit RTE on createProducer', async () => {
            let star = new Star();
            const producer: Producer = {
                docType: 'producer',
                producerMarketParticipantMrId: 'EolienFRvert28EIC',
                producerMarketParticipantName: 'EolienFR vert Cie',
                producerMarketParticipantRoleType: 'A21'
            };

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateProducer(transactionContext, JSON.stringify(producer));

            let ret = JSON.parse((await chaincodeStub.getState("EolienFRvert28EIC")).toString());
            expect(ret).to.eql( producer );
        });

        it('should return SUCCESS with Enedis on createProducer', async () => {
            let star = new Star();
            const producer: Producer = {
                docType: 'producer',
                producerMarketParticipantMrId: 'EolienFRvert28EIC',
                producerMarketParticipantName: 'EolienFR vert Cie',
                producerMarketParticipantRoleType: 'A21'
            };

            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateProducer(transactionContext, JSON.stringify(producer));

            let ret = JSON.parse((await chaincodeStub.getState("EolienFRvert28EIC")).toString());
            expect(ret).to.eql( producer );
        });
    });

    describe('Test queryProducer', () => {
        it('should return ERROR on queryProducer', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert28EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            try {
                await star.QueryProducer(transactionContext, 'toto');
            } catch (err) {
                // console.info(err.message)
                expect(err.message).to.equal('toto does not exist');
            }
        });

        it('should return SUCCESS on queryProducer', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert28EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            const producer: Producer = {
                docType: 'producer',
                producerMarketParticipantMrId: 'EolienFRvert28EIC',
                producerMarketParticipantName: 'EolienFR vert Cie',
                producerMarketParticipantRoleType: 'A21'
            };

            let test = JSON.parse(await star.QueryProducer(transactionContext, "EolienFRvert28EIC"));
            expect(test).to.eql(producer);
            let ret = JSON.parse(await chaincodeStub.getState('EolienFRvert28EIC'));
            expect(ret).to.eql(producer);
        });
    });

    describe('Test updateProducer', () => {
        it('should return ERROR wrong MSPID', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert28EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');

            try {
                chaincodeStub.MspiID = 'FakeMSP';
                await star.UpdateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert28EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisation, FakeMSP does not have write access to update a producer');
            }
        });

        it('should return ERROR NON-JSON value', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.UpdateProducer(transactionContext, 'toto');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('ERROR updateProducer-> Input string NON-JSON value');
            }
        });

        it('should return ERROR on updateProducer producer doesn\'t exist', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert28EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');

            try {
                await star.UpdateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"XXX\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            } catch (err) {
                expect(err.message).to.equal('XXX does not exist');
            }
        });

        it('should return SUCCESS on updateProducer', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert28EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            await star.UpdateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert28EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"toto\"}');

            let ret = JSON.parse(await chaincodeStub.getState('EolienFRvert28EIC'));
            let expected = {
                docType: 'producer',
                producerMarketParticipantMrId: 'EolienFRvert28EIC',
                producerMarketParticipantName: 'EolienFR vert Cie',
                producerMarketParticipantRoleType: 'toto'
            };
            expect(ret).to.eql(expected);
        });
    });

    describe('Test getAllProducer', () => {
        it('should return error on getAllProducer', async () => {
            let star = new Star();

            let ret = await star.GetAllProducer(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return success on getAllProducer', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateSystemOperator(transactionContext, '{\"systemOperatorMarketParticipantMrid\": \"RTE01EIC\",\"systemOperatorMarketParticipantName\": \"RTE\",\"systemOperatorMarketParticipantRoleType\": \"A49\"}');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert28EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert29EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A22\"}');
            let ret = await star.GetAllProducer(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: Producer[] = [
                { docType: 'producer', producerMarketParticipantName: 'EolienFR vert Cie', producerMarketParticipantRoleType: 'A21', producerMarketParticipantMrId: 'EolienFRvert28EIC'},
                { docType: 'producer', producerMarketParticipantName: 'EolienFR vert Cie', producerMarketParticipantRoleType: 'A22', producerMarketParticipantMrId: 'EolienFRvert29EIC'}
            ];

            expect(ret).to.eql(expected);
        });

        it('should return success on GetAllAssets for non JSON value', async () => {
            let star = new Star();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                chaincodeStub.states = {};
                chaincodeStub.states[key] = 'non-json-value';
            });

            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert22EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert28EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A21\"}');
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.CreateProducer(transactionContext, '{\"producerMarketParticipantMrId\": \"EolienFRvert29EIC\",\"producerMarketParticipantName\": \"EolienFR vert Cie\",\"producerMarketParticipantRoleType\": \"A22\"}');

            let ret = await star.GetAllProducer(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(3);

            const expected = [
                'non-json-value',
                { docType: 'producer', producerMarketParticipantName: 'EolienFR vert Cie', producerMarketParticipantRoleType: 'A21', producerMarketParticipantMrId: 'EolienFRvert28EIC'},
                { docType: 'producer', producerMarketParticipantName: 'EolienFR vert Cie', producerMarketParticipantRoleType: 'A22', producerMarketParticipantMrId: 'EolienFRvert29EIC'}
            ];

            expect(ret).to.eql(expected);
        });
    });
});