import express from 'express';
import { connect } from 'mongoose';
import { Controller } from './controller';
import { Service } from './service';

const app = express();
const PORT = 8000;

const service = new Service();
const controller = new Controller(service);
app.get('/', controller.list.bind(controller));

export async function start(): Promise<any> {
    await connect('mongodb://localhost:27017/accounts');
    console.log('connected to mongo');
    app.listen(PORT, () => {
        console.log(`server is running at https://localhost:${PORT}`);
    });
    return app;
}


