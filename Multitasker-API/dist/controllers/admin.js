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
const signin_1 = require("../authN/signin");
const isAdmin = (db, req) => {
    return (0, signin_1.userAuthN)(db, req)
        .then((user) => user.user_type === "admin")
        .catch((err) => {
        console.log("Fadminbio Error!", err);
        return false;
    });
};
const getUsers = (db, res, req) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Admin Action: sending user info <================================================");
    if (yield isAdmin(db, req)) {
        db.select("*")
            .from("users")
            .returning("*")
            .then((users) => {
            db.select("*")
                .from("login")
                .returning("*")
                .then((logins) => {
                res.status(200).json({ users: [...users], logins: [...logins] });
            });
        })
            .catch((err) => {
            console.log("admin: ", err);
            res.status(501).json(err);
        });
    }
    else {
        res.status(500).json("nop");
    }
});
module.exports = {
    getUsers: getUsers,
};
