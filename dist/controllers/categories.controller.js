"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.getCategories = exports.createCategory = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Category_1 = require("../models/Category");
const files_1 = require("../utils/files");
exports.createCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, path, image: imageUrl } = req.body;
    const image = req.file?.path || imageUrl; // Prefer uploaded file; fallback to JSON URL
    const cat = await Category_1.Category.create({ name, description, path, image, createdBy: req.user.id });
    res.status(201).json(cat);
});
exports.getCategories = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const list = await Category_1.Category.find();
    res.json(list);
});
exports.getCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cat = await Category_1.Category.findById(req.params.id);
    if (!cat)
        return res.status(404).json({ message: 'Not found' });
    res.json(cat);
});
exports.updateCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { image: imageUrl, ...rest } = req.body;
    const updates = rest;
    let oldImage;
    const current = await Category_1.Category.findById(req.params.id);
    if (current?.image)
        oldImage = current.image;
    if (req.file) {
        updates.image = req.file.path; // Prefer uploaded file
    }
    else if (imageUrl !== undefined) {
        updates.image = imageUrl; // Fallback to JSON URL
    }
    const cat = await Category_1.Category.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!cat)
        return res.status(404).json({ message: 'Not found' });
    if (oldImage && updates.image && oldImage !== updates.image) {
        (0, files_1.removeFile)(oldImage);
    }
    res.json(cat);
});
exports.deleteCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cat = await Category_1.Category.findById(req.params.id);
    if (cat?.image)
        (0, files_1.removeFile)(cat.image);
    await Category_1.Category.findByIdAndDelete(req.params.id);
    res.status(204).send();
});
