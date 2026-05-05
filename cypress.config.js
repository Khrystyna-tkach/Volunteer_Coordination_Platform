const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: '3uaz86',
  e2e: {
    baseUrl: 'http://localhost:8000',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    supportFile: false, // <-- ������ ����'������� ����� ����� ��������
  }
});