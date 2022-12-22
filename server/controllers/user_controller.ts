import { Request, Response, NextFunction } from "express";
import handleAsync from "../utils/handle_async";

export const getUsers = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ status: "success" });
  }
);
