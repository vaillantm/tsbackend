"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const uploads_controller_1 = require("../controllers/uploads.controller");
const router = (0, express_1.Router)();
router.post('/profile', auth_1.authenticate, upload_1.uploadImage.single('file'), uploads_controller_1.uploadProfileImage);
exports.default = router;
