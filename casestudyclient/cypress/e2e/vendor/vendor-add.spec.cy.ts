describe('vendor add test', () => {
  it('visits the root', () => {
  cy.visit('/');
  });
  it('clicks the menu button vendors option', () => {
  cy.get('mat-icon').click();
  cy.contains('a', 'vendors').click();
  });
  it('clicks add icon', () => {
  cy.contains('control_point').click();
  });
  it('fills in fields', () => {
  cy.get('input[formcontrolname=name').type('PetsMart');
  cy.get('input[formcontrolname=address1').type('123 Pet Ln.');
  cy.get('input[formcontrolname=city').type('Detroit');

  cy.get('mat-select[formcontrolname="province"]').click();
  cy.get('mat-option').contains('Ontario').click();

  cy.get('input[formcontrolname=postalcode').type('P3T0C0');
  cy.get('input[formcontrolname=phone').type('(555)555-5555');
  cy.get('mat-select[formcontrolname="type"]').click();
  cy.get('mat-option').contains('Trusted').click();
  cy.get('input[formcontrolname=email').type('pc@here.com');
  });
  it('clicks the save button', () => {
  cy.get('button').contains('Save').click();
  cy.wait(500);
  });
  it('confirms add', () => {
  cy.contains('added!');
  });
 });
 