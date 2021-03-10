import { Application } from "express";
import express from "express";
import getApiRouter from "./api";

export default (app: Application): void => {
    // add routes
    const rootRouter = express.Router();
    app.use("/", rootRouter);
    app.use("/api", getApiRouter());

    rootRouter.get("/", async (_req, res) => {
        res.render("root");
    });
};
