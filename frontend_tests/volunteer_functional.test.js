const buildAvailableRequest = ({ id, title, category, location, description, contact }) => `
  <div class="request-item-vol" id="avail-${id}">
    <div class="request-data-vol" data-id="${id}">
      <div class="data-column-vol">
        <span class="data-label-vol">Назва проблеми</span>
        <span class="data-value-vol">${title}</span>
      </div>
      <div class="data-column-vol">
        <span class="data-label-vol">Категорія</span>
        <span class="data-value-vol">${category}</span>
      </div>
      <div class="data-column-vol">
        <span class="data-label-vol">Локація</span>
        <span class="data-value-vol">${location}</span>
      </div>
    </div>

    <div class="request-details-vol">
      <div class="details-content-vol">
        <p><strong>ОПИС:</strong> ${description}</p>
        <p><strong>КОНТАКТИ:</strong> ${contact}</p>
      </div>
    </div>

    <div class="action-area-vol">
      <form method="POST" action="/take_request/${id}/">
        <button type="submit" class="btn-take-vol">ВЗЯТИ В ОБРОБКУ</button>
      </form>
    </div>
  </div>
`;

const buildMyTask = ({ id, title, status }) => `
  <div class="request-item-vol" id="task-${id}">
    <div class="request-data-vol" data-id="${id}">
      <div class="data-column-vol">
        <span class="data-label-vol">НАЗВА ЗАЯВКИ</span>
        <span class="data-value-vol">${title}</span>
      </div>
      <div class="data-column-vol">
        <span class="data-label-vol">СТАТУС</span>
        <span class="data-value-vol">${status}</span>
      </div>
    </div>

    <div class="request-details-vol">
      <div class="details-content-vol">
        <p><strong>ПОВНИЙ ОПИС:</strong> Example</p>
      </div>
    </div>

    <div class="action-area-vol">
      <form method="POST" action="/update_status/${id}/">
        <select name="status" class="status-select-vol">
          <option value="in_progress" ${status === 'in_progress' ? 'selected' : ''}>В процесі</option>
          <option value="completed" ${status === 'completed' ? 'selected' : ''}>Виконана</option>
        </select>
        <button type="submit" class="btn-update-vol">ОНОВИТИ СТАТУС</button>
      </form>
    </div>
  </div>
`;

describe('Volunteer page functional tests (DOM-level)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('clicking "ВЗЯТИ В ОБРОБКУ" submits the take_request form', () => {
    // Arrange: render one available request
    document.body.innerHTML = buildAvailableRequest({
      id: 42,
      title: 'Help needed',
      category: 'Допомога',
      location: 'Kyiv',
      description: 'Please help',
      contact: '012345'
    });

    const form = document.querySelector('#avail-42 form');
    const button = form.querySelector('.btn-take-vol');

    // Attach submit listener to capture the submission and inspect attributes
    let submitted = false;
    let submittedAction = null;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
      submittedAction = form.getAttribute('action');
    });

    // Act: simulate user clicking the button
    button.click();

    // Assert: form submitted and action is correct
    expect(submitted).toBe(true);
    expect(submittedAction).toBe('/take_request/42/');
  });

  test('changing status select and submitting sends selected value (update_status form)', () => {
    // Arrange: render a task with initial status in_progress
    document.body.innerHTML = buildMyTask({
      id: 7,
      title: 'Task Seven',
      status: 'in_progress'
    });

    const form = document.querySelector('#task-7 form');
    const select = form.querySelector('select[name="status"]');
    const button = form.querySelector('.btn-update-vol');

    // Attach submit listener to capture selected value at submit time
    let capturedStatus = null;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // read the selected value as the backend would receive it
      capturedStatus = select.value;
    });

    // Act: change select to 'completed' then submit
    select.value = 'completed';
    button.click();

    // Assert: captured value equals the chosen option
    expect(capturedStatus).toBe('completed');
  });
});