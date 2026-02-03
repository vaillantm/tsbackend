"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];
REQUIRED.forEach((key) => {
    if (!process.env[key]) {
        console.warn(`[env] Missing ${key}. Make sure to set it in .env`);
    }
});
exports.config = {
    PORT: Number(process.env.PORT || 4000),
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/eshop',
    JWT_SECRET: process.env.JWT_SECRET || 'change_me',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    UPLOAD_DIR: process.env.UPLOAD_DIR || path_1.default.resolve('uploads'),
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    SMTP: {
        HOST: process.env.SMTP_HOST,
        PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
        USER: process.env.SMTP_USER,
        PASS: process.env.SMTP_PASS,
    },
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
};
