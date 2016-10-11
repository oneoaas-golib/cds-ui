"use strict";

describe("Controller: HomeCtrl", function () {

    var HomeCtrl, $controller, $rootScope, $scope, $httpBackend, $state;

    // load the controller"s module
    beforeEach(module("cdsApp"));
    beforeEach(module("stateMock"));

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$rootScope_, _$controller_, _$httpBackend_, _$state_) {
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $state = _$state_;

        HomeCtrl = $controller("HomeCtrl", {
            $scope: $scope
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    });

    it("should ...", function () {
        expect(1).toEqual(1);
    });

});
