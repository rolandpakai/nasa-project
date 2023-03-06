import axios from 'axios';
import launches from './launches.mongo.js';
import planets from './planets.mongo.js';

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

const DEFAULT_FLIGHT_NUMBER = 100;

async function populateLaunches() {
  console.log('Downloading launch data...');
  const response = await axios.post(SPACEX_API_URL, {
      "query": {},
      "options": {
          "pagination": false,
          "populate": [
              {
                  "path": "rocket",
                  "select": {
                      "name": 1
                  }
              },
              {
                "path": "payloads",
                "select": {
                  "customers": 1
                }
              }
          ]
      }
  });

  if(response.status !== 200) {
    console.log('Launch data download failed');
    throw new Error('Launch data download failed');
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'], 
      customers,
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
    };

    await saveLaunch(launch);
  }
}

export async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log('Launch data already loaded!');
  } else {
    await populateLaunches();
  }
};

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
};

async function saveLaunch(launch) {
  await launches.findOneAndUpdate({
    flightNumber: launch.flightNumber
  },
  launch, {
    upsert: true
  });
};

export async function getAllLaunches(skip, limit) {
  return await launches
  .find({}, {
    '_id': 0, 
    '__v': 0,
  })
  .sort({
    flightNumber: 1
  })
  .skip(skip)
  .limit(limit);
};

export async function addNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if(!planet) {
    throw new Error('No planet found with name', launch.target);
  }

  const newFlightNumber = await getLatestFlightNumber() + 1;

  const newLaunch = Object.assign(launch, { 
    flightNumber: newFlightNumber,
    customers: ['ZTM', 'NASA'],
    upcoming: true,
    success: true,
  }); 

  await saveLaunch(newLaunch);
};

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

export async function existsLaunchWithId(id) {
  return await findLaunch({
    flightNumber: id,
  });
};

export async function abortLaunchById(id) {
  const aborted = await launches.updateOne({
    flightNumber: id,
  }, {
    upcoming: false,
    success: false,
  });

  return aborted.modifiedCount === 1;
};