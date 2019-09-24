import { getManager } from "typeorm";
import { Shops } from "../entity/Shops";
import { verifyToken } from "../tokenauth";
import { ShopCustomers } from "../entity/ShopCustomers";
import { DataEntry } from "../entity/DataEntry";
import { Request, Response } from "express-serve-static-core";

//Start - Add customers
export async function addCustomer(req: Request, res: Response) {
  try {
    let mobile = await verifyToken(req.headers["authorization"]);
    let shopRepo = await getManager().getRepository(Shops);
    let shop = await shopRepo.findOne({
      mobile: Number(mobile)
    });
    if (shop !== undefined) {
      let customerRepo = await getManager().getRepository(ShopCustomers);
      let cusNumCheck = await customerRepo.findOne({
        customers: shop,
        cusNo: req.body.cusno
      });
      if (cusNumCheck !== undefined) {
        res.status(404).send("Customer Number already exists");
      } else {
        let newCustomer = new ShopCustomers();
        newCustomer.cusNo = req.body.cusno;
        newCustomer.CusName = req.body.name;
        newCustomer.MobileNum = req.body.mobile;
        newCustomer.Outstanding = Number(req.body.outstanding);
        newCustomer.customers = shop;
        console.log("validation successfull");
        await customerRepo.save(newCustomer);
        let dataEntryRepo = await getManager().getRepository(DataEntry);
        let dataEntry = new DataEntry();
        dataEntry.message = "Initial Outstanding Balance";
        dataEntry.outstanding = Number(req.body.outstanding);
        dataEntry.datas = newCustomer;
        await dataEntryRepo.save(dataEntry);
        res.send("User added Successfully");
      }
    } else {
      res.status(403).send("Invalid Request");
    }
  } catch (err) {
    res.status(404).send(err);
  }
}
//End - Add Customers

//Start - View Customers
export async function viewCustomer(req: Request, res: Response) {
  try {
    let mobile = await verifyToken(req.headers["authorization"]);
    let shopRepo = await getManager().getRepository(Shops);
    let shop = await shopRepo.findOne({
      mobile: Number(mobile)
    });
    if (shop !== undefined) {
      let viewCustomersRepo = await getManager().getRepository(ShopCustomers);
      let viewCustomers = await viewCustomersRepo.find({
        customers: shop
      });
      res.send(JSON.stringify(viewCustomers));
    } else {
      res.status(404).send("Bad Request");
    }
  } catch (err) {
    res.status(404).send("Invalid Request");
  }
}
//End - View Customers

export async function editPopup(req:Request, res: Response){
  try{
    let mobile = await verifyToken(req.headers["authorization"]);
    let shopRepo = await getManager().getRepository(Shops);
    let shop = await shopRepo.findOne({
      mobile: Number(mobile)
    });
    if (shop !== undefined) {
      let editCustomerRepo = await getManager().getRepository(ShopCustomers);
      let editCustomer = await editCustomerRepo.findOne({
        cusNo: Number(req.params.cusno),
        customers: shop
      });
      if (editCustomer !== undefined) {
        res.send(JSON.stringify(editCustomer));
      } else {
        res.status(404).send('customer Number not exists');
      }
    } else {
        res.status(404).send('Invalid Request');
      }
  } catch(err){
    res.status(404).send(err);
  }
}

//Start - Edit Customers
export async function editCustomer(req: Request, res: Response) {
  try {
    let mobile = await verifyToken(req.headers["authorization"]);
    let shopRepo = await getManager().getRepository(Shops);
    let shop = await shopRepo.findOne({
      mobile: Number(mobile)
    });
    if (shop !== undefined) {
      let editCustomerRepo = await getManager().getRepository(ShopCustomers);
      let editCustomer = await editCustomerRepo.findOne({
        cusNo: Number(req.params.cusno),
        customers: shop
      });
      if (editCustomer !== undefined) {
        if (req.body.newcusno !== undefined) {
          let checkCusNoAvai = await editCustomerRepo.findOne({
            cusNo: req.body.newcusno,
            customers: shop
          });
          if (checkCusNoAvai !== undefined) {
            res
              .status(404)
              .send("Customer number already exists" + checkCusNoAvai);
          } else {
            editCustomer.cusNo = req.body.newcusno;
          }
        }
        if (req.body.name !== undefined) {
          editCustomer.CusName = req.body.name;
        }
        if (req.body.mobile !== undefined) {
          editCustomer.MobileNum = req.body.mobile;
        }
        editCustomer.customers = shop;
        await editCustomerRepo.save(editCustomer);
        res.send(JSON.stringify(editCustomer));
      } else {
        res.status(404).send("Invalid Request");
      }
    } else {
      res.status(404).send("Invalid Request");
    }
  } catch (err) {
    res.status(404).send(err);
  }
}
//End - Edit Customers

//Start - Delete Customers
export async function deleteCustomer(req: Request, res: Response) {
  try {
    let mobile = await verifyToken(req.headers["authorization"]);
    let shopRepo = await getManager().getRepository(Shops);
    let shop = await shopRepo.findOne({
      mobile: Number(mobile)
    });
    if (shop !== undefined) {
      let delCustomerRepo = await getManager().getRepository(ShopCustomers);
      let delCustomer = await delCustomerRepo.findOne({
        customers: shop,
        cusNo: Number(req.params.cusno)
      });
      if (delCustomer !== undefined) {
        let delCustDataRepo = await getManager().getRepository(DataEntry);
        let delCustomerData = await delCustDataRepo.find({
          datas: delCustomer
        });
        if (delCustomerData !== undefined) {
          await delCustDataRepo.remove(delCustomerData);
          await delCustomerRepo.remove(delCustomer);
          res.send("User Removed successfully");
        } else {
          await delCustomerRepo.remove(delCustomer);
          res.send("User Removed successfully");
        }
      } else {
        res.status(404).send("Invalid Request");
      }
    } else {
      res.status(404).send("Bad Request");
    }
  } catch (err) {
    res.status(404).send(err);
  }
}
//End - Delete Customers
