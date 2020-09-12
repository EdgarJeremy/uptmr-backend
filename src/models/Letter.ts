import Sequelize from 'sequelize';
import { SequelizeAttributes } from './typings/SequelizeAttributes';
import { Factory } from './typings/ModelInterface';
import ModelFactoryInterface from './typings/ModelFactoryInterface';

export interface LetterAttributes {
    id?: number;
    name: string;
    data: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface LetterInstance extends Sequelize.Instance<LetterAttributes>, LetterAttributes {
}

export interface Associate {
    (models: ModelFactoryInterface): void;
}

export const LetterFactory: Factory<LetterInstance, LetterAttributes> = (
    sequelize: Sequelize.Sequelize,
    DataTypes: Sequelize.DataTypes,
): Sequelize.Model<LetterInstance, LetterAttributes> => {
    const attributes: SequelizeAttributes<LetterAttributes> = {
        name: {
            type: DataTypes.STRING(191),
            allowNull: false,
        },
        data: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    };
    const Letter: Sequelize.Model<LetterInstance, LetterAttributes> = sequelize.define<
        LetterInstance,
        LetterAttributes
    >('letter', attributes, { underscored: true });

    Letter.associate = (models: ModelFactoryInterface): void => {
        Letter.belongsTo(models.User, { onDelete: 'cascade' });
    };

    return Letter;
};
