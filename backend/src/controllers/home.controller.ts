import express from 'express';
import SportFacilityModel from '../models/SportFacility';
import PromotionModel from '../models/Promotion';

export class HomeController {

    getHomeData = (req: express.Request, res: express.Response) => {
        const now = new Date();

        Promise.all([
            SportFacilityModel.countDocuments({ status: 'active' }),
            SportFacilityModel.find({ status: 'active' })
                .sort({ likes: -1 })
                .limit(3)
                .select('name city likes dislikes'),
            PromotionModel.find({
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
    }
}
