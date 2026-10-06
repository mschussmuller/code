import { readFileSync } from 'node:fs';

const num = value => value === '-' ? 0 : Number(value);
const usd = value => Number(value.replaceAll(',', ''));
const latin = value => Number(value.replaceAll('.', '').replace(',', '.'));
export function parseAuditSource(id) {
  const text = readFileSync(new URL(`./fixtures/audit/${id}.txt`, import.meta.url), 'utf8');
  const rows = [];
  const add = (code, available, fields, raw) => rows.push({ code, available, ...fields, raw });
  if (/^(insignia-|terra-02|city-02)/.test(id)) {
    for (const line of text.split('\n').filter(l => /^(?:\d+ )?(TORRE|BLOQUE) /.test(l))) {
      const identity = line.match(/^(?:\d+ )?(?:TORRE|BLOQUE) ([A-D]) (?:(PB|\d+) )?[A-D]\s*(\d+) (.+)$/);
      if (!identity) throw Error(line);
      const [, tower, floor, number, tail] = identity;
      if (id === 'insignia-10') {
        const m = tail.match(/^(.*?) ([123]) ([\d.]+) ([\d.]+) ([\d.]+) (Vendido|[\d,]+)$/);
        if (!m) throw Error(line);
        const type = m[1].match(/[123] dormitorio.*$/)[0];
        add(tower + number, m[6] !== 'Vendido', { floor, type, bedrooms: Number(type[0]), currency: 'USD', price: m[6] === 'Vendido' ? null : usd(m[6]), parking: num(m[2]), parkingM2: num(m[3]), ownM2: num(m[4]), totalM2: num(m[4]), commonM2: num(m[5]), areaLabel: 'de departamento' }, line);
        continue;
      }
      const match = tail.match(/^(.*?) (\d) ([\d.-]+) ([\d.]+) ([\d.-]+) ([\d.-]+)(.*?) (Vendido|[\d,]+)$/);
      if (!match) throw Error(line);
      const [, desc, parking, parkingArea, own, fourth, fifth, extra, price] = match;
      const type = desc.replace(/^(Frente|Atrás|atrás|frente|Medio|Quinta|Este|Oeste)\s+/, '').replace(/\s+X$/, '');
      add(tower + number, price !== 'Vendido', {
        floor: floor ?? (number.startsWith('0') ? 'PB' : number.slice(0, -1)),
        type, bedrooms: /Mono/i.test(type) ? 0 : Number(type.match(/\d/)?.[0]),
        currency: 'USD', price: price === 'Vendido' ? null : usd(price),
        ownM2: num(own), totalM2: num(own), commonM2: num(fifth), patioM2: num(fourth),
        parkingM2: parkingArea === '-' ? undefined : num(parkingArea), parking: Number(parking),
        areaLabel: 'de departamento'
      }, line);
    }
  } else if (id === 'solana-2') {
    for (const line of text.split('\n').filter(l => /^P\d/.test(l) && / \d{3} [\d.]+ (Libre|Vendido|Reservado)/.test(l))) {
      const m = line.match(/^P(\d+) (.+?) (\d{3}) ([\d.]+) (Libre|Vendido|Reservado)(.*)$/);
      if (!m) throw Error(line);
      const values = m[6].trim().split(/\s+/);
      add(m[3], m[5] === 'Libre', { ownM2: num(m[4]), totalM2: num(m[4]), price: m[5] === 'Libre' ? usd(values[1]) : null, currency: 'USD', areaLabel: 'propios' }, line);
    }
  } else if (id === 'narciso') {
    for (const line of text.split('\n').filter(l => /^\d+ \d{3,4} (Mono|[123]D)/.test(l))) {
      const m = line.match(/^(\d+) (\d{3,4}) (.+?) ([\d,]+) (.+?) ([\d.-]+) (Libre|Vendido|Reservado)(.*)$/);
      if (!m) throw Error(line);
      add(m[2], m[7] === 'Libre', { ownM2: latin(m[4]), totalM2: latin(m[4]), price: m[7] === 'Libre' ? latin(m[6]) : null, currency: 'USD', areaLabel: 'propios' }, line);
    }
  } else if (id === 'mood-office') {
    for (const section of text.split(/Piso /).slice(1)) {
      const floor = section.match(/^\d+/)[0];
      const regex = /([A-H]) (Frente|Contrafrente) (\d) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) \$([\d,]+) \$[\d,]+ (Disponible|RESERVADO)/g;
      for (const m of section.matchAll(regex)) add(floor + m[1], m[10] === 'Disponible', { price: usd(m[9]), currency: 'USD', ownM2: num(m[6]), internalM2: num(m[4]), balconyM2: num(m[5]), totalM2: num(m[6]), parkingM2: num(m[7]), parking: num(m[3]), areaLabel: 'de oficina con balcón' }, m[0]);
    }
  } else if (id === 'venire-villa-morra') {
    for (const line of text.split('\n').filter(l => /^Venire Villa Morra \d/.test(l))) {
      const m = line.match(/^Venire Villa Morra (\d+) (\d+) (.+?) (mono|[123] dor) ([\d.]+) (.+)$/);
      if (!m) throw Error(line);
      const available = /Disponible$/.test(line) && !/REVENTA/.test(line);
      const values = m[6].split(/\s+/);
      const fields = { totalM2: num(m[5]), ownM2: num(m[5]), currency: 'PYG', price: available ? usd(values.at(-2)) : null, areaLabel: 'de departamento' };
      if (available) {
        fields.parkingM2 = num(values[0]); fields.parking = num(values[0])/12.5;
        if(values.length === 5) fields.storageM2 = num(values[1]);
      }
      add(m[1], available, fields, line);
    }
  } else if (id === 'venire') {
    for (const line of text.split('\n').filter(l => /^\d+ \d{3} /.test(l))) {
      const m = line.match(/^(\d+) (\d+) (mono|[123] dor) ([\d.]+) ([\d.]+) ([\d.]+) (.*)$/);
      if (!m) throw Error(line);
      const available = /Disponible/.test(line);
      add(m[2], available, { totalM2: num(m[4]), ownM2: num(m[5]), balconyM2: num(m[6]), currency: 'USD', price: available ? usd(m[7].match(/([\d,]+) \$/)[1]) : null, areaLabel: 'con balcón' }, line);
    }
  } else if (id.startsWith('ventura')) {
    const tower = id !== 'ventura-hassler';
    for (const line of text.split('\n').filter(l => /^\d+ \d+ /.test(l))) {
      const m = line.match(tower ? /^(\d+) \d (\d+) ([123]) dor (.+?) ([\d.]+) (.*)$/ : /^(\d+) (\d+) ([123]) dor ([\d.]+) \d (.*)$/);
      if (!m) throw Error(line);
      const tail = m[tower ? 6 : 5];
      const available = /Disponible/.test(tail);
      const price = tail.match(/[\d][\d,]*(?:\.\d{2})?/);
      add(m[2], available, { totalM2: num(m[tower ? 5 : 4]), currency: tower ? 'PYG' : 'USD', price: available ? usd(price[0]) : null, areaLabel: 'totales según lista' }, line);
    }
  } else if (id === 'r5-las-lomas') {
    for (const line of text.split('\n').filter(l => /^\d{3} Departamento/.test(l))) {
      const m = line.match(/^(\d+) Departamento 1 DORMITORIO TIPO ([A-F]) ([\d,]+)(?: \$([\d.]+) DISPONIBLE)?$/);
      if(!m) throw Error(line);
      add(m[1], Boolean(m[4]), { totalM2: latin(m[3]), currency: 'USD', price: m[4] ? latin(m[4]) : null, areaLabel: 'según lista' }, line);
    }
  }
  return rows;
}
