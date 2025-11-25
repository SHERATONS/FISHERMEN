import 'cypress-file-upload';

/**
 * Automated UI Test Suites - Fish Market System (Fishermen Module)
 * Feature: Upload Fish
 * Framework: Cypress
 * Rationale & Strategy:
 * This script converts the defined Manual System Test Cases for uploading fish
 * into executable Automated UI Test Suites. The tests validate the core "Fisherman Upload Journey"
 * continuously to ensure that the system enforces proper data validation and successful uploads.
 *
 * Mapping Manual Tasks to Automated Suites:
 * - Manual Task 4 (Upload Fish Successfully) -> Converted to TC_UI_004 1&2
 * - Manual Task 5 (Validate Required Fields) -> Converted to TC_UI_005
 * - Manual Task 6 (Invalid Weight/Price) -> Converted to TC_UI_006
 *
 * Implementation Note:
 * { testIsolation: false } is recommended if you want to maintain login/session state
 * across multiple tests to simulate a real-user journey from Login -> Upload -> Market.
 */


describe('FISHERMEN - Upload Fish', () => {
  beforeEach(() => {
    // Login ก่อนทุก test
    cy.visit('http://localhost:3000/login');
    cy.get('input[placeholder="Username or Email"]').type('captain_jack');
    cy.wait(1000);
    cy.get('input[placeholder="Password"]').type('blackpearl');
    cy.wait(1000);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/upload');
  });

  // -----------------------------
  // TC_UI_004 - Upload Fish Successfully
  // -----------------------------
  it('TC_UI_004 - Upload Fish Successfully', () => {
    cy.get('input[placeholder="e.g., Phuket, Krabi"]').type('Phuket');
    cy.get('input[list="fishOptions"]').type('Anchovy{enter}');
    cy.get('input[placeholder="Weight in kilograms"]').type('2');
    cy.get('input[placeholder="Price per kg"]').type('20');
    cy.get('input[type="date"]').clear().type('2025-11-25');
    cy.get('input[type="file"]').attachFile('images/anchovy.jpg');
    cy.get('button[type="submit"]').click();

    cy.contains('Upload Successful!').should('be.visible');
    cy.wait(3000); // ให้ popup แสดง
    cy.url().should('include', '/market');
    cy.contains('Anchovy').should('exist');
  });

  // -----------------------------
  // TC_UI_005 - Validate Required Fields
  // -----------------------------
  it('TC_UI_005 - Validate Required Fields', () => {
    // Stub alert
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertStub');
    });

    // Step 1: Empty location
    cy.get('input[placeholder="e.g., Phuket, Krabi"]').clear({ force: true });
    cy.get('input[list="fishOptions"]').type('Anchovy{enter}');
    cy.get('input[placeholder="Weight in kilograms"]').type('2');
    cy.get('input[placeholder="Price per kg"]').type('20');
    cy.get('input[type="date"]').clear().type('2025-11-25');
    cy.get('input[type="file"]').attachFile('images/anchovy.jpg');
    cy.get('button[type="submit"]').click();
    cy.get('@alertStub').should('be.calledWith', 'Please enter location');

    // Step 2: Empty species
    cy.get('input[placeholder="e.g., Phuket, Krabi"]').type('Phuket');
    cy.get('input[list="fishOptions"]').clear({ force: true }).type('{backspace}');
    cy.get('button[type="submit"]').click();
    cy.get('@alertStub').should('be.calledWith', 'Please select at least one species');

  });

  // -----------------------------
  // TC_UI_006 - Invalid Weight/Price
  // -----------------------------
  it('TC_UI_006 - Invalid Weight/Price', () => {
    // Step 1: Negative weight
    cy.get('input[placeholder="e.g., Phuket, Krabi"]').type('Phuket');
    cy.get('input[list="fishOptions"]').type('Anchovy{enter}');
    cy.get('input[placeholder="Weight in kilograms"]').type('-1');
    cy.get('input[placeholder="Price per kg"]').type('20');
    cy.get('input[type="date"]').clear().type('2025-11-24');
    cy.get('input[type="file"]').attachFile('images/anchovy.jpg');

    cy.on('window:alert', (text) => {
      expect(text).to.match(/Weight must be greater than 0/);
    });
    cy.get('button[type="submit"]').click();
    cy.wait(1000);

    // Step 2: Negative price
    cy.get('input[placeholder="Weight in kilograms"]').clear().type('2');
    cy.get('input[placeholder="Price per kg"]').clear().type('-5');

    cy.on('window:alert', (text) => {
      expect(text).to.match(/Price must be greater than 0/);
    });
    cy.get('button[type="submit"]').click();
    cy.wait(1000);
  });
});

