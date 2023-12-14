// ------------------------------------------------- authentication ------------------------------------------------------
// Check user is authenticated using tokens manged with redis DB.
//
// Redis will connect on the signin page and store an auth token for every active logged in user.
//
// ---------------------------------------------- getAuthentication() ------------------------------------------------------
//
// Checks redis's DB for a token.
// If token has a key (number): calls Next()
// Error or No token: res.status(511).json("Network Authentication Required")
//
// ------------------------------------------- getAuthentication() end ------------------------------------------------------

// --------------------------------------------------- Types ----------------------------------------------------------------

type TGetAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
// ------------------------------------------------- Types end --------------------------------------------------------------

import { Response, Request, NextFunction } from "express";

const redisClient = require("../config/redis").redisClient;

const getAuthentication: TGetAuthentication = async (req, res, next) => {
  const { authentication } = req.headers;
  console.log("getAuthentication: ", authentication);

  // Checks auth token is present.
  if (!authentication) {
    console.log("getAuthentication - unauthorized: ", authentication);

    return res.status(511).json("Network Authentication Required");
  }

  // Trying to check for auth token in redis DB.
  try {
    const authCheck = await redisClient.get(authentication);

    if (authCheck) {
      console.log("authCheck success: ", authCheck);
      next();
    } else {
      console.log("authCheck didn't find key: ", authCheck);
      return res.status(511).json("Network Authentication Required");
    }
  } catch (err) {
    console.log("redis: failed to get(auth): ", err);
    return res.status(500).json("Internal Server Error");
  }
};

module.exports = {
  getAuthentication: getAuthentication,
};
