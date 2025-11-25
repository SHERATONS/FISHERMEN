const path = require("path");
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    supportFile: path.join("automated test cases", "cypress", "support", "e2e.js"),
    specPattern: path.join("automated test cases", "cypress", "e2e", "**/*.cy.{js,jsx,ts,tsx}"),
    fixturesFolder: "automated test cases/cypress/fixtures",
    setupNodeEvents(on, config) {
      // event listeners
    },
  },
});

