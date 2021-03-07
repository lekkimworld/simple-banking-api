import { config as dotenv_config } from "dotenv";
dotenv_config();
import { buildQueryHelper, terminatePool } from "./postgres";
import moment from "moment";


const NUM_ACCOUNTS = 1000;
const NUM_TX = 100;
const START_AMOUNT = 1000000;
const MAX_AMOUNT = 5000;
const MIN_AMOUNT = -3000;
const SECONDS_ADJUST_START = 60 * 60 * 24 * 100;
const SECONDS_ADJUST_TX = 60 * 60 * 24 * 9;

const log = (msg: string) => {
    console.log(`DATALOAD - ${msg}`);
}

log("Starting");
const queryHelper = buildQueryHelper();
queryHelper.query("select count(*) from account").catch(() => {
    // create schema
    return queryHelper.query("create table account(regno integer not null, accountno integer not null, amount float not null default 0.00, txdt timestamp without time zone not null, txid varchar(64));");
}).then(() => {
    return queryHelper.query("delete from account;");
}).then(async () => {
    for (let i = 0; i < NUM_ACCOUNTS; i++) {
        const regno = `000${Math.ceil(Math.random() * 5000) + 1000}`.substr(-4);
        const accountno = `000${Math.ceil(10000000000 * Math.random())}`.substr(-10);
        log(`Generated account - ${regno} ${accountno}`);

        let amount = Math.ceil(Math.random() * START_AMOUNT) / 100;
        let txdt = moment().utc().subtract(Math.random() * SECONDS_ADJUST_START, "seconds");
        const num_tx = Math.ceil(Math.random() * NUM_TX);
        log(`Inserting ${num_tx} transactions starting with amount ${amount} at ${txdt.toISOString()}`);
        for (let k = 0; k < num_tx; k++) {
            const delta_amount = (Math.round(Math.random() * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT) * 100) / 100;
            amount += delta_amount;
            await queryHelper.query("insert into account (regno, accountno, amount, txdt) values ($1, $2, $3, $4)", regno, accountno, amount, txdt);
            txdt.add(Math.random() * SECONDS_ADJUST_TX, "seconds");
        }
    }
}).then((() => {
    log("Done");
    terminatePool();
}))