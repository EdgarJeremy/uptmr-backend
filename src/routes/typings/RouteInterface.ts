import express, { Request } from 'express';
import io from 'socket.io';
import ModelFactoryInterface from '../../models/typings/ModelFactoryInterface';
import { UserInstance } from '../../models/User';
import TelegramBot from 'node-telegram-bot-api';

export interface Routes {
	(app: express.Application, models: ModelFactoryInterface, io: io.Server, bot: TelegramBot): express.Router;
}

export interface A {
	(handler: express.Handler): express.Handler;
}

export interface ObjectKeyValue {
	[s: string]: any;
}
