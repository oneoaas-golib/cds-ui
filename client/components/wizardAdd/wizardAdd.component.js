"use strict";

angular.module("cdsApp").component("wizardAdd", {
    bindings: {
        project : "=",
        done : "&"
    },
    controllerAs: "ctrl",
    controller: function (WizardHandler) {
        var self = this;

        this.currentPage = "project";
        this.emptyProject = "false";

        this.tab = {};

        this.reinitTab = function () {
            this.tab.project.active = false;
            this.tab.application.active = false;
            this.tab.deployment.active = false;
            this.tab.permission.active = false;
        };

        this.activeTab = function (page) {
            self.reinitTab();
            this.currentPage = page;
            this.tab[this.currentPage].active = true;
            this.tab[this.currentPage].disable = false;
            this.tab.active = this.tab[this.currentPage].index;
        };

        this.nextTab = function (emptyProject) {
            switch (self.currentPage) {
                case "project":
                    self.emptyProject = emptyProject.toString();
                    if (!emptyProject) {
                        WizardHandler.wizard().next();
                        self.currentPage = "application";
                    } else {
                        WizardHandler.wizard().getEnabledSteps()[0].completed = true;
                        WizardHandler.wizard().goTo(3);
                        self.currentPage = "permission";
                    }
                    break;
                case "application":
                    WizardHandler.wizard().next();
                    self.currentPage = "deployment";
                    break;
                case "deployment":
                    WizardHandler.wizard().next();
                    self.currentPage = "permission";
                    break;
                case "permission":
                    WizardHandler.wizard().next();
                    break;
            }
        };

        this.init = function () {
            this.tab = {
                project : {
                    index : 0,
                    active: true,
                    disable : false
                },
                application : {
                    index : 1,
                    active: false,
                    disable : true
                },
                deployment : {
                    index : 2,
                    active: false,
                    disable : true
                },
                permission : {
                    index : 3,
                    active: false,
                    disable : true
                },
                active : 0
            };
        };
        this.init();
    },
    templateUrl: "components/wizardAdd/wizardAdd.html"
});
