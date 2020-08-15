import express from 'express';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import { Routes } from './typings/RouteInterface';
import a from '../middlewares/wrapper/a';
import { OkResponse } from './typings/BodyBuilderInterface';
import { ReportInstance } from '../models/Report';
import NotFoundError from '../classes/NotFoundError';
import { PaginatedResult } from './typings/QueryInterface';
import sequelize from 'sequelize';
import { Parser } from '../helpers/Parser';
import onlyAuth from '../middlewares/protector/auth';
import { ReportAttributes } from '../models/Report';

const reportsRoute: Routes = (
	app: express.Application,
	models: ModelFactoryInterface,
): express.Router => {
	const router: express.Router = express.Router();

	router.use(onlyAuth());

	router.get(
		'/',
		Parser.validateQ(),
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const parsed: sequelize.FindOptions<ReportInstance> = Parser.parseQuery<ReportInstance>(
					req.query.q,
					models,
				);
				const data: PaginatedResult<ReportInstance> = await models.Report.findAndCountAll(parsed);
				const body: OkResponse = { data };

				res.json(body);
			},
		),
	);

	router.get(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const report: ReportInstance | null = await models.Report.findOne({ where: { id } });
				if (!report) throw new NotFoundError('Report tidak ditemukan');
				const body: OkResponse = { data: report };

				res.json(body);
			},
		),
	);

	router.post(
		'/',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const data: ReportAttributes = req.body;
				const report: ReportInstance = await models.Report.create(data);
				const body: OkResponse = { data: report };

				res.json(body);
			},
		),
	);

	router.put(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const data: ReportInstance = req.body;
				const report: ReportInstance | null = await models.Report.findOne({ where: { id } });
				if (!report) throw new NotFoundError('Report tidak ditemukan');
				await report.update(data);
				const body: OkResponse = { data: report };

				res.json(body);
			},
		),
	);

	router.delete(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const report: ReportInstance | null = await models.Report.findOne({ where: { id } });
				if (!report) throw new NotFoundError('Report tidak ditemukan');
				await report.destroy();
				const body: OkResponse = { data: report };

				res.json(body);
			},
		),
	);

	return router;
};

export default reportsRoute;
