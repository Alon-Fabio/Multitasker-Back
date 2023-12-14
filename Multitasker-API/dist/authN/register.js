"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const { hashSync } = require("bcrypt-nodejs");
const { JWT_SECRET } = require("../../secret");
const redisClient = require("../config/redis").redisClient;
const signToken = (email) => {
    const jwtPayload = email;
    const token = jwt.sign({ jwtPayload }, process.env.JWT_SECRET || JWT_SECRET, {
        expiresIn: "2d",
    });
    return token;
};
const getUserWToken = (user) => {
    const { email, id } = user;
    const token = signToken(email);
    return redisClient
        .set(token, id)
        .then((res) => ({ success: true, userId: id, token }))
        .catch((err) => ({ success: false, error: "Internal server ERROR" }));
};
const handleRegister = (req, res, db) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        res.status(400).json({ success: false, error: "Bad Request" });
    }
    console.log("handleRegister - body: ", req.body);
    const hash = hashSync(password);
    console.log("handleRegister - hash: ", hash);
    db.transaction((trx) => {
        trx
            .insert({
            hash: hash,
            email: email,
        })
            .into("login")
            .returning("email")
            .then((loginEmail) => {
            return trx
                .insert({
                email: loginEmail[0],
                name: name,
                joined: new Date(),
            })
                .into("users")
                .returning("*")
                .then((user) => {
                console.log("handleRegister - db: ", user[0]);
                getUserWToken(user[0]).then((finalRes) => {
                    res.status(200).json(finalRes);
                });
            });
        })
            .then(trx.commit)
            .catch(trx.rollback);
    }).catch((err) => {
        res.status(500).json({ success: false, error: "unable to register" });
        return err.rollback;
    });
};
module.exports = {
    handleRegister: handleRegister,
};
