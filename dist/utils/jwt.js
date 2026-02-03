"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const signToken = (id) => {
    const secret = env_1.config.JWT_SECRET;
    const options = {
        expiresIn: env_1.config.JWT_EXPIRES_IN,
    };
    return jsonwebtoken_1.default.sign({ id }, secret, options);
};
exports.signToken = signToken;
