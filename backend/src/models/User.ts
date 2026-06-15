import mongoose from "mongoose";

const Schema: any = mongoose.Schema;

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
})

export default mongoose.model("UserModel", User, "users")
