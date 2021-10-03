import { Request, Response, NextFunction } from 'express';
import { QueryCursor } from 'mongoose';
import { AccountResponse } from './accountResponse';
import { AccountFilter, Service, TransformFunction } from './service';


export class Controller {

    private service: Service;

    constructor(service: Service) {
        this.service = service;
    }

    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountFilter: AccountFilter = {
                name: req.query.name as string,
                country: req.query.country as string,
                mfa: req.query.mfa as string
            };
            const sort = req.query.sort as string || 'createdDate';
            const pageSize = Number(req.query.pageSize || '10');
            const offset = Number(req.query.offset || '0');
            const cursor = await this.service.list(accountFilter, sort, pageSize, offset, this.transformToJson());

            this.streamCursorAsJson(res, cursor);
        } catch (e) {
            console.error(e);
            next(e);
        }

    }

    private transformToJson(): TransformFunction {

        let first = true;

        return (account: AccountResponse) => {

            // make sure we return only the properties we want in json and not whatever is returned by service layer / mongoose
            // and remove null properties
            const item = Object.fromEntries(Object.entries({
                firstName: account.firstName,
                lastName: account.lastName,
                country: account.country,
                email: account.email,
                dob: account.dob,
                mfa: account.mfa,
                amt: account.amt,
                createdDate: account.createdDate,
                referredBy: account.referredBy,
            }).filter(([_, v]) => v != null));


            if (first) {
                first = false;
                return JSON.stringify(item);
            }
            return ',' + JSON.stringify(item);
        }
    }

    private streamCursorAsJson(res: Response, cursor: QueryCursor<AccountResponse>) {
        res.type('json');
        res.write('[');
        cursor.on('end', () => {
            res.write(']');
        });
        cursor.pipe(res);
    }
}