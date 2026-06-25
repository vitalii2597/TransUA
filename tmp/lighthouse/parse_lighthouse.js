const fs = require('fs');
const files = ['tmp/lighthouse/root.json','tmp/lighthouse/uk.json','tmp/lighthouse/uk-trips.json'];
for(const f of files){
  if(!fs.existsSync(f)){ console.log(`${f} missing`); continue; }
  const data = JSON.parse(fs.readFileSync(f));
  const url = data.finalUrl;
  const perf = data.categories && data.categories.performance && data.categories.performance.score ? Math.round(data.categories.performance.score * 100) : 'n/a';
  const acc = data.categories && data.categories.accessibility && data.categories.accessibility.score ? Math.round(data.categories.accessibility.score * 100) : 'n/a';
  const seo = data.categories && data.categories.seo && data.categories.seo.score ? Math.round(data.categories.seo.score * 100) : 'n/a';
  const pwa = data.categories && data.categories.pwa && data.categories.pwa.score ? Math.round(data.categories.pwa.score * 100) : null;
  const errorsAudit = data.audits && data.audits['errors-in-console'];
  const errors = errorsAudit && errorsAudit.details && errorsAudit.details.items ? errorsAudit.details.items.map(i=>i.source).slice(0,5) : [];
  console.log(`URL: ${url}`);
  console.log(`Scores — Performance: ${perf}, Accessibility: ${acc}, SEO: ${seo}${pwa?`, PWA: ${pwa}`:''}`);
  if(errors.length) { console.log('Console errors (sample):'); errors.forEach(e=>console.log(' - '+e)); } else { console.log('No console errors reported by Lighthouse.'); }
  console.log('---');
}
