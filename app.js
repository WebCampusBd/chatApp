// external imports
require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const moment = require("moment");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// internal imports
const dbConnect = require("./config/database");
const loginRouter = require("./router/loginRouter");
const inboxRouter = require("./router/inboxRouter");
const usersRouter = require("./router/usersRouter");
const {
  notFoundHandler,
  errorHandler,
} = require("./middlewares/common/errorHandler");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT;

// socket creation
const io = require("socket.io")(server);
global.io = io;

// set comment as app locals
app.locals.moment = moment;

// cors setup
app.use(cors());

// request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// set view engine & static folder
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static(path.join(__dirname, "public")));

// routing setup
app.use("/", loginRouter);
app.use("/users", usersRouter);
app.use("/inbox", inboxRouter);

// 404 not found handler
app.use(notFoundHandler);

// common error handler
app.use(errorHandler);

server.listen(port, async () => {
  console.log(`Server is running at : http://localhost:${port}`);
  await dbConnect();
});
