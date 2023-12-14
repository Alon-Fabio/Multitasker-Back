import { Response, Request } from "express";
import Knex from "knex";

const handleProfileGet = (req: Request, res: Response, db: Knex) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      if (user.length) {
        res.status(200).json(user[0]);
      } else {
        res.status(400).json("Not found");
      }
    })
    .catch((err) => {
      res.status(400).json("error getting user");
    });
};

const handleProfilePost = (req: Request, res: Response, db: Knex) => {
  const { id } = req.params;
  const { name, age, pet } = req.body.formInput;

  db("users")
    .where({ id })
    .update({ name, pet, age })
    .then((resp) => {
      if (resp) {
        res.status(200).json("success");
      } else {
        res.status(400).json("request failed");
      }
    })
    .catch((err) => {
      res.status(400).json("request failed");
    });
};

module.exports = {
  handleProfileGet,
  handleProfilePost,
};
