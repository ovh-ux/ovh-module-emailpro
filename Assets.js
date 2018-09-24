"use strict";
module.exports = {
    src: {
        js: [
            "src/emailpro/**/*.app.js",
            "src/emailpro/**/*.module.js",
            "src/emailpro/**/*.js"
        ],
        css: [
            "src/css/emailpro/*.css"
        ],
        html: [
            "src/emailpro/**/*.html"
        ],
        images: [
            "src/images/emailpro/**/*"
        ]
    },
    // Common is only used in STANDALONE!
    common: {
        js: [
            "node_modules/ipaddr.js/lib/ipaddr.js",
            "bower_components/lodash/dist/lodash.min.js",
            "bower_components/moment/min/moment-with-langs.min.js",
            "bower_components/ovh-utils-angular/lib/jquery.min.js",
            "bower_components/ovh-utils-angular/lib/jquery.cookie.js",
            "bower_components/ovh-utils-angular/lib/bootstrap/bootstrap.min.js",
            "src/js/app/libs/bootstrap3-modal.min.js",
            "bower_components/ovh-utils-angular/lib/angular.min.js",
            "bower_components/ovh-utils-angular/lib/angular/latest/angular-cookies.min.js",
            "bower_components/ovh-utils-angular/lib/ui-bootstrap-tpls.min.js",
            "bower_components/ovh-utils-angular/lib/raphael.min.js",
            "bower_components/ovh-utils-angular/lib/justgage.js",
            "bower_components/ovh-utils-angular/bin/ovh-utils-angular.min.js",
            "bower_components/ovh-utils-angular/core.js",
            "bower_components/uri.js/src/URI.min.js"
        ],
        css: [
            "src/css/bootstrap/bootstrap.min.css",
            "src/css/bootstrap/bootstrap-responsive.min.css",
            "src/css/bootstrap/bootstrap3-modal.min.css",
            "bower_components/ovh-utils-angular/directives/tooltipBox/*.css",
            "bower_components/ovh-utils-angular/directives/dateTimePicker/bootstrap-datetimepicker.min.css"
        ]
    },
    resources: {
        i18n: [
            "src/**/translations/**/*.xml"
        ]
    }
};
