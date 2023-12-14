"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const knex_1 = __importDefault(require("knex"));
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const register = require("./authN/register");
const signin = require("./authN/signin");
const auth = require("./authZ/auth");
const profile = require("./controllers/profile");
const image = require("./controllers/image");
const gallery = require("./controllers/gallery");
const admin = require("./controllers/admin");
const health = require("./test/health");
const { POSTGRES_URI } = require("../secret");
const db = (0, knex_1.default)({
    client: "postgres",
    connection: process.env.POSTGRES_URI || POSTGRES_URI,
});
const whitelist = [
    "https://www.alonfabio.com",
    "https://www.alonfabio.com/Per/Photoraphy",
    "https://www.alonfabio.com/Per/Gallery",
    "https://multitasker.alonfabio.com",
    "http://multitasker.alonfabio.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8080",
    "http://localhost/*",
];
const CustomOrigin = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin ? origin : "") !== -1 || !origin) {
            callback(null, true);
        }
        else {
            callback(Error("no-access-allowed"), origin);
        }
    },
    methods: ["POST", "GET", "PUT"],
    allowedHeaders: ["Content-Type", "Authentication"],
};
const buildLocation = path.join(__dirname.slice(0, -5), "build");
const app = (0, express_1.default)();
app.use(morgan("combined"));
app.use(cors());
app.use(bodyParser.json());
app.use(express_1.default.static(buildLocation));
app.use(express_1.default.static("static"));
app.get("/", (req, res) => {
    res.sendFile(path.join(buildLocation, "index.html"));
});
app.post("/signin", signin.signinAuthentication(db));
app.post("/register", (req, res) => {
    register.handleRegister(req, res, db);
});
app.get("/profile/:id", cors(CustomOrigin), auth.getAuthentication, (req, res) => {
    profile.handleProfileGet(req, res, db);
});
app.post("/profile/:id", cors(CustomOrigin), auth.getAuthentication, (req, res) => {
    profile.handleProfilePost(req, res, db);
});
app.put("/image", cors(CustomOrigin), auth.getAuthentication, (req, res) => {
    image.handleImage(req, res, db);
});
app.post("/imageurl", cors(CustomOrigin), auth.getAuthentication, (req, res) => {
    image.handleApiCall(req, res);
});
app.get("/gallery/:folder", cors(CustomOrigin), (req, res) => {
    gallery.getImages(req, res, db);
});
app.post("/admin/getUsers", cors(CustomOrigin), auth.getAuthentication, (req, res) => {
    admin.getUsers(db, res, req);
});
app.post("/gallery/update", cors(CustomOrigin), (req, res) => {
    gallery.updateImages(req, res, db);
});
app.post("/health-check", (req, res) => {
    health.testHandler(res, req);
});
app.get("/health-check", cors(CustomOrigin), (req, res) => {
    res.sendStatus(200);
});
app.listen(5000, () => {
    console.log("app is running on port 5000");
});
