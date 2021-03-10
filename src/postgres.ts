import { Application } from "express";
import { ConnectionOptions } from "node:tls";
import { Pool, QueryResult, PoolConfig } from "pg";
import { URL } from "url";

const url = new URL(process.env.DATABASE_URL as string);
const config: PoolConfig = {
    database: url.pathname.substring(1),
    host: url.hostname,
    port: url.port ? Number.parseInt(url.port) : 5432,
    user: url.username,
    password: url.password,
};
if (process.env.DATABASE_SSL || process.env.NODE_ENV === "production") {
    config.ssl = {
        rejectUnauthorized: false,
    } as ConnectionOptions;
}

// create pool
const pool = new Pool(config);

// export method to terminate the pool
export const terminatePool = (): void => {
    pool.end();
};

export interface PostgresLocals {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query(query: string, ...args: Array<any>): Promise<QueryResult>;
}

export const buildQueryHelper = (): PostgresLocals => {
    return Object.freeze({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query: (query: string, ...args: Array<any>): Promise<QueryResult> => {
            if (pool) return pool.query(query, args);
            return Promise.reject();
        },
    } as PostgresLocals);
};

export default (app: Application): void => {
    // add route to set a connection pool in response
    app.use((_req, res, next) => {
        res.locals.postgres = buildQueryHelper();
        next();
    });
};
