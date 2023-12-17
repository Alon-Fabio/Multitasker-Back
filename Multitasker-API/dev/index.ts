"use strict";

// Libraries:
import { CorsOptions } from "cors";
import express from "express";
import Knex from "knex";
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// Controllers:
const register = require("./authN/register");
const signin = require("./authN/signin");
const auth = require("./authZ/auth");
const profile = require("./controllers/profile");
const image = require("./controllers/image");
const gallery = require("./controllers/gallery");
const admin = require("./controllers/admin");
const health = require("./test/health");

// ================================================ Postgresql config ================================================

const { POSTGRES_URI }: { POSTGRES_URI: string } = require("../secret");
const db = Knex({
  // connect to your own database here.
  client: "postgres",
  connection: process.env.POSTGRES_URI || POSTGRES_URI,
});

// ============================================== Postgresql config end ===============================================

// ================================================== Cors config =====================================================

const whitelist = ["http://localhost/*"];

const CustomOrigin: CorsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin ? origin : "") !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(Error("no-access-allowed"), origin); // Add error response.
    }
  },
  methods: ["POST", "GET", "PUT"],
  allowedHeaders: ["Content-Type", "Authentication"],
};

// ================================================ Cors config end ================================================

const buildLocation = path.join(__dirname.slice(0, -5), "build");

const app = express();

app.use(morgan("combined"));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(buildLocation));
app.use(express.static("static"));

app.get("/", (req, res) => {
  res.sendFile(path.join(buildLocation, "index.html"));
});

// Authentication:
app.post("/signin", signin.signinAuthentication(db));

app.post("/register", (req, res) => {
  register.handleRegister(req, res, db);
});

// User info:
app.get(
  "/profile/:id",
  cors(CustomOrigin),
  auth.getAuthentication,
  (req, res) => {
    profile.handleProfileGet(req, res, db);
  }
);

app.post(
  "/profile/:id",
  cors(CustomOrigin),
  auth.getAuthentication,
  (req, res) => {
    profile.handleProfilePost(req, res, db);
  }
);

// Product:
app.put("/image", cors(CustomOrigin), auth.getAuthentication, (req, res) => {
  image.handleImage(req, res, db);
});
app.post(
  "/imageurl",
  cors(CustomOrigin),
  auth.getAuthentication,
  (req, res) => {
    image.handleApiCall(req, res);
  }
);

// Admin:
app.post(
  "/admin/getUsers",
  cors(CustomOrigin),
  auth.getAuthentication,
  (req, res) => {
    admin.getUsers(db, res, req);
  }
);

// Server checks:
app.post("/health-check", (req, res) => {
  health.testHandler(res, req);
});

app.get("/health-check", cors(CustomOrigin), (req, res) => {
  res.sendStatus(200);
});

// Listen on :port:
app.listen(5000, () => {
  console.log("app is running on port 5000");
});
