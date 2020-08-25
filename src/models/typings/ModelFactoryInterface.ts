import Sequelize from 'sequelize';
import { UserInstance, UserAttributes } from '../User';
import { TokenInstance, TokenAttributes } from '../Token';
import { DepartmentInstance, DepartmentAttributes } from '../Department';
import { ReportInstance, ReportAttributes } from '../Report';
import { FileInstance, FileAttributes } from '../File';

interface Obj {
	[s: string]: any;
}

export default interface ModelFactoryInterface extends Obj {
	sequelize: Sequelize.Sequelize;
	Sequelize: Sequelize.SequelizeStatic;
	User: Sequelize.Model<UserInstance, UserAttributes>;
	Token: Sequelize.Model<TokenInstance, TokenAttributes>;
	Department: Sequelize.Model<DepartmentInstance, DepartmentAttributes>;
	Report: Sequelize.Model<ReportInstance, ReportAttributes>;
	File: Sequelize.Model<FileInstance, FileAttributes>;
}
