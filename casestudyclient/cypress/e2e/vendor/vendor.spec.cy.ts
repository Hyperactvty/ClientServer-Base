describe("vendor page test", () => {
  it("visits the root", () => {
  cy.visit("/");
  });
  it("clicks the menu button vendor option", () => {
  cy.get('mat-icon').click();
  cy.contains('a', 'vendor').click();
  });
  it("shows vendors were loaded", () => {
  cy.contains('vendors loaded!');
  });
 }); 