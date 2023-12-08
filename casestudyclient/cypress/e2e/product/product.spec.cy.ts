describe("product page test", () => {
  it("visits the root", () => {
  cy.visit("/");
  });
  it("clicks the menu button product option", () => {
  cy.get('mat-icon').click();
  cy.contains('a', 'product').click();
  });
  it("shows products were loaded", () => {
  cy.contains('products loaded!');
  });
 }); 