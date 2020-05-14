'use strict';

const { Router } = require('express');
const authenticationRouter = Router();
const passport = require("passport");

authenticationRouter.get('/sign-up', (req, res, next) => {
    res.render("sign-up");
});

authenticationRouter.post(
    '/sign-up', passport.authenticate("sign-up", {
        sucessRedirect: "/",
        failureRedirect: "/authentication/sign-up"
    })
);

authenticationRouter.get("/sign-in", (req, res, next) => {
    res.render("sign-in");
});

module.exports = authenticationRouter;

