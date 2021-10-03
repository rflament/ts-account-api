import { Schema, model, Model, FilterQuery, QueryCursor } from 'mongoose';
import { AccountResponse } from './accountResponse';

export interface AccountFilter {
    country?: string;
    mfa?: string;
    name?: string;
}

export type TransformFunction = (account: AccountResponse) => string;

export class Service {

    private accountModel: Model<AccountResponse>;

    constructor() {
        const schema = new Schema<AccountResponse>({
            firstName: String,
            lastName: String,
            country: String,
            email: String,
            dob: String,
            mfa: String,
            amt: String,
            createdDate: String,
            referredBy: String,
        });
        this.accountModel = model<AccountResponse>('Account', schema);
    }

    async list(filters: AccountFilter, sort: string, pageSize: number, offset = 0, transform: TransformFunction): Promise<QueryCursor<AccountResponse>> {

        const { sortField, sortDirection } = this.getSort(sort);
        const mongoFilters: FilterQuery<AccountResponse> = this.buildFilter(filters);

        const cursor = await this.accountModel.find(mongoFilters)
            .sort({ [sortField]: sortDirection }).skip(offset).limit(pageSize).lean().
            cursor({ transform });

        return cursor;
    }


    // The user should be able to filter on account country, on mfa type, and by name;
    private buildFilter(filters: AccountFilter) {
        const mongoFilters: FilterQuery<AccountResponse> = {};

        if (filters.country) {
            mongoFilters.country = filters.country;
        }
        if (filters.mfa) {
            mongoFilters.mfa = filters.mfa;
        }
        if (filters.name) {
            // case insenstive match in first name and last name columns using text index
            // if we need "contains" we could use regexp or another search engine like elastic search
            mongoFilters.$text = { $search: filters.name };
        }

        return mongoFilters;
    }

    // The user should be able to sort accounts on number of Ledn tokens held or creation date
    private getSort(sort: string) {
        let sortDirection = 1;
        let sortField = sort;

        if (sort.startsWith('-')) {
            sortDirection = -1;
            sortField = sort.slice(1);
        }

        if (!['createdDate', 'amt'].includes(sortField)) {
            throw new Error('Invalid Sort Field:' + sortField);
        }
        return { sortField, sortDirection };
    }
}