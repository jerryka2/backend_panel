import express from "express";
import { stationList } from "../controllers/stationController.js";

const stationRouter = express.Router();

stationRouter.get('/list', stationList);

export default stationRouter;
