import express, { Router } from "express";
import cors from "cors";
import { PostgresLocals } from "./postgres";
import { HttpError, Customer, Account, Transaction } from "./types";
import moment from "moment";

export default (): Router => {
    const router = express.Router();
    router.use(cors());

    router.use("/reply", async (req, res) => {
        const p = {
            status: "OK",
        } as any;
        if (req.method === "POST" && req.body) p.data = req.body;
        res.type("json").send(p);
    });

    router.get("/customers", async (_req, res, next) => {
        const q = res.locals.postgres as PostgresLocals;
        const result = await q.query("select * from customer");
        if (result.rowCount === 0) {
            return next(new HttpError("No customers found", 404));
        }
        res.locals.result = result.rows.map((r: any) => new Customer(r.custno));
        next();
    });

    router.get("/customer/:custno", async (req, res, next) => {
        const custno = req.params.custno;
        if (!custno) return next(new HttpError("Missing customer number", 417));
        const q = res.locals.postgres as PostgresLocals;
        const result = await q.query(
            "select * from customer where custno=$1",
            custno
        );
        if (result.rowCount === 0) {
            return next(
                new HttpError(`Customer with no <${custno}> not found`, 404)
            );
        }
        res.locals.result = new Customer(result.rows[0].custno);
        next();
    });

    router.get("/accounts/:custno", async (req, res, next) => {
        const custno = req.params.custno;
        if (!custno) return next(new HttpError("Missing customer number", 417));
        const q = res.locals.postgres as PostgresLocals;
        const result = await q.query(
            "select * from account where custno=$1",
            custno
        );
        res.locals.result = result.rows.map((r) => {
            return new Account(
                `${r.regno}`,
                `${r.accountno}`,
                r.amount,
                moment.utc(r.lastTx)
            );
        });
        next();
    });

    router.get("/tx/:regno/:accountno", async (req, res, next) => {
        const regno = req.params.regno;
        const accountno = req.params.accountno;
        if (!regno)
            return next(new HttpError("Missing registration number", 417));
        if (!accountno)
            return next(new HttpError("Missing account number", 417));
        const q = res.locals.postgres as PostgresLocals;
        const result = await q.query(
            "select * from tx where regno=$1 and accountno=$2 order by txdt desc",
            regno,
            accountno
        );
        res.locals.result = result.rows.map((r) => {
            return new Transaction(
                r.txid,
                r.before,
                r.delta,
                r.after,
                moment.utc(r.txdt)
            );
        });
        next();
    });

    return router;
};
