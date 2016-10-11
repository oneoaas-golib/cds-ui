"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:PipelineRunVariablesCtrl
 * @requires $uibModalInstance, build
 *
 * @description Manage show variables
 *
 */
angular.module("cdsApp").controller("PipelineRunVariablesCtrl", function ApplicationShowCtrl ($uibModalInstance, build) {

    var self = this;
    this.build = build;

    this.variables = {
        project: [],
        pipeline: [],
        env: [],
        app: [],
        build: [],
        parent: [],
        cds: [],
        git: []
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunVariablesCtrl
     * @name ok
     * @description Close modal
     *
     * Close modal
     */
    this.ok = function () {
        $uibModalInstance.close();
    };

    this.init = function () {
        this.build.args.forEach(function (v) {
            if (v.name.lastIndexOf("cds.proj.", 0) === 0) {
                self.variables.project.push(v);
            } else if (v.name.lastIndexOf("cds.app.", 0) === 0) {
                self.variables.app.push(v);
            } else if (v.name.lastIndexOf("cds.pip.", 0) === 0) {
                self.variables.pipeline.push(v);
            } else if (v.name.lastIndexOf("cds.env.", 0) === 0) {
                self.variables.env.push(v);
            } else if (v.name.lastIndexOf("cds.parent.", 0) === 0) {
                self.variables.parent.push(v);
            } else if (v.name.lastIndexOf("cds.", 0) === 0) {
                self.variables.cds.push(v);
            } else if (v.name.lastIndexOf("git.", 0) === 0) {
                self.variables.git.push(v);
            } else if (v.name) {
                self.variables.build.push(v);
            }
        });
    };

    this.init();

});
