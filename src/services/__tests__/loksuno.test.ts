import { describe, it, expect } from 'vitest';
import { detectLanguage, classifyComplaint } from '../classifier';
import { calculateUrgency } from '../urgency';
import { generateDraftReply } from '../draftReplies';
import { parseCSVLines, parseBatchInput } from '../csvParser';

describe('JanAwaaz Core Engines', () => {

  describe('Language Detection', () => {
    it('detects Gujarati script accurately', () => {
      const res = detectLanguage('લિફ્ટમાં ફસાઈ ગયા છીએ મદદ કરો');
      expect(res.language).toBe('Gujarati');
      expect(res.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('detects Hindi Devanagari script accurately', () => {
      const res = detectLanguage('प्लेटफॉर्म पर धुआं और आग दिखाई दे रही है');
      expect(res.language).toBe('Hindi');
      expect(res.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('detects Romanized Gujlish accurately', () => {
      const res = detectLanguage('Lift bandh che ane staff nathi aavya');
      expect(res.language).toBe('Gujlish/Hinglish');
    });

    it('detects English text accurately', () => {
      const res = detectLanguage('The ticket vending machine at Infocity did not return my change');
      expect(res.language).toBe('English');
    });
  });

  describe('Department Classification', () => {
    it('classifies electrical fire/smoke as Safety', () => {
      const res = classifyComplaint('Electrical sparks and smoke from the coach ceiling');
      expect(res.department).toBe('Safety');
    });

    it('classifies Gujarati lift trapped as Safety emergency', () => {
      const res = classifyComplaint('લિફ્ટમાં ૪ મુસાફરો ફસાઈ ગયા છે');
      expect(res.department).toBe('Safety');
    });

    it('classifies accessibility barriers as Lifts & Accessibility', () => {
      const res = classifyComplaint('Wheelchair ramp is blocked and elevator is out of service');
      expect(res.department).toBe('Lifts & Accessibility');
    });

    it('classifies cleanliness issues accurately', () => {
      const res = classifyComplaint('ગંદકી અને પાનની પીચકારી સીડી પર છે');
      expect(res.department).toBe('Cleanliness');
    });

    it('classifies ticket and fare issues accurately', () => {
      const res = classifyComplaint('Account ma thi paise kapai gaya pan recharge na thayo');
      expect(res.department).toBe('Fare & Ticketing');
    });

    it('classifies staff misbehaviour accurately', () => {
      const res = classifyComplaint('Security guard pushed passenger and behaved aggressively');
      expect(res.department).toBe('Staff Behaviour');
    });

    it('routes ambiguous text to Other / Needs Review', () => {
      const res = classifyComplaint('Hello metro');
      expect(res.department).toBe('Other / Needs Review');
      expect(res.isAmbiguous).toBe(true);
    });
  });

  describe('Explainable Urgency Scoring', () => {
    it('escalates fire/smoke to critical urgency tier (>= 85)', () => {
      const evaluation = calculateUrgency('Heavy smoke and fire near platform', 'Safety', 'Infocity');
      expect(evaluation.score).toBeGreaterThanOrEqual(85);
      expect(evaluation.tier).toBe('CRITICAL');
      expect(evaluation.reasons.some(r => r.toLowerCase().includes('fire'))).toBe(true);
    });

    it('escalates trapped lift passenger to critical tier', () => {
      const evaluation = calculateUrgency('લિફ્ટમાં મુસાફરો ફસાયા છે', 'Safety', 'GIFT City');
      expect(evaluation.score).toBeGreaterThanOrEqual(85);
      expect(evaluation.tier).toBe('CRITICAL');
      expect(evaluation.reasons.length).toBeGreaterThan(0);
    });

    it('caps routine cleanliness reports at moderate score (<= 35)', () => {
      const evaluation = calculateUrgency('Litter on platform near dustbin', 'Cleanliness', 'Raysan');
      expect(evaluation.score).toBeLessThanOrEqual(35);
      expect(evaluation.tier).toBe('ROUTINE');
      expect(evaluation.reasons).toContain('Routine sanitation / housekeeping report');
    });

    it('detects repeated issues at the same station and department', () => {
      const mockExisting: any[] = [
        { id: '1', station: 'Infocity', department: 'Fare & Ticketing', status: 'Open' },
        { id: '2', station: 'Infocity', department: 'Fare & Ticketing', status: 'In Progress' }
      ];
      const evaluation = calculateUrgency('Ticket machine error', 'Fare & Ticketing', 'Infocity', mockExisting);
      expect(evaluation.isDuplicateOrRelated).toBe(true);
      expect(evaluation.reasons.some(r => r.includes('Repeated issue alert'))).toBe(true);
    });
  });

  describe('Language-Aware Draft Replies', () => {
    it('generates Gujarati response for Gujarati safety complaint', () => {
      const draft = generateDraftReply('Safety', 'Gujarati', 90, 'GIFT City', 'LS-001');
      expect(draft.language).toBe('Gujarati');
      expect(draft.text).toContain('આદરણીય મુસાફર');
      expect(draft.text).toContain('GIFT City');
      expect(draft.text).toContain('LS-001');
    });

    it('generates Hindi response for Hindi complaint', () => {
      const draft = generateDraftReply('Fare & Ticketing', 'Hindi', 45, 'Sachivalaya', 'LS-002');
      expect(draft.language).toBe('Hindi');
      expect(draft.text).toContain('प्रिय यात्री');
      expect(draft.text).toContain('Sachivalaya');
      expect(draft.text).toContain('LS-002');
    });

    it('generates English response fallback', () => {
      const draft = generateDraftReply('Cleanliness', 'English', 30, 'Infocity', 'LS-003');
      expect(draft.language).toBe('English');
      expect(draft.text).toContain('Dear Passenger');
      expect(draft.text).toContain('Infocity');
    });
  });

  describe('CSV Handling', () => {
    it('parses CSV lines with quotes and commas safely', () => {
      const csv = 'id,station,text\n1,Infocity,"Heavy smoke, call fire brigade"\n2,Raysan,Cleanliness feedback';
      const lines = parseCSVLines(csv);
      expect(lines.length).toBe(3);
      expect(lines[1][2]).toBe('Heavy smoke, call fire brigade');
    });

    it('parses batch input and detects validity', () => {
      const raw = 'feedback_text_synthetic,station\nSparks on track,Sector-1\n';
      const parsed = parseBatchInput(raw);
      expect(parsed.length).toBe(1);
      expect(parsed[0].isValid).toBe(true);
      expect(parsed[0].station).toBe('Sector-1');
      expect(parsed[0].predictedDepartment).toBe('Safety');
    });
  });
});
