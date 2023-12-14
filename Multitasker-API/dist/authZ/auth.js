"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redisClient = require("../config/redis").redisClient;
const getAuthentication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authentication } = req.headers;
    console.log("getAuthentication: ", authentication);
    if (!authentication) {
        console.log("getAuthentication - unauthorized: ", authentication);
        return res.status(511).json("Network Authentication Required");
    }
    try {
        const authCheck = yield redisClient.get(authentication);
        if (authCheck) {
            console.log("authCheck success: ", authCheck);
            next();
        }
        else {
            console.log("authCheck didn't find key: ", authCheck);
            return res.status(511).json("Network Authentication Required");
        }
    }
    catch (err) {
        console.log("redis: failed to get(auth): ", err);
        return res.status(500).json("Internal Server Error");
    }
});
module.exports = {
    getAuthentication: getAuthentication,
};
