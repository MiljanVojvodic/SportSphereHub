"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let User = new Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    profilePicture: String,
    role: String,
    status: String,
    sports: [String],
    facilityName: String,
    facilityAddress: String,
    registrationNumber: String,
    taxId: String
});
exports.default = mongoose_1.default.model("UserModel", User, "users");
