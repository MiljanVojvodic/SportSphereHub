import mongoose from "mongoose";

const Schema: any = mongoose.Schema;

let Promotion = new Schema({
    name: String,
    facility: { type: Schema.Types.ObjectId, ref: 'sportfacilities' },
    startDate: Date,
    endDate: Date,
    discountType: String,
    discountValue: Number,
    sport: String,
    active: Boolean
})

export default mongoose.model("PromotionModel", Promotion, "promotions")
