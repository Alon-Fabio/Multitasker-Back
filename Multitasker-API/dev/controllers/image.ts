// ---------------------------------------------------------- functions ----------------------------------------------------------

// ---------------------------------------------------------- handleApiCall() ----------------------------------------------------------

// Calls Clarifai's API with a URL of an image from the request body image property.

// Success: res.status(200).json(data)
// Fail : res.status(417).json("Expectation Failed")

// -------------------------------------------------------- handleApiCall() end ----------------------------------------------------------

// -------------------------------------------------------- handleImage() ----------------------------------------------------------

// Query's DB for user past searches and updates it.

// Success: res.status(200).json(entries[0]);
// Fail : res.status(500).json("Internal Server Error")

// -------------------------------------------------------- handleImage() end ----------------------------------------------------------

// -------------------------------------------------------- functions end ----------------------------------------------------------

import { Response, Request } from "express";
import Knex from "knex";

// --------------------------------------------------- Types ----------------------------------------------------------------
// What I know/use from the API call outputs[0].data.regions
interface ICalculateFaceLocation {
  id: string;
  value: number;
  region_info: {
    bounding_box: {
      left_col: number;
      top_row: number;
      right_col: number;
      bottom_row: number;
    };
  };
}

interface IClarifaiResponse {
  outputs: ICalculateFaceLocation[];
}

type THaleApiCall = (req: Request, res: Response) => void;

type THandleImage = (req: Request, res: Response, db: Knex) => void;
// ------------------------------------------------ Types end ----------------------------------------------------------------

const { APIKEY } = require("../../secret");
const Clarifai = require("clarifai");

const clarifaiApp = new Clarifai.App({
  apiKey: APIKEY,
});

// Calls Clarifai's API with a URL of an image.

const handleApiCall: THaleApiCall = (req, res) => {
  clarifaiApp.models
    // HEADS UP! Sometimes the Clarifai Models can be down or not working as they are constantly getting updated.
    // A good way to check if the model you are using is up, is to check them on the clarifai website. For example,
    // for the Face Detect Mode: https://www.clarifai.com/models/face-detection
    // If that isn't working, then that means you will have to wait until their servers are back up. Another solution
    // is to use a different version of their model that works like: `c0c0ac362b03416da06ab3fa36fb58e3`
    // so you would change from:
    // .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    // to:
    // .predict('c0c0ac362b03416da06ab3fa36fb58e3', req.body.input)
    .predict(
      {
        id: "a403429f2ddf4b49b307e318f00e528b",
        version: "34ce21a40cc24b6b96ffee54aabff139",
      },
      req.body.input
    )
    .then((data: IClarifaiResponse) => {
      res.status(200).json({ success: true, faces: data });
    })
    .catch((err: string) => {
      res.status(417).json({ success: false, error: "Expectation Failed" });
    });
};

// Query's DB for user past searches and updates it.

const handleImage: THandleImage = (req, res, db) => {
  const { id } = req.body;
  console.log("User ", id, " used face-detection");
  if (id) {
    db("users")
      .where("id", "=", id)
      .increment("entries", 1)
      .returning("entries")
      .then((entries: number[]) => {
        console.log("entries array: ", entries, "user entries: ", entries[0]);
        res.status(200).json(entries[0]);
      })
      .catch((err) => {
        res.status(500).json("Internal Server Error");
      });
  } else {
    res.status(511).json("Network Authentication Required");
  }
};

module.exports = {
  handleImage,
  handleApiCall,
};
