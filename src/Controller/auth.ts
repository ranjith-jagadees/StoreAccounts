import { getManager } from "typeorm";
import { Shops } from "../entity/Shops";
import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import {generateToken} from "../tokenauth";

export async function getallShop(req: Request, res: Response) {
  let signupRepo = await getManager().getRepository(Shops);
  let existingShop = await signupRepo.find();
  res.send(existingShop);
}

// Start - Shops signup

export async function newShopSignup(req: Request, res: Response) {
  let signupRepo = await getManager().getRepository(Shops);
  let signupDetails = new Shops();
  let existingShop = await signupRepo.findOne({ mobile: Number(req.body.mobile) });
  if (existingShop !== undefined) {
    res.status(404).send("Shop already registered with this mobile number");
  } else {
    if (req.body.pin == req.body.cpin) {
      signupDetails.mobile = Number(req.body.mobile);
      signupDetails.pin = await bcrypt.hash(req.body.pin, 10);
      signupDetails.shopName = req.body.shopName;
      signupDetails.emailId = req.body.email;
      signupDetails.address = req.body.address;
      signupDetails.district = req.body.district;
      signupDetails.state = req.body.state;
      signupDetails.pincode = req.body.pincode;
      signupDetails.regDate = new Date();
      await signupRepo.save(signupDetails);
      res.send(
        "user signed up successfully, your account will get activated in 2 hours"
      );
    } else {
      res.status(404).send("pin and confirm are not same");
    }
  }
}

//Stop - Shops signup

//Start - Activate Shop

export async function activateShop(req: Request, res: Response) {
  let activateShopRepo = await getManager().getRepository(Shops);
  let adminCheck = await activateShopRepo.findOne({
    mobile: Number(req.body.mobile)
  });
  if (adminCheck.admin == true) {
    let activateShop = await activateShopRepo.findOne({
      mobile: Number(req.body.mobile)
    });
    if (activateShop !== undefined) {
      activateShop.isApproved = true;
      await activateShopRepo.save(activateShop);
      res.send("User Activated successfully");
    } else {
      res.status(404).send("User not exists in database");
    }
  } else {
    res.status(403).send("You are not allowed to perform this action");
  }
}
//End - Activate Shop

//Start - Perform Login
export async function login(req: Request, res: Response) {
  try {
    let loginShopRepo = await getManager().getRepository(Shops);
    let loginShop = await loginShopRepo.findOne({
      mobile: Number(req.body.mobile)
    });
    console.log(loginShop);
    if (loginShop !== undefined) {
      let bcryptCompare = await bcrypt.compare(req.body.pin, loginShop.pin);
      console.log(bcryptCompare);
      if (bcryptCompare == true) {
        let token = await generateToken(Number(req.body.mobile));
        res.json({ token, message: "User logged in successfully" });
      } else {
        res.status(404).send("Mobile Number and secure pin combination are not same");
      }
    } else {
      res.status(404).send("Mobile Number not exists in our database");
    }
  } catch (err) {
    res.status(404).send(err);
  }
}
//End - Perform Login
