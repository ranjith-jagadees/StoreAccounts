import {
  newShopSignup,
  getallShop,
  activateShop,
  login
} from "../Controller/auth";
import { addCustomer, viewCustomer, editCustomer, deleteCustomer, editPopup } from "../Controller/customer";
import { customerDataEntry, customerDataHistory } from "../Controller/dataentry";

export const AppRoutes = [
  //Start - Authentication and Authorization{
  //New Shop Signup
  {
    path: "/api/signup",
    method: "post",
    action: newShopSignup
  },
  //Get all shop details
  {
    path: "/api/getall",
    method: "get",
    action: getallShop
  },
  //Activate the new signed up shops
  {
    path: "/api/activateshop",
    method: "post",
    action: activateShop
  },
  //Shop Login
  {
    path: "/api/login",
    method: "post",
    action: login
  },
  //End - Authentication and authorization}

  //Start - Customer Details{
  //Add new Customer for shop
  {
    path: "/api/add/customers",
    method: "post",
    action: addCustomer
  },
  //View all customers for a shop
  {
      path: "/api/view/customers",
      method:"get",
      action: viewCustomer
  },
  //Edit customer Popup
  {
    path:"/api/edit/popup/:cusno",
    method:"get",
    action: editPopup
  },
  //Edit Customers for a shop
  {
      path:"/api/edit/customers/:cusno",
      method:"get",
      action: editCustomer
  },
  //Delete customers for a shop
  {
      path:"/api/delete/customers/:cusno",
      method:"delete",
      action: deleteCustomer
  },
  //End - Customer details}

  //Start - Customer Data{
  //Data entry for a customer
  {
      path:"/api/dataentry",
      method:"post",
      action: customerDataEntry
  },
  //Data history for a customer
  {
      path:"/api/customers/data/:cusno",
      method:"get",
      action: customerDataHistory
  }
  //End - Customer Data}
];
