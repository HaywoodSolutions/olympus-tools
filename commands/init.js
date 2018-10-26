"use strict";

var clc = require("cli-color");
var fs = require("fs");
var homeDir = require("user-home");
var path = require("path");

var Command = require("../lib/command");
var Config = require("../lib/config");
var fsutils = require("../lib/fsutils");
var init = require("../lib/init");
var logger = require("../lib/logger");
var prompt = require("../lib/prompt");
var requireAuth = require("../lib/requireAuth");
var utils = require("../lib/utils");

var TEMPLATE_ROOT = path.resolve(__dirname, "../templates/");
var BANNER_TEXT = fs.readFileSync(path.join(TEMPLATE_ROOT, "banner.txt"), "utf8");
var GITIGNORE_TEMPLATE = fs.readFileSync(path.join(TEMPLATE_ROOT, "_gitignore"), "utf8");

var _isOutside = function(from, to) {
  return path.relative(from, to).match(/^\.\./);
};

module.exports = new Command("init [feature]")
  .description("setup a Firebase project in the current directory")
  .before(requireAuth)
  .action(function(feature, options) {
    var cwd = options.cwd || process.cwd();

    var warnings = [];
    var warningText = "";
    if (_isOutside(homeDir, cwd)) {
      warnings.push("You are currently outside your home directory");
    }
    if (cwd === homeDir) {
      warnings.push("You are initializing your home directory as a Firebase project");
    }

    var config = Config.load(options, true);
    var existingConfig = !!config;
    if (!existingConfig) {
      config = new Config({}, { projectDir: cwd, cwd: cwd });
    } else {
      warnings.push("You are initializing in an existing Firebase project directory");
    }

    if (warnings.length) {
      warningText =
        "\nBefore we get started, keep in mind:\n\n  " +
        clc.yellow.bold("* ") +
        warnings.join("\n  " + clc.yellow.bold("* ")) +
        "\n";
    }

    if (process.platform === "darwin") {
      BANNER_TEXT = BANNER_TEXT.replace(/#/g, "🔥");
    }
    logger.info(
      clc.yellow.bold(BANNER_TEXT) +
        "\nYou're about to initialize a Firebase project in this directory:\n\n  " +
        clc.bold(config.projectDir) +
        "\n" +
        warningText
    );

    var setup = {
      config: config._src,
      rcfile: config.readProjectFile(".firebaserc", {
        json: true,
        fallback: {},
      }),
    };

    var choices = [
      {
        name: "accessmodulebucket",
        label: "Module Bucket: Store infomation for module (not user specific)",
        checked: false,
      },
      {
        name: "accessmoduleusersbucket",
        label: "Module User Bucket: Store infomation about user specific to the module",
        checked: false,
      },
      {
        name: "accessusersbucket",
        label: "User Bucket: Store infomation about user public to all modules",
        checked: false,
      },
    ];

    var next;
    // HACK: Windows Node has issues with selectables as the first prompt, so we
    // add an extra confirmation prompt that fixes the problem
    if (process.platform === "win32") {
      next = prompt.once({
        type: "confirm",
        message: "Are you ready to proceed?",
      });
    } else {
      next = Promise.resolve(true);
    }

    return next
      .then(function(proceed) {
        if (!proceed) {
          return utils.reject("Aborted by user.", { exit: 1 });
        }

        if (feature) {
          setup.featureArg = true;
          setup.features = [feature];
          return undefined;
        }

        return prompt(setup, [
          {
            type: "checkbox",
            name: "features",
            message:
              "Which Olympus Module features do you want to setup for this module? " +
              "Press Space to select features, then Enter to confirm your choices.",
            choices: prompt.convertLabeledListChoices(choices),
          },
        ]);
      })
      .then(function() {
        if (!setup.featureArg) {
          setup.features = setup.features.map(function(feat) {
            return prompt.listLabelToValue(feat, choices);
          });
        }
        setup.features.unshift("project");
        return init(setup, config, options);
      })
      .then(function() {
        console.log();
        console.log("Writing configuration info to " + clc.bold("firebase.json") + "...");
        config.writeProjectFile("olympus.json", setup.config);
        console.log("Writing project information to " + clc.bold(".firebaserc") + "...");
        config.writeProjectFile(".firebaserc", setup.rcfile);
        if (!fsutils.fileExistsSync(config.path(".gitignore"))) {
          console.log("Writing gitignore file to " + clc.bold(".gitignore") + "...");
          config.writeProjectFile(".gitignore", GITIGNORE_TEMPLATE);
        }
        console.log();
        console.log("Firebase initialization complete!");

        if (setup.createProject) {
          console.log();
          console.log(
            clc.bold.cyan("Project creation is only available from the Firebase Console")
          );
          console.log(
            "Please visit",
            clc.underline("https://console.firebase.google.com"),
            "to create a new project, then run",
            clc.bold("firebase use --add")
          );
        }
      });
  });