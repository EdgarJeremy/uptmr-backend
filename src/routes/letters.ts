import express from 'express';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import { Routes } from './typings/RouteInterface';
import a from '../middlewares/wrapper/a';
import { OkResponse } from './typings/BodyBuilderInterface';
import { LetterInstance } from '../models/Letter';
import NotFoundError from '../classes/NotFoundError';
import { PaginatedResult } from './typings/QueryInterface';
import sequelize from 'sequelize';
import { Parser } from '../helpers/Parser';
import onlyAuth from '../middlewares/protector/auth';
import { LetterAttributes } from '../models/Letter';

const lettersRoute: Routes = (
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
				const parsed: sequelize.FindOptions<LetterInstance> = Parser.parseQuery<LetterInstance>(
					req.query.q,
					models,
				);
				const data: PaginatedResult<LetterInstance> = await models.Letter.findAndCountAll(parsed);
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
				const letter: LetterInstance | null = await models.Letter.findOne({ where: { id } });
				if (!letter) throw new NotFoundError('Letter tidak ditemukan');
				const body: OkResponse = { data: letter };

				res.json(body);
			},
		),
	);

	router.post(
		'/',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const data: LetterAttributes = req.body;
				const letter: LetterInstance = await models.Letter.create(data);
				const body: OkResponse = { data: letter };

				res.json(body);
			},
		),
	);

	router.put(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const data: LetterInstance = req.body;
				const letter: LetterInstance | null = await models.Letter.findOne({ where: { id } });
				if (!letter) throw new NotFoundError('Letter tidak ditemukan');
				await letter.update(data);
				const body: OkResponse = { data: letter };

				res.json(body);
			},
		),
	);

	router.delete(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const letter: LetterInstance | null = await models.Letter.findOne({ where: { id } });
				if (!letter) throw new NotFoundError('Letter tidak ditemukan');
				await letter.destroy();
				const body: OkResponse = { data: letter };

				res.json(body);
			},
		),
	);

	return router;
};

export default lettersRoute;
