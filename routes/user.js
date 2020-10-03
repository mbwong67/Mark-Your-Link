const router = require("express").Router();
const User = require("../models/user");
const authenticate = require("../middleware/authenticate");
var _ = require("lodash");

router.post("/register", (req, res) => {
  var body = _.pick(req.body, ["email", "password", "name", "person_id", "type"]);
  var user = new User(body);

  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res
        .header("x-auth", token)
        .status(200)
        .send(user);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.delete("/me/token", authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400).send();
    }
  );
});

router.get("/me", authenticate, (req, res) => {
  res.send(req.user);
});

router.post("/login", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);

  User.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.send({ user, "x-auth": token }); //.header("x-auth", token).send(user);
      });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.post("/feedback", (req, res) => {

  console.log(req.body);
  User.update(
    { _id: req.body.sender_id },
    { $push: { sendFeedback: { ...req.body } } }
  )

  // TODO: 1. maintain count of feedback or thankyou
  // 2. store the feedback against sender as well as for receiver
  // 3. send the mail 


  // var body = _.pick(req.body, ["email", "password"]);

  // User.findByCredentials(body.email, body.password)
  //   .then(user => {
  //     return user.generateAuthToken().then(token => {
  //       res.send({ user, "x-auth": token }); //.header("x-auth", token).send(user);
  //     });
  //   })
  //   .catch(e => {
  //     res.status(400).send(e);
  //   });
});

module.exports = router;
