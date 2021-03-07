import express from "express";
import cors from "cors";

export default () => {
    const router = express.Router();
    router.use(cors());

    router.use("/reply", async (req, res) => {
        const p = {
            "status": "OK"
        } as any;
        if (req.method === "POST" && req.body) p.data = req.body;
        res.type("json").send(p)
    })

    return router;
}