import chai from 'chai';
import { Model,  Query } from 'mongoose';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.use(sinonChai);

import { Service } from '../../src/service';
import { AccountResponse } from '../../src/accountResponse';

const expect = chai.expect;

describe('Service', () => {

    describe('list', () => {

        it('should query using moongoose and return a cursor built with transform function', async () => {

            const filters = {
                name: 'somename',
                country: 'CL',
                mfa: 'SMS',
            };
            const sort = 'amt';
            const pageSize = 10;
            const offset = 5;
            const transform = sinon.stub();

            const stub = sinon.stub(Model, 'find');
            const mock = {
                sort: stub,
                skip: stub,
                limit: stub,
                lean: stub,
                cursor: stub
            };

            stub.returns(mock as any as Query<Array<any>, AccountResponse>);

            const service = new Service();
            await service.list(filters, sort, pageSize, offset, transform);

            expect(mock.skip).to.have.been.calledWith(offset);
            expect(mock.limit).to.have.been.calledWith(pageSize);
            expect(mock.sort).to.have.been.calledWith({ amt: 1 });
            expect(mock.cursor).to.have.been.calledWith({ transform });

        });

    });
})