"use strict";

angular.module("cdsApp")
    .factory("Permission", function PermissionService (PERMISSION_CONSTANTS) {

        var Permission = {

            /**
             * CanRead
             *
             * @param  {Object}   permission     - user permission
             * @return boolean
             */
            canRead: function (permission) {
                return permission >= PERMISSION_CONSTANTS.R;
            },

            /**
             * CanExecute
             *
             * @param  {Object}   permission     - user permission
             * @return boolean
             */
            canExecute: function (permission) {
                return permission >= PERMISSION_CONSTANTS.RX;
            },

            /**
             * CanExecute
             *
             * @param  {Object}   permission     - user permission
             * @return boolean
             */
            canWrite: function (permission) {
                return permission === PERMISSION_CONSTANTS.RWX;
            }
        };

        return Permission;
    });
