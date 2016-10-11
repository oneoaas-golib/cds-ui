"use strict";

angular.module("cdsApp").component("parameterValueField", {
    bindings: {
        param: "=",
        suggest: "=",
        type: "=",
        edit: "@",
        runlist: "@",
        pipelines: "=",
        isaction: "@"
    },
    controllerAs: "ctrl",
    controller: function ($scope, $sce) {

        var self = this;
        this.listValues = [];
        this.listLanguages = [
            "dockerfile",
            "javascript",
            "perl",
            "php",
            "powershell",
            "python",
            "ruby",
            "shell"
        ];

        this.editorOptions = {
            lineWrapping : true,
            lineNumbers: true
        };

        $scope.$watch(function () {
            return self.param;
        }, function (n, o) {
            if (n !== o && self.param.value) {
                if (self.param.type === "text") {
                    var firstLine = self.param.value.split("\n")[0];
                    if (firstLine.indexOf("#!") === 0) {
                        if (firstLine.indexOf("node") !== -1) {
                            self.editorOptions.mode = "javascript";
                        } else if (firstLine.indexOf("perl") !== -1) {
                            self.editorOptions.mode = "perl";
                        } else if (firstLine.indexOf("php") !== -1) {
                            self.editorOptions.mode = "php";
                        } else if (firstLine.indexOf("python") !== -1) {
                            self.editorOptions.mode = "python";
                        } else if (firstLine.indexOf("ruby") !== -1) {
                            self.editorOptions.mode = "ruby";
                        } else {
                            self.editorOptions.mode = "shell";
                        }
                    }
                }
            }
        }, true);

        this.getHeight = function (value) {
            var nbReturn = 0;
            if (value) {
                nbReturn = value.split("\n").length;
            }
            return nbReturn < 2 ? 2 : nbReturn;
        };

        $scope.$watch(function () {
            return self.param;
        }, function (newValue) {
            if (newValue && newValue.name) {
                if (self.listValues.length === 0 && newValue.type === "list" && self.runlist === "true") {
                    self.listValues = newValue.value.split(";");
                    self.param.value = self.listValues[0];
                }
                if (self.param.type === "boolean") {
                    self.param.value = self.param.value ? (self.param.value.toString() === "true") : false;
                }

                if (self.param.type === "number") {
                    self.param.value = self.param.value ? parseInt(self.param.value.toString(), 10) : 0;
                }
            }
            if (newValue && self.param.meta && !self.param.name) {
                self.param.name = self.param.meta.name;
                self.param.type = self.param.meta.type;
            }
        }, true);

        function suggest_state (term) {
            if (term.indexOf("{{.") !== -1 && self.suggest && (self.edit === "true" || self.runlist === "true")) {
                var q = term.toLowerCase().trim();
                var results = [];

                // Find first 10 states that start with `term`.
                for (var i = 0; i < self.suggest.length; i++) {
                    var s = self.suggest[i];
                    if (s.toLowerCase().indexOf(q) !== -1) {
                        results.push({
                            value: s,
                            obj: s,
                            label: $sce.trustAsHtml(
                                "<div class=\"row\">" +
                                "  <strong>" + s + "</strong>" +
                                " </div>"
                            )
                        });
                    }
                }
                return results;
            }
        }

        function suggest_state_delimited (term) {
            var indexSpace = term.lastIndexOf(" ");
            var indexReturn = term.lastIndexOf("\n");

            var lastIndex = indexSpace;
            if (indexReturn > indexSpace) {
                lastIndex = indexReturn;
            }
            var lhs = term.substring(0, lastIndex + 1),
                rhs = term.substring(lastIndex + 1);

            var suggestions = suggest_state(rhs);

            if (suggestions) {
                suggestions.forEach(function (s) {
                    s.value = lhs + s.value;
                });

                return suggestions;
            }
        }

        this.loadSuggest = function () {
            self.param.results = suggest_state_delimited(self.param.value);
        };

        this.apply_selection = function (index) {

            var newValue = self.param.results[index];

            var term = self.param.value;
            var indexSpace = term.lastIndexOf(" ");
            var indexReturn = term.lastIndexOf("\n");

            var lastIndex = indexSpace;
            if (indexReturn > indexSpace) {
                lastIndex = indexReturn;
            }
            var lhs = term.substring(0, lastIndex + 1);

            self.param.value = lhs + newValue.obj;
            self.param.results = [];
        };

        this.autocomplete_options = {
            suggest: suggest_state_delimited
        };
    },
    templateUrl: "components/parameter/value-field/parameterValueField.html"
});
