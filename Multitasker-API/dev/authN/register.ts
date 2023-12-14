// Main Functions:

// ------------------------------------------------------- handleRegister() ---------------------------------------------------

// Inset new users into the system:
// Checks email, name, password are all present.
// Insert users Hash & mail into 'login' table.
// Insert users email, name, joined (new date) into 'users' table.

// Ends:
// Fail: res.status(400).json({ success: false, error:"Bad Request"});
// Fail DB: res.status(500 ).json({ success: false, error:"unable to register"});
// Success: res.status(200).json({ success: true, userId: id, token })
// ----------------------------------------------------- handleRegister() end -------------------------------------------------

// ========================================================== Types ==========================================================

type TSignToken = (email: string) => string;

type TGetUserWToken = (user: {
  email: string;
  name: string;
  id: number;
  joined: Date;
}) => Promise<
  | { success: boolean; userId: number; token: string }
  | { success: boolean; error: "Internal server ERROR" }
>;

type THandleRegister = (req: Request, res: Response, db: Knex) => void;

// ======================================================= Types end =========================================================

import { Response, Request } from "express";
import Knex from "knex";
const jwt = require("jsonwebtoken");
const { hashSync } = require("bcrypt-nodejs");

const { JWT_SECRET } = require("../../secret");

import { RedisClientType } from "redis";
const redisClient: RedisClientType = require("../config/redis").redisClient;

// Generate Token:
const signToken: TSignToken = (email) => {
  const jwtPayload = email;
  const token: string = jwt.sign(
    { jwtPayload },
    process.env.JWT_SECRET || JWT_SECRET,
    {
      expiresIn: "2d",
    }
  );
  return token;
};

// Generate object to send to client with Token & user id, insert Token to redis DB:
const getUserWToken: TGetUserWToken = (user) => {
  const { email, id } = user;
  const token = signToken(email);

  return redisClient
    .set(token, id)
    .then((res) => ({ success: true, userId: id, token }))
    .catch((err) => ({ success: false, error: "Internal server ERROR" }));
};

// Inset new users into the system:
const handleRegister: THandleRegister = (req, res, db) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    res.status(400).json({ success: false, error: "Bad Request" });
  }

  console.log("handleRegister - body: ", req.body);
  const hash: string = hashSync(password);
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
