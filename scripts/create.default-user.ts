import createModels from '../src/models';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import ModelFactoryInterface from '../src/models/typings/ModelFactoryInterface';

dotenv.config();

(async () => {
    const models: ModelFactoryInterface = createModels();
    const user = await models.User.create({
        name: 'Administrator',
        username: 'admin',
        password: bcrypt.hashSync('admin', 10),
        type: 'Administrator',
        target_id: null
    });
})()
    .then(() => {
        console.log('(db:migrate) done');
        process.exit(0);
    })
    .catch((err: Error) => {
        console.warn('(db:migrate) error : ' + err.message);
        process.exit(0);
    });