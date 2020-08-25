import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';

export interface FileAttributes {
    id?: number;
    data: string;
    report_id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface FileInstance extends Sequelize.Instance<FileAttributes>, FileAttributes {
}

export interface Associate {
    (models: ModelFactoryInterface): void;
}

export const FileFactory: Factory<FileInstance, FileAttributes> = (
    sequelize: Sequelize.Sequelize,
    DataTypes: Sequelize.DataTypes,
): Sequelize.Model<FileInstance, FileAttributes> => {
    const attributes: SequelizeAttributes<FileAttributes> = {
        data: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    };
    const File: Sequelize.Model<FileInstance, FileAttributes> = sequelize.define<
        FileInstance,
        FileAttributes
    >('file', attributes, { underscored: true });

    File.associate = (models: ModelFactoryInterface): void => {
        File.belongsTo(models.Report, { onDelete: 'cascade' });
    };

    return File;
};
