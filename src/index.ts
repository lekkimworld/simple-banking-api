import express from "express";

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

// listen
const server = app.listen(process.env.PORT || 8080);
console.log(`Started listening on port ${process.env.PORT || 8080}`); ''
process.on('SIGTERM', () => {
    server.close();
    terminatePool();
    process.exit(0);
})