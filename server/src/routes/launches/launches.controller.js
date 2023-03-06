import { 
  getAllLaunches, 
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} from '../../models/launches.model.js';
import { getPagination } from '../../services/query.js';
 
export async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);

  return res.status(200).json(launches);
};

export async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  const launchDate = new Date(launch.launchDate);

  if (!launch.mission || 
    !launch.rocket || 
    !launch.target ||
    !launch.launchDate) {
      return res.status(400).json({
        error: 'Missing required property'
      })
  }

  if (isNaN(launchDate)) {
    return res.status(400).json({
      error: 'Invalid date'
    })
  }

  launch.launchDate = launchDate;

  await addNewLaunch(launch);
  
  return res.status(201).json(launch);
};

export async function httpAbortLaunch(req, res) {
  const id = Number(req.params.id);
  const existsLaunch = await existsLaunchWithId(id);

  if (!existsLaunch) {
    return res.status(404).json({
      error: `Not found launch: ${id}`
    })
  }

  const aborted = await abortLaunchById(id);

  if(!aborted) {
    return res.status(400).json({
      error: 'Launch not aborted',
    });
  }

  return res.status(200).json({
    ok: true,
  });
};