"use strict";

angular.module("cdsApp").component("wizardApplicationAdd", {
    bindings: {
        application : "=",
        done: "&",
        buttontitle: "@",
        pipelines : "=",
        applications: "=",
        repomanager: "="
    },
    controllerAs: "wz",
    controller: function ($document, $scope, $state, $translate, Messaging, CDSTemplateBuild, Application, CDSRepoManagerRsc, CDSApplicationVarRsc) {
        var self = this;
        this.pipelineCreation = "template";
        this.typeRepo = [];
        this.selected = {};

        this.namePattern = new RegExp("^[a-zA-Z0-9._-]{1,}$");

        $scope.$watch(function () {
            return self.repomanager;
        }, function () {
            if (self.repomanager && self.repomanager.length > 0) {
                self.initTypeRepo();
                self.repomanager.forEach(function (r) {
                    self.typeRepo.push(r);
                });
            }
        }, true);

        this.goToParameters = function () {
            var someElement = angular.element(document.getElementById("WizardParameter"));
            $document.duScrollTo(someElement);
        };

        this.initTypeRepo = function () {
            self.typeRepo = [];
            self.typeRepo.push({
                id: 0,
                name: "Git URL",
                type: "GIT",
                url: ""
            });
            self.selected.repositories_manager = self.typeRepo[0];
        };

        this.setRepoValue = function (item, model) {
            self.application.repoGit = model.ssh_url;
            self.application.repository_fullname = model.fullname;
            self.getApplicationName();
        };

        this.loadApplicationVariables = function (appToClone) {
            CDSApplicationVarRsc.query({
                "key": $state.params.key,
                "appName": appToClone.name
            }, function (vars) {
                self.application.variables = vars;
                if (self.application.variables && self.application.variables.length > 0) {
                    self.application.variables.forEach(function (v) {
                        if (v.name === "repo") {
                            v.value = self.application.repoGit;
                        }
                    });
                    self.goToParameters();
                }
            }, function (err) {
                Messaging.error(err);
            });
        };

        /**
         * @ngdoc function
         * @name refreshListRepo
         * @description Refresh the list of available repository
         */
        this.refreshListRepo = function ($select) {
            if ($select.search && $select.search !== "") {
                self.listReposTemp = [];
                if (self.listRepos) {
                    self.listRepos.forEach(function (repo) {
                        if (repo.fullname.toLowerCase().indexOf($select.search.toLowerCase()) !== -1 || repo.url.toLowerCase().indexOf($select.search.toLowerCase()) !== -1) {
                            self.listReposTemp.push(repo);
                        }
                    });
                }
            }
        };

        /**
         * @ngdoc function
         * @name loadRepoFromRepoManager
         * @description Call API to load all repositories from repository manager
         */
        this.loadRepoFromRepoManager = function () {
            if (self.selected.repositories_manager.id === 0) {
                return;
            }
            self.application.repositories_manager = self.selected.repositories_manager;
            self.loadingRepos = true;
            CDSRepoManagerRsc.repos({ "key": $state.params.key, "repoManName" : self.application.repositories_manager.name }, function (data) {
                self.loadingRepos = false;
                self.listRepos = data;
                self.listReposTemp = [];
            }, function (err) {
                self.loadingRepos = false;
                Messaging.error(err);
            });
        };

        // List of build templates
        this.templates = [];

        /**
         * @ngdoc function
         * @name submit
         * @description Submit form
         */
        this.submit = function submit (form) {
            this.submitted = true;
            if (form.$valid) {
                if (self.pipelineCreation === "empty") {
                    self.application.type = "template";
                    self.application.buildTemplate = _.find(self.templates, { name: "Void" });
                    delete self.application.variables;
                } else {
                    self.application.type = self.pipelineCreation;
                }

                if (!self.application.variables) {
                    self.application.variables = [];
                    self.application.variables.push({ name: "repo", type: "string", value: self.application.repoGit });
                }

                switch (self.pipelineCreation) {
                    case "template":
                        if (self.application.buildTemplate.params && self.notFilled(self.application.buildTemplate.params)) {
                            return;
                        }
                        break;
                    case "clone":
                        if (self.application.variables && self.notFilled(self.application.variables)) {
                            return;
                        }
                        break;
                }
                self.done();
            }
        };

        /**
         * @ngdoc function
         * @name notFilled
         * @description Check if the user filled template params
         */
        this.notFilled = function (params) {
            if (!params) {
                return false;
            }
            for (var i = 0; i < params.length; i++) {
                if (params[i].value === undefined || params[i].value === null || params[i].value.toString() === "") {
                    return true;
                }
            }
            return false;
        };

        /**
         * @ngdoc function
         * @name getUrl
         * @description Get application name from git URL
         */
        this.getApplicationName = function () {
            if (this.application.repoGit) {
                var splittedUrl = this.application.repoGit.split("/");
                this.application.name = splittedUrl[splittedUrl.length - 1].split(".")[0];
            }
        };

        /**
         * @ngdoc function
         * @name getBuildTemplate
         * @description Call API to get all the build template
         */
        this.getBuildTemplate = function () {
            CDSTemplateBuild.query(function (data) {
                self.templates = data;
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.init = function () {
            self.initTypeRepo();
            self.getBuildTemplate();
        };
        this.init();
    },

    templateUrl: "components/wizardAdd/application/wizardApplicationAdd.html"
});
