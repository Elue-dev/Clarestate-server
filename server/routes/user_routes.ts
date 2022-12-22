import { Router } from "express";
import { getUsers } from "../controllers/user_controller";

const router = Router();

router.route("/").get(getUsers);

export default router;
