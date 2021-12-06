
'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

import { Context } from 'fabric-contract-api'
import { ChaincodeStub } from 'fabric-shim'

import { FabCar } from '../src/fabcar'
import { Car } from '../src/car';

let assert = sinon.assert;
chai.use(sinonChai);

describe('FabCar Tests', () => {
    let transactionContext, chaincodeStub;
    beforeEach(() => {
        transactionContext = new Context();

        chaincodeStub = sinon.createStubInstance(ChaincodeStub);
        transactionContext.setChaincodeStub(chaincodeStub);

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

        chaincodeStub.deleteState.callsFake(async (key) => {
            if (chaincodeStub.states) {
                delete chaincodeStub.states[key];
            }
            return Promise.resolve(key);
        });

        chaincodeStub.getStateByRange.callsFake(async () => {
            function* internalGetStateByRange() {
                if (chaincodeStub.states) {
                    // Shallow copy
                    const copied = Object.assign({}, chaincodeStub.states);

                    for (let key in copied) {
                        yield {value: copied[key]};
                    }
                }
            }

            return Promise.resolve(internalGetStateByRange());
        });
    });

    
    describe('Test InitLedger', () => {
        it('should return error on InitLedger', async () => {
            chaincodeStub.putState.rejects('failed inserting key');
            let fabcar = new FabCar();
            try {
                await fabcar.initLedger(transactionContext);
                // assert.fail('InitLedger should have failed');
            } catch (err) {
                expect(err.name).to.equal('failed inserting key');
            }
        });

        it('should return success on InitLedger', async () => {    
            const cars: Car[] = [
                { color: 'blue', make: 'Toyota', model: 'Prius', owner: 'Tomoko'},
                { color: 'red', make: 'Ford', model: 'Mustang', owner: 'Brad'},
                { color: 'green', make: 'Hyundai', model: 'Tucson', owner: 'Jin Soo'},
                { color: 'yellow', make: 'Volkswagen', model: 'Passat', owner: 'Max'},
                { color: 'black', make: 'Tesla', model: 'S', owner: 'Adriana'},
                { color: 'purple', make: 'Peugeot', model: '205', owner: 'Michel'},
                { color: 'white', make: 'Chery', model: 'S22L', owner: 'Aarav'},
                { color: 'violet', make: 'Fiat', model: 'Punto', owner: 'Pari'},
                { color: 'indigo', make: 'Tata', model: 'Nano', owner: 'Valeria'},
                { color: 'brown', make: 'Holden', model: 'Barina', owner: 'Shotaro'},
            ];

            let fabcar = new FabCar();
            await fabcar.initLedger(transactionContext);
            let ret = JSON.parse((await chaincodeStub.getState('CAR0')).toString());
            // console.log("ret CAR0=", ret)
            // console.log("CAR[0]=", cars[0])
            expect(ret).to.eql(Object.assign({docType: 'car'}, cars[0]));
            ret = JSON.parse((await chaincodeStub.getState('CAR1')).toString());
            // console.log("ret CAR1=", ret)
            expect(ret).to.eql(Object.assign({docType: 'car'}, cars[1]));
            ret = JSON.parse((await chaincodeStub.getState('CAR2')).toString());
            // console.log("ret CAR2=", ret)
            expect(ret).to.eql(Object.assign({docType: 'car'}, cars[2]));
            ret = JSON.parse((await chaincodeStub.getState('CAR3')).toString());
            // console.log("ret CAR3=", ret)
            expect(ret).to.eql(Object.assign({docType: 'car'}, cars[3]));
            ret = JSON.parse((await chaincodeStub.getState('CAR4')).toString());
            // console.log("ret CAR4=", ret)
            expect(ret).to.eql(Object.assign({docType: 'car'}, cars[4]));
            ret = JSON.parse((await chaincodeStub.getState('CAR5')).toString());
            // console.log("ret CAR5=", ret)
            expect(ret).to.eql(Object.assign({docType: 'car'}, cars[5]));
            ret = JSON.parse((await chaincodeStub.getState('CAR6')).toString());
            // console.log("ret CAR6=", ret)
            expect(ret).to.eql(Object.assign({docType: 'car'}, cars[6]));
            ret = JSON.parse((await chaincodeStub.getState('CAR7')).toString());
            // console.log("ret CAR7=", ret)
            expect(ret).to.eql(Object.assign({docType: 'car'}, cars[7]));
            ret = JSON.parse((await chaincodeStub.getState('CAR8')).toString());
            // console.log("ret CAR8=", ret)
            expect(ret).to.eql(Object.assign({docType: 'car'}, cars[8]));
            ret = JSON.parse((await chaincodeStub.getState('CAR9')).toString());
            // console.log("ret CAR9=", ret)
            expect(ret).to.eql(Object.assign({docType: 'car'}, cars[9]));
        });
    });

    describe('Test createCar', () => {
        it('should return error on createCar', async () => {
            chaincodeStub.putState.rejects('failed inserting key');

            let fabcar = new FabCar();
            try {
                await fabcar.createCar(transactionContext, 'CAR10', 'toto', 'titi', 'tutu', 'tata');
                // assert.fail('createCar should have failed');
            } catch(err) {
                console.log("err=", err.name)
                expect(err.name).to.equal('failed inserting key');
            }
        });

        it('should return success on createCar', async () => {
            let fabcar = new FabCar();
            const cars: Car[] = [{ color: 'tutu', make: 'toto', model: 'titi', owner: 'tata'},];
    
            await fabcar.initLedger(transactionContext);
            await fabcar.createCar(transactionContext, 'CAR10', 'toto', 'titi', 'tutu', 'tata');

            let ret = JSON.parse((await chaincodeStub.getState("CAR10")).toString());
            expect(ret).to.eql(Object.assign({docType: 'car'}, cars[0]));
        });
    });

    describe('Test queryCar', () => {
        it('should return error on queryCar', async () => {
            let fabcar = new FabCar();
            await fabcar.createCar(transactionContext, 'CAR10', 'toto', 'titi', 'tutu', 'tata');

            try {
                await fabcar.queryCar(transactionContext, 'CAR09');
                // assert.fail('queryCar should have failed');
            } catch (err) {
                expect(err.message).to.equal('CAR09 does not exist');
            }
        });

        it('should return success on queryCar', async () => {
            let fabcar = new FabCar();
            await fabcar.initLedger(transactionContext);
            const cars: Car[] = [
                { color: 'brown', make: 'Holden', model: 'Barina', owner: 'Shotaro'},
            ];

            let test = JSON.parse(await fabcar.queryCar(transactionContext, "CAR9"));
            // console.log('test=', test);
            // console.log('cars=', cars[0])
            expect(test).to.eql(Object.assign({docType: 'car'}, cars[0]));
            let ret = JSON.parse(await chaincodeStub.getState('CAR9'));
            // console.log('ret', ret);
            expect(ret).to.eql(Object.assign({docType: 'car'}, cars[0]));
        });
    });

    describe('Test changeCarOwner', () => {
        it('should return error on changeCarOwner', async () => {
            let fabcar = new FabCar();
            await fabcar.createCar(transactionContext, 'CAR10', 'toto', 'titi', 'tutu', 'tata');

            try {
                await fabcar.changeCarOwner(transactionContext, 'CAR09', 'Dave');
                // assert.fail('changeCarOwner should have failed');
            } catch (err) {
                expect(err.message).to.equal('CAR09 does not exist');
            }
        });

        it('should return success on changeCarOwner', async () => {
            let fabcar = new FabCar();
            await fabcar.initLedger(transactionContext);
            await fabcar.changeCarOwner(transactionContext, 'CAR0', 'Dave');

            let ret = JSON.parse(await chaincodeStub.getState('CAR0'));
            let expected = {
                color: 'blue',
                make: 'Toyota',
                model: 'Prius',
                owner: 'Dave'
            };
            expect(ret).to.eql(Object.assign({docType: 'car'}, expected));
        });
    });

    describe('Test queryAllCars', () => {
        it('should return error on queryAllCars', async () => {
            let fabcar = new FabCar();

            let ret = await fabcar.GetAll(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(0);
            expect(ret).to.eql([]);
        });

        it('should return success on queryAllCars', async () => {
            let fabcar = new FabCar();

            await fabcar.createCar(transactionContext, 'CAR0', 'Toyota', 'Prius', 'blue', 'Tomoko');
            await fabcar.createCar(transactionContext, 'CAR1', 'Ford', 'Mustang', 'red', 'Brad');
            await fabcar.createCar(transactionContext, 'CAR2', 'Hyundai', 'Tucson', 'green', 'Jin Soo');
            await fabcar.createCar(transactionContext, 'CAR3', 'Volkswagen', 'Passat', 'yellow', 'Max');

            let ret = await fabcar.GetAll(transactionContext);
            ret = JSON.parse(ret);
            // console.log('ret=', ret)
            expect(ret.length).to.equal(4);

            const expected: Car[] = [
                { docType: 'car', color: 'blue', make: 'Toyota', model: 'Prius', owner: 'Tomoko'},
                { docType: 'car', color: 'red', make: 'Ford', model: 'Mustang', owner: 'Brad'},
                { docType: 'car', color: 'green', make: 'Hyundai', model: 'Tucson', owner: 'Jin Soo'},
                { docType: 'car', color: 'yellow', make: 'Volkswagen', model: 'Passat', owner: 'Max'},
            ];

            expect(ret).to.eql(expected);
        });

        it('should return success on GetAllAssets for non JSON value', async () => {
            let fabcar = new FabCar();
            chaincodeStub.putState.onFirstCall().callsFake((key, value) => {
                if (!chaincodeStub.states) {
                    chaincodeStub.states = {};
                }
                chaincodeStub.states[key] = 'non-json-value';
            });

            await fabcar.createCar(transactionContext, 'CAR0', 'Toyota', 'Prius', 'blue', 'Tomoko');
            await fabcar.createCar(transactionContext, 'CAR1', 'Ford', 'Mustang', 'red', 'Brad');
            await fabcar.createCar(transactionContext, 'CAR2', 'Hyundai', 'Tucson', 'green', 'Jin Soo');
            await fabcar.createCar(transactionContext, 'CAR3', 'Volkswagen', 'Passat', 'yellow', 'Max');

            let ret = await fabcar.GetAll(transactionContext);
            ret = JSON.parse(ret);
            expect(ret.length).to.equal(4);

            const expected = [
                'non-json-value',
                { docType: 'car', color: 'red', make: 'Ford', model: 'Mustang', owner: 'Brad'},
                { docType: 'car', color: 'green', make: 'Hyundai', model: 'Tucson', owner: 'Jin Soo'},
                { docType: 'car', color: 'yellow', make: 'Volkswagen', model: 'Passat', owner: 'Max'},
            ];

            expect(ret).to.eql(expected);
        });
    });
});
