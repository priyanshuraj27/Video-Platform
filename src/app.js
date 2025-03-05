import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();
// console.log("app.js");
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

 app.use(express.json({limit : "16kb"}));
 app.use(urlencoded({extended : true}));
 app.use(express.static('public'));
 app.use(cookieParser());
 
// Routes import 

import userRouter from './routes/user.routes.js';

// routes declaration

app.use("/api/v1/users",userRouter);

export {app};
