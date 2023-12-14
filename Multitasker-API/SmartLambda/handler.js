"use strict";
const emojis = ["😄", "😃", "😀", "😊", "😉", "😍", "🔶", "🔷", "🚀"];
module.exports.rank = async (event) => {
  const userRank = event.queryStringParameters.rank;
  const Rank = emojis[userRank >= emojis.length ? emojis.length - 1 : userRank];
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
    body: JSON.stringify(
      {
        message: "Rank generated!",
        input: Rank,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
