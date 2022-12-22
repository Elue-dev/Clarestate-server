import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({});

const Property = mongoose.model("property", propertySchema);

export default Property;
