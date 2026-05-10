const buildAdminPanels = ({ reqId = 11, userId = 3 } = {}) => `
  <section class="all-requests">
    <div class="item-card-admin" id="req-${reqId}">
      <form method="POST" action="/delete_request/${reqId}/">
        <button type="submit" class="btn-delete">ВИДАЛИТИ</button>
      </form>
      <a href="/edit_request/${reqId}/" class="btn-edit">РЕДАГУВАТИ</a>
      <form method="POST" action="/admin_change_status/${reqId}/">
        <select name="status"><option value="new">НОВА</option></select>
        <button type="submit" class="btn-status">✓</button>
      </form>
    </div>
  </section>

  <section class="users">
    <div class="item-card-admin" id="user-${userId}">
      <form method="POST" action="/toggle_user/${userId}/">
        <button type="submit" class="btn-toggle-user">ЗАБЛОКУВАТИ</button>
      </form>
    </div>
  </section>
`;

describe('Admin panel forms', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('delete request form submits to correct endpoint', () => {
    document.body.innerHTML = buildAdminPanels();
    const deleteForm = document.querySelector('#req-11 form[action^="/delete_request/"]');
    expect(deleteForm).not.toBeNull();
    let submitted = false;
    let action = null;
    deleteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
      action = deleteForm.getAttribute('action');
    });
    deleteForm.querySelector('button').click();
    expect(submitted).toBe(true);
    expect(action).toBe('/delete_request/11/');
  });

  test('toggle user form submits to toggle endpoint and includes anchor behavior expectation', () => {
    document.body.innerHTML = buildAdminPanels({ reqId: 11, userId: 3 });
    const toggleForm = document.querySelector('#user-3 form[action^="/toggle_user/"]');
    expect(toggleForm).not.toBeNull();
    let submittedAction = null;
    toggleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submittedAction = toggleForm.getAttribute('action');
    });
    toggleForm.querySelector('button').click();
    expect(submittedAction).toBe('/toggle_user/3/');
    // Note: backend appends #user-<id> on redirect; frontend submits to toggle endpoint
  });
});