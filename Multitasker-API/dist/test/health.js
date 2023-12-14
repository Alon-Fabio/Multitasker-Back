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
const testHandler = (res, req) => __awaiter(void 0, void 0, void 0, function* () {
    const { tests } = req.body;
    let testRes = ["Starting testing"];
    if (!Array.isArray(tests)) {
        return res.status(417).json("Tests needs to be an Array format.");
    }
    yield tests.forEach((test) => __awaiter(void 0, void 0, void 0, function* () {
        switch (test) {
            case "redis":
                let redisRes = yield testRedis().then((res) => res);
                console.log(redisRes);
                testRes.push(redisRes);
                break;
            case "pingAF":
                testRes.push(pingAF());
                break;
            default:
                break;
        }
    }));
    res.status(200).json({ testRes: testRes });
});
const pingAF = () => {
    console.log("Testing Ping");
    return "Ping OK";
};
const testRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Testing Redis");
    yield redisClient.set("test", "result");
    const redisGet = yield redisClient.get("test");
    console.log(redisGet);
    if (redisGet === "result")
        "redis OK";
    return "redis failed to set & get";
});
module.exports = {
    testHandler,
};
