import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';

export interface DepartmentAttributes {
    id?: number;
    name: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface DepartmentInstance extends Sequelize.Instance<DepartmentAttributes>, DepartmentAttributes {
}

export interface Associate {
    (models: ModelFactoryInterface): void;
}

export const DepartmentFactory: Factory<DepartmentInstance, DepartmentAttributes> = (
    sequelize: Sequelize.Sequelize,
    DataTypes: Sequelize.DataTypes,
): Sequelize.Model<DepartmentInstance, DepartmentAttributes> => {
    const attributes: SequelizeAttributes<DepartmentAttributes> = {
        name: {
            type: DataTypes.STRING(191),
            allowNull: false,
        },
    };
    const Department: Sequelize.Model<DepartmentInstance, DepartmentAttributes> = sequelize.define<
        DepartmentInstance,
        DepartmentAttributes
    >('department', attributes, { underscored: true });

    Department.associate = (models: ModelFactoryInterface): void => {
        Department.hasMany(models.User, { onDelete: 'cascade' });
    };

    return Department;
};
