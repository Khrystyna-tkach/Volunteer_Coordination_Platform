const buildCreateForm = () => `
  <form class="request-form-user" method="POST" action="/user/create/">
    <input type="text" name="title" required />
    <textarea name="description" required></textarea>
    <input type="text" name="contact_info" required />
    <input type="text" name="location" required />
    <button type="submit">Надіслати заявку</button>
  </form>
`;

describe('Create request form (user)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('form has required inputs and submits correct values', () => {
    document.body.innerHTML = buildCreateForm();

    const form = document.querySelector('form.request-form-user');
    const title = form.querySelector('input[name="title"]');
    const desc = form.querySelector('textarea[name="description"]');
    const contact = form.querySelector('input[name="contact_info"]');
    const location = form.querySelector('input[name="location"]');
    const button = form.querySelector('button[type="submit"]');

    expect(form).not.toBeNull();
    expect(title).not.toBeNull();
    expect(desc).not.toBeNull();
    expect(contact).not.toBeNull();
    expect(location).not.toBeNull();

    // capture submission
    let submittedData = null;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submittedData = {
        action: form.getAttribute('action'),
        title: title.value,
        description: desc.value,
        contact_info: contact.value,
        location: location.value
      };
    });

    // fill and submit
    title.value = 'Need water';
    desc.value = 'Description here';
    contact.value = '+380123';
    location.value = 'Central';
    button.click();

    expect(submittedData).not.toBeNull();
    expect(submittedData.action).toBe('/user/create/');
    expect(submittedData.title).toBe('Need water');
    expect(submittedData.description).toBe('Description here');
    expect(submittedData.contact_info).toBe('+380123');
    expect(submittedData.location).toBe('Central');
  });
});