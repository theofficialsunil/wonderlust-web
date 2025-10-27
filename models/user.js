const express = require('express');
const { required } = require('joi');
const mongoose = require('mongoose');
const PassportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        sparse: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,  
        required: true
    },
    profilePhoto: {       
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' 
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    }
});

//PassportLocalMongoose automatically add salt,password and username 
userSchema.plugin(PassportLocalMongoose);
module.exports = mongoose.model('User', userSchema);
