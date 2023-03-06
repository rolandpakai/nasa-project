import http from 'http';
import app from './app.js';
import * as dotenv from 'dotenv';
dotenv.config();

import { loadsPlanetsData } from './models/planets.model.js';
import { loadLaunchData } from './models/launches.model.js';
import { mongoConnect } from './services/mongo.js';

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

async function startServer(server, PORT) {
  await mongoConnect();
  await loadsPlanetsData();
  await loadLaunchData();

  server.listen(PORT, () => {
    console.log('Listening on PORT', PORT);
  });
}

startServer(server, PORT);