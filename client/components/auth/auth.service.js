"use strict";

angular.module("cdsApp")
    .factory("Auth", function AuthService ($location, $http, $localStorage, $q, $base64, UserReset, UserVerify, COOKIE_KEY, SESSION_KEY) {
        var safeCb = function safeCb (cb) {
            return (angular.isFunction(cb)) ? cb : angular.noop;
        };

        var currentUser = {};

        if ($localStorage[COOKIE_KEY] && $location.path() !== "/logout") {
            currentUser = $localStorage[COOKIE_KEY];
        }

        var baseHref = function () {
            var bases = document.getElementsByTagName("base");
            var baseHref = null;

            if (bases.length > 0) {
                baseHref = bases[0].href;
            }
            return baseHref;
        };

        var Auth = {

            /**
             * Authenticate user and save token
             *
             * @param  {Object}   user     - login info
             * @param  {Function} callback - optional, function (error, user)
             * @return {Promise}
             */
            login: function (user, callback) {
                return $http.post("/cdsapi/login", {
                    username: user.username,
                    password: user.password
                })
                    .then(function (res) {
                        var token = res.headers(SESSION_KEY);
                        if (token) {
                            Auth.setCurrentSession(res.data.user, token);
                        }  else {
                            Auth.setCurrentUser(res.data.user, user.password);
                        }
                        return currentUser.$promise;
                    })
                    .then(function (user) {
                        safeCb(callback)(null, user);
                        return user;
                    })
                    .catch(function (err) {
                        Auth.logout();
                        safeCb(callback)(err.data);
                        return $q.reject(err);
                    });
            },

            /**
             * Delete access token and user info
             */
            logout: function () {
                $localStorage[COOKIE_KEY] = null;
                $localStorage[SESSION_KEY] = null;
                currentUser = {};
            },

            /**
             * Create a new user
             *
             * @param  {Object}   user     - user info
             * @param  {Function} callback - optional, function (error, user)
             * @return {Promise}
             */
            createUser: function (user) {
                return $http.post("/cdsapi/user/signup", user)
                    .catch(function (err) {
                        Auth.logout();
                        return $q.reject(err);
                    });
            },

            /**
             * Reset the user password
             *
             * @param  {Object}   user     - user info
             * @return {Promise}
             */
            resetPassword: function (request) {
                return UserReset.resetPassword({ "name": request.user.username }, request).$promise;
            },

            /**
             * Gets all available info on a user
             *   (synchronous|asynchronous)
             *
             * @param  {Function|*} callback - optional, funciton(user)
             * @return {Object|Promise}
             */
            getCurrentUser: function (callback) {
                if (arguments.length === 0) {
                    return currentUser;
                }

                var value = (currentUser.hasOwnProperty("$promise")) ?
                    currentUser.$promise : currentUser;
                return $q.when(value)
                    .then(function (user) {
                        safeCb(callback)(user);
                        return user;
                    }, function () {
                        safeCb(callback)({});
                        return {};
                    });
            },

            /**
             * Set info on a user
             *   (synchronous|asynchronous)
             *
             * @param  user data
             * @return {Object|Promise}
             */
            setCurrentUser: function (user, password) {
                user.token = "Basic " + $base64.encode(user.username + ":" + password);
                $localStorage[COOKIE_KEY] = user;
                currentUser = user;
            },

            /**
             * Set info on a session
             *   (synchronous|asynchronous)
             *
             * @param  session_token
             * @return {Object|Promise}
             */
            setCurrentSession: function (user, token) {
                user.token = "Session " + token;
                $localStorage[SESSION_KEY] = token;
                $localStorage[COOKIE_KEY] = user;
                currentUser = user;
            },

            /**
             * Check if a user is logged in
             *   (synchronous|asynchronous)
             *
             * @param  {Function|*} callback - optional, function (is)
             * @return {Bool|Promise}
             */
            isLoggedIn: function (callback) {
                if (arguments.length === 0) {
                    return currentUser.hasOwnProperty("token");
                }

                return Auth.getCurrentUser(null)
                    .then(function (user) {
                        var is = user.hasOwnProperty("token");
                        safeCb(callback)(is);
                        return is;
                    });
            },

            /**
             * Check if a user is an admin
             *   (synchronous|asynchronous)
             *
             * @return {Bool|Promise}
             */
            isAdmin: function () {
                return Auth.getCurrentUser(null)
                    .then(function (user) {
                        return user.admin;
                    });
            },

            /**
             * Get auth token
             *
             * @return {String} - a token string used for authenticating
             */
            getToken: function () {
                return Auth.getCurrentUser(null)
                    .then(function (user) {
                        return user.token;
                    });
            },

            /**
             * Build verify url
             * @returns {string}
             */
            getVerifyUrl: function () {
                return baseHref() + "#/verify/%s/%s";
            },

            /**
             * Call api to verify received token
             *
             */
            verify: function (username, token) {
                return UserVerify.get({ "name": username, "token" : token }, { "username" : username, "token" : token }).$promise;
            }
        };

        return Auth;
    });
