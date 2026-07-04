import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { eur, eur2, pct } from '../lib/format.js';

const C = {
  purple: '#24174C',
  purpleTint: '#F1EFF5',
  red: '#F02D6E',
  redTint: '#FCE6EE',
  white: '#FFFFFF',
  border: '#D9D4E3',
  ink: '#333F48',
};

// column flex weights (must match between header and body)
const F = { type: 1.75, cover: 1.15, benefit: 1.15, client: 3.1, combined: 1.25 };
const SUB = { annual: 1, res: 1.4, cost: 0.9 }; // within a client group

const s = StyleSheet.create({
  table: { borderWidth: 1, borderColor: C.border, borderRadius: 2 },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  hCell: {
    backgroundColor: C.purple, color: C.white, fontFamily: 'Open Sans', fontWeight: 600,
    fontSize: 6.5, paddingVertical: 5, paddingHorizontal: 4, textAlign: 'center',
    justifyContent: 'center', borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  hCellLeft: { textAlign: 'left', alignItems: 'flex-start' },
  clientName: {
    backgroundColor: C.purple, color: C.white, fontFamily: 'Open Sans', fontWeight: 700,
    fontSize: 8, textAlign: 'center', paddingVertical: 4,
    borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  sub: {
    backgroundColor: C.purple, color: C.white, fontFamily: 'Open Sans', fontWeight: 600,
    fontSize: 6.2, paddingVertical: 4, paddingHorizontal: 3, textAlign: 'center',
    borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  bCell: {
    fontFamily: 'Open Sans', fontWeight: 400, fontSize: 7.5, color: C.ink,
    paddingVertical: 5, paddingHorizontal: 4, textAlign: 'right', justifyContent: 'center',
    borderRightWidth: 1, borderColor: C.border,
  },
  bCellLeft: { textAlign: 'left' },
  typeCell: { fontFamily: 'Montserrat', fontWeight: 600, color: C.purple, fontSize: 7.5 },
  resCell: { backgroundColor: C.purpleTint, fontFamily: 'Open Sans', fontWeight: 600, color: C.purple },
  combCell: { fontFamily: 'Montserrat', fontWeight: 700, color: C.purple, backgroundColor: '#F6F5F9' },
  rowBorder: { borderBottomWidth: 1, borderColor: C.border },
  totalRow: { backgroundColor: C.white, borderTopWidth: 1.5, borderColor: C.purple },
  totalCell: { fontFamily: 'Montserrat', fontWeight: 700, color: C.purple, fontSize: 8 },
  figures: { marginTop: 12, flexDirection: 'column', gap: 6 },
  figureRow: { flexDirection: 'row', alignItems: 'center' },
  figureLabel: { fontFamily: 'Montserrat', fontWeight: 600, fontSize: 8.5, color: C.purple, flexGrow: 1 },
  figureValue: {
    fontFamily: 'Montserrat', fontWeight: 700, fontSize: 9.5, color: C.purple,
    backgroundColor: C.purpleTint, paddingVertical: 3, paddingHorizontal: 12, borderRadius: 2,
  },
  note: { marginTop: 10, fontFamily: 'Open Sans', fontWeight: 400, fontSize: 6, color: '#7C6992', lineHeight: 1.4 },
  titleBand: {
    backgroundColor: C.purple, paddingVertical: 6, paddingHorizontal: 10,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
  },
  titleText: { fontFamily: 'Montserrat', fontWeight: 700, fontSize: 10, color: C.white, textAlign: 'center' },
});

// one client's 3 sub-cells for a body row
function ClientBodyCells({ cell, isIP, resExtra }) {
  return (
    <View style={{ flexBasis: 0, flexGrow: F.client, flexDirection: 'row' }}>
      <Text style={[s.bCell, { flexBasis: 0, flexGrow: SUB.annual }]}>{isIP ? eur(cell.annual) : ''}</Text>
      <Text style={[s.bCell, s.resCell, resExtra, { flexBasis: 0, flexGrow: SUB.res }]}>{eur(cell.res)}</Text>
      <Text style={[s.bCell, { flexBasis: 0, flexGrow: SUB.cost }]}>{isIP ? eur2(cell.cost) : ''}</Text>
    </View>
  );
}

function ClientHeader({ name }) {
  return (
    <View style={{ flexBasis: 0, flexGrow: F.client, flexDirection: 'column' }}>
      <Text style={s.clientName}>{name}</Text>
      <View style={{ flexDirection: 'row' }}>
        <Text style={[s.sub, { flexBasis: 0, flexGrow: SUB.annual }]}>Annual Cover</Text>
        <Text style={[s.sub, { flexBasis: 0, flexGrow: SUB.res }]}>Financial Resilience Value</Text>
        <Text style={[s.sub, { flexBasis: 0, flexGrow: SUB.cost }]}>Net Cost</Text>
      </View>
    </View>
  );
}

export default function ResilienceTablePdf({ shape, names, accent = 'purple', title }) {
  const two = shape.two;
  const redAccent = accent === 'red';
  const figureValueStyle = redAccent
    ? [s.figureValue, { color: C.red, backgroundColor: C.redTint }]
    : s.figureValue;

  return (
    <View wrap={false}>
      {title && (
        <View style={[s.titleBand, redAccent && { backgroundColor: C.red }]}>
          <Text style={s.titleText}>{title}</Text>
        </View>
      )}
      <View style={s.table}>
        {/* header */}
        <View style={[s.row]}>
          <Text style={[s.hCell, s.hCellLeft, { flexBasis: 0, flexGrow: F.type }]}>Financial Protection Type</Text>
          <Text style={[s.hCell, { flexBasis: 0, flexGrow: F.cover }]}>Cover Until</Text>
          <Text style={[s.hCell, { flexBasis: 0, flexGrow: F.benefit }]}>Benefit</Text>
          <ClientHeader name={names[0]} />
          {two && <ClientHeader name={names[1]} />}
          <View style={{ flexBasis: 0, flexGrow: F.combined, flexDirection: 'column' }}>
            <Text style={[s.clientName, { fontWeight: 600, fontSize: 6.8 }]}>Combined Premium</Text>
            <Text style={[s.sub, { borderRightWidth: 0 }]}>Total Net monthly Cost</Text>
          </View>
        </View>

        {/* body rows */}
        {shape.rows.map((r) => {
          const isIP = r.key === 'ip';
          return (
            <View key={r.key} style={[s.row, s.rowBorder]} wrap={false}>
              <Text style={[s.bCell, s.bCellLeft, s.typeCell, { flexBasis: 0, flexGrow: F.type }]}>{r.type}</Text>
              <Text style={[s.bCell, s.bCellLeft, { flexBasis: 0, flexGrow: F.cover }]}>
                {r.coverLabel} {r.coverValue ?? '—'}
              </Text>
              <Text style={[s.bCell, s.bCellLeft, { flexBasis: 0, flexGrow: F.benefit }]}>{r.benefit}</Text>
              <ClientBodyCells cell={r.cells[0]} isIP={isIP} />
              {two && <ClientBodyCells cell={r.cells[1]} isIP={isIP} />}
              <Text style={[s.bCell, s.combCell, { flexBasis: 0, flexGrow: F.combined, borderRightWidth: 0 }]}>
                {eur2(r.combined)}
              </Text>
            </View>
          );
        })}

        {/* total row */}
        <View style={[s.row, s.totalRow]} wrap={false}>
          <Text style={[s.bCell, s.bCellLeft, s.totalCell, { flexBasis: 0, flexGrow: F.type + F.cover + F.benefit }]}>Total</Text>
          <View style={{ flexBasis: 0, flexGrow: F.client, flexDirection: 'row' }}>
            <Text style={[s.bCell, { flexBasis: 0, flexGrow: SUB.annual }]}></Text>
            <Text style={[s.bCell, s.totalCell, { flexBasis: 0, flexGrow: SUB.res }]}>{eur(shape.totalsPerClient[0])}</Text>
            <Text style={[s.bCell, { flexBasis: 0, flexGrow: SUB.cost }]}></Text>
          </View>
          {two && (
            <View style={{ flexBasis: 0, flexGrow: F.client, flexDirection: 'row' }}>
              <Text style={[s.bCell, { flexBasis: 0, flexGrow: SUB.annual }]}></Text>
              <Text style={[s.bCell, s.totalCell, { flexBasis: 0, flexGrow: SUB.res }]}>{eur(shape.totalsPerClient[1])}</Text>
              <Text style={[s.bCell, { flexBasis: 0, flexGrow: SUB.cost }]}></Text>
            </View>
          )}
          <Text style={[s.bCell, s.totalCell, { flexBasis: 0, flexGrow: F.combined, borderRightWidth: 0 }]}>
            {eur2(shape.totalCombined)}
          </Text>
        </View>
      </View>

      {/* figures below the table */}
      <View style={s.figures}>
        <View style={s.figureRow}>
          <Text style={s.figureLabel}>Combined Household Financial Resilience Value</Text>
          <Text style={figureValueStyle}>{eur(shape.combinedHousehold)}</Text>
        </View>
        <View style={s.figureRow}>
          <Text style={s.figureLabel}>Actual premium cost as a % of net take home income</Text>
          <Text style={s.figureValue}>{pct(shape.premiumPctNet, 2)}</Text>
        </View>
      </View>

      <Text style={s.note}>
        *Any premiums quoted are indicative for the purposes of illustration only. Premiums are subject to a
        completed application form and the provider may require additional health screening information. This
        further information and assessment may increase the cost of cover.
      </Text>
    </View>
  );
}
