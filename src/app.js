import express from "express";
import cors from "cors"
import dotenv from "dotenv"; 
import cookieParser from "cookie-parser"
import healthcheckRouter from "./routes/healthcheck.route.js"
import errorHandler from "./middlewares/errorHandler.js"
import adminRouter from "./routes/admin.route.js"
import userRouter from "./routes/user.route.js"

dotenv.config();

const app = express();

// const allowedOrigins = process.env.CORS_ORIGIN.split(",");
const allowedOrigins = process.env.CORS_ORIGIN;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json())
app.use(express.urlencoded({extended : true}));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/admin", adminRouter )
app.use("/api/v1/user", userRouter)
console.log(process.env.CORS_ORIGIN)
app.use(errorHandler)


export {app}