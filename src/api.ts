import express from "express";
import cors from "cors";

export default () => {
    const router = express.Router();
    router.use(cors());

    router.use("/reply", async (_req, res) => {
        res.type("json").send({
            "status": "OK"
        })
    })

    return router;
}