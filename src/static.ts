import express, { Application } from "express";
import path from "path";

export default (app: Application, dirPath = "public"): void => {
    app.use(express.static(path.join(__dirname, "..", dirPath)));
};
