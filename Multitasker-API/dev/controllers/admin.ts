import { Response, Request } from "express";
import Knex from "knex";

// Functions:
import { userAuthN } from "../authN/signin";

// --------------------------------------------------------------- Types ---------------------------------------------------------------
type TGetUsers = (db: Knex, res: Response, req: Request) => void;

type TIsAdmin = (db: Knex, req: Request) => Promise<boolean>;
// ------------------------------------------------------------- Types end -------------------------------------------------------------

// Log admin token to redis and use it before all actions.

// Checks if user is Admin.
const isAdmin: TIsAdmin = (db, req) => {
  return userAuthN(db, req)
    .then((user) => user.user_type === "admin")
    .catch((err) => {
      console.log("Fadminbio Error!", err);
      return false;
    });
};

// Sends tables 'users' and 'login' to client.
const getUsers: TGetUsers = async (db, res, req) => {
  console.log(
    "Admin Action: sending user info <================================================"
  );

  if (await isAdmin(db, req)) {
    db.select("*")
      .from("users")
      .returning("*")
      .then((users) => {
        db.select("*")
          .from("login")
          .returning("*")
          .then((logins) => {
            res.status(200).json({ users: [...users], logins: [...logins] });
          });
      })
      .catch((err) => {
        console.log("admin: ", err);
        res.status(501).json(err);
      });
  } else {
    res.status(500).json("nop");
  }
};

module.exports = {
  getUsers: getUsers,
};
