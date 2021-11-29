
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeServer, ChaincodeStub } from 'fabric-shim'

import { Star } from '../src/star'
import { Producer } from '../src/producer';

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
        it('should return ERROR on createProducer', async () => {
            chaincodeStub.putState.rejects('failed inserting key');

            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            try {
                await star.createProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');
            } catch(err) {
                console.info(err.message)
                expect(err.name).to.equal('failed inserting key');
            }
        });

        it('should return ERROR wrong MSPID', async () => {
            let star = new Star();
            try {
                await star.createProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, FakeMspID does not have write access');
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
            await star.createProducer(transactionContext, producer.producerMarketParticipantMrId, producer.producerMarketParticipantName, producer.producerMarketParticipantRoleType);

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
            await star.createProducer(transactionContext, producer.producerMarketParticipantMrId, producer.producerMarketParticipantName, producer.producerMarketParticipantRoleType);

            let ret = JSON.parse((await chaincodeStub.getState("EolienFRvert28EIC")).toString());
            expect(ret).to.eql( producer );
        });
    });

    describe('Test queryProducer', () => {
        it('should return ERROR on queryProducer', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');

            try {
                await star.queryProducer(transactionContext, 'toto');
            } catch (err) {
                // console.info(err.message)
                expect(err.message).to.equal('toto does not exist');
            }
        });

        it('should return SUCCESS on queryProducer', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');
            const producer: Producer = {
                docType: 'producer',
                producerMarketParticipantMrId: 'EolienFRvert28EIC',
                producerMarketParticipantName: 'EolienFR vert Cie',
                producerMarketParticipantRoleType: 'A21'
            };

            let test = JSON.parse(await star.queryProducer(transactionContext, "EolienFRvert28EIC"));
            expect(test).to.eql(producer);
            let ret = JSON.parse(await chaincodeStub.getState('EolienFRvert28EIC'));
            expect(ret).to.eql(producer);
        });
    });

    describe('Test updateProducer', () => {
        it('should return ERROR on updateProducer', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');

            try {
                await star.updateProducer(transactionContext, 'XXX', 'EolienFR vert Cie', 'A21');
            } catch (err) {
                expect(err.message).to.equal('XXX does not exist');
            }
        });

        it('should return ERROR wrong MSPID', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');

            try {
                chaincodeStub.MspiID = 'FakeMSP';
                await star.updateProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');
            } catch(err) {
                console.info(err.message)
                expect(err.message).to.equal('Organisition, FakeMSP does not have write access');
            }
        });

        it('should return SUCCESS on updateProducer', async () => {
            let star = new Star();
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');
            await star.updateProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'toto');

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

            let ret = await star.getAllProducer(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return success on getAllProducer', async () => {
            let star = new Star();

            chaincodeStub.MspiID = 'RTEMSP';
            await star.createSystemOperator(transactionContext, 'RTE01EIC', 'RTE', 'A49');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, 'EolienFRvert29EIC', 'EolienFR vert Cie', 'A50');

            let ret = await star.getAllProducer(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(2);

            const expected: Producer[] = [
                { docType: 'producer', producerMarketParticipantName: 'EolienFR vert Cie', producerMarketParticipantRoleType: 'A21', producerMarketParticipantMrId: 'EolienFRvert28EIC'},
                { docType: 'producer', producerMarketParticipantName: 'EolienFR vert Cie', producerMarketParticipantRoleType: 'A50', producerMarketParticipantMrId: 'EolienFRvert29EIC'}
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
            await star.createProducer(transactionContext, 'RTE00EIC', 'EolienFR vert Cie', 'A21');
            chaincodeStub.MspiID = 'RTEMSP';
            await star.createProducer(transactionContext, 'EolienFRvert28EIC', 'EolienFR vert Cie', 'A21');
            chaincodeStub.MspiID = 'ENEDISMSP';
            await star.createProducer(transactionContext, 'EolienFRvert29EIC', 'EolienFR vert Cie', 'A50');

            let ret = await star.getAllProducer(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(3);

            const expected = [
                'non-json-value',
                { docType: 'producer', producerMarketParticipantName: 'EolienFR vert Cie', producerMarketParticipantRoleType: 'A21', producerMarketParticipantMrId: 'EolienFRvert28EIC'},
                { docType: 'producer', producerMarketParticipantName: 'EolienFR vert Cie', producerMarketParticipantRoleType: 'A50', producerMarketParticipantMrId: 'EolienFRvert29EIC'}
            ];

            expect(ret).to.eql(expected);
        });
    });
});