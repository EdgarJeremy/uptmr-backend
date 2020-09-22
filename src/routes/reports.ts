import express from 'express';
import io from 'socket.io';
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
import TelegramBot from 'node-telegram-bot-api';

const reportsRoute: Routes = (
	app: express.Application,
	models: ModelFactoryInterface,
	io: io.Server,
	bot: TelegramBot
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
		'/update_read_done',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const update = await models.Report.update({
					read: true
				}, {
					where: {
						department_id: req.user.department_id!,
						done: true,
						read: false
					}
				});
				const body: OkResponse = { data: update };
				res.json(body);
			}
		)
	);

	router.get(
		'/update_read_rejected',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const update = await models.Report.update({
					read: true
				}, {
					where: {
						rejection_note: {
							$ne: null
						},
						department_id: req.user.department_id!,
						done: false,
						read: false
					}
				});
				const body: OkResponse = { data: update };
				res.json(body);
			}
		)
	);

	router.get(
		'/update_read_inbox',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const update = await models.Report.update({
					read: true
				}, {
					where: {
						rejection_note: null!,
						department_id: {
							$in: req.user.target_id
						},
						done: false,
						read: false
					}
				});
				const body: OkResponse = { data: update };
				res.json(body);
			}
		)
	);

	router.get(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const report: ReportInstance | null = await models.Report.findOne({
					where: { id },
					include: [{
						model: models.Department,
						attributes: ['name']
					}, {
						model: models.File,
						attributes: ['data']
					}]
				});
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
				const files = req.body.files;
				// @ts-ignore
				delete data.files;
				data.done = false;
				data.user_id = req.user.id;
				data.department_id = req.user.type === 'Department' ? req.user.department_id : data.department_id;
				const report: ReportInstance = await models.Report.create(data);
				const upts = await models.User.findAll({
					where: {
						target_id: {
							[models.Sequelize.Op.contains]: [data.department_id]
						}
					}
				});
				upts.forEach((upt) => {
					if (upt.telegram_chat_id) {
						bot.sendMessage(upt.telegram_chat_id, `Hei ${upt.name}, ada laporan baru dari ${req.user.department.name}`);
					}
				});
				for (let i = 0; i < files.length; i++) {
					const file = files[i];
					await models.File.create({
						data: file,
						report_id: report.id
					});
				}
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
				const report: ReportInstance | null = await models.Report.findOne({
					where: { id },
					include: [{
						model: models.User
					}]
				});
				if (!report) throw new NotFoundError('Report tidak ditemukan');
				if (report.user.telegram_chat_id) {
					if (data.done) {
						bot.sendMessage(report.user.telegram_chat_id, `Laporan yang anda buat telah disetujui oleh pihak UPT&MR`);
					}
					if (data.rejection_note) {
						bot.sendMessage(report.user.telegram_chat_id, `Laporan yang anda buat telah ditolak oleh pihak UPT&MR dengan catatan penolakan: ${data.rejection_note}`);
					}
				}
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
