import { Router as router } from "express";
import UserRoute from "./User.router";

const Router = router();

Router.use("/user", UserRoute);

export default Router;
