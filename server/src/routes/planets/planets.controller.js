import { getAllPlanets } from '../../models/planets.model.js';

export async function httpGetAllPlanets(req, res) {
  const allPlanets = await getAllPlanets();
  return res.status(200).json(allPlanets);
}