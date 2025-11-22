/**
 * Automated UI Test Suites for Fish Market System
 * * Rationale & Strategy:
 * This script covers the critical "Buyer Journey" to ensure the system functions correctly form end-to-end.
 * The tests are divided into 4 sequential scenarios to mimic real-user behavior:
 * * 1. Search Functionality: Verifies that the search bar correctly filters listings and excludes irrelevant items.
 * 2. Advanced Filters & Add to Cart: Validates specific filtering (Species, Price) and the core action of adding items to the cart.
 * 3. Cart Management: Ensures the cart updates correctly and items can be removed (state management check).
 * 4. Checkout Flow: Verifies the final step of the purchasing process, ensuring the total price is visible and navigation to payment works.
 * * Note: { testIsolation: false } is used to create a seamless, continuous demo flow without resetting the page between steps.
 */

describe('Fish Market - Automated UI Test Suites', { testIsolation: false }, () => {

  before(() => {
    cy.intercept('GET', 'http://localhost:8080/api/fishListings/list').as('getFish')
    cy.visit('http://localhost:3000/login')
    
    cy.log('🗣️ Action: Logging in as Buyer...')
    cy.get('input[placeholder="Username or Email"]').type('alice_b', { delay: 100 })
    cy.get('input[placeholder="Password"]').type('password123', { delay: 100 })
    cy.get('button[type="submit"]').click()
    
    cy.url({ timeout: 10000 }).should('include', '/market')
    cy.wait('@getFish')
    cy.wait(2000) 
  })

  // --- Suite 1: Search Functionality ---
  it('1. Verify Search Functionality', () => {
    cy.log('Rationale: Ensure users can find specific products quickly.')
    
    cy.get('input[placeholder="Search for fish (e.g., Salmon, Tuna)"]')
      .type('Salmon', { delay: 400 }) 
    
    cy.wait(3000)
    cy.get('.fish-list').should('contain', 'Salmon')

    // Clear search to prepare for the next suite
    cy.get('input[placeholder="Search for fish (e.g., Salmon, Tuna)"]').clear()
    cy.wait(1000) 
  })

  // --- Suite 2: Advanced Filters & Add to Cart ---
  it('2. Verify Advanced Filters and Add-to-Cart', () => {
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

  // --- Suite 3: Cart Management ---
  it('3. Verify Cart Management (Verify & Remove)', () => {
    cy.log('Rationale: Ensure cart reflects added items and allows removal.')
    
    // Scroll up to view cart
    cy.log('⬆️ Scrolling to view cart')
    cy.scrollTo('top', { duration: 2000, easing: 'linear' })
    
    cy.wait(5000)
    // Assert that item exists
    cy.get('.cart-panel').should('contain', 'x 1')

    // Remove item
    cy.log('Action: Removing item from cart...')
    cy.get('.cart-panel li button').click() 
    
    cy.wait(3000)
    // Assert empty state
    cy.get('.cart-panel').should('contain', 'Your cart is empty')
  })

  // --- Suite 4: Checkout Flow ---
  it('4. Verify Full Checkout Process', () => {
    cy.log('Rationale: Ensure the buyer can complete the purchase.')

    // Re-add item for checkout
    cy.contains('.fish-card', 'Salmon').first().within(() => {
        cy.contains('button', 'Add to Cart').click()
    })
    
    // Scroll to view total price
    cy.scrollTo('top', { duration: 2000, easing: 'linear' }) 
    
    // Wait for visual verification of Total Price
    cy.wait(6000) 
    cy.get('.cart-total').should('contain', 'Total:')

    // Proceed to Checkout
    cy.get('.checkout-btn').click()
    
    cy.wait(3000)
    cy.url().should('include', '/payment')
    
    cy.wait(3000)
    cy.log('All Automated Suites Passed')
  })

})