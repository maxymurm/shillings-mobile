describe('Account Register', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
    cy.get('ion-input[type="email"]').type('test@example.com');
    cy.get('ion-input[type="password"]').type('password');
    cy.get('ion-button').contains('Sign In').click();
    cy.url().should('include', '/tabs/dashboard');
    cy.visit('/tabs/reports/account-register');
  });

  it('shows accounts list', () => {
    cy.get('ion-list').should('exist');
    cy.get('ion-item').should('have.length.at.least', 1);
  });

  it('drills into account register', () => {
    cy.get('ion-item').first().click();
    cy.get('ion-searchbar').should('exist');
  });

  it('search filters transactions', () => {
    cy.get('ion-item').first().click();
    cy.get('ion-searchbar').type('test');
    cy.wait(500); // debounce
  });
});
