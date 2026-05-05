describe('Volunteer flows: take request and update status', () => {
  before(() => {
    // 1. Заходимо як звичайний користувач, щоб перевірити або створити заявку
    cy.visit('/login/');
    cy.get('input[name="email"]').type('testuser@example.test');
    cy.get('input[name="password"]').type('testpass');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/user/');

    // Перевіряємо, чи є заявка, якщо немає — створюємо
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

  it('volunteer takes an available request and sees it in My Tasks', () => {
    // 2. Логінимось як волонтер
    cy.visit('/login/');
    cy.get('input[name="email"]').type('volunteer@example.test');
    cy.get('input[name="password"]').type('volpass');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/volunteer/');

    // 3. Знаходимо доступну заявку та беремо її
    // Пошук здійснюємо за текстом 'Seeded Request' без жорсткої прив'язки до класу
    cy.contains('Seeded Request').should('exist').parents('.request-item-vol').within(() => {
      cy.get('button.btn-take-vol').click();
    });

    // 4. Перевіряємо, чи заявка з'явилася в списку активних
    cy.url().should('include', '/volunteer/');
    cy.contains('МОЇ АКТИВНІ ЗАЯВКИ').should('exist');
    cy.contains('Seeded Request').should('exist');

    // 5. Змінюємо статус на "виконано"
    cy.contains('.request-item-vol', 'Seeded Request').within(() => {
      cy.get('select[name="status"]').select('completed');
      cy.get('button.btn-update-vol').click();
    });

    // Перевіряємо, чи статус оновився
    cy.contains('.request-item-vol', 'Seeded Request').within(() => {
      cy.get('select[name="status"]').should('have.value', 'completed');
    });

    // 6. Виходимо з облікового запису волонтера
    cy.get('a[title="Вийти"]').click();
    cy.url().should('include', '/');
  });
});