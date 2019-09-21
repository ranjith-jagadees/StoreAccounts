import * as jwt from "jsonwebtoken";
import * as fs from "fs";

//Start - Generate Token

export function generateToken(mobile: string) {
  return new Promise((resolve: any, reject: any) => {
    let privateKey = fs.readFileSync("./private.key", "utf8");

    let signOptions = {
      expiresIn: "12h",
      algorithm: "RS256"
    };

    let payload = { mobile: `${mobile}` };

    jwt.sign(payload, privateKey, signOptions, (err, token) => {
      if (err) {
        reject(err);
      } else {
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
        if (err){
          reject('Invalid Request, Please sign in again to continue')
        } else {
          resolve(decoded.mobile);
        };
      });
    } else {
      reject("Invalid Request");
    }
  });
}
