// import { Request } from "express-serve-static-core";
import { Request, Response } from "express";
import { getManager } from "typeorm";
import { Shops } from "../entity/Shops";
import { ShopCustomers } from "../entity/ShopCustomers";
import { DataEntry } from "../entity/DataEntry";
import { verifyToken } from "../tokenauth";

//Start- Data Entry
export async function customerDataEntry(req: Request, res: Response) {
  try {
    let mobile = await verifyToken(req.headers["authorization"]);
    let shopRepo = await getManager().getRepository(Shops);
    let shop = await shopRepo.findOne({
      mobile: Number(mobile)
    });
    if (shop !== undefined) {
      let customerRepo = await getManager().getRepository(ShopCustomers);
      let customer = await customerRepo.findOne({
        cusNo: req.body.cusno,
        customers: shop
      });
      if (customer !== undefined) {
        console.log(customer);
        let dataEntryRepo = await getManager().getRepository(DataEntry);
        let dataEntry = new DataEntry();
        if (req.body.amount !== undefined && req.body.credibit !== undefined) {
          dataEntry.amount = Number(req.body.amount);
          let date = new Date();
          dataEntry.dateofentry = new Date();
          dataEntry.dateofentry.setFullYear(date.getFullYear());
          dataEntry.dateofentry.setMonth(date.getMonth());
          dataEntry.dateofentry.setDate(date.getDate());
          dataEntry.date = new Date(2019, 8, 17); //Date in which debit/credit is done "Rewrite logic"
          if (req.body.message !== undefined) {
            dataEntry.message = req.body.message;
          }
          let credibit = Boolean(req.body.credibit);
          console.log(typeof credibit);
          console.log(credibit);
          if (credibit== true) {
            dataEntry.credibit = "D";
            dataEntry.outstanding = customer.Outstanding;
            dataEntry.outstanding += dataEntry.amount;
            customer.Outstanding = dataEntry.outstanding;
            dataEntry.datas = customer;
            await dataEntryRepo.save(dataEntry);
            res.send("Data Updated Successfully ");
          } else {
            dataEntry.credibit = "C";
            dataEntry.outstanding = customer.Outstanding;
            dataEntry.outstanding -= dataEntry.amount;
            customer.Outstanding = dataEntry.outstanding;
            dataEntry.datas = customer;
            await dataEntryRepo.save(dataEntry);
            res.send("Data Updated Successfully ");
          }
        } else {
          res.status(404).send("Please enter all mandatory fields");
        }
      } else {
        res.status(404).send("Customer Number not exists");
      }
    } else {
      res.status(404).send("You are not allowed to perform this action");
    }
  } catch (err) {
    res.status(404).send(err);
  }
}
//End- Data Entry

//Start - Each Customer data entry history
export async function customerDataHistory(req: Request, res: Response) {
  try {
    let mobile = await verifyToken(req.headers["authorization"]);
    let shopRepo = await getManager().getRepository(Shops);
    let shop = await shopRepo.findOne({
      mobile: Number(mobile)
    });
    if (shop !== undefined) {
      let customerRepo = await getManager().getRepository(ShopCustomers);
      let customer = await customerRepo.findOne({
        cusNo: req.body.cusno,
        customers: shop
      });
      if (customer !== undefined) {
        console.log(customer);
        let dataEntryRepo = await getManager().getRepository(DataEntry);
        let dataEntry = await dataEntryRepo.find({
          datas: customer
        });
        let datas = JSON.stringify(dataEntry);
        if (datas !== undefined) {
          res.send(datas);
        } else {
          res.status(404).send("Data Entry not exists for customer");
        }
      } else {
        res.status(404).send("Customer number not exists");
      }
    } else {
      res.status(404).send("Invalid Request");
    }
  } catch (err) {
    res.status(404).send(err);
  }
}
//End - Each Customer data entry history
