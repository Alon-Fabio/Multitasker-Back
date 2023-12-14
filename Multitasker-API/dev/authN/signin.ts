// Main Functions:
// --------------------------------------------------------------- getUsers() ---------------------------------------------------------------

// Check if admin.
// If admin:
// Query's the DB ("users", "logins" table).
// Good return >> Object{users: [{id, hash, email}...], logins: [{id ,name ,email ,pet ,age ,entries ,joined}...]}
//
// Ends:
// Not admin: res.status(500).json("nop")
// DB Error: res.status(501).json(err)

// ------------------------------------------------------------ getUsers() end ---------------------------------------------------------------

import { Response, Request } from "express";
import Knex from "knex";
import { RedisClientType } from "redis";
const { compareSync } = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const redisClient: RedisClientType = require("../config/redis").redisClient;
const { JWT_SECRET } = require("../../secret");

// --------------------------------------------------------------- Types ---------------------------------------------------------------

type TUser = {
  email: string;
  name: string;
  user_type: string;
  id: number;
  joined: Date;
};

export type TUserAuthN = (db: Knex, req: Request) => Promise<TUser>;

type TGetAuthTokenId = (authentication: string) => Promise<{ id: number }>;

type TSigninAuthentication = (
  db: Knex
) => (req: Request, res: Response) => void;

type TCreateSession = (
  user: TUser
) => Promise<{ success: Boolean; userId: number; token: any }>;

type TSetToken = (token: string, id: number) => Promise<string | null>;

// ------------------------------------------------------------- Types end -------------------------------------------------------------

// Handles user authentication:
export const userAuthN: TUserAuthN = (db, req) => {
  return new Promise((proResolve, proReject) => {
    let { email, password } = req.body;
    console.log("data fetch", email, password);

    if (
      email &&
      password &&
      typeof email === "string" &&
      typeof password === "string"
    ) {
      password = req.body.password;
      email = req.body.email.toLowerCase();
    } else {
      console.log(
        "userAuthN email and password to uppercase: ",
        email,
        password
      );
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
        } else {
          return proReject("Sorry.. something went wrong.. please try");
        }
      })
      .catch((err) => proReject("Sorry.. something went wrong.. please try"));
  });
};

const getAuthTokenId: TGetAuthTokenId = (authentication) => {
  console.log("getAuthTokenId", authentication);
  return new Promise((proResolve, proReject) => {
    // console.log("authentication: ", authentication);

    // return new Promise((resolve, reject) => {
    // console.log(
    //   redisClient
    //     .get(
    //       authentication
    //       // , (err, reply) => {
    //       // if (err || !reply) {
    //       //   // console.log("err: ", err, "reply: ", reply);

    //       //   return reject("getAuthTokenId" || "no data");
    //       // }
    //       // return resolve({ id: reply });
    //       // }
    //     )
    //     .then((reply) => {
    //       console.log(reply);
    //       return { id: reply };
    //     })

    // );
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

const signToken = (email: string) => {
  const jwtPayload = email;
  const token = jwt.sign(
    { jwtPayload },
    process.env.JWT_SECRET ? process.env.JWT_SECRET : JWT_SECRET,
    {
      expiresIn: "2d",
    }
  );
  return token;
};

// Inserts user token into Redis DB. >> id or null or promise reject with string.
const setToken: TSetToken = (token, id) => {
  // <=====================================================================FIX THIS! redis login problem.
  // try {
  //   console.log(
  //     "token: ",
  //     token,
  //     "id: ",
  //     id,
  //     "redis res: ",
  //     redisClient.set(token, id)
  //   );
  //   return Promise.resolve(redisClient.set(token, id));
  // } catch {
  //   console.log("setToken.catch: ", "token: ", token, "id: ", id);

  //   return Promise.reject("Promise rejected");
  // }

  return new Promise((proResolve, proReject) => {
    try {
      // console.log(
      //   "token: ",
      //   token,
      //   "id: ",
      //   id,
      //   "redis res: ",
      //   redisClient.set(token, id)
      // );
      return proResolve(redisClient.set(token, id));
    } catch (err) {
      console.log(
        "setToken.catch: ",
        "token: ",
        token,
        "id: ",
        id,
        "err: ",
        err
      );

      return proReject("Promise rejected");
    }
  });
};

const createSession: TCreateSession = (user) => {
  //JWT web token. return user
  const { email, id } = user;
  const token: string = signToken(email);
  console.log("createSession > token: ", token);
  return setToken(token, id)
    .then(() => {
      console.log("createSession > token, id: ", token, id);

      return { success: true, userId: id, token };
    })
    .catch((err) => Promise.reject("Promise rejected"));
};

// Handle login requests.
const signinAuthentication: TSigninAuthentication = (db) => (req, res) => {
  const { authentication } = req.headers;
  console.log("Start to sign in", authentication, typeof authentication);

  // Try changing to explicit check 'typeof authentication === "undefined":
  return typeof authentication !== "string" || authentication.length < 5
    ? userAuthN(db, req)
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

  userAuthN,
};
