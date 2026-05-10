describe('User: create request flow', () => {
  beforeEach(() => {
    // login as test user created by seeding script
    cy.visit('/login/');
    cy.get('input[name="email"]').type('testuser@example.test');
    cy.get('input[name="password"]').type('testpass');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/user/');
  });

  it('creates a help request and it appears in "МОЇ ЗАЯВКИ"', () => {
    cy.get('input[name="title"]').type('Cypress: Need Food');
    cy.get('textarea[name="description"]').type('Please deliver food.');
    cy.get('input[name="contact_info"]').type('+380501234567');
    cy.get('input[name="location"]').type('Kyiv');
    cy.get('form.request-form-user button[type="submit"]').click();

    // After redirect, the created title should appear in the list
    cy.contains('Cypress: Need Food').should('exist');
  });

  afterEach(() => {
    // logout
    cy.get('a[title="Вийти"]').click();
  });
});