import "reflect-metadata";
import * as express from "express";
import * as cors from "cors";
import { createConnection } from "typeorm";
import { Shops } from "./entity/Shops";
import { validate } from "class-validator";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { ShopCustomers } from "./entity/ShopCustomers";
import { DataEntry } from "./entity/DataEntry";

//Declare express server
const app = express();

//Enable JSON input in express
app.use(express.json());

//Enable Cors
app.use(cors());

createConnection()
  .then(async connection => {
    // Start - Shops signup
    app.post("/api/signup", async (req, res) => {
      let signupRepo = await connection.getRepository(Shops);
      let signupDetails = new Shops();
      let existingShop = await signupRepo.findOne({ mobile: req.body.mobile });
      if (existingShop !== undefined) {
        res.status(404).send("Shop already registered with this mobile number");
      } else {
        if (req.body.pin == req.body.cpin) {
          signupDetails.mobile = req.body.mobile;
          signupDetails.pin = await bcrypt.hash(req.body.pin, 10);
          signupDetails.shopName = req.body.shopName;
          signupDetails.emailId = req.body.email;
          signupDetails.address = req.body.address;
          signupDetails.district = req.body.district;
          signupDetails.state = req.body.state;
          signupDetails.pincode = req.body.pincode;
          signupDetails.regDate = new Date();
          validate(signupDetails).then(async errors => {
            if (errors.length > 0) {
              console.log("Validation failed", errors);
              res.status(404).send(errors);
            } else {
              console.log("validation successfull");
              await signupRepo.save(signupDetails);
              res.send(
                "user signed up successfully, your account will get activated in 2 hours"
              );
            }
          });
        } else {
          res.status(404).send("pin and confirm are not same");
        }
      }
    });
    //Stop - Shops signup

    //Start - Activate Shop
    app.post("/api/activateshop/:mobile", async (req, res) => {
      let activateShopRepo = await connection.getRepository(Shops);
      let nun = Number(req.params.mobile);
      let adminCheck = await activateShopRepo.findOne({
        mobile: Number(req.params.mobile)
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
    });
    //End - Activate Shop

    //Start - Perform Login
    app.post("/api/login", async (req, res) => {
      let loginShopRepo = await connection.getRepository(Shops);
      let loginShop = await loginShopRepo.findOne({
        mobile: Number(req.body.mobile)
      });
      if (loginShop !== undefined) {
        let bcryptCompare = await bcrypt.compare(req.body.pin, loginShop.pin);
        if (bcryptCompare == true) {
          let jwtToken = await jwt.sign(
            `${loginShop.mobile}`,
            `Shop Secure ${loginShop.mobile}`
          );
          res.json({ jwtToken, message: "User logged in successfully" });
        } else {
          res.status(404).send("Mobile Number and secure pin are invalid ");
        }
      } else {
        res.status(404).send("Mobile Number not exists");
      }
    });
    //End - Perform Login

    //Start - Add customers
    app.post("/api/add/customers/:mobile", verifyToken, async (req, res) => {
      jwt.verify(
        req.body.token,
        `Shop Secure ${req.params.mobile}`,
        async (err, data) => {
          if (err) {
            res.status(403).send("invalid request");
          } else {
            let shopRepo = await connection.getRepository(Shops);
            let shop = await shopRepo.findOne({
              mobile: Number(req.params.mobile)
            });
            if (shop !== undefined) {
              let customerRepo = await connection.getRepository(ShopCustomers);
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
                validate(newCustomer).then(async errors => {
                  if (errors.length > 0) {
                    console.log("Validation failed", errors);
                    res.status(404).send(errors);
                  } else {
                    console.log("validation successfull");
                    await customerRepo.save(newCustomer);
                    let dataEntryRepo = await connection.getRepository(
                      DataEntry
                    );
                    let dataEntry = new DataEntry();
                    dataEntry.message = "Initial Outstanding Balance";
                    dataEntry.outstanding = req.body.outstanding;
                    dataEntry.datas = newCustomer;
                    await dataEntryRepo.save(dataEntry);
                    res.send("User added Successfully");
                  }
                });
              }
            } else {
              res.status(403).send("Invalid Request");
            }
          }
        }
      );
    });
    //End - Add Customers

    //Start - View Customers
    app.get("/api/view/customers/:mobile", verifyToken, async (req, res) => {
      jwt.verify(
        req.body.token,
        `Shop Secure ${req.params.mobile}`,
        async (err, data) => {
          if (err) {
            res.status(403).send("invalid request");
          } else {
            let shopRepo = await connection.getRepository(Shops);
            let shop = await shopRepo.findOne({
              mobile: Number(req.params.mobile)
            });
            if (shop !== undefined) {
              let viewCustomersRepo = await connection.getRepository(
                ShopCustomers
              );
              let viewCustomers = await viewCustomersRepo.find({
                customers: shop
              });
              res.send(JSON.stringify(viewCustomers));
            } else {
              res.status(404).send("Bad Request");
            }
          }
        }
      );
    });
    //End - View Customers

    //Start - Edit Customers
    app.post("/api/edit/customers/:mobile", verifyToken, async (req, res) => {
      jwt.verify(
        req.body.token,
        `Shop Secure ${req.params.mobile}`,
        async (err, data) => {
          if (err) {
            res.status(403).send("invalid request");
          } else {
            let shopRepo = await connection.getRepository(Shops);
            let shop = await shopRepo.findOne({
              mobile: Number(req.params.mobile)
            });
            if (shop !== undefined) {
              let editCustomerRepo = await connection.getRepository(
                ShopCustomers
              );
              let editCustomer = await editCustomerRepo.findOne({
                cusNo: req.body.cusno,
                customers: shop
              });
              console.log(editCustomer);
              if (editCustomer !== undefined) {
                if (req.body.cusno !== undefined) {
                  let checkCusNoAvai = await editCustomerRepo.findOne({
                    cusNo: req.body.cusno,
                    customers: shop
                  });
                  if (checkCusNoAvai !== undefined) {
                    res
                      .status(404)
                      .send("Customer number already exists" + checkCusNoAvai);
                  } else {
                    // await editCustomerRepo.remove(editCustomer);
                    editCustomer.cusNo = req.body.cusno;
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
                res.status(404).send("bad Request");
              }
            } else {
              res.status(404).send("Bad Request");
            }
          }
        }
      );
    });
    //End - Edit Customers

    //Start - Delete Customers
    app.post("/api/delete/customers/:mobile", verifyToken, async (req, res) => {
      jwt.verify(
        req.body.token,
        `Shop Secure ${req.params.mobile}`,
        async (err, data) => {
          if (err) {
            res.status(403).send("invalid request");
          } else {
            let shopRepo = await connection.getRepository(Shops);
            let shop = await shopRepo.findOne({
              mobile: Number(req.params.mobile)
            });
            if (shop !== undefined) {
              let editCustomerRepo = await connection.getRepository(
                ShopCustomers
              );
              let editCustomer = await editCustomerRepo.findOne({
                customers: shop,
                cusNo: req.body.cusno
              });
              await editCustomerRepo.remove(editCustomer);
              res.send("User Removed successfully");
            } else {
              res.status(404).send("Bad Request");
            }
          }
        }
      );
    });
    //End - Delete Customers

    //Start- Data Entry
    app.post("/api/dataentry/:mobile", verifyToken, async (req, res) => {
      jwt.verify(
        req.body.token,
        `Shop Secure ${req.params.mobile}`,
        async (err, data) => {
          if (err) {
            res.status(403).send("invalid request");
          } else {
            let shopRepo = await connection.getRepository(Shops);
            let shop = await shopRepo.findOne({
              mobile: Number(req.params.mobile)
            });
            if (shop !== undefined) {
              console.log(shop);
              let customerRepo = await connection.getRepository(ShopCustomers);
              let customer = await customerRepo.findOne({
                cusNo: req.body.cusno,
                customers: shop
              });
              if (customer !== undefined) {
                console.log(customer);
                let dataEntryRepo = await connection.getRepository(DataEntry);
                let dataEntry = new DataEntry();
                if (
                  req.body.amount !== undefined &&
                  req.body.credebit !== undefined
                ) {
                  dataEntry.amount = Number(req.body.amount);
                  let date = new Date();
                  dataEntry.dateofentry = new Date();
                  dataEntry.dateofentry.setFullYear(date.getFullYear());
                  dataEntry.dateofentry.setMonth(date.getMonth());
                  dataEntry.dateofentry.setDate(date.getDate());
                  dataEntry.date = new Date(2019, 8, 17); //Date in which debit/credit is done "Reqrite logic"
                  if (req.body.message !== undefined) {
                    dataEntry.message = req.body.message;
                  }
                  if (req.body.credebit == true) {
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
                    console.log("hello");
                    console.log(dataEntry);
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
              res
                .status(404)
                .send("You are not allowed to perform this action");
            }
          }
        }
      );
    });
    //End- Data Entry

    //Start - Each Customer data entry history
    app.post("/api/customers/data/:mobile", verifyToken, async (req, res) => {
      jwt.verify(
        req.body.token,
        `Shop Secure ${req.params.mobile}`,
        async (err, data) => {
          if (err) {
            res.status(403).send("invalid request");
          } else {
            let shopRepo = await connection.getRepository(Shops);
            let shop = await shopRepo.findOne({
              mobile: Number(req.params.mobile)
            });
            if (shop !== undefined) {
              let customerRepo = await connection.getRepository(ShopCustomers);
              let customer = await customerRepo.findOne({
                cusNo: req.body.cusno,
                customers: shop
              });
              if (customer !== undefined) {
                console.log(customer);
                let dataEntryRepo = await connection.getRepository(DataEntry);
                let dataEntry = await dataEntryRepo.find({
                  datas: customer
                }); 
                let datas = JSON.stringify(dataEntry);
                if (datas !== undefined){
                  res.send(datas);
                } else {
                  res.status(404).send('Data Entry not exists for customer');
                }
              } else {
                res.status(404).send('Customer number not exists');
              }
            } else {
              res.status(404).send("Invalid Request");
            }
          }
        }
      );
    });
    //End - Each Customer data entry history

    //Start - Data Entry check

    //Start- JWT verifyToken
    function verifyToken(req, res, next) {
      const bearerHeader = req.headers["authorization"];
      if (typeof bearerHeader !== undefined) {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.body.token = bearerToken;
        next();
      } else {
        res.sendStatus(404);
      }
    }

    //End- JWT verifyToken

    //Declare port
    const port = process.env.PORT || 3000;

    //Enable express server
    app.listen(port, () => {
      console.log(`Server started at port ${port}`);
    });
  })
  .catch(error => console.log(error));
