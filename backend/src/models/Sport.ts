import mongoose from "mongoose";

const Schema: any = mongoose.Schema;

let Sport = new Schema({
    name: { type: String, unique: true },
    active: { type: Boolean, default: true }
});

export default mongoose.model("SportModel", Sport, "sports");
