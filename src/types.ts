import { Moment } from "moment";

const round = (input: number, decimals: number = 2) => {
    return Math.round(input * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export class HttpError extends Error {
    httpCode: number = 500;

    constructor(msg: string, httpCode?: number) {
        super(msg);
        if (httpCode) this.httpCode = httpCode;
    }
}

export class Customer {
    customerNumber;

    constructor(custno: number) {
        this.customerNumber = custno;
    }
}

export class Account {
    regNo: string;
    accountNo: string;
    amount: number;
    lastTx: Moment;

    constructor(regNo: string, accountNo: string, amount: number, lastTx: Moment) {
        this.regNo = regNo;
        this.accountNo = accountNo;
        this.amount = round(amount, 2);
        this.lastTx = lastTx;
    }
}

export class Transaction {
    before: number;
    delta: number;
    after: number;
    dt: Moment;

    constructor(before: number, delta: number, after: number, dt: Moment) {
        this.after = round(after, 2);
        this.before = round(before, 2);
        this.delta = round(delta, 2);
        this.dt = dt;
    }
}