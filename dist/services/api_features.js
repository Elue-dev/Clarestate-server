"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIFeatures = void 0;
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        //@ts-ignore
        let queryObj = Object.assign({}, this.queryString);
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach((el) => delete queryObj[el]);
        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt|ne|eq)\b/g, (match) => `$${match}`);
        //@ts-ignore
        this.query.find(JSON.parse(queryString));
        return this;
    }
    sort() {
        //@ts-ignore
        if (this.queryString.sort) {
            //@ts-ignore
            const sortBy = this.queryString.sort.split(",").join(" ");
            //@ts-ignore
            this.query = this.query.sort(sortBy);
        }
        else {
            //@ts-ignore
            this.query = this.query.sort("-createdAt");
        }
        return this;
    }
    limitFields() {
        //@ts-ignore
        if (this.queryString.fields) {
            //@ts-ignore
            const fields = req.query.fields.split(",").join(" ");
            //@ts-ignore
            this.query = query.select(fields);
        }
        else {
            //@ts-ignore
            this.query = this.query.select("-__v");
        }
        return this;
    }
}
exports.APIFeatures = APIFeatures;
