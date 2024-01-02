const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { signup, login } = require('../controllers/auth');

jest.mock('bcryptjs', () => ({
    compare: jest.fn(async () => true),
}));

jest.mock('../models/user', () => ({
    findOne: jest.fn(),
    save: jest.fn(),
}));

const app = express();
app.use(bodyParser.json());
app.use(passport.initialize());

app.post('/signup', signup);
app.post('/login', passport.authenticate('jwt', { session: false }), login);

describe('Authentication API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Signup Endpoint', () => {
        it('should register a new user', async () => {
            const mockRequest = {
                body: { username: 'testUser', password: 'testPassword', email: 'test@example.com' },
            };

            const mockResponse = {
                status: jest.fn(() => mockResponse),
                json: jest.fn(),
            };

            await request(app)
                .post('/signup')
                .send(mockRequest.body)
                .expect(201);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
        });

        it('should handle registration error', async () => {
            const mockRequest = {
                body: { username: 'existingUser', password: 'testPassword', email: 'test@example.com' },
            };

            const mockResponse = {
                status: jest.fn(() => mockResponse),
                json: jest.fn(),
            };

            // Mocking User.findOne to simulate an existing user
            jest.spyOn(require('../models/user'), 'findOne').mockImplementationOnce(() => true);

            await request(app)
                .post('/signup')
                .send(mockRequest.body)
                .expect(400);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Username is already taken' });
        });
    });

    describe('Login Endpoint', () => {
        it('should log in a user with correct credentials', async () => {
            const mockRequest = {
                body: { username: 'existingUser', password: 'testPassword' },
            };

            const mockResponse = {
                status: jest.fn(() => mockResponse),
                json: jest.fn(),
            };

            // Mocking User.findOne to simulate an existing user
            jest.spyOn(require('../models/user'), 'findOne').mockImplementationOnce(() => ({
                username: 'existingUser',
                local: { password: 'hashedPassword' }, // Mocking hashed password for the user
            }));

            await request(app)
                .post('/login')
                .send(mockRequest.body)
                .expect(200);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ username: 'existingUser', token: expect.any(String) });
        });

        it('should handle login error for user not found', async () => {
            const mockRequest = {
                body: { username: 'nonexistentUser', password: 'testPassword' },
            };

            const mockResponse = {
                status: jest.fn(() => mockResponse),
                json: jest.fn(),
            };

            // Mocking User.findOne to simulate a user not found
            jest.spyOn(require('../models/user'), 'findOne').mockImplementationOnce(() => null);

            await request(app)
                .post('/login')
                .send(mockRequest.body)
                .expect(403);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should handle login error for invalid password', async () => {
            const mockRequest = {
                body: { username: 'existingUser', password: 'incorrectPassword' },
            };

            const mockResponse = {
                status: jest.fn(() => mockResponse),
                json: jest.fn(),
            };

            // Mocking User.findOne to simulate an existing user
            jest.spyOn(require('../models/user'), 'findOne').mockImplementationOnce(() => ({
                username: 'existingUser',
                local: { password: 'hashedPassword' }, // Mocking hashed password for the user
            }));

            // Mocking bcrypt.compare to simulate an invalid password
            jest.spyOn(require('bcryptjs'), 'compare').mockImplementationOnce(async () => false);

            await request(app)
                .post('/login')
                .send(mockRequest.body)
                .expect(403);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid Password' });
        });

        it('should handle login error for missing email or password', async () => {
            const mockRequest = {
                body: {},
            };

            const mockResponse = {
                status: jest.fn(() => mockResponse),
                json: jest.fn(),
            };

            await request(app)
                .post('/login')
                .send(mockRequest.body)
                .expect(422);

            expect(mockResponse.status).toHaveBeenCalledWith(422);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
        });
    });
});
