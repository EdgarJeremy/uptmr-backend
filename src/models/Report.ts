import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';

export interface ReportAttributes {
    id?: number;
    description: string;
    photo: string;
    urgency: 1 | 2 | 3;
    user_id?: number;
    department_id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface ReportInstance extends Sequelize.Instance<ReportAttributes>, ReportAttributes {
}

export interface Associate {
    (models: ModelFactoryInterface): void;
}

export const ReportFactory: Factory<ReportInstance, ReportAttributes> = (
    sequelize: Sequelize.Sequelize,
    DataTypes: Sequelize.DataTypes,
): Sequelize.Model<ReportInstance, ReportAttributes> => {
    const attributes: SequelizeAttributes<ReportAttributes> = {
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        photo: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        urgency: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    };
    const Report: Sequelize.Model<ReportInstance, ReportAttributes> = sequelize.define<
        ReportInstance,
        ReportAttributes
    >('report', attributes, { underscored: true });

    Report.associate = (models: ModelFactoryInterface): void => {
        Report.belongsTo(models.User, { onDelete: 'cascade' });
        Report.belongsTo(models.Department, { onDelete: 'cascade' });
    };

    return Report;
};
