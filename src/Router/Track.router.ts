import { Router } from "express";
import TrackEntry from "../controller/TrackFeature/LibraryEntry.controller";
import { IsAdmin, VerifyToken } from "../middleware/UserValidate";
import BorrowBookHandler, {
  HandleIndividualReturn,
} from "../controller/TrackFeature/BorrowBook.controller";

const trackRouter = Router();

trackRouter.post("/scan", TrackEntry as any);
trackRouter.post("/pnr", BorrowBookHandler as any);
trackRouter.post("/rb", HandleIndividualReturn as any);

export default trackRouter;
