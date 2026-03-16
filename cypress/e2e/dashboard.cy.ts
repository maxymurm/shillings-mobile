describe('Dashboard', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
    cy.get('ion-input[type="email"]').type('test@example.com');
    cy.get('ion-input[type="password"]').type('password');
    cy.get('ion-button').contains('Sign In').click();
    cy.url().should('include', '/tabs/dashboard');
  });

  it('loads dashboard page', () => {
    cy.get('ion-title').should('contain', 'Dashboard');
  });

  it('shows org switcher', () => {
    cy.get('.org-switcher, ion-chip').should('exist');
  });

  it('displays summary cards', () => {
    cy.get('ion-card').should('have.length.at.least', 1);
  });
});
