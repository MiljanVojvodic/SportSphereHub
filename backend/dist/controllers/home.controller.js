"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeController = void 0;
const SportFacility_1 = __importDefault(require("../models/SportFacility"));
const Promotion_1 = __importDefault(require("../models/Promotion"));
class HomeController {
    constructor() {
        this.getHomeData = (req, res) => {
            const now = new Date();
            Promise.all([
                SportFacility_1.default.countDocuments({ status: 'active' }),
                SportFacility_1.default.find({ status: 'active' })
                    .sort({ likes: -1 })
                    .limit(3)
                    .select('name city likes dislikes'),
                Promotion_1.default.find({
                    active: true,
                    startDate: { $lte: now },
                    endDate: { $gte: now }
                })
                    .limit(3)
                    .populate('facility', 'name')
                    .select('name facility startDate endDate discountType discountValue sport')
            ]).then(([activeFacilitiesCount, top3Facilities, promotions]) => {
                res.json({ activeFacilitiesCount, top3Facilities, promotions });
            }).catch(() => {
                res.status(500).json({ message: 'Greška na serveru' });
            });
        };
    }
}
exports.HomeController = HomeController;
