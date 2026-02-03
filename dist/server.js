"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const app_1 = __importDefault(require("./app"));
(async () => {
    await (0, db_1.connectDB)();
    const port = env_1.config.PORT;
    app_1.default.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
})();
