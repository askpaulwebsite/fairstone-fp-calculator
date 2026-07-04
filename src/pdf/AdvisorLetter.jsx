import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { registerFonts } from './registerFonts.js';
import ResilienceTablePdf from './ResilienceTablePdf.jsx';
import logoUrl from '../assets/fairstone-logo-white.png?url';

registerFonts();

const C = { purple: '#24174C', red: '#F02D6E', ink: '#333F48', muted: '#7C6992', white: '#FFFFFF' };

const s = StyleSheet.create({
  page: {
    paddingTop: 92, paddingBottom: 58, paddingHorizontal: 46,
    fontFamily: 'Open Sans', fontSize: 9.5, color: C.ink, lineHeight: 1.5,
  },
  headerBand: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: C.purple, height: 66,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 46,
  },
  logo: { width: 132, height: 53, objectFit: 'contain' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 44,
    paddingHorizontal: 46, paddingTop: 10,
    borderTopWidth: 1, borderColor: '#E4E0EC',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: 'Open Sans', fontSize: 6.5, color: C.muted },

  title: { fontFamily: 'Montserrat', fontWeight: 700, fontSize: 14, color: C.purple, marginBottom: 6 },
  subline: { fontFamily: 'Montserrat', fontWeight: 600, fontSize: 9.5, color: C.purple },
  meta: { fontFamily: 'Open Sans', fontSize: 8.5, color: C.muted, marginBottom: 14 },
  greeting: { marginBottom: 8, fontWeight: 600, fontFamily: 'Open Sans' },
  p: { marginBottom: 8, textAlign: 'justify' },
  h2: { fontFamily: 'Montserrat', fontWeight: 700, fontSize: 11, color: C.purple, marginTop: 14, marginBottom: 6 },
  tableWrap: { marginVertical: 10 },
  signLine: { marginTop: 18 },
  signRule: { fontFamily: 'Open Sans', color: C.ink, marginTop: 16 },
  signName: { fontFamily: 'Montserrat', fontWeight: 600, color: C.purple, marginTop: 2 },
});

const f = (v, ph) => (v && String(v).trim() ? String(v).trim() : ph);

function HeaderFooter() {
  return (
    <>
      <View style={s.headerBand} fixed>
        <Image style={s.logo} src={logoUrl} />
      </View>
      <View style={s.footer} fixed>
        <Text style={s.footerText}>
          Fairstone Ireland · Financial Protection Consultation Summary
        </Text>
        <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
      </View>
    </>
  );
}

export default function AdvisorLetter({ variant, data }) {
  const { letter, recommended, revised, names } = data;
  const lower = variant === 'lower';

  const clientNames = f(letter.clientNames, 'Client Name(s)');
  const advisorName = f(letter.advisorName, 'Advisor Name');
  const via = f(letter.consultationVia, 'MS Teams / Location');
  const date = f(letter.consultationDate, '(Date)');
  const day = f(letter.nextMeetingDay, '(day)');
  const time = f(letter.nextMeetingTime, '(time)');

  const nextStepsFirst = lower
    ? `I will prepare and send you a formal Statement of Suitability, along with the relevant quotations and supporting documentation for your chosen level of cover ahead of our next meeting on ${day} at ${time}, where I will be happy to address any questions.`
    : `I will prepare and send you a formal Statement of Suitability, along with the relevant quotations and supporting documentation, ahead of our next meeting on ${day} at ${time}, where I will be happy to address any questions.`;

  return (
    <Document title="Financial Protection Consultation Summary" author="Fairstone Ireland">
      <Page size="A4" style={s.page}>
        <HeaderFooter />

        <Text style={s.title}>Financial Protection Consultation Summary &amp; Next Steps</Text>
        <Text style={s.subline}>{clientNames} with {advisorName}</Text>
        <Text style={s.meta}>Consultation held via {via} on {date}</Text>

        <Text style={s.greeting}>Dear {clientNames},</Text>

        <Text style={s.p}>
          Thank you for taking the time to meet with me today. I hope you found our discussion beneficial and that
          it provided clarity around your financial protection needs and overall financial resilience.
        </Text>
        <Text style={s.p}>
          As discussed, based on the information gathered during our review, we have identified a minimum
          recommended level of protection to help safeguard your financial goals and objectives. A summary of this
          recommendation is outlined below:
        </Text>

        <View style={s.tableWrap}>
          <ResilienceTablePdf shape={recommended} names={names} accent="purple" title="Financial Resilience Strategy" />
        </View>

        {lower && (
          <>
            <Text style={s.p}>
              Following our discussion, you have advised that you wish to proceed with a lower level of cover at
              this time. A summary of the cover you have chosen to proceed with is outlined below:
            </Text>
            <View style={s.tableWrap}>
              <ResilienceTablePdf shape={revised} names={names} accent="red" title="Revised Financial Resilience Strategy" />
            </View>
            <Text style={s.p}>
              While we respect your decision, it is important to note that the level of cover selected may not fully
              address all of the protection needs identified during our review. We would recommend reviewing your
              protection arrangements on at least an annual basis, or sooner should your circumstances change, to
              ensure your cover remains appropriate.
            </Text>
          </>
        )}

        <Text style={s.h2}>Next Steps</Text>
        <Text style={s.p}>{nextStepsFirst}</Text>
        <Text style={s.p}>
          In the meantime, please review the documentation and let me know if anything requires clarification.
        </Text>
        <Text style={s.p}>
          Following this, I will arrange for the application documentation and any required medical questionnaires
          to be issued to you electronically. Your application will then be subject to medical underwriting and we
          will keep you informed throughout and will update you once a decision has been made.
        </Text>
        <Text style={s.p}>
          In the meantime, if you have any questions, please do not hesitate to contact me.
        </Text>

        <View style={s.signLine}>
          <Text>Kind regards,</Text>
          <Text style={s.signRule}>___________________</Text>
          <Text style={s.signName}>{advisorName}</Text>
        </View>
      </Page>
    </Document>
  );
}
