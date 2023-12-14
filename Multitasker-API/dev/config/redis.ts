import { createClient } from "redis";

const { REDIS_URI } = require("../../secret");
const redisProsURI = process.env.REDIS_URI || REDIS_URI;

const redisClient = createClient({
  url: redisProsURI,
});

redisClient.on("error", function (err) {
  console.log("Redis error, redis failed with error: " + err);
});

redisClient
  .connect()
  .then((onfulfilled) => {
    if (onfulfilled) {
      return console.log("Redis ready");
    }
    return console.log("Redis down");
  })
  .catch((err) => console.log("Redis connect failed with error: ", err));

module.exports = {
  redisClient,
};
