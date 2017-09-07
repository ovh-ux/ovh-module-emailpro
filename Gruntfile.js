/* eslint-disable prefer-template */
module.exports = function (grunt) {
    "use strict";

    function isProd () {
        return grunt.option("mode") === "prod" || grunt.option("type") !== undefined;
    }

    var assets = require("./Assets");
    var mode = grunt.option("mode") || "dev";
    var basepath = grunt.option("base-path") || (isProd() ? "" : "../");
    var target = grunt.option("target") || "EU";

    grunt.loadTasks("tasks");

    require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        // Config
        pkg: grunt.file.readJSON("package.json"),
        bower: grunt.file.readJSON("bower.json"),
        bowerdir: "bower_components",
        builddir: "tmp",
        publicdir: "src",

        // SWS
        swspath: "api/",
        swsProxyPath: "api/proxypass/",

        // Clean
        clean: {
            files: [
                "<%= builddir %>",
                "<%= publicdir %>/js/ovh-utils-angular/",
                "<%= publicdir %>/index.html",
                "<%= publicdir %>/login.html",
                "<%= publicdir %>/doubleAuthentication.html"
            ]
        },

        copy: {
            dev: {
                files: [{
                    expand: true,
                    cwd: "<%= builddir %>",
                    src: "*.html",
                    dest: "<%= publicdir %>/"
                }, {
                    expand: true,
                    cwd: "<%= bowerdir %>/ovh-utils-angular/lib/angular/latest/i18n/",
                    src: "*",
                    dest: "<%= publicdir %>/js/ovh-utils-angular/lib/angular/latest/i18n/"
                }, {
                    expand: true,
                    cwd: "<%= bowerdir %>/ovh-utils-angular/directives/",
                    src: ["**/*.html", "**/*.css"],
                    dest: "<%= publicdir %>/js/ovh-utils-angular/directives/"
                }]
            }
        },

        // Constants
        ngconstant: {
            options: { deps: null },
            devApp: {
                options: {
                    name: "App",
                    deps: ["Standalone", "Module.emailpro"],
                    dest: "<%= builddir %>/js/constants-app.js"
                }
            },
            devUa: {
                options: {
                    name: "ovh-utils-angular",
                    dest: "<%= builddir %>/js/constants-utils-angular.js"
                },
                constants: {
                    "utils-angular.conf.STARGATE_URL": "<%= swspath %>common/univers",
                    target
                }
            },
            devModCommon: {
                options: {
                    name: "Module.Common",
                    dest: "<%= builddir %>/js/constants-module-common.js"
                },
                constants: {
                    "Module.Common.constants": {
                        swsRootPath: "<%= swspath %>"
                    }
                }
            },
            devLogin: {
                options: {
                    name: "Login",
                    dest: "<%= builddir %>/js/constants-login.js"
                },
                constants: {
                    "Login.conf.BASE_URL": basepath + "<%= bowerdir %>/univers-login-front/dist/",
                    "Login.constants": {
                        swsRootPath: "<%= swspath %>auth/",
                        target
                    }
                }
            },
            devModEmailPro: {
                options: {
                    name: "Module.emailpro",
                    dest: "<%= builddir %>/js/constants-emailPro.js"
                },
                constants: {
                    "Module.emailpro.constants": {
                        swsRootPath: "<%= swspath %>",
                        swsProxyRootPath: "<%= swsProxyPath %>"
                    }
                }
            }
        },

        xml2json: {
            files: assets.resources.i18n
        },

        // Auto Build
        watch: {
            js: {
                files: assets.src.js,
                tasks: "buildDev"
            },
            css: {
                files: assets.src.css,
                tasks: "buildDev"
            },
            resources: {
                files: assets.resources.i18n,
                tasks: "buildDev"
            }
        },

        eslint: {
            options: {
                configFile: "./.eslintrc.json",
                quiet: true
            },
            target: ["src/**/!(*.spec|*.integration).js", "Gruntfile.js"]
        },

        // To release
        bump: {
            options: {
                pushTo: "origin",
                files: [
                    "package.json",
                    "bower.json"
                ],
                updateConfigs: ["pkg", "bower"],
                commitFiles: ["-a"]
            }
        }
    });

    grunt.registerTask("default", ["build"]);

    grunt.registerTask("test", ["eslint"]);

    grunt.registerTask("buildProd", [
        "clean",
        "eslint"
    ]);

    grunt.registerTask("buildDev", [
        "clean",
        "ngconstant:devApp",
        "ngconstant:devUa",
        "ngconstant:devModCommon",
        "ngconstant:devLogin",
        "ngconstant:devModEmailPro",
        "xml2json",
        "copy:dev"
    ]);

    /*
     * --mode=prod
     * --mode=dev
     */
    grunt.registerTask("build", "Prod build", () => {
        grunt.log.subhead("You build in " + mode + " mode");
        switch (mode) {
        case "dev":
            grunt.task.run("buildDev");
            break;
        case "prod":
            grunt.task.run("buildProd");
            break;
        default:
            grunt.verbose.or.write("You try to build in a weird mode [" + mode + "]").error();
            grunt.fail.warn("Please try with --mode=dev|prod");
        }
    });

    /*
     * --type=patch
     * --type=minor
     * --type=major
     */
    grunt.registerTask("release", "Release", () => {
        var type = grunt.option("type");
        if (isProd()) {
            mode = "prod";
            grunt.task.run(["bump-only:" + type]);
        } else {
            grunt.verbose.or.write("You try to release in a weird version [" + type + "]").error();
            grunt.fail.warn("Please try with --type=patch|minor|major");
        }
    });
};
/* eslint-enable prefer-template */
