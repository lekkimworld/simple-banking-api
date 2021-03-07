import { Application } from "express";
import express from "express";
import getApiRouter from "./api";

export default (app : Application) => {
    // add routes
    const rootRouter = express.Router();
    app.use("/", rootRouter);
    app.use("/api", getApiRouter());

    //@ts-ignore5
    rootRouter.get("/", async (req, res) => {
        res.render("root");
    })
}