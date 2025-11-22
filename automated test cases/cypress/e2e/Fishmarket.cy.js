/**
 * Automated UI Test Suites - Fish Market System
 * Framework: Cypress
 * Rationale & Strategy:
 * This script converts the defined Manual System Test Suites into executable Automated UI Test Suites.
 * The tests are structured to validate the core "Buyer Journey" continuously.
 *
 * Mapping Manual Tasks to Automated Suites:
 * - Manual Task 1 (Search & Filter) -> Converted to Suites 1 & 2.
 * - Manual Task 2 (Cart Management) -> Converted to Suite 3.
 * - Manual Task 3 (Checkout Flow)   -> Converted to Suite 4.
 *
 * Implementation Note:
 * { testIsolation: false } is used to maintain the browser state (session, cart data) across suites,
 * simulating a real-user flow from Login -> Search -> Cart -> Checkout.
 */

describe('Fish Market - Automated UI Test Suites', { testIsolation: false }, () => {

  // Pre-condition: User must be logged in before executing suites.
  before(() => {
    cy.intercept('GET', 'http://localhost:8080/api/fishListings/list').as('getFish')
    cy.visit('http://localhost:3000/login')
    
    cy.log('Action: Logging in as Buyer...')
    cy.get('input[placeholder="Username or Email"]').type('alice_b', { delay: 100 })
    cy.get('input[placeholder="Password"]').type('password123', { delay: 100 })
    cy.get('button[type="submit"]').click()
    
    cy.url({ timeout: 10000 }).should('include', '/market')
    cy.wait('@getFish')
    cy.wait(2000) 
  })

  // 1: Based on Manual Task 1 (Search) 
  it('1. Verify Search Functionality', () => {
    // Rationale: Validates that the search input correctly filters the product list (REQ-01).
    // Corresponds to Manual Test Case: TC_UI_001 (Part A)
    
    cy.log('Rationale: Ensure users can find specific products quickly.')
    cy.get('input[placeholder="Search for fish (e.g., Salmon, Tuna)"]')
      .type('Salmon', { delay: 400 }) 
    cy.wait(3000)
    cy.get('.fish-list').should('contain', 'Salmon')
    cy.get('input[placeholder="Search for fish (e.g., Salmon, Tuna)"]').clear()
    cy.wait(1000) 
  })

  // 2: Based on Manual Task 1 (Filter) & Task 2 (Add) 
  it('2. Verify Advanced Filters and Add-to-Cart', () => {
    // Rationale: Validates specific filtering criteria (Species, Price) and the ability to add items (REQ-02).
    // Corresponds to Manual Test Case: TC_UI_001 (Part B) & TC_UI_002 (Step 1)
    
    cy.log('Rationale: Ensure filtering by criteria works and users can add items.')
    
    // 1. Filter by Species
    cy.contains('label', 'Species:').next('select').select('Salmon')
    cy.wait(1000)

    // 2. Filter by Status
    cy.contains('label', 'Status (Freshness):').next('select').select('SENT FRESH')
    cy.wait(1000)

    // 3. Filter by Price
    cy.get('input[placeholder="Max"]').type('1000', { delay: 300 })
    
    cy.wait(3000)
    cy.get('.fish-card').should('contain', 'Salmon')

    // Add filtered item to cart
    cy.log('Action: Adding filtered fish to cart...')
    cy.contains('.fish-card', 'Salmon').first().within(() => {
         cy.contains('button', 'Add to Cart').click()
    })
    
    cy.wait(1000)
  })

  // 3: Based on Manual Task 2 (Cart Management) 
  it('3. Verify Cart Management (Verify & Remove)', () => {
    // Rationale: Validates that the cart updates accurately and allows item removal (REQ-03).
    // Corresponds to Manual Test Case: TC_UI_002
    
    cy.log('Rationale: Ensure cart reflects added items and allows removal.')
    cy.log('Scrolling to view cart')
    cy.scrollTo('top', { duration: 2000, easing: 'linear' })
    cy.wait(5000)
    // Assert that item exists (Quantity x 1 as per manual test)
    cy.get('.cart-panel').should('contain', 'x 1')

    // Remove item
    cy.log('Action: Removing item from cart...')
    cy.get('.cart-panel li button').click() 
    
    cy.wait(3000)
    // Assert empty state
    cy.get('.cart-panel').should('contain', 'Your cart is empty')
  })

  // 4: Based on Manual Task 3 (Checkout Flow)
  it('4. Verify Full Checkout Process', () => {
    // Rationale: Validates the final purchase flow, total calculation, and page navigation (REQ-04, REQ-05).
    // Corresponds to Manual Test Case: TC_UI_003

    cy.log('Rationale: Ensure the buyer can complete the purchase.')

    // Re-add item for checkout (Since it was removed in Suite 3)
    cy.contains('.fish-card', 'Salmon').first().within(() => {
        cy.contains('button', 'Add to Cart').click()
    })
    cy.scrollTo('top', { duration: 2000, easing: 'linear' }) 
    cy.wait(3000) 
    cy.get('.cart-total').should('contain', 'Total:')

    // Proceed to Checkout
    cy.get('.checkout-btn').click()
    cy.wait(3000)
    cy.url().should('include', '/payment')
    cy.wait(1000)
    cy.log('All Automated Suites Passed')
  })

})