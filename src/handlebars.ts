import { Application } from "express";
import Handlebars from "handlebars";
import exphbs from "express-handlebars";

export default (app: Application): void => {
    // add handlebars
    app.engine("handlebars", exphbs({ defaultLayout: "main" }));
    app.set("view engine", "handlebars");

    Handlebars.registerHelper({
        eq: function (v1, v2) {
            return v1 === v2;
        },
        ne: function (v1, v2) {
            return v1 !== v2;
        },
        lt: function (v1, v2) {
            return v1 < v2;
        },
        gt: function (v1, v2) {
            return v1 > v2;
        },
        lte: function (v1, v2) {
            return v1 <= v2;
        },
        gte: function (v1, v2) {
            return v1 >= v2;
        },
        and: function (...args) {
            return Array.prototype.slice.call(args).every(Boolean);
        },
        or: function (...args) {
            return Array.prototype.slice.call(args, 0, -1).some(Boolean);
        },
    });
};
