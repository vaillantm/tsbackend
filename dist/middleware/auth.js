"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
function authenticate(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.JWT_SECRET);
        User_1.User.findById(decoded.id)
            .then((u) => {
            if (!u)
                return res.status(401).json({ message: 'Unauthorized' });
            req.user = { id: u._id.toString(), name: u.name, username: u.username, email: u.email, role: u.role, avatar: u.avatar };
            next();
        })
            .catch(next);
    }
    catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        if (roles.length && !roles.includes(req.user.role))
            return res.status(403).json({ message: 'Forbidden' });
        next();
    };
}
