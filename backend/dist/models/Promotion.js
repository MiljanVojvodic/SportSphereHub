"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let Promotion = new Schema({
    name: String,
    facility: { type: Schema.Types.ObjectId, ref: 'sportfacilities' },
    startDate: Date,
    endDate: Date,
    discountType: String,
    discountValue: Number,
    sport: String,
    active: Boolean
});
exports.default = mongoose_1.default.model("PromotionModel", Promotion, "promotions");
