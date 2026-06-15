import mongoose from "mongoose";

const Schema: any = mongoose.Schema;

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
})

export default mongoose.model("SportFacilityModel", SportFacility, "sportfacilities")
