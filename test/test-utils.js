import {prismaClient} from '../src/application/database.js';
import bcrypt from 'bcrypt';


export const removeTestUser = async () => {
    await prismaClient.user.deleteMany({
        where: {
            email: 'test@email.com'
        }
    });
}

export const createTestUser = async () => {
    await prismaClient.user.create({
        data: {
            email: 'test@email.com',
            password: await bcrypt.hash('testing', 10),
            name: 'Test User',
            token: 'test-token'
        }
    });
}

export const getTestUser = async () => {
    return await prismaClient.user.findUnique({
        where: {
            email: 'test@email.com'
        }
    });
}