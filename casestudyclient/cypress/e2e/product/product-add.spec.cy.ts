describe('product add test', () => {
  it('visits the root', () => {
  cy.visit('/');
  });
  it('clicks the menu button products option', () => {
  cy.get('mat-icon').click();
  cy.contains('a', 'products').click();
  });
  it('clicks add icon', () => {
  cy.contains('control_point').click();
  });
  it('fills in fields', () => {

  cy.get('input[formcontrolname=id').type('4-P3-water');
  cy.get('mat-select[formcontrolname="vendorid"]').click();
  cy.get('mat-option').contains('Brayden Co.').click();
  cy.get('input[formcontrolname=name').type('Water');
  cy.get('input[formcontrolname=costprice]').clear();
  cy.get('input[formcontrolname=costprice').type('10.95');
  cy.get('input[formcontrolname=msrp]').clear();
  cy.get('input[formcontrolname=msrp').type('8.40');

  cy.get('.mat-expansion-indicator').eq(0).click();
  cy.get('.mat-expansion-indicator').eq(1).click();


  cy.get('input[formcontrolname=rop').clear();
  cy.get('input[formcontrolname=rop').type('14');
  cy.get('input[formcontrolname=eoq').clear();
  cy.get('input[formcontrolname=eoq').type('16');
  cy.get('input[formcontrolname=qoh').clear();
  cy.get('input[formcontrolname=qoh').type('13');
  cy.get('input[formcontrolname=qoo').clear();
  cy.get('input[formcontrolname=qoo').type('27');

  });
  it('clicks the save button', () => {
  cy.get('button').contains('Save').click();
  cy.wait(500);
  });
  it('confirms add', () => {
  cy.contains('added!');
  });
 });
 