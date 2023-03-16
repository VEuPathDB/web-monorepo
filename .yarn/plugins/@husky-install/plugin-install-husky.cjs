// Creative Commons (c) 2022 Spore, Inc.
const { exec } = require("child_process");

const plugin = {
  default: {
    hooks: {
      afterAllInstalled: () => {
        exec("yarn husky install");
      },
    },
  },
};

module.exports = {
  name: `plugin-install-husky`,
  factory: () => plugin,
};
