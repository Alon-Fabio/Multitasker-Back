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

// Copy res from front: <======================================================== UPDATE!
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

// From the documentation of clarifai:

///////////////////////////////////////////////////////////////////////////////////////////////////
// In this section, we set the user authentication, user and app ID, model details, and the URL
// of the image we want as an input. Change these strings to run your own example.
///////////////////////////////////////////////////////////////////////////////////////////////////
// const handleApiCall = (req, res) => {
//   // Your PAT (Personal Access Token) can be found in the portal under Authentification
//   const PAT = secret.APIKEY;
//   // Specify the correct user_id/app_id pairings
//   // Since you're making inferences outside your app's scope
//   const USER_ID = "alonfabio";
//   const APP_ID = "eab75b70ccdc4bfcac46d05f84204d88";
//   // Change these to whatever model and image URL you want to use
//   const MODEL_ID = "face-detection";
//   const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105";
//   const IMAGE_URL = req.body;

//   ///////////////////////////////////////////////////////////////////////////////////
//   // YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
//   ///////////////////////////////////////////////////////////////////////////////////

//   const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

//   const stub = ClarifaiStub.grpc();

//   // This will be used by every Clarifai endpoint call
//   const metadata = new grpc.Metadata();
//   metadata.set("authorization", "Key " + PAT);

//   stub.PostModelOutputs(
//     {
//       user_app_id: {
//         user_id: USER_ID,
//         app_id: APP_ID,
//       },
//       model_id: MODEL_ID,
//       // version_id: MODEL_VERSION_ID, // This is optional. Defaults to the latest model version
//       inputs: [
//         { data: { image: { url: IMAGE_URL, allow_duplicate_url: true } } },
//       ],
//     },
//     metadata,
//     (err, response) => {
//       if (err) {
//         // throw new Error(err);
//         console.log(err);
//       }

//       if (response.status.code !== 10000) {
//         "Post model outputs failed, status: " + response.status.description;
//         console.log(err, "><", response.status.code);
//       }

//       // Since we have one input, one output will exist here
//       const output = response.outputs[0];

//       console.log("Predicted concepts:");
//       for (const concept of output.data.concepts) {
//         console.log(concept.name + " " + concept.value);
//         res.status(200).json(concept.value);
//       }
//     }
//   );
// };
// const handleImage = (req, res, db) => {
//   const { id } = req.body;
//   console.log(id, "############################");
//   db("users")
//     .where("id", "=", id)
//     .increment("entries", 1)
//     .returning("entries")
//     .then((entries) => {
//       console.log(entries);
//       res.json(entries[0]);
//     })
//     .catch((err) => res.status(400).json("unable to get entries"));
// };

// module.exports = {
//   handleImage,
//   handleApiCall,
// };
