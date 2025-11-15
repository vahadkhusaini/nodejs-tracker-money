import supertest from 'supertest';
import {web} from '../src/application/web.js';
import { removeTestUser } from "./test-utils.js";
import { logger } from '../src/application/logging.js';

describe('POST /api/users', () => {

    afterEach(async () => {
        // Clean up the test user from the database
        await removeTestUser();
    });

    it('should can register new user', async () => {
        const result = await supertest(web)
        .post('/api/users')
        .send({
            email: 'test@email.com',
            password: 'testing',
            name: 'Test',
        })

        logger.info(result)

        expect(result.status).toBe(200);
        expect(result.body.data.email).toBe('test@email.com');
        expect(result.body.data.name).toBe('Test');   
        expect(result.body.data.password).toBeUndefined();

    });
});