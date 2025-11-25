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
 * - Manual Task 1 (Upload Fish Successfully) -> Converted to Step 1.
 * - Manual Task 2 (Validate Required Fields) -> Converted to Step 2.
 * - Manual Task 3 (Invalid Weight/Price) -> Converted to Step 3.
 *
 * Implementation Note:
 * { testIsolation: false } is recommended if you want to maintain login/session state
 * across multiple tests to simulate a real-user journey from Login -> Upload -> Market.
 */

describe('FISHERMEN - Upload Fish', () => {
  before(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[placeholder="Username or Email"]').type('captain_jack');
    cy.get('input[placeholder="Password"]').type('blackpearl');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/upload');
  });

  it('TC_UI_004 Step 1 - Upload Fish Successfully', () => {
    cy.get('input[placeholder="e.g., Phuket, Krabi"]').type('Phuket');

    // เลือก fish species โดยตรง
    cy.get('input[list="fishOptions"]').type('Anchovy{enter}');

    cy.get('input[placeholder="Weight in kilograms"]').type('2');
    cy.get('input[placeholder="Price per kg"]').type('20');

    // อัปโหลดไฟล์
    cy.get('input[type="file"]').attachFile('images/anchovy.jpg');

    cy.get('button[type="submit"]').click();

    cy.wait(1000);
    cy.contains('Upload Successful!').should('be.visible');
    
    cy.wait(6000);
    cy.url().should('include', '/market');
    cy.contains('Anchovy').should('exist');
  });

  it('TC_UI_004 Step 2 - Validate Required Fields', () => {
    cy.visit('http://localhost:3000/upload');

    cy.get('input[placeholder="e.g., Phuket, Krabi"]').clear();
    cy.get('input[list="fishOptions"]').type('Anchovy{enter}');

    cy.get('input[placeholder="Weight in kilograms"]').type('2');
    cy.get('input[placeholder="Price per kg"]').type('20');
    cy.get('input[type="file"]').attachFile('images/anchovy.jpg');

    cy.wait(1000);
    cy.on('window:alert', (text) => {
      expect(text).to.match(/Please enter|Please enter location/);
    });
     
    cy.get('button[type="submit"]').click();
    cy.wait(2000); 
  });

  it('TC_UI_004 Step 3 - Invalid Weight/Price', () => {
    cy.visit('http://localhost:3000/upload');
    
    cy.get('input[placeholder="e.g., Phuket, Krabi"]').type('Phuket');
    cy.get('input[list="fishOptions"]').type('Anchovy{enter}');
    cy.get('input[placeholder="Weight in kilograms"]').type('0');
    cy.get('input[placeholder="Price per kg"]').type('-5');

    cy.on('window:alert', (text) => {
      expect(text).to.match(/must be greater than 0/);
    });

    cy.get('button[type="submit"]').click();
    cy.wait(2000); 
  });
});
