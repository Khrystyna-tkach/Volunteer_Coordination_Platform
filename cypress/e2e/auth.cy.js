describe('Auth: register, login and logout', () => {
  it('registers a new user and logs out', () => {
    cy.visit('/register/');

    // Генеруємо унікальну пошту для кожного прогону тесту
    const uniqueEmail = `cypress_user_${Date.now()}@example.test`;

    // Перевірте, чи атрибут name у полі вводу імені саме 'name' чи 'username'
    cy.get('input[name="name"], input[name="username"]').type('Cypress User');
    cy.get('input[name="email"]').type(uniqueEmail);
    cy.get('input[name="password"]').type('cypresspw123');
    
    cy.get('button[type="submit"]').click();

    // Перенаправлення на сторінку користувача
    cy.url().should('include', '/user/');
    cy.contains('HELPBRIDGE').should('exist');

    // Вихід з облікового запису
    cy.get('a[title="Вийти"]').click();
    cy.url().should('include', '/');
  });

  it('logs in an existing user', () => {
    cy.visit('/login/');
    cy.get('input[name="email"]').type('testuser@example.test');
    cy.get('input[name="password"]').type('testpass');
    cy.get('button[type="submit"]').click();

    // Перехід на сторінку користувача
    cy.url().should('include', '/user/');
    cy.contains('HELPBRIDGE').should('exist');
    
    // Вихід для очищення сесії
    cy.get('a[title="Вийти"]').click();
    cy.url().should('include', '/');
  });
});