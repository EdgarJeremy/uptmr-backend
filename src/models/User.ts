import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';
import { DepartmentInstance } from './Department';

export interface UserAttributes {
	id?: number;
	name: string;
	username: string;
	password: string;
	type: 'UPT' | 'Department' | 'Administrator';
	target_id: number[] | null;
	telegram_code: number;
	telegram_chat_id: number;
	department_id?: number;
	created_at?: Date;
	updated_at?: Date;
}

export interface UserInstance extends Sequelize.Instance<UserAttributes>, UserAttributes {
	department: DepartmentInstance;
}

export interface Associate {
	(models: ModelFactoryInterface): void;
}

export const UserFactory: Factory<UserInstance, UserAttributes> = (
	sequelize: Sequelize.Sequelize,
	DataTypes: Sequelize.DataTypes,
): Sequelize.Model<UserInstance, UserAttributes> => {
	const attributes: SequelizeAttributes<UserAttributes> = {
		name: {
			type: DataTypes.STRING(191),
			allowNull: false,
		},
		username: {
			type: DataTypes.STRING(191),
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING(191),
			allowNull: false,
		},
		type: {
			type: DataTypes.ENUM(['UPT', 'Department', 'Administrator']),
			allowNull: false
		},
		target_id: {
			type: DataTypes.JSONB,
			allowNull: true
		},
		telegram_code: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		telegram_chat_id: {
			type: DataTypes.INTEGER,
			allowNull: true
		}
	};
	const User: Sequelize.Model<UserInstance, UserAttributes> = sequelize.define<
		UserInstance,
		UserAttributes
	>('user', attributes, { underscored: true });

	User.associate = (models: ModelFactoryInterface): void => {
		User.hasMany(models.Token, { onDelete: 'cascade' });
		User.belongsTo(models.Department, { onDelete: 'cascade' });
	};

	return User;
};
