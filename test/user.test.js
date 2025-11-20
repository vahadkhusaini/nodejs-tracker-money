import supertest from 'supertest';
import {web} from '../src/application/web.js';
import { removeTestUser, createTestUser, getTestUser } from "./test-utils.js";
import { logger } from '../src/application/logging.js';
import bcrypt from 'bcrypt';

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

    it('should cant register with wrong email', async() => {
        const result = await supertest(web)
        .post('/api/users')
        .send({
            email: 'email',
            password: 'testing',
            name: 'Test'
        })

        logger.info(result.body)

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined()
    })
});

describe('POST /api/users/login', () => {

    beforeEach(async () => {
        // Create a test user in the database
        await createTestUser();
    });

    afterEach(async () => {
        // Clean up the test user from the database
        await removeTestUser();
    });

    it('should can login with valid credentials', async () => {
        // First, register a new user
        const result = await supertest(web)
        .post('/api/users/login')
        .send({
            email: 'test@email.com',
            password: 'testing',
        });

        logger.info(result.body)

        expect(result.status).toBe(200);
        expect(result.body.data.token).toBeDefined();
    });

    it('should can login with invalid credentials', async () => {
        // First, register a new user
        const result = await supertest(web)
        .post('/api/users/login')
        .send({
            email: 'test@email.com',
            password: 'testingoooo',
        });

        logger.info(result.body)

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});

describe('GET /api/users/current', () => {

    beforeEach(async () => {
        // Create a test user in the database
        await createTestUser();
    });

    afterEach(async () => {
        // Clean up the test user from the database
        await removeTestUser();
    });

    it('should can get current user with valid token', async () => {
        const result = await supertest(web)
        .get('/api/users/current')
        .set('Authorization', 'test-token');

        logger.info(result.body)

        expect(result.status).toBe(200);
        expect(result.body.data.email).toBe('test@email.com');
        expect(result.body.data.name).toBe('Test User');
    });

    it('should can get current user with invalid token', async () => {
        const result = await supertest(web)
        .get('/api/users/current')
        .set('Authorization', 'test-tokennnn');

        logger.info(result.body)

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined()
    });

});

describe('PATCH /api/users/current', () => {

    beforeEach(async () => {
        // Create a test user in the database
        await createTestUser();
    });
    
    afterEach(async () => {
        // Clean up the test user from the database
        await removeTestUser();
    });

    it('should can update current user with valid token', async () => {
        const result = await supertest(web)
        .patch('/api/users/current')
        .set('Authorization', 'test-token')
        .send({
            name: 'Updated Test User',
            password: 'newpassword'
        });

        logger.info(result.body)

        expect(result.status).toBe(200);
        expect(result.body.data.name).not.toBe('Test User');
        expect(result.body.data.email).toBe('test@email.com');

        const updatedUser = await getTestUser();
        expect(updatedUser.name).toBe('Updated Test User');
        expect(await bcrypt.compare('newpassword', updatedUser.password)).toBe(true);

    });

});

describe('DELETE /api/users/logout', () => {

    beforeEach(async () => {
        // Create a test user in the database
        await createTestUser();
    });
    
    afterEach(async () => {
        // Clean up the test user from the database
        await removeTestUser();
    });

    it('should can logout current user with valid token', async () => {
        const result = await supertest(web)
        .delete('/api/users/logout')
        .set('Authorization', 'test-token');

        logger.info(result.body)

        expect(result.status).toBe(200);
        expect(result.body.data).toBe('OK');

        const loggedOutUser = await getTestUser();
        expect(loggedOutUser.token).toBeNull();
    });

});