/** import modules */
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import nocache from 'nocache';
import cors from 'cors';
import path from 'path';
import http from 'http';
import socketio from 'socket.io';
import _ from 'lodash';
import mimeTypes from 'mime-types';

import ModelFactoryInterface from './models/typings/ModelFactoryInterface';
import createModels from './models';
import createRoutes, { SiriusRouter } from './routes';
import tokenMiddleware from './middlewares/pipes/token';
import websocket from './websocket';
import teleHandler, { bot } from './telegram/handler';

/** import .env file configuration */
dotenv.config();

/** app variables */
const app: express.Application = express();
const web: http.Server = new http.Server(app);
const io: socketio.Server = socketio(web);
const models: ModelFactoryInterface = createModels();
const allowOrigins: string | string[] = process.env.ALLOW_ORIGIN
	? process.env.ALLOW_ORIGIN === '*'
		? '*'
		: process.env.ALLOW_ORIGIN.split(',').map((origin: string) => origin.trim())
	: `http://localhost:${process.env.PORT || 1234}`;

/** setup websocket */
websocket(io);

/** middlewares */
app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '1024mb' }));
app.use(bodyParser.urlencoded({ limit: process.env.REQUEST_LIMIT || '1024mb', extended: true }));
app.use(cors({ origin: allowOrigins, credentials: true }));
app.use(tokenMiddleware(models)); // token auth
app.use(nocache()); // no cache

/** router configuration */
const routes: SiriusRouter[] = createRoutes(app, models, io, bot);
const apiURL: string = process.env.API_URL ? process.env.API_URL : '/api';
let routeData: any = {};

/** extract route data */
routes.forEach((route: SiriusRouter) => {
	const key: string = `${apiURL}/${route.basepoint}`;
	routeData[key] = { endpoints: [] };
	route.stack.forEach((info: any) => {
		let { route }: { route: any } = info;
		if (route) {
			let endpoint: string = route.path;
			let verbs: any = route.methods.get
				? 'GET'
				: route.methods.post
					? 'POST'
					: route.methods.put
						? 'PUT'
						: 'DELETE';
			let keys: any = info.keys.map((t: any) => t.name);
			routeData[key].endpoints.push({ endpoint, verbs, keys });
		}
	});
});

/** meta route for inspector */
app.get(
	'/app_meta',
	(req: express.Request, res: express.Response): void => {
		let data: { routes: any[]; models: any[] } = { routes: [], models: [] };
		Object.keys(routeData).forEach((route: any) => {
			data.routes.push({
				basepoint: route,
				endpoints: routeData[route].endpoints,
			});
		});
		Object.keys(models).forEach((modelName: string) => {
			if (['sequelize', 'Sequelize'].indexOf(modelName) === -1) {
				data.models.push({
					name: modelName,
					basepoint: models[modelName].getTableName(),
					attributes: models[modelName].rawAttributes,
				});
			}
		});
		res.json(data);
	},
);

app.get(
	'/file/:id',
	(req: express.Request, res: express.Response) => {
		const { id } = req.params;
		models.File.findByPk(id).then((file) => {
			if (!file) res.status(404).send('not found');
			const b64 = file?.data.split(',')[1]!;
			const header = file?.data.split(',')[0]!;
			const mime = header.replace('data:', '').replace(';base64', '');
			const buff = new Buffer(b64, 'base64');
			res.writeHead(200, {
				'Content-Type': mime,
				'Content-Length': buff.length
			});
			res.end(buff);
		});
	}
)

app.get(
	'/letter_file/:id',
	(req: express.Request, res: express.Response) => {
		const { id } = req.params;
		models.Letter.findByPk(id).then((letter) => {
			if (!letter) res.status(404).send('not found');
			const b64 = letter?.data.split(',')[1]!;
			const header = letter?.data.split(',')[0]!;
			const mime = header.replace('data:', '').replace(';base64', '');
			const buff = new Buffer(b64, 'base64');
			res.writeHead(200, {
				'Content-Disposition': `attachment;filename=${letter?.name}.${mimeTypes.extension(mime)}`,
				'Content-Type': mime,
				'Content-Length': buff.length
			});
			res.end(buff);
		});
	}
)

/** root route */
if (process.env.NODE_ENV === 'development') {
	app.use(express.static(path.resolve(__dirname, '..', 'inspector')));
} else {
	app.use(express.static(path.resolve(__dirname, '..', 'frontend')));
}

teleHandler(models);

/** sync models & start server */
models.sequelize
	.sync({
		force: process.env.DB_FORCE_RENEW === 'true',
		alter: false,
	})
	.then(
		(): void => {
			web.listen(
				process.env.PORT || 1234,
				(): void => {
					console.log('App running');
				},
			);
		},
	);
