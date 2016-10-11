angular.module("cdsApp").directive("pipelineDiagram", function ($compile) {
    "use strict";
    return {
        retrict: "EA",
        template: "",
        scope: {
            item: "=",
            orientation: "@",
            branch: "@"
        },
        replace: false,
        link: function (scope, element) {
            if (scope.orientation === "vertical") {
                element.append(
                    "<td ng-repeat=\"p in item\" valign=\"top\" align=\"center\">" +
                        "<table>" +
                            "<tr>" +
                                "<td valign=\"top\" align=\"center\" colspan=\"{{p.subPipelines.length}}\">" +
                                    "<pipeline-diagram-item item=\"p\" orientation=\"{{orientation}}\" branch=\"{{branch}}\"></pipeline-diagram-item>" +
                                "</td>" +
                             "</tr>" +
                            "<tr ng-if=\"p.subPipelines !== null && p.subPipelines !== undefined && p.subPipelines.length > 0\" pipeline-diagram item=\"p.subPipelines\" orientation=\"{{orientation}}\" branch=\"{{branch}}\"></tr>" +
                        "</table>" +
                    "</td>"
                );
            } else if (scope.orientation === "horizontal") {
                element.append(
                    "<table class=\"horizontalView\">" +
                        "<tr ng-repeat=\"p in item\" valign=\"top\" align=\"center\">" +
                            "<td valign=\"top\" align=\"center\" style=\"width:500px;\">" +
                                "<pipeline-diagram-item item=\"p\" orientation=\"{{orientation}}\" branch=\"{{branch}}\"></pipeline-diagram-item>" +
                            "</td>" +
                            "<td pipeline-diagram item=\"p.subPipelines\" orientation=\"{{orientation}}\" branch=\"{{branch}}\">" +
                            "</td>" +
                        "</tr>" +
                    "</table>"
                );
            }
            $compile(element.contents())(scope);
        },
        controller: function () {
        }
    };
});
