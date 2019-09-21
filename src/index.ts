import "reflect-metadata";
import * as express from "express";
import * as cors from "cors";
import { createConnection } from "typeorm";
import { Shops } from "./entity/Shops";
import * as jwt from "jsonwebtoken";
import { ShopCustomers } from "./entity/ShopCustomers";
import { DataEntry } from "./entity/DataEntry";
import { verifyToken } from "./tokenauth";
import * as bodyParser from "body-parser";
import {AppRoutes} from "./routes/routes"
import { Request, Response } from "express-serve-static-core";

//Declare express server
const app = express();

//Enable JSON input in express
app.use(express.json());

//Enable Cors
app.use(cors());

createConnection()
  .then(async connection => {

    //Register all application routes

    AppRoutes.forEach(route=>{
      app[route.method](route.path, (req: Request, res:Response, next:Function)=>{
        route.action(req, res)
        .then(()=>next)
        .catch(err=>next(err));
      })
    })



    
    //Start - Data Entry check

    //Declare port
    const port = process.env.PORT || 3000;

    //Enable express server
    app.listen(port, () => {
      console.log(`Server started at port ${port}`);
    });
  })
  .catch(error => console.log(error));
