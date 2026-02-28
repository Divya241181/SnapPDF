const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    username: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true },
    profession: { type: String },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    profilePhotoUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
