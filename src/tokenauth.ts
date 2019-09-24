import * as jwt from "jsonwebtoken";
import * as fs from "fs";

//Start - Generate Token

export async function generateToken(mobile: number) {
  return new Promise((resolve: any, reject: any) => {
    let privateKey = fs.readFileSync("./private.key", "utf8");

    console.log(privateKey);

    let signOptions = {
      expiresIn: "12h",
      algorithm: "RS256"
    };

    let payload = { mobile: `${mobile}` };

    console.log(payload);

    jwt.sign(payload, privateKey, signOptions, (err, token) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log("token" + token);
        resolve(token);
      }
    });
  });
}
// End - Generate Token

export function verifyToken(bearerHeader) {
  return new Promise((resolve: any, reject: any) => {
    let publicKey = fs.readFileSync("./public.key", "utf8");
    if (typeof bearerHeader !== undefined) {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      let token = bearerToken;

      jwt.verify(token, publicKey, (err, decoded) => {
        if (err) {
          reject("Invalid Request, Please sign in again to continue");
        } else {
          resolve(decoded.mobile);
        }
      });
    } else {
      reject("Invalid Request");
    }
  });
}
