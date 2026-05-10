const fs = require('fs');
const path = require('path');

const templatePath = path.resolve(__dirname, '..', 'accounts', 'templates', 'accounts', 'user_page.html');

function extractToggleScript(html) {
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const content = match[1];
    if (content.includes('function toggleDetails')) return content;
  }
  return null;
}

describe('toggleDetails (page-specific behavior)', () => {
  let scriptContent = null;
  let appendedScriptEl = null;

  beforeAll(() => {
    const html = fs.readFileSync(templatePath, 'utf8');
    scriptContent = extractToggleScript(html);
    if (!scriptContent) throw new Error('toggleDetails script not found in template');
  });

  function buildRequestHtml({ id, title, date, status, description, location, contact }, detailsActive = false) {
    const activeClass = detailsActive ? ' active' : '';
    return `
      <div class="request-wrapper-user" id="req-wrap-${id}">
        <div class="request-item-user" data-id="${id}">
          <span class="req-title">${title}</span>
          <span class="req-date">${date}</span>
          <span class="req-status">${status}</span>
        </div>
        <div class="request-details-user${activeClass}">
          <div class="details-content-user">
            <p><strong>Œœ»—:</strong> ${description}</p>
            <p><strong>ÀŒ ¿÷≤ﬂ:</strong> ${location}</p>
            <p><strong> ŒÕ“¿ “»:</strong> ${contact}</p>
          </div>
        </div>
      </div>
    `;
  }

  beforeEach(() => {
    // Two realistic request items; second starts opened
    document.body.innerHTML = ''
      + buildRequestHtml({
          id: 1,
          title: 'Request Alpha',
          date: '01.01.2026',
          status: 'ÕŒ¬¿',
          description: 'Alpha description',
          location: 'Alpha location',
          contact: 'Alpha contact'
        }, false)
      + buildRequestHtml({
          id: 2,
          title: 'Request Beta',
          date: '02.01.2026',
          status: '¬ œ–Œ÷≈—≤',
          description: 'Beta description',
          location: 'Beta location',
          contact: 'Beta contact'
        }, true);

    // Inject the actual toggleDetails script into jsdom window context
    appendedScriptEl = document.createElement('script');
    appendedScriptEl.type = 'text/javascript';
    appendedScriptEl.textContent = scriptContent;
    document.body.appendChild(appendedScriptEl);

    if (typeof window.toggleDetails !== 'function') {
      // helpful debugging: uncomment to print extracted script
      console.log('Extracted toggleDetails script:\\n', scriptContent);
      throw new Error('toggleDetails function not defined after injecting script');
    }
  });

  afterEach(() => {
    // cleanup between tests
    if (appendedScriptEl && appendedScriptEl.parentNode) appendedScriptEl.parentNode.removeChild(appendedScriptEl);
    appendedScriptEl = null;
    document.body.innerHTML = '';
  });

  test('clicking an item opens its details and shows description/location/contact', () => {
    const item = document.querySelector('.request-item-user[data-id="1"]');
    const details = item.nextElementSibling;
    // ensure initially the first is closed and second is open
    expect(details.classList.contains('active')).toBe(false);
    expect(document.querySelector('.request-details-user.active')).not.toBeNull();

    // simulate click
    window.toggleDetails(item);

    // first details should be open
    expect(details.classList.contains('active')).toBe(true);

    // verify the details content contains the expected fields and values
    const detailsText = details.textContent;
    expect(detailsText).toContain('Alpha description');
    expect(detailsText).toContain('Alpha location');
    expect(detailsText).toContain('Alpha contact');

    // only one details block should be active
    expect(document.querySelectorAll('.request-details-user.active').length).toBe(1);
  });

  test('clicking the same item toggles its details closed on second click and does not affect content', () => {
    const item = document.querySelector('.request-item-user[data-id="1"]');
    const details = item.nextElementSibling;

    // open then close
    window.toggleDetails(item);
    expect(details.classList.contains('active')).toBe(true);

    // second click closes it
    window.toggleDetails(item);
    expect(details.classList.contains('active')).toBe(false);

    // content remains present in DOM (but hidden)
    const detailsText = details.textContent;
    expect(detailsText).toContain('Alpha description');
    expect(detailsText).toContain('Alpha location');
    expect(detailsText).toContain('Alpha contact');
  });
});