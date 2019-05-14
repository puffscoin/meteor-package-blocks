Package.describe({
  name: "puffscoin:blocks",
  summary: "Provides informations about the current and last 50 puffscoin blocks",
  version: "1.1.0",
  git: "http://github.com/puffscoin/meteor-package-blocks"
});

Package.onUse(function(api) {
  api.versionsFrom("1.0");
  api.use("underscore", ["client", "server"]);
  api.use("mongo", ["client", "server"]);

  // api.use('frozeman:persistent-minimongo@0.1.3', 'client');
  api.use("puffscoin:web3@1.0.0-beta.33", ["client", "server"]);

  api.export(["PuffsBlocks"], ["client", "server"]);

  api.addFiles("blocks.js", ["client", "server"]);
});

// Package.onTest(function(api) {
//   api.use('tinytest');
//   api.use('ethereum:blocks');
//   api.addFiles('blocks-tests.js');
// });
