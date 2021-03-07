import express from "express";
import cors from "cors";
import { PostgresLocals } from "./postgres";

export default () => {
    const router = express.Router();
    router.use(cors());

    router.use("/reply", async (req, res) => {
        (res.locals.postgres as PostgresLocals).query("select * from foo").catch(err => {
            console.log(err);
        })
        const p = {
            "status": "OK"
        } as any;
        if (req.method === "POST" && req.body) p.data = req.body;
        res.type("json").send(p)
    })

    return router;
}