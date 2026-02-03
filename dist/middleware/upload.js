"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: {
        folder: 'eshop',
        allowed_formats: ['jpg', 'png', 'webp', 'jpeg', 'gif'],
    },
});
function fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Only jpg, png, webp, gif images are allowed'));
    }
    cb(null, true);
}
exports.uploadImage = (0, multer_1.default)({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
    fileFilter,
});
