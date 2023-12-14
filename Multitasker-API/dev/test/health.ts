// checks to add:
// !
// 1. Express
// 2. Cloudinary
// 3. Redis
// 4. Postgres/Knex
//

import { Response, Request } from "express";

// Redis
const redisClient = require("../config/redis").redisClient;

// ========================================================== Types ==========================================================

type TTestHandler = (res: Response, req: Request) => void;

type TPingAF = () => string;

type TTestRedis = () => Promise<string>;
// ======================================================== Types end ========================================================

const testHandler: TTestHandler = async (res, req) => {
  const { tests }: { tests: string[] } = req.body;
  let testRes: string[] = ["Starting testing"];

  if (!Array.isArray(tests)) {
    return res.status(417).json("Tests needs to be an Array format.");
  }

  await tests.forEach(async (test) => {
    switch (test) {
      case "redis":
        let redisRes = await testRedis().then((res) => res);
        console.log(redisRes);
        testRes.push(redisRes);
        break;
      case "pingAF":
        testRes.push(pingAF());
        break;
      default:
        break;
    }
  });

  res.status(200).json({ testRes: testRes });
};

const pingAF: TPingAF = () => {
  console.log("Testing Ping");
  return "Ping OK";
};

const testRedis: TTestRedis = async () => {
  console.log("Testing Redis");

  await redisClient.set("test", "result");
  const redisGet = await redisClient.get("test");
  console.log(redisGet);
  if (redisGet === "result") "redis OK";
  return "redis failed to set & get";
};

module.exports = {
  testHandler,
};
