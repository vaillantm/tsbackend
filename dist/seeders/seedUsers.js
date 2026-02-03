"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const utils_1 = require("./utils");
async function seedUsers() {
    await User_1.User.deleteMany({});
    const password = await bcryptjs_1.default.hash('Password123!', 10);
    const users = await User_1.User.create([
        {
            name: 'Admin User',
            username: 'admin',
            email: 'admin@example.com',
            password,
            role: 'admin',
        },
        {
            name: 'Vendor User',
            username: 'vendor',
            email: 'vendor@example.com',
            password,
            role: 'vendor',
        },
        {
            name: 'Customer User',
            username: 'customer',
            email: 'customer@example.com',
            password,
            role: 'customer',
        },
    ]);
    console.log(`Seeded ${users.length} users`);
}
(0, utils_1.connectAndSeed)(seedUsers)
    .then(() => process.exit(0))
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
