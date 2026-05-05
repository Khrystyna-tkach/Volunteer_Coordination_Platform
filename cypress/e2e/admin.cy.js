describe('Admin flows: delete request and toggle user status', () => {
  before(() => {
    // 1. Заходимо як адмін, щоб перевірити та розблокувати користувача (якщо він був заблокований)
    cy.visit('/login/');
    cy.get('input[name="email"]').type('admin@example.test');
    cy.get('input[name="password"]').type('adminpass');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/admin_panel/');

    // Перевіряємо статус користувача і розблоковуємо його, якщо він заблокований
    cy.contains('.item-card-admin', 'Test').then(($card) => {
      const unblockBtn = $card.find('button:contains("РОЗБЛОКУВАТИ")');
      if (unblockBtn.length > 0) {
        cy.wrap(unblockBtn).click();
      }
    });

    // Виходимо з адмін-панелі
    cy.get('a[title="Вийти"]').click();
    cy.url().should('include', '/');

    // 2. Заходимо як звичайний користувач для створення тестової заявки
    cy.visit('/login/');
    cy.get('input[name="email"]').type('testuser@example.test');
    cy.get('input[name="password"]').type('testpass');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/user/');

    // Перевіряємо, чи є заявка, якщо немає — створюємо її
    cy.get('body').then(($body) => {
      if ($body.find(':contains("Seeded Request")').length === 0) {
        cy.get('input[name="title"]').type('Seeded Request');
        cy.get('textarea[name="description"]').type('Seeded');
        cy.get('input[name="contact_info"]').type('000');
        cy.get('input[name="location"]').type('SeedCity');
        cy.get('form.request-form-user button[type="submit"]').click();
      }
    });

    // Виходимо з облікового запису користувача
    cy.get('a[title="Вийти"]').click();
    cy.url().should('include', '/');
  });

  it('admin can delete a request and toggle a user', () => {
    // 1. Логінимось як адмін
    cy.visit('/login/');
    cy.get('input[name="email"]').type('admin@example.test');
    cy.get('input[name="password"]').type('adminpass');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/admin_panel/');

    // Автоматичне підтвердження модального вікна (alert/confirm)
    cy.on('window:confirm', () => true);

    // 2. Видаляємо створену заявку
    cy.contains('.col-value-admin', 'Seeded Request', { timeout: 10000 })
      .closest('.item-card-admin')
      .within(() => {
        cy.get('button').contains('ВИДАЛИТИ').click();
      });

    // Перевіряємо, чи заявка зникла
    cy.contains('Seeded Request').should('not.exist');

    // 3. Блокуємо користувача
    cy.contains('.item-card-admin', 'Test').within(() => {
      cy.get('button').contains('ЗАБЛОКУВАТИ').click();
    });

    // Перевіряємо зміну URL на якір
    cy.url().should('match', /#user-\d+$/);

    // 4. Розблоковуємо користувача назад (щоб не блокувати його для наступних тестів)
    cy.contains('.item-card-admin', 'Test').within(() => {
      cy.get('button').contains('РОЗБЛОКУВАТИ').click();
    });

    // Вихід з адмін-панелі
    cy.get('a[title="Вийти"]').click();
  });
});