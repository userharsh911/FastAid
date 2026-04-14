import mongoose from "mongoose"

const volunteerSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    mode:{
        type:String,
        enum:['Available','Busy','Call','Alloted'],
        default:'Available',
        required:true
    },
    location:{
        type:{
            type:String,
            enum:["Point"],
            required:true,
            default:"Point"
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    verification_document: {
        publicId: {
            type: String,
        },
        url: {
            type: String,
        },
        format: {
            type: String,
        },
        resourceType: {
            type: String,
        },
        bytes: {
            type: Number,
        },
        originalName: {
            type: String,
        },
        mimeType: {
            type: String,
        },
    },
    isverified: {
        type: Boolean,
        default: false,
        required: true,
    },
    push_token: {
        type: String,
        default: null
    }
},{timestamps:true});

volunteerSchema.index({location:"2dsphere"});

const Volunteer = mongoose.model("Volunteer",volunteerSchema);
export default Volunteer;