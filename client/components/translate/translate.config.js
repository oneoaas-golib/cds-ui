"use strict";

angular.module("cdsApp")
.config(function ($translateProvider, TranslateServiceProvider, tmhDynamicLocaleProvider, LANGUAGES) {
    var lang;

    // Config current locale
    TranslateServiceProvider.setUserLocale();

    // Get current locale
    lang = TranslateServiceProvider.getUserLocale();

    // Configure $translate
    $translateProvider.preferredLanguage(lang);
    $translateProvider.fallbackLanguage(LANGUAGES.fallback);

    // Define translation loader
    $translateProvider.useLoader("$translatePartialLoader", {
        urlTemplate : "{part}/translations/Messages_{lang}.json"
    });
    $translateProvider.useLoaderCache(true);
    $translateProvider.useSanitizeValueStrategy("escapeParameters");

    // Set angular locale
    tmhDynamicLocaleProvider.localeLocationPattern("bower_components/angular-i18n/angular-locale_{{locale}}.js");
    tmhDynamicLocaleProvider.defaultLocale(_.kebabCase(lang));
})

/**
 * Translate Interceptor: If 404 on i18n file, return an empty object
 */
.factory("translateInterceptor", function ($q) {
    var regexp = new RegExp(/Messages\w+\.json$/i);
    return {
        "responseError": function (rejection) {
            if (regexp.test(rejection.config.url)) {
                return {};
            }
            return $q.reject(rejection);
        }
    };
})
.config(function ($httpProvider) {
    $httpProvider.interceptors.push("translateInterceptor");
})

.provider("TranslateDecoratorService", function () {

    /**
     * (ui-router) Automatically load translations on state change
     *
     * @example:
     * $stateProvider
     *    .state("foo-bar", {
     *        url          : "/foo/bar",
     *        templateUrl  : "app/foo/bar/bar.html",
     *        controller   : "FooBarCtrl",
     *        controllerAs : "FooBarCtrl"
     *        translations : [
     *            "app/common",
     *            "app/foo",
     *            "app/foo/bar"
     *        ]
     *    });
     */
    this.add = function ($stateProvider) {

        $stateProvider.decorator("translations", function (state) {
            var routeOption = state.self;

            if (routeOption.translations) {

                var translationsTab = ["./assets"];

                state.resolve.translations = ["$translate", "$translatePartialLoader", function ($translate, $translatePartialLoader) {
                    // load translation parts
                    angular.forEach(translationsTab, function (part) {
                        $translatePartialLoader.addPart(part);
                    });

                    return $translate.refresh();
                }];

                return translationsTab;

            }
            return;
        });
    };

    this.$get = function () {
        return {};
    };
});
