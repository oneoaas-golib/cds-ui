"use strict";

import {Router} from "express";
import proxy from "request";
import config from "../../config/environment";

var router = new Router();

router.all("/*", function (req, res) {
    console.log("SDEV", req.method, config.sdev.url + req.url.replace(/^\/api/, ""));

    var p = proxy(config.sdev.url + req.url.replace(/^\/api/, ""));
    p.on("error", function (err) {
        res.status(500).json(err);
    });
    req.pipe(p).pipe(res);
});

export default router;
