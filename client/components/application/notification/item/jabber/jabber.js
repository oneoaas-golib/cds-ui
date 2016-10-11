"use strict";

angular.module("cdsApp").component("notificationItemJabber", {
    bindings: {
        content: "=",
        suggest: "=",
        edit: "@"
    },
    controllerAs: "ctrl",
    controller: function ($scope, $sce) {
        var self = this;

        this.users = [];

        $scope.$watch(function () {
            return self.content;
        }, function () {
            if (self.content && self.content.recipients) {
                self.content.recipients.forEach(function (r) {
                    if (!_.find(self.users, { username: r })) {
                        self.users.push({
                            username: r
                        });
                    }
                });
            }
        }, true);

        this.getBodyHeight = function () {
            return self.content.template.body.split("\n").length;
        };

        /**
         * @ngdoc function
         * @name refreshResults
         * @description Refresh select2 result to add current user input as a new choice ( to create a new group )
         */
        this.refreshResults = function ($select) {
            var search = $select.search;
            var FLAG = -1;

            var itemExist = _.find(self.content.recipients, function (i) {
                return i === search;
            });
            if (!itemExist) {
                // remove last user input
                if (self.users[0] && self.users[0].flag) {
                    self.users.splice(0, 1);
                }

                self.users.unshift({
                    flag: FLAG,
                    username: search
                });
            }
        };

        function suggest_state (term) {
            if (term.indexOf("{{.") !== -1 && self.suggest && self.edit === "true") {
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
                rhs = term.substring(lastIndex + 1),
                suggestions = suggest_state(rhs);

            if (suggestions) {
                suggestions.forEach(function (s) {
                    s.value = lhs + s.value;
                });

                return suggestions;
            }
        }

        this.autocomplete_options = {
            suggest: suggest_state_delimited
        };
    },
    templateUrl: "components/application/notification/item/jabber/jabber.html"
});
