describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('shows login form', () => {
    cy.get('ion-input[type="email"]').should('exist');
    cy.get('ion-input[type="password"]').should('exist');
    cy.get('ion-button').contains('Sign In').should('exist');
  });

  it('login with valid credentials', () => {
    cy.get('ion-input[type="email"]').type('test@example.com');
    cy.get('ion-input[type="password"]').type('password');
    cy.get('ion-button').contains('Sign In').click();
    cy.url().should('include', '/tabs/dashboard');
  });

  it('shows error on invalid credentials', () => {
    cy.get('ion-input[type="email"]').type('bad@example.com');
    cy.get('ion-input[type="password"]').type('wrong');
    cy.get('ion-button').contains('Sign In').click();
    cy.get('ion-text[color="danger"]').should('be.visible');
  });

  it('logout clears session', () => {
    cy.get('ion-input[type="email"]').type('test@example.com');
    cy.get('ion-input[type="password"]').type('password');
    cy.get('ion-button').contains('Sign In').click();
    cy.url().should('include', '/tabs/dashboard');
    cy.visit('/tabs/settings');
    cy.get('ion-button').contains('Sign Out').click();
    cy.url().should('include', '/auth/login');
  });
});
