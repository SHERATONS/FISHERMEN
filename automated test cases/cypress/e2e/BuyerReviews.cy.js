/**
 * Automated UI Test Suites - Buyer Reviews Module
 * Framework: Cypress
 * Test Coverage: View → Add Review → Edit Review
 */

describe('Buyer Reviews - Complete UI Test Suites', { testIsolation: false }, () => {

  // --------------------------------------------------------
  // PRE-CONDITION: LOGIN
  // --------------------------------------------------------
  before(() => {
    cy.visit('http://localhost:3000/login')
    cy.get('input[placeholder="Username or Email"]').type('alice_b', { delay: 80 })
    cy.get('input[placeholder="Password"]').type('password123', { delay: 80 })
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/market')
    cy.wait(2000)
  })


  // --------------------------------------------------------
  // 1. NAVIGATE TO REVIEWS PAGE
  // --------------------------------------------------------
  it('1. Navigate to Reviews page', () => {
    cy.intercept('GET', 'http://localhost:8080/api/users/*').as('getUser')
    cy.intercept('GET', 'http://localhost:8080/api/orders/buyer/*').as('getOrders')
    cy.intercept('GET', 'http://localhost:8080/api/reviews/buyer/*').as('getReviews')

    cy.contains('a', 'Reviews').click()
    cy.url().should('include', '/reviews')

    cy.wait('@getUser')
    cy.wait('@getOrders')
    cy.wait('@getReviews')
    cy.wait(1000)

    cy.log('✓ Navigated to Reviews page')
  })


  // --------------------------------------------------------
  // 2. VERIFY PAGE RENDERING
  // --------------------------------------------------------
  it('2. Verify page components', () => {
    cy.contains('My Reviews').should('exist')
    cy.get('.buyer-info').should('exist')
    cy.contains('Alice').should('exist')
    cy.contains('button', 'Not Reviewed').should('exist')
    cy.contains('button', 'Reviewed').should('exist')
    cy.contains('button', 'Not Reviewed').should('have.class', 'active')

    cy.log('✓ Page components rendered')
  })


  // --------------------------------------------------------
  // 3. VERIFY "NOT REVIEWED" ITEMS
  // --------------------------------------------------------
  it('3. Verify "Not Reviewed" filter', () => {
    cy.contains('button', 'Not Reviewed').click()
    cy.wait(1000)

    cy.get('.order-card').should('exist')
    cy.get('.order-card').first().within(() => {
      cy.contains('button', 'Rate').should('exist')
    })

    cy.log('✓ "Not Reviewed" filter works')
  })


  // --------------------------------------------------------
  // 4. OPEN REVIEW FORM
  // --------------------------------------------------------
  it('4. Open review form', () => {
    cy.contains('button', 'Rate').first().click()
    cy.wait(500)

    cy.get('.review-form').should('be.visible')
    cy.contains('Select overall rating:').should('exist')
    cy.get('.star-input .star').should('have.length', 5)
    cy.get('textarea').should('exist')
    cy.contains('button', 'Submit Review').should('exist')

    cy.log('✓ Review form opened')
  })


  // --------------------------------------------------------
  // 5. SUBMIT NEW REVIEW
  // --------------------------------------------------------
  it('5. Submit new review', () => {
    cy.intercept('POST', 'http://localhost:8080/api/reviews/create').as('createReview')

    // Select 5 stars
    cy.get('.star-input .star').eq(4).click()
    cy.wait(300)
    cy.get('.star-input .star.selected').should('have.length', 5)

    // Type comment
    cy.get('textarea').clear().type('Very fresh fish! Highly recommended.', { delay: 50 })

    // Submit (alert auto-handled by Cypress)
    cy.contains('button', 'Submit Review').click()

    // Wait for API (201 = Created)
    cy.wait('@createReview').its('response.statusCode').should('eq', 201)
    cy.wait(2000) // Wait for state update

    cy.log('✓ Review submitted')
  })


  // --------------------------------------------------------
  // 6. SWITCH TO "REVIEWED" AND VERIFY
  // --------------------------------------------------------
  it('6. Switch to "Reviewed" filter', () => {
    // Wait for previous state to settle
    cy.wait(2000)
    
    // DEBUG: Check current filter state
    cy.get('button.filter-tab.active').should('contain', 'Not Reviewed')
    cy.log('Currently on: Not Reviewed filter')
    
    // Try multiple click strategies
    // Strategy 1: Direct click on the exact button
    cy.get('button.filter-tab').eq(1).click()  // Index 1 = "Reviewed" button
    cy.wait(1000)
    
    // Verify if it worked
    cy.get('button.filter-tab').eq(1).then(($btn) => {
      if (!$btn.hasClass('active')) {
        cy.log('⚠ First click failed, trying alternative method...')
        // Strategy 2: Click using text content
        cy.get('.filter-bar button').contains('Reviewed').click({ force: true })
        cy.wait(1000)
      }
    })
    
    // Final verification
    cy.get('button.filter-tab.active').should('contain', 'Reviewed')
    cy.wait(2000)

    // Now verify the filtered content
    cy.get('.order-card').should('exist')
    
    cy.contains('.order-card', 'Very fresh fish! Highly recommended.')
      .should('exist')
      .within(() => {
        cy.contains('Your Rating:').should('exist')
        cy.contains('Your Comment:').should('exist')
        cy.contains('button', 'Edit Review').should('exist')
      })

    cy.log('✓ "Reviewed" filter works')
  })


  // --------------------------------------------------------
  // 7. VERIFY REVIEW DETAILS
  // --------------------------------------------------------
  it('7. Verify review details', () => {
    // Find the specific card with our review comment (not .first())
    cy.contains('.order-card', 'Very fresh fish! Highly recommended.').within(() => {
      cy.contains('Your Rating:').parent().should('contain', '★★★★★')
      cy.contains('Your Rating:').parent().should('contain', '(5/5)')
      cy.contains('Your Comment:').parent().should('contain', 'Very fresh fish! Highly recommended.')
    })

    cy.log('✓ Review details correct')
  })


  // --------------------------------------------------------
  // 8. OPEN EDIT FORM
  // --------------------------------------------------------
  it('8. Open edit review form', () => {
    // Find the specific card with our review, then click Edit
    cy.contains('.order-card', 'Very fresh fish! Highly recommended.').within(() => {
      cy.contains('button', 'Edit Review').click()
    })
    cy.wait(500)

    cy.get('.review-form').should('be.visible')
    cy.get('.star-input .star.selected').should('have.length', 5)
    cy.get('textarea').should('have.value', 'Very fresh fish! Highly recommended.')
    cy.contains('button', 'Update Review').should('exist')

    cy.log('✓ Edit form opened')
  })

  
  // --------------------------------------------------------
  // 9. UPDATE REVIEW
  // --------------------------------------------------------
  it('9. Update review', () => {
    cy.intercept('PUT', 'http://localhost:8080/api/reviews/update/*').as('updateReview')

    // Change to 4 stars
    cy.get('.star-input .star').eq(3).click()
    cy.wait(300)
    cy.get('.star-input .star.selected').should('have.length', 4)

    // Update comment
    cy.get('textarea').clear().type('Good quality fish, will buy again!', { delay: 50 })

    // Update (alert auto-handled)
    cy.contains('button', 'Update Review').click()

    // Wait for API (200 = OK)
    cy.wait('@updateReview').its('response.statusCode').should('eq', 200)
    cy.wait(2000) // Wait for state update

    cy.log('✓ Review updated')
  })

})