#!/usr/bin/env node

//! CHECK LIB.DEVDEPENDENCIES
var crawler  = require('./lib/libcrawler');

var dl       = require('./lib/libdownloader');
var readline = require('readline');
var colog = require('colog');

var argument = /react/i;

/*
 * This is a helper function to prompt a user.
 * It recurses until the format matches, then passes
 * on the reply
 */
global.promptUser = function(format, callback) {
  var rl = readline.createInterface(process.stdin, process.stdout);
  rl.prompt();

  rl.on('line', function(line) {
    if (line == "exit") process.exit(0);
    if (line.match(format)) {
      rl.close();
      console.log("");
      callback(line);
    } else {
      rl.prompt();
    }
  });
}

/*
 * The main function
 */
crawler.find(argument, function(packages) {
  // No matches
  if (packages.length == 0) {
    console.log("No matches found");
  }

  // Multiple matches
  else if (packages.length > 1) {

    // Log options
    console.log("Found many packages! Which one do you want?");
    for (var i in packages) {
      console.log(i + " - " + packages[i].name);
    }

    // Get user's choice
    promptUser(/^[0-9]*$/, function(line) {
      var choice = parseInt(line);
      if (choice < packages.length) {
        var targetPackage = packages[choice];
        if (targetPackage.dependencies) {
          // Prompt user if he wants dependencies
          var deps = Object.keys(targetPackage.dependencies);
          colog.warning("This package has dependencies! ");
          colog.info(deps);
          console.log("Would you like to pull them down? (y/N)");
          promptUser(/^[a-z]$/i, function(line) {
            if (line.toLowerCase() == "y") {
              crawler.grabDependencies(targetPackage);
            }
          })
        }
        // dl.download(targetPackage);
      } else {
        console.log("Not an option!");
      }
    });
  }

  // Only the one match
  else {
    console.log(crawler.extract(packages[0]));
  }
});
