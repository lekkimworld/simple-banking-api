import { config as dotenv_config } from "dotenv";
dotenv_config();
import { buildQueryHelper, terminatePool } from "./postgres";
import moment from "moment";
import { v4 as uuid } from "uuid";

const NUM_CUSTOMERS = 1000;
const MIN_NUM_ACCOUNTS = 1;
const MAX_NUM_ACCOUNTS = 5;
const NUM_TX = 100;
const START_AMOUNT = 1000000;
const MAX_AMOUNT = 5000;
const MIN_AMOUNT = -3000;
const SECONDS_ADJUST_START = 60 * 60 * 24 * 100;
const SECONDS_ADJUST_TX = 60 * 60 * 24 * 9;
const REG_NOS = new Array(10).fill("").map(() => {
    return `000${Math.ceil(Math.random() * 5000) + 1000}`.substr(-4);
})

const log = (msg: string, arg?: any) => {
    if (arg) {
        console.log(`DATALOAD - ${msg}`, arg);
    } else {
        console.log(`DATALOAD - ${msg}`);
    }
}
log("Generated reg. numbers", REG_NOS);

log("Starting");
const queryHelper = buildQueryHelper();
queryHelper.query("select count(*) from customer").then(result => {
    log(`Found ${result.rows[0].count} rows in customer table`);
    if (result.rows[0].count != 0) {
        log("Found data in database - not running postbuild script");
        process.exit(0);
    }
}).catch(async () => {
    // create schema
    await queryHelper.query("create table customer (custno varchar(64) not null primary key);")
    await queryHelper.query("create table account (custno varchar(64) not null, regno integer not null, accountno bigint not null, amount float not null default 0.00, lasttx timestamp without time zone);")
    await queryHelper.query("alter table account add primary key (regno, accountno);");
    await queryHelper.query("alter table account add foreign key (custno) references customer(custno) on delete cascade;");
    await queryHelper.query("create table tx (regno integer not null, accountno bigint not null, before float not null default 0.00, delta float not null default 0.00, after float not null default 0.00, txdt timestamp without time zone not null, txid varchar(64));");
    await queryHelper.query("alter table tx add foreign key (regno, accountno) references account(regno, accountno) on delete cascade;");
}).then(() => {
    queryHelper.query("delete from customer;");


}).then(async () => {
    for (let i = 0; i < NUM_CUSTOMERS; i++) {
        // create customer no
        const custno = uuid();
        await queryHelper.query("insert into customer (custno) values ($1)", custno);
        log(`Created customer: ${custno}`);

        // create accounts (minimum 1)
        const num_accounts = Math.floor(Math.random() * MAX_NUM_ACCOUNTS) + MIN_NUM_ACCOUNTS;
        log(`Creating ${num_accounts} accounts for customer (${custno})`);
        for (let j = 0; j < num_accounts; j++) {
            // get reg no and account no
            const regno = REG_NOS[Math.floor(Math.random() * 10)];
            const accountno = `000${Math.ceil(10000000000 * Math.random())}`.substr(-10);

            // create account
            let amount = Math.ceil(Math.random() * START_AMOUNT) / 100;
            let txdt = moment().utc().subtract(Math.random() * SECONDS_ADJUST_START, "seconds");
            await queryHelper.query("insert into account (regno, accountno, amount, lasttx, custno) values ($1, $2, $3, $4, $5)", regno, accountno, amount, txdt, custno);
            log(`Generating account - ${regno} ${accountno} with amount ${amount}`);

            const num_tx = Math.ceil(Math.random() * NUM_TX);
            log(`Inserting ${num_tx} transactions starting with amount ${amount} at ${txdt.toISOString()}`);
            for (let k = 0; k < num_tx; k++) {
                const delta_amount = (Math.round(Math.random() * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT) * 100) / 100;
                const before_amount = amount;
                amount += delta_amount;
                await queryHelper.query("insert into tx (regno, accountno, before, delta, after, txdt, txid) values ($1, $2, $3, $4, $5, $6, $7)", regno, accountno, before_amount, delta_amount, amount, txdt, uuid());
                txdt.add(Math.random() * SECONDS_ADJUST_TX, "seconds");

                // ensure we do not go part current dt
                if (txdt.isAfter(moment.now())) break;
            }

            // update amount
            await queryHelper.query("update account set amount=$1, lasttx=$2 where regno=$3 and accountno=$4", amount, txdt, regno, accountno);
        }
    }
}).then(() => {
    log("Done (SUCCESS)");
    return Promise.resolve(0);
}).catch(err => {
    log("Done (ERROR)", err);
    return Promise.resolve(1);
}).then((errCode: number) => {
    terminatePool();
    process.exit(errCode);

})