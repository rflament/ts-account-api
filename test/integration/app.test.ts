import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiHttp from 'chai-http';

chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.use(chaiHttp);

import * as app from '../../src/app';
import { AccountResponse } from '../../src/accountResponse';

const expect = chai.expect;

describe('App', () => {


    let path: string;

    before(async () => {
        await app.start();
        path = 'http://localhost:8000';
    });


    it('should return json response', async () => {
        const response = await chai.request(path).get('/');
        expect(response.status).to.equal(200);
        expect(response.type).to.equal('application/json');
    });

    it('should not return more items than pageSize', async () => {
        const response = await chai.request(path).get('/').query({
            pageSize: 1,
        });
        expect(response.body.length).to.equal(1);
    });

    it('should support offset and pageSize for pagination', async () => {
        const firstResponse = await chai.request(path).get('/').query({
            pageSize: 1,
            offset: 0,
            sort: '-amt',
        });
        const secondResponse = await chai.request(path).get('/').query({
            pageSize: 1,
            offset: 1,
            sort: '-amt',
        });
        expect(firstResponse.body.length).to.equal(1);
        expect(secondResponse.body.length).to.equal(1);
        expect(firstResponse.body[0].firstName).not.to.equal(secondResponse.body[0].firstName);
    });

    it('should sort by amount asc', async () => {
        const response = await chai.request(path).get('/').query({
            sort: 'amt',
            pageSize: 10,
        });
        expect(response.body.length).to.equal(10);

        let previous: number;
        response.body.forEach(
            (i: AccountResponse) => {
                if (previous) expect(Number(i.amt) >= previous).to.be.true;
                previous = Number(i.amt);
            }
        );
    });

    it('should sort by amount desc', async () => {
        const response = await chai.request(path).get('/').query({
            sort: '-amt',
            pageSize: 10,
        });
        expect(response.body.length).to.equal(10);

        let previous: number;
        response.body.forEach(
            (i: AccountResponse) => {
                if (previous) expect(Number(i.amt) <= previous).to.be.true;
                previous = Number(i.amt);
            }
        );
    });

    it('should sort by createdDate asc', async () => {
        const response = await chai.request(path).get('/').query({
            sort: 'createdDate',
            pageSize: 10,
        });
        expect(response.body.length).to.equal(10);

        let previous: number;
        response.body.forEach(
            (i: AccountResponse) => {
                if (previous) expect(Number(i.createdDate) >= previous).to.be.true;
                previous = Number(i.createdDate);
            }
        );
    });

    it('should sort by createdDate desc', async () => {
        const response = await chai.request(path).get('/').query({
            sort: '-createdDate',
            pageSize: 10,
        });
        expect(response.body.length).to.equal(10);

        let previous: number;
        response.body.forEach(
            (i: AccountResponse) => {
                if (previous) expect(Number(i.createdDate) <= previous).to.be.true;
                previous = Number(i.createdDate);
            }
        );
    });

    it('should filter by name', async () => {
        const nameSearch = 'john';
        const response = await chai.request(path).get('/').query({
            name: nameSearch,
            pageSize: 5,
        });
        expect(response.status).to.equal(200);
        expect(response.type).to.equal('application/json');


        response.body.map(
            (i: AccountResponse) => {
                expect((i.firstName + i.lastName).toLowerCase()).to.contain(nameSearch);
            }
        );
    });

    it('should filter by country', async () => {
        const countrySearch = 'CL';
        const response = await chai.request(path).get('/').query({
            country: countrySearch,
            pageSize: 5,
        });
        expect(response.status).to.equal(200);
        expect(response.type).to.equal('application/json');


        response.body.map(
            (i: AccountResponse) => {
                expect(i.country).to.equal(countrySearch);
            }
        );
    });

    it('should filter by mfa', async () => {
        const mfaSearch = 'SMS';
        const response = await chai.request(path).get('/').query({
            mfa: mfaSearch,
            pageSize: 5,
        });
        expect(response.status).to.equal(200);
        expect(response.type).to.equal('application/json');


        response.body.map(
            (i: AccountResponse) => {
                expect(i.mfa).to.equal(mfaSearch);
            }
        );
    });

    it('should support all filters and sort at the same time', async () => {
        const mfaSearch = 'SMS';
        const nameSearch = 'john';
        const countrySearch = 'CL';
        const response = await chai.request(path).get('/').query({
            country: countrySearch,
            mfa: mfaSearch,
            name: nameSearch,
            sort: '-amt',
            pageSize: 5,
        });
        expect(response.status).to.equal(200);
        expect(response.type).to.equal('application/json');

        let previous: number;

        response.body.map(
            (i: AccountResponse) => {
                expect(i.mfa).to.equal(mfaSearch);
                expect(i.country).to.equal(countrySearch);
                expect((i.firstName + i.lastName).toLowerCase()).to.contain(nameSearch);
                if (previous) expect(Number(i.amt) <= previous).to.be.true;
                previous = Number(i.amt);
            }
        );
    });
})