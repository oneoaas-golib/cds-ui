// Protractor configuration
// https://github.com/angular/protractor/blob/master/docs/referenceConf.js

"use strict";

var appName = "r";//require("package.json").name;

var config = {
    // The timeout for each script run on the browser. This should be longer
    // than the maximum time your application needs to stabilize between tasks.
    allScriptsTimeout: 110000,

    // A base URL for your application under test. Calls to protractor.get()
    // with relative paths will be prepended with this.
    baseUrl: "http://localhost:" + (process.env.PORT || "9000"),

    // Credientials for Saucelabs
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,

    // When run without a command line parameter, all suites will run.
    // If run with --suite=smoke or --suite=smoke,full
    // only the patterns matched by the specified suites will run.
    suites: {
        smoke: "tests/**/*.smoke.spec.js",
        full: "tests/**/!(*.smoke).spec.js"
    },

    // ----- Capabilities to be passed to the webdriver instance ----
    //
    // For a full list of available capabilities, see
    // https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
    capabilities: {
        "browserName": "chrome",
        "name": appName
    },

    // ChromeDriver location is used to help find the chromedriver binary.
    // This will be passed to the Selenium jar as the system property
    // webdriver.chrome.driver. If null, Selenium will
    // attempt to find ChromeDriver using PATH.
    chromeDriver: "./node_modules/chromedriver/bin/chromedriver",

    // Path to the firefox application binary. If null, will attempt to find
    // firefox in the default locations.
    firefoxPath: null,

    // Boolean. If true, Protractor will connect directly to the browser Drivers
    // at the locations specified by chromeDriver and firefoxPath. Only Chrome
    // and Firefox are supported for direct connect.
    directConnect: true,

    // ----- The test framework -----
    //
    // Jasmine and Cucumber are fully supported as a test and assertion framework.
    // Mocha has limited beta support. You will need to include your own
    // assertion framework if working with mocha.
    framework: "jasmine2",

    // ----- Options to be passed to minijasminenode -----
    //
    // See the full list at https://github.com/jasmine/jasmine-npm
    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000,
        print: function() {}  // for jasmine-spec-reporter
    },


    // The params object will be passed directly to the Protractor instance,
    // and can be accessed from your test as browser.params. It is an arbitrary
    // object and can contain anything you may need in your test.
    // This can be changed via the command line as:
    //   --params.login.user "Joe"
    params: {
        login: process.env.LOGIN,
        password: process.env.PASSWORD
    },

    onPrepare: function() {
        var SpecReporter = require("jasmine-spec-reporter");
        // add jasmine spec reporter
        jasmine.getEnv().addReporter(new SpecReporter({ displayStacktrace: true }));

    }
};

config.params.baseUrl = config.baseUrl;
exports.config = config;
