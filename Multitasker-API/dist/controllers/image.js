"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { APIKEY } = require("../../secret");
const Clarifai = require("clarifai");
const clarifaiApp = new Clarifai.App({
    apiKey: APIKEY,
});
const handleApiCall = (req, res) => {
    clarifaiApp.models
        .predict({
        id: "a403429f2ddf4b49b307e318f00e528b",
        version: "34ce21a40cc24b6b96ffee54aabff139",
    }, req.body.input)
        .then((data) => {
        res.status(200).json({ success: true, faces: data });
    })
        .catch((err) => {
        res.status(417).json({ success: false, error: "Expectation Failed" });
    });
};
const handleImage = (req, res, db) => {
    const { id } = req.body;
    console.log("User ", id, " used face-detection");
    if (id) {
        db("users")
            .where("id", "=", id)
            .increment("entries", 1)
            .returning("entries")
            .then((entries) => {
            console.log("entries array: ", entries, "user entries: ", entries[0]);
            res.status(200).json(entries[0]);
        })
            .catch((err) => {
            res.status(500).json("Internal Server Error");
        });
    }
    else {
        res.status(511).json("Network Authentication Required");
    }
};
module.exports = {
    handleImage,
    handleApiCall,
};
