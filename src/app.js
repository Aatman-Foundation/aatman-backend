import express from "express";
import cors from "cors"
import dotenv from "dotenv"; 
import cookieParser from "cookie-parser"
import healthcheckRouter from "./routes/healthcheck.route.js"
import errorHandler from "./middlewares/errorHandler.js"
import userRouter from "./routes/user.route.js"

dotenv.config();

const app = express();

app.use(
    cors ({
        origin : process.env.CORS_ORIGIN,
        credentials : true
    })
)



app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true}));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/user", userRouter)
console.log(process.env.CORS_ORIGIN)
app.use(errorHandler)


export {app}