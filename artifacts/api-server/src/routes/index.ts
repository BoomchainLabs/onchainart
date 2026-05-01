import { Router, type IRouter } from "express";
import healthRouter from "./health";
import artRouter from "./art";

const router: IRouter = Router();

router.use(healthRouter);
router.use(artRouter);

export default router;
