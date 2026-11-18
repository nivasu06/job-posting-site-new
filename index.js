import express from "express";
import fs from "fs";
import path from "path";
import ejsLayouts from "ejs-layouts";
import bodyParser from "body-parser";
import session from "express-session";
import { auth } from "./src/middleware/auth.js";
import UserController from "./src/controllers/users.controller.js";
import jobing from "./src/controllers/jobcontroller.js";
import APPLYposted from "./src/controllers/apply.controller.js";
import { uploadFile } from "./src/middleware/fileupload.js";
import { setLastposted } from "./src/middleware/lastposted.js";
import cookieParser from "cookie-parser";

fs.mkdirSync(path.resolve("public", "files"), { recursive: true });

const app = express();
const userController = new UserController();
const apply = new APPLYposted();
const jober = new jobing();

app.use(express.static("public"));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "nivasu",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.resolve("src", "views"));
// app.use(ejsLayouts);

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

// Public routes
app.get("/home", userController.homeRedirectController);
app.get("/register", userController.getRegister);
app.get("/login", userController.getLogin);
app.post("/register", userController.postRegister);
app.post("/login", userController.postLogin);

// Protected routes (require authentication)
app.get("/logout", userController.logout);
app.get("/jobpost", auth, jober.getAddProduct);
app.post("/jobpost", auth, jober.postAddProduct);
app.get("/jobcard", jober.getProducts);
app.get("/details-card", auth, jober.getrecuriterProducts);
app.get("/details/:id", setLastposted, jober.getProductView);
app.get("/details-card/:id", setLastposted, jober.getProductupdatedView);
app.get("/update/:id", jober.getUpdateProductView);
app.post("/update/:id", jober.postUpdateProduct);
app.post("/delete/:id", jober.deleteProduct);
app.get("/apply", apply.getWebsite);
app.post("/resume", uploadFile.single("resume"), apply.postADDaplies);
app.get("/resume", apply.getNumberapplies);
app.get("/resume/:id", apply.getviewResume);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`server is running on port ${PORT}`);
});
