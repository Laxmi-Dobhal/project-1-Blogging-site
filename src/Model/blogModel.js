const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        trim:true,
        required: true
    },
    body: {
        type: String,
        trim:true,
        required: true
    },
    authorId: {
        type: ObjectId,
        ref: "Author",
        required: true,
    },
    subcategory: [{ type: String,trim:true }],
    category: {
        type: String,
        trim:true,
        required: true
    },
    tags: [{ type: String ,trim:true }],
    isdeleted: {
        type: Boolean,
        default: false
    },
    ispublished: {
        type: Boolean,
        default: false
    },
    deletedAt:Date,
    publishedAt:Date
}, { timestamps: true })

module.exports = mongoose.model('Blog', blogSchema)
