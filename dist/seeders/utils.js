"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectAndSeed = connectAndSeed;
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../config/db");
async function connectAndSeed(seedFn) {
    await (0, db_1.connectDB)();
    try {
        await seedFn();
    }
    finally {
        await mongoose_1.default.disconnect();
    }
}
