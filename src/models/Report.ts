import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';
import { UserInstance } from './User';

export interface Questionnaire {
    breakage: number;
    availability: number;
    warranty: number;
    usability: number;
}

export interface ReportAttributes {
    id?: number;
    description: string;
    urgency: number;
    room: string;
    since: Date;
    done: boolean;
    rejection_note: string | null;
    questionnaire: Questionnaire;
    report_file: string;
    read: boolean;
    user_id?: number;
    department_id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface ReportInstance extends Sequelize.Instance<ReportAttributes>, ReportAttributes {
    user: UserInstance;
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
        urgency: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        room: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        since: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        done: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        rejection_note: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        questionnaire: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        report_file: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    };
    const Report: Sequelize.Model<ReportInstance, ReportAttributes> = sequelize.define<
        ReportInstance,
        ReportAttributes
    >('report', attributes, { underscored: true });

    Report.associate = (models: ModelFactoryInterface): void => {
        Report.belongsTo(models.User, { onDelete: 'cascade' });
        Report.belongsTo(models.Department, { onDelete: 'cascade' });
        Report.hasMany(models.File, { onDelete: 'cascade' });
    };

    return Report;
};
