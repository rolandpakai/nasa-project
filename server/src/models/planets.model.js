import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import planets from './planets.mongo.js';
const __dirname = path.resolve();

function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6;
}

const parser = parse({
  comment: '#',
  columns: true,
  delimiter: ',',
});

export function loadsPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, 'data','kepler_data.csv'))
    .pipe(parser)
    .on('data', async (data) => {
      if(isHabitablePlanet(data)) {
        savePlanet(data);
      }
    })
    .on('error', (error) => {
      console.log(error);
      reject(error);
    })
    .on('end', async () => {
      const planetsList = await getAllPlanets();
      console.log('Planets found', planetsList.length);
      parser.end(); 
      resolve();
    });
  })
};

export async function getAllPlanets() {
  return await planets.find({}, {
    '_id': 0, 
    '__v': 0,
  });
};

async function savePlanet(planet) {
  try {
    await planets.updateOne({
      keplerName: planet.kepler_name, 
    }, {
      keplerName: planet.kepler_name,
    }, {
      upsert: true
    });
  } catch (error) {
    console.error('Could not save planet', error);
  }
};