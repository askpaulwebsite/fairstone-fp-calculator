import { useState, createElement } from 'react';
import { useCalc } from '../state/CalculatorContext.jsx';
import { shapeResilience } from '../lib/calc.js';
import { Card, Field } from '../components/ui.jsx';

export default function AdvisorDocuments() {
  const { inputs, derived, setField } = useCalc();
  const [busy, setBusy] = useState(null); // 'recommended' | 'lower' | null
  const [error, setError] = useState('');
  const L = inputs.letter;
  const two = inputs.hasSecondHolder;

  const setL = (key, v) => setField(['letter', key], v);

  async function download(variant) {
    setBusy(variant);
    setError('');
    try {
      const [{ downloadPdf }, { default: AdvisorLetter }] = await Promise.all([
        import('../pdf/downloadLetter.js'),
        import('../pdf/AdvisorLetter.jsx'),
      ]);
      const data = {
        letter: inputs.letter,
        names: [inputs.holders[0].name || 'Client 1', inputs.holders[1].name || 'Client 2'],
        recommended: shapeResilience(derived.resilience, two),
        revised: shapeResilience(derived.revisedResilience, two),
      };
      // Preserve accented letters (fadas are common in Irish names); only strip
      // characters that are actually illegal in filenames.
      const base = ((L.clientNames || '')
        .normalize('NFC')
        .replace(/[\\/:*?"<>|]+/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')) || 'Client';
      const fileName =
        variant === 'recommended'
          ? `Fairstone-${base}-Recommended-Cover.pdf`
          : `Fairstone-${base}-Lower-Than-Recommended-Cover.pdf`;
      await downloadPdf(createElement(AdvisorLetter, { variant, data }), fileName);
    } catch (err) {
      console.error('PDF generation failed', err);
      setError('Sorry, the document could not be generated. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Advisor Documents</h1>
        <p>Personalise the letter, then download the client-ready PDF for the chosen scenario.</p>
      </div>

      <Card title="Letter details">
        <div className="grid-2">
          <Field label="Client name(s)">
            <input className="input" value={L.clientNames} placeholder="e.g. Kate & Jack Murphy"
              onChange={(e) => setL('clientNames', e.target.value)} />
          </Field>
          <Field label="Advisor name">
            <input className="input" value={L.advisorName} placeholder="e.g. John Smith"
              onChange={(e) => setL('advisorName', e.target.value)} />
          </Field>
          <Field label="Consultation held via">
            <input className="input" value={L.consultationVia} placeholder="MS Teams / Location"
              onChange={(e) => setL('consultationVia', e.target.value)} />
          </Field>
          <Field label="Consultation date">
            <input className="input" value={L.consultationDate} placeholder="e.g. 3 July 2026"
              onChange={(e) => setL('consultationDate', e.target.value)} />
          </Field>
          <Field label="Next meeting day">
            <input className="input" value={L.nextMeetingDay} placeholder="e.g. Tuesday 15 July"
              onChange={(e) => setL('nextMeetingDay', e.target.value)} />
          </Field>
          <Field label="Next meeting time">
            <input className="input" value={L.nextMeetingTime} placeholder="e.g. 2:00pm"
              onChange={(e) => setL('nextMeetingTime', e.target.value)} />
          </Field>
        </div>
        <p className="card__subtitle" style={{ margin: '14px 0 0' }}>
          Blank fields appear as placeholders (e.g. “(Date)”) in the PDF, matching the Word templates.
        </p>
      </Card>

      <div className="grid-2">
        <Card title="Proceeding with recommended cover" accent>
          <p style={{ fontSize: 13, color: 'var(--color-slate)', marginTop: 0 }}>
            Letter confirming the client is proceeding with the full <strong>recommended</strong> level of cover.
            Includes the Financial Resilience Strategy summary.
          </p>
          <button className="doc-btn" disabled={busy !== null} onClick={() => download('recommended')}>
            {busy === 'recommended' ? 'Generating…' : '⬇ Download recommended-cover PDF'}
          </button>
        </Card>

        <Card title="Proceeding lower than recommended">
          <p style={{ fontSize: 13, color: 'var(--color-slate)', marginTop: 0 }}>
            Letter for a client proceeding with a <strong>lower</strong> level of cover. Includes both the
            recommended and the <span style={{ color: 'var(--color-pink)', fontWeight: 600 }}>Revised</span> strategy tables.
          </p>
          <button className="doc-btn doc-btn--red" disabled={busy !== null} onClick={() => download('lower')}>
            {busy === 'lower' ? 'Generating…' : '⬇ Download lower-than-recommended PDF'}
          </button>
        </Card>
      </div>

      {error && <p style={{ color: 'var(--color-pink)', fontSize: 13 }}>{error}</p>}

      <p className="note">
        The PDF uses the same wording as the Fairstone Word templates and embeds the live Financial Resilience
        Strategy figures. Fill in the Revised Resilience Strategy tab first to set the lower cover amounts.
      </p>
    </>
  );
}
