import assert from 'node:assert/strict';
import test from 'node:test';
import { loadData } from './load-data.mjs';
import { parseAuditSource } from './parse-audit-sources.mjs';
const { projects, units } = loadData();
const ids = ['solana-2','narciso','mood-office','ventura','venire-villa-morra','ventura-torre-1','insignia-07-cd','insignia-09','insignia-10','insignia-11','city-02','terra-02'];
const expectedCounts = [34,86,60,27,28,7,34,46,18,32,21,25];

for (const [index, id] of ids.entries()) test(`${id}: every identified source unit, price and surface matches`, () => {
  const rows = parseAuditSource(id);
  const projectId = id === 'insignia-07-cd' ? 'insignia-07' : id;
  const scope = units.filter(u => u.projectId === projectId && (id === 'insignia-07' ? /^[AB]/.test(u.code) : id === 'insignia-07-cd' ? /^[CD]/.test(u.code) : true));
  assert.equal(rows.filter(r => r.available).length, expectedCounts[index]);
  assert.equal(scope.length, expectedCounts[index]);
  assert.equal(new Set(rows.map(r=>r.code)).size, rows.length);
  for (const row of rows) {
    const unit = scope.find(u => u.code === row.code);
    if(!row.available) { assert.equal(unit, undefined, row.raw); continue; }
    assert.ok(unit, row.raw);
    for (const field of ['price','currency','totalM2','ownM2','commonM2','patioM2','parkingM2','parking','storageM2','internalM2','areaLabel']) {
      if(row[field] !== undefined) assert.equal(unit[field],row[field],`${id} ${row.code}: ${field}`);
    }
    if(id === 'mood-office' || id === 'venire') assert.equal(unit.balconyM2,row.balconyM2,row.code);
    assert.equal(unit.status,'Disponible');
    assert.doesNotMatch(unit.type,/ X$/);
  }
});

test('confirmed September reconciliation supersedes older snapshots', () => {
  const count = id => units.filter(u => u.projectId === id && u.status === 'Disponible').length;
  assert.deepEqual({
    venire: count('venire'), hassler: count('ventura-hassler'), insignia07: count('insignia-07'),
    insignia08: count('insignia-08'), casas: count('casas-bosque'), blu: count('blu'), rBulnes: count('r-bulnes'),
    rLasLomas: count('r-las-lomas'), rAndrade: count('r-andrade'),
  }, { venire: 55, hassler: 3, insignia07: 34, insignia08: 24, casas: 12, blu: 4, rBulnes: 10, rLasLomas: 8, rAndrade: 27 });
  assert.ok(!units.some(u => u.projectId === 'venire' && u.code === '605'));
  assert.ok(!units.some(u => u.projectId === 'insignia-07' && u.code === 'B43'));
  assert.ok(units.some(u => u.projectId === 'insignia-08' && u.code === 'B19' && u.price === 74799));
});

test('all 37 projects have honest audit coverage and no orphan or duplicate units', () => {
  assert.equal(projects.length,37);
  assert.equal(new Set(units.map(u=>u.id)).size,units.length);
  assert.equal(new Set(units.map(u=>u.projectId+'/'+u.code)).size,units.length);
  for(const unit of units) assert.ok(projects.some(p=>p.id===unit.projectId),unit.id);
  for(const project of projects) {
    assert.ok(project.inventoryAudit,project.id);
    assert.ok(project.inventoryAudit.reviewedAt);
    if(project.resolvedFields?.includes('inventoryAudit')) assert.equal(project.inventoryAudit.pending.length,0);
  }
  const audit = projects.map(p=>p.inventoryAudit);
  assert.equal(audit.reduce((n,a)=>n+a.areaCorrections,0),231);
  assert.equal(audit.reduce((n,a)=>n+a.addedUnits,0),79);
  assert.equal(projects.find(p=>p.id==='solana-2').inventoryAudit.status,'Cotejado');
  assert.equal(projects.find(p=>p.id==='mood-office').updatedAt,'2026-09-01');
  assert.equal(projects.find(p=>p.id==='bi-filum-herrera').resolvedFields.includes('inventoryAudit'),true);
  assert.equal(units.filter(u=>u.projectId==='insignia-07').length,34);
});

test('unknown area components are not silently treated as confirmed zero', () => {
  for(const u of units.filter(u=>['ventura','ventura-torre-1'].includes(u.projectId))) { assert.equal(u.ownM2,-1); assert.equal(u.balconyM2,-1); }
  assert.equal(units.find(u=>u.projectId==='ventura-hassler'&&u.code==='105').ownM2,78);
  for(const u of units.filter(u=>u.projectId==='mood-office')) assert.equal(Math.round((u.internalM2+u.balconyM2)*10),Math.round(u.totalM2*10));
  assert.equal(units.find(u=>u.projectId==='venire-villa-morra'&&u.code==='603').storageM2,undefined);
  assert.equal(units.find(u=>u.projectId==='insignia-09'&&u.code==='A04').patioM2,23.2);
  assert.equal(units.find(u=>u.projectId==='insignia-10'&&u.code==='B72').parking,2);
  assert.equal(units.find(u=>u.projectId==='insignia-10'&&u.code==='B72').totalM2,118.9);
});
