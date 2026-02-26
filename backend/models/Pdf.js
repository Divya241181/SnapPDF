const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    pageCount: { type: Number },
    thumbnailUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Pdf', pdfSchema);
