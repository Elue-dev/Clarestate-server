"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAsync = void 0;
const handleAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.handleAsync = handleAsync;
