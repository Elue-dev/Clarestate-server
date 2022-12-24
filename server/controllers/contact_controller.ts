import { Request, Response, NextFunction } from "express";
import handleAsync from "../utils/handle_async";
import { GlobalError } from "../utils/global_error";

export const contactUs = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
