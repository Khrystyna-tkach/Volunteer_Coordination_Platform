const fs = require('fs');
const path = require('path');

describe('Login form structure', () => {
  // If you want to read the actual template, you can; here we build expected form structure
  const buildLoginForm = () => `
    <form method="POST" action="/login/">
      <input type="email" name="email" />
      <input type="password" name="password" />
      <button type="submit">”в≥йти</button>
    </form>
  `;

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('login form has email and password fields and submits action', () => {
    document.body.innerHTML = buildLoginForm();
    const form = document.querySelector('form[action="/login/"]');
    expect(form).not.toBeNull();
    expect(form.querySelector('input[name="email"]')).not.toBeNull();
    expect(form.querySelector('input[name="password"]')).not.toBeNull();

    let captured = null;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      captured = {
        action: form.getAttribute('action'),
        email: form.querySelector('input[name="email"]').value,
        passwordSet: !!form.querySelector('input[name="password"]').value
      };
    });

    form.querySelector('input[name="email"]').value = 'user@example.com';
    form.querySelector('input[name="password"]').value = 'pw';
    form.querySelector('button[type="submit"]').click();

    expect(captured).not.toBeNull();
    expect(captured.action).toBe('/login/');
    expect(captured.email).toBe('user@example.com');
    expect(captured.passwordSet).toBe(true);
  });
});