"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let SportFacility = new Schema({
    name: String,
    city: String,
    address: String,
    sports: [String],
    status: String,
    likes: Number,
    dislikes: Number,
    images: [String],
    hourlyRate: Number,
    workingHours: {
        from: String,
        to: String
    },
    maxNoShows: Number,
    courts: [{
            name: String,
            type: String,
            capacity: Number,
            sport: String,
            description: String
        }],
    description: String,
    employees: [Schema.Types.ObjectId]
});
exports.default = mongoose_1.default.model("SportFacilityModel", SportFacility, "sportfacilities");
