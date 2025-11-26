const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    
    supportFile: "automated test cases/cypress/support/e2e.js",
    specPattern: "automated test cases/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    fixturesFolder: "automated test cases/cypress/fixtures",
    
    setupNodeEvents(on, config) {
      
    },
  },
});
