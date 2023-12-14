"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthN = void 0;
const { compareSync } = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis").redisClient;
const { JWT_SECRET } = require("../../secret");
const userAuthN = (db, req) => {
    return new Promise((proResolve, proReject) => {
        let { email, password } = req.body;
        console.log("data fetch", email, password);
        if (email &&
            password &&
            typeof email === "string" &&
            typeof password === "string") {
            password = req.body.password;
            email = req.body.email.toLowerCase();
        }
        else {
            console.log("userAuthN email and password to uppercase: ", email, password);
            return proReject("incorrect form submission");
        }
        return db
            .select("email", "hash")
            .from("login")
            .where("email", "=", email)
            .then((data) => {
            const isValid = compareSync(password, data[0].hash);
            console.log("userAuthN-db", isValid);
            if (isValid) {
                return db
                    .select("*")
                    .from("users")
                    .where("email", "=", email)
                    .then((user) => {
                    console.log("userAuthN-db > user[0]: ", user[0]);
                    return proResolve(user[0]);
                })
                    .catch((err) => proReject("databaseErr"));
            }
            else {
                return proReject("Sorry.. something went wrong.. please try");
            }
        })
            .catch((err) => proReject("Sorry.. something went wrong.. please try"));
    });
};
exports.userAuthN = userAuthN;
const getAuthTokenId = (authentication) => {
    console.log("getAuthTokenId", authentication);
    return new Promise((proResolve, proReject) => {
        return redisClient
            .get(authentication)
            .then((reply) => {
            console.log("redisClient >> reply: ", reply);
            return reply === null
                ? proReject("Unauthorized")
                : proResolve({ id: Number(reply) });
        })
            .catch((err) => proReject("Authentication failed"));
    });
};
const signToken = (email) => {
    const jwtPayload = email;
    const token = jwt.sign({ jwtPayload }, process.env.JWT_SECRET ? process.env.JWT_SECRET : JWT_SECRET, {
        expiresIn: "2d",
    });
    return token;
};
const setToken = (token, id) => {
    return new Promise((proResolve, proReject) => {
        try {
            return proResolve(redisClient.set(token, id));
        }
        catch (err) {
            console.log("setToken.catch: ", "token: ", token, "id: ", id, "err: ", err);
            return proReject("Promise rejected");
        }
    });
};
const createSession = (user) => {
    const { email, id } = user;
    const token = signToken(email);
    console.log("createSession > token: ", token);
    return setToken(token, id)
        .then(() => {
        console.log("createSession > token, id: ", token, id);
        return { success: true, userId: id, token };
    })
        .catch((err) => Promise.reject("Promise rejected"));
};
const signinAuthentication = (db) => (req, res) => {
    const { authentication } = req.headers;
    console.log("Start to sign in", authentication, typeof authentication);
    return typeof authentication !== "string" || authentication.length < 5
        ? (0, exports.userAuthN)(db, req)
            .then((dataFromDb) => {
            console.log("signinAuthentication.userAuthN > data", dataFromDb);
            return dataFromDb.id && dataFromDb.email
                ? createSession(dataFromDb)
                : Promise.reject(dataFromDb);
        })
            .then((userData) => {
            res.status(200).json(userData);
        })
            .catch((error) => {
            console.log(error);
            res.status(401).json({ success: false, error: "Unauthorized" });
        })
        : getAuthTokenId(authentication)
            .then((userData) => {
            res.status(200).json(userData);
        })
            .catch((error) => {
            res.status(401).json({ success: false, error: "Unauthorized" });
        });
};
module.exports = {
    signinAuthentication: signinAuthentication,
    userAuthN: exports.userAuthN,
};
