import chai from 'chai';
import { Request, Response, NextFunction } from 'express';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.use(sinonChai);

import { Controller } from '../../src/controller';
import { Service } from '../../src/service';
import { QueryCursor } from 'mongoose';
import { AccountResponse } from '../../src/accountResponse';

const expect = chai.expect;

describe('Controller', () => {

    describe('list', () => {

        it('should stream cursor returned by service in response as json', async () => {
            const serviceStub = sinon.createStubInstance(Service);

            const req = {
                query: {}
            };
            const res = {
                write: sinon.stub(),
                type: sinon.stub()
            }
            const next = sinon.stub();

            const cursor = {
                on: sinon.stub(),
                pipe: sinon.stub()
            };

            cursor.on.withArgs('end').yields('');

            serviceStub.list.resolves(cursor as any as QueryCursor<AccountResponse>);

            const controller = new Controller(serviceStub as unknown as Service);
            await controller.list(req as Request, res as unknown as Response, next as NextFunction);

            expect(next).to.not.have.been.called;
            expect(res.type).to.have.been.calledWith('json');
            expect(res.write).to.have.been.calledWith('[');
            expect(res.write).to.have.been.calledWith(']');
            expect(cursor.pipe).to.have.been.calledWith(res);

        });

        it('should call next with error if service throws an error', async () => {
            const serviceStub = sinon.createStubInstance(Service);

            const req = {
                query: {}
            };
            const res = {
                write: sinon.stub(),
                type: sinon.stub()
            }
            const next = sinon.stub();

            const error = new Error('error from service');
            serviceStub.list.throws(error);

            const controller = new Controller(serviceStub as unknown as Service);
            await controller.list(req as Request, res as unknown as Response, next as NextFunction);

            expect(next).to.have.been.calledWith(error);

        });
    });
})