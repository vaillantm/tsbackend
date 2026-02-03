"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.listUsers = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const User_1 = require("../models/User");
exports.listUsers = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const page = Math.max(parseInt(_req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(_req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const sort = _req.query.sort || '-createdAt';
    const [users, total] = await Promise.all([
        User_1.User.find().select('-password').sort(sort).skip(skip).limit(limit),
        User_1.User.countDocuments(),
    ]);
    res.json({ data: users, page, limit, total });
});
exports.getUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.params.id).select('-password');
    if (!user)
        return res.status(404).json({ message: 'Not found' });
    res.json(user);
});
exports.updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user)
        return res.status(404).json({ message: 'Not found' });
    res.json(user);
});
exports.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await User_1.User.findByIdAndDelete(req.params.id);
    res.status(204).send();
});
