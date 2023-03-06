import request from 'supertest';
import app from '../../app.js';
import { mongoConnect, mongoDisconnect } from '../../services/mongo.js';

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  })

  describe('Test GET /launches', () => {
    test('200 Success', async () => {
      await request(app)
      .get('/v1/launches')
      .expect(200);
    });
  });
  
  describe('Test POST /launches', () => {
    const launch = {
      mission: 'Mission 1', 
      rocket: 'Rocket 1',
      target: 'Kepler-62 f',
      launchDate: 'January 4, 2028',
    };
  
    const launchWithoutDate = {
      mission: 'Mission 1', 
      rocket: 'Rocket 1',
      target: 'Kepler-62 f',
    };
  
    const launchWithInvalidDate = {
      mission: 'Mission 1', 
      rocket: 'Rocket 1',
      target: 'Kepler-62 f',
      launchDate: 'invalid',
    };
  
    test('201 Success', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launch)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(201);
  
      const requestDate = new Date(launch.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
  
      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchWithoutDate);
    });
  
    test('400 Missing required property', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchWithoutDate)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(400);
  
      expect(response.body).toStrictEqual({
        error: 'Missing required property',
      })
    });
  
    test('400 Invalid date', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchWithInvalidDate)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(400);
  
      expect(response.body).toStrictEqual({
        error: 'Invalid date',
      })
    });
  });
});