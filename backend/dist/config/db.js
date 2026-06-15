"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Projekat';
const connectDB = async () => {
    await mongoose_1.default.connect(MONGO_URI);
    console.log('MongoDB connected to', MONGO_URI);
};
exports.default = connectDB;
