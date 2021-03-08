import express, { Response, Request, NextFunction } from "express";

// read .env
import { config as dotenv_config } from "dotenv";
dotenv_config();
import { json as bpjson } from "body-parser";
import createRedisClient from "./redis";
import configureRedisSession from "./redis-session";
import configureStatic from "./static";
import configureRoutes from "./configure-routes";
import configureHandlebars from "./handlebars";
import configurePostgres, { terminatePool } from "./postgres";

// create app
const app = express();
app.disable('x-powered-by');
app.use(bpjson());

// configure handlebats
configureHandlebars(app);

// configure static files
configureStatic(app);

// configure session
const redisClient = createRedisClient();
configureRedisSession(app, redisClient);

// configure postgres
configurePostgres(app);

// create routes
configureRoutes(app);

// serialize output
app.use(async (_req, res, next) => {
    if (!res.locals.result) return next();
    res.type("json").send(res.locals.result).end();
})

// error handler
//@ts-ignore
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const o = {
        "status": "ERROR",
        "message": err.message
    }
    if (err.hasOwnProperty("httpCode")) {
        res.status((err as any).httpCode);
    }
    res.type("json").send(o);
})

// listen
const server = app.listen(process.env.PORT || 8080);
console.log(`Started listening on port ${process.env.PORT || 8080}`); ''
process.on('SIGTERM', () => {
    server.close();
    terminatePool();
    process.exit(0);
})