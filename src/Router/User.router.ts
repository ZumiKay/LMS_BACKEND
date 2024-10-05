import { Router } from "express";
import RegisterUser, {
  Login,
} from "../controller/Authentication/Account.controller";

const UserRoute = Router();

UserRoute.post("/registerstudent", async (req, res) => {
  await RegisterUser(req, res, "STUDENT");
});

UserRoute.post("/login", Login as any);

export default UserRoute;
