const { chromium } = require('playwright');
// End-to-end journey through the real app: creator → admin → partner → creator.
// Usage: start the app, seed demo data, then `node scripts/e2e-journey.cjs`
// (BASE_URL and SEED_DEMO_PASSWORD are read from the environment).
const B = process.env.BASE_URL || 'http://localhost:3000';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const stamp = Date.now();
const step = (m) => console.log('✓', m);
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const mk = async () => { const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); return p; };

  // Creator signs up
  const c = await mk();
  await c.goto(B + '/join');
  await c.fill('#name', 'Test Creator');
  await c.fill('#email', `creator${stamp}@example.com`);
  await c.fill('#password', 'supersecret123');
  await c.check('input[name=acceptTerms]');
  await c.click('button[type=submit]');
  await c.waitForURL(/\/dashboard\?welcome=1/); step('creator signup → dashboard');

  // Validation error path
  await c.goto(B + '/dashboard/projects/new');
  await c.click('button[type=submit]');
  await c.getByText('Give your project a title').waitFor(); step('validation errors shown');

  await c.check('input[name=category][value=GAMES]', { force: true });
  await c.fill('#title', `Lighthouse Foxes ${stamp}`);
  await c.fill('#tagline', 'Foxes who keep the lights on.');
  await c.click('button[type=submit]');
  await c.waitForURL(/step=story/); step('project created');
  const projectUrl = c.url().split('?')[0];

  await c.fill('#overview', 'A cosy game about a family of foxes who run the last lighthouse on a stormy coast, guiding ships and lost creatures home each night.');
  await c.fill('#world', 'A windy archipelago.');
  await c.click('button[type=submit]');
  await c.waitForURL(/step=characters/); step('story saved');

  await c.fill('#name', 'Bram'); await c.fill('#role', 'Keeper fox');
  await c.click('text=Add character');
  await c.getByText('Bram added.').waitFor(); step('character added');

  await c.goto(projectUrl + '?step=visuals');
  await c.setInputFiles('input[type=file]', { name: 'art.png', mimeType: 'image/png', buffer: PNG });
  await c.getByText('Uploaded.').waitFor({ timeout: 15000 });
  await c.reload(); await c.getByText('Cover', { exact: true }).waitFor(); step('image uploaded and set as cover');

  // submit before basics logline → should fail
  await c.goto(projectUrl + '?step=publish');
  await c.click('text=Submit for publishing');
  await c.getByText(/Before submitting/).waitFor(); step('readiness check blocks submission');

  await c.goto(projectUrl + '?step=basics');
  await c.fill('#logline', 'A fox family keeps the last lighthouse burning.');
  await c.click('button[type=submit]'); await c.waitForURL(/step=story/);
  await c.goto(projectUrl + '?step=rights');
  await c.check('input[name=declareOwnership]');
  await c.click('text=Save & continue'); await c.waitForURL(/step=commercial/);
  await c.check('input[value=PLUSH_AND_TOYS]', { force: true });
  await c.click('text=Save & continue'); await c.waitForURL(/step=publish/);
  await c.click('text=Submit for publishing');
  await c.getByText(/The IPPLY team will review/).waitFor(); step('submitted for review');

  const slug = `lighthouse-foxes-${stamp}`;
  const anon = await mk();
  let r = await anon.goto(B + '/ip/' + slug);
  console.log(r.status() === 404 ? '✓ unpublished project hidden from public' : '✗ draft visible publicly');

  // Admin approves
  const a = await mk();
  await a.goto(B + '/signin');
  await a.fill('#email', 'admin@ipply.demo'); await a.fill('#password', process.env.SEED_DEMO_PASSWORD || 'ipply-demo-2026');
  await a.click('button[type=submit]'); await a.waitForURL(/\/admin/);
  await a.goto(B + '/admin/projects?tab=review');
  await a.click(`text=Lighthouse Foxes ${stamp}`);
  await a.click('text=Approve & publish');
  await a.getByText('Published', { exact: true }).first().waitFor(); step('admin approved');
  await a.click('text=Feature on homepage'); await a.getByText('Remove from featured').waitFor(); step('admin featured');

  r = await anon.goto(B + '/ip/' + slug);
  console.log(r.status() === 200 ? '✓ published project visible' : '✗ not visible');
  await anon.goto(B + `/discover?q=Lighthouse`); await anon.getByText(`Lighthouse Foxes ${stamp}`).first().waitFor(); step('discover search finds it');
  await anon.goto(B + `/discover?category=games`); await anon.getByText(`Lighthouse Foxes ${stamp}`).first().waitFor(); step('category filter works');

  // Partner signs up, shortlists, enquires
  const p = await mk();
  await p.goto(B + '/join?as=partner');
  await p.fill('#name', 'Pat Partner');
  await p.fill('#organizationName', 'Acme Test Toys');
  await p.selectOption('#organizationType', 'TOY_AND_CONSUMER_PRODUCTS');
  await p.fill('#email', `partner${stamp}@example.com`);
  await p.fill('#password', 'supersecret123');
  await p.check('input[name=acceptTerms]');
  await p.click('button[type=submit]'); await p.waitForURL(/\/partner/); step('partner signup');
  await p.goto(B + '/ip/' + slug);
  await p.click('button:has-text("Shortlist")'); await p.getByText('Shortlisted').waitFor();
  await p.click('button:has-text("Follow")'); await p.getByRole('button', { name: /Following 1/ }).waitFor(); step('shortlist + follow (count 1)');
  await p.goto(B + `/ip/${slug}/enquire`);
  await p.click('button:has-text("Send enquiry")');
  await p.getByText('Choose at least one category').waitFor(); step('enquiry validation');
  await p.check('input[name=categories][value=PLUSH_AND_TOYS]', { force: true });
  await p.check('input[name=territories][value="Europe"]', { force: true });
  await p.fill('#intendedUse', 'A four-piece plush range of the fox family for specialist toy retailers in Europe.');
  await p.fill('#termMonths', '24');
  await p.fill('#message', 'We love Bram!');
  await p.check('input[name=acknowledge]');
  await p.click('button:has-text("Send enquiry")');
  await p.waitForURL(/\/partner\/enquiries\/.*sent=1/); step('enquiry submitted');
  const pEnq = p.url().split('?')[0];

  // Creator responds
  await c.goto(B + '/dashboard/enquiries');
  await c.click('text=Acme Test Toys');
  await c.getByText('We love Bram!').waitFor();
  await c.click('text=Mark as in discussion');
  await c.getByText('Status changed to In discussion').waitFor();
  await c.fill('textarea[name=body]', 'Thanks — happy to talk!');
  await c.click('text=Send message'); await c.getByText('Message sent.').waitFor(); step('creator replied + status change');
  await p.goto(pEnq); await p.getByText('Thanks — happy to talk!').waitFor(); step('partner sees reply');

  // Authorization checks
  r = await p.goto(B + '/dashboard'); console.log(p.url().includes('/partner') ? '✓ partner redirected away from creator dashboard' : '✗ ' + p.url());
  r = await c.goto(B + '/admin'); console.log(!c.url().includes('/admin') ? '✓ creator blocked from admin' : '✗ creator reached admin');
  r = await c.goto(pEnq.replace('/partner/', '/dashboard/')); 
  const other = await mk(); await other.goto(B + '/join'); await other.fill('#name','Other'); await other.fill('#email',`o${stamp}@example.com`); await other.fill('#password','supersecret123'); await other.check('input[name=acceptTerms]'); await other.click('button[type=submit]'); await other.waitForURL(/dashboard/);
  r = await other.goto(pEnq.replace('/partner/', '/dashboard/')); console.log(r.status() === 404 ? '✓ other creator cannot read enquiry' : '✗ status ' + r.status());
  r = await other.goto(projectUrl); console.log(r.status() === 404 ? '✓ other creator cannot edit project' : '✗ status ' + r.status());

  console.log('page errors:', errs);
  await b.close();
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
