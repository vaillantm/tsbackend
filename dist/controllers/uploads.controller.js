"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductImages = exports.uploadProfileImage = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Upload_1 = require("../models/Upload");
const User_1 = require("../models/User");
exports.uploadProfileImage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file)
        return res.status(400).json({ message: 'No file uploaded' });
    const avatar = req.file.path;
    const updated = await User_1.User.findByIdAndUpdate(req.user.id, { avatar }, { new: true });
    res.status(201).json({ path: avatar, user: { id: updated._id, avatar: updated.avatar } });
});
exports.uploadProductImages = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }
    const files = req.files.map((f) => f.path);
    const saved = await Upload_1.Upload.insertMany(files.map((p) => ({ userId: req.user.id, path: p, type: 'product' })));
    res.status(201).json({ files: saved.map((s) => ({ id: s._id, path: s.path })) });
});
