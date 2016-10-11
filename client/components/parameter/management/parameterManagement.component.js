"use strict";

angular.module("cdsApp").component("parameterManagement", {
    bindings: {
        params: "=",
        suggest: "=",

        showname: "@",
        showtype: "@",
        showvalue: "@",
        showdescription: "@",
        descriptiontooltip: "@",
        isaction: "@",
        variable: "@",

        warning: "=",

        pipelines: "=",

        run : "@",
        runlist: "@",

        ro: "@", //force readonly mode

        save: "&"
    },
    controllerAs: "ctrl",
    controller: function ($scope, $attrs, $translate, CDSParametersTypeRsc, CDSVariablesTypeRsc, Messaging, EditMode, WARNING_TYPE) {
        var self = this;
        this.types = [];
        this.newType = "string";
        this.edit = EditMode.get();

        $scope.$watch(function () {
            return self.variable;
        }, function () {
            if (self.variable && self.variables === "true") {
                self.getDataType();
            }
        }, true);

        this.getHeight = function (value) {
            var nbReturn = 0;
            if (value) {
                nbReturn = value.split("\n").length;
            }
            return nbReturn < 2 ? 3 : nbReturn + 2;
        };

        this.hasWarning = function () {
            var result = false;
            if (self.isaction === "true" && self.warning) {
                self.warning.forEach(function (w) {
                    switch (w.id) {
                        case WARNING_TYPE.ApplicationVariableDoesNotExist:
                        case WARNING_TYPE.EnvironmentVariableDoesNotExist:
                        case WARNING_TYPE.ProjectVariableDoesNotExist:
                        case WARNING_TYPE.CannotUseEnvironmentVariable:
                        case WARNING_TYPE.InvalidVariableFormat:
                            var varName = w.message_param.VarName;
                            if (varName) {
                                self.params.forEach(function (p) {
                                    if (p.value.indexOf("." + varName + "}}") !== -1) {
                                        result = true;
                                    }
                                });
                            }
                            break;
                    }
                });
            }
            return result;
        };

        this.getNameColumnClass = function () {
            var size = 2;
            if (self.showtype  === "false") {
                size += 1;
            }
            if (self.showdescription  === "false") {
                size += 1;
            }
            return "col-md-" + size;
        };

        this.getValueColumnClass = function () {
            var size = 6;
            if (self.showdescription  === "false") {
                size += 2;
            }
            return "col-md-" + size;
        };

        this.canEditValue = function () {
            return this.ro !== "true" && (this.edit || this.run === "true");
        };

        this.canSave = function () {
            return $attrs.save;
        };

        /**
         * @ngdoc function
         * @name add
         * @description Add a new parameter in the list
         */
        this.add = function () {
            if (!this.params) {
                this.params = [];
            }
            this.params.push({
                name : "_" + this.params.length,
                type : self.newType ? self.newType : "string",
                value : "",
                description : ""
            });
        };

        /**
         * @ngdoc function
         * @name delete
         * @description Delete a parameter
         */
        this.delete = function (p, index) {
            this.params.splice(index, 1);
        };

        /**
         * @ngdoc function
         * @name getDataType
         * @description Get from API all types of parameter
         */
        this.getDataType = function () {
            if (self.variable === "true") {
                CDSVariablesTypeRsc.query(function (data) {
                    self.types = data;
                }, function (err) {
                    Messaging.error(err);
                });
            } else {
                CDSParametersTypeRsc.query(function (data) {
                    self.types = data;
                }, function (err) {
                    Messaging.error(err);
                });
            }
        };

        this.init = function () {
            this.getDataType();
        };
        this.init();

        $scope.$on("editModeStateEvent", function (event, args) {
            self.edit = args;
        });
    },
    templateUrl: "components/parameter/management/parameterManagement.html"
});
