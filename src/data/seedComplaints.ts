import { Complaint } from '../types';
import { classifyComplaint } from '../services/classifier';
import { calculateUrgency } from '../services/urgency';
import { generateDraftReply } from '../services/draftReplies';

interface RawSeedItem {
  id: string;
  referenceId: string;
  source: Complaint['source'];
  station: string;
  dateTime: string;
  rawText: string;
  status: Complaint['status'];
}

const RAW_SEEDS: RawSeedItem[] = [
  // 1. CRITICAL SAFETY - Fire / Sparking (English)
  {
    id: 'LS-2026-001',
    referenceId: 'APP-9821',
    source: 'App',
    station: 'Infocity',
    dateTime: '2026-10-10T09:14:00Z',
    rawText: 'Urgent! Heavy electrical sparking and smoke coming from the power distribution box on Platform 2 near Coach 3 marker! Sparks flying near waiting passengers.',
    status: 'Open'
  },
  // 2. CRITICAL SAFETY - Trapped in lift (Gujarati Script)
  {
    id: 'LS-2026-002',
    referenceId: 'SOC-4412',
    source: 'Social Media',
    station: 'GIFT City',
    dateTime: '2026-10-10T09:28:00Z',
    rawText: 'તાત્કાલિક મદદ કરો! ગિફ્ટ સિટી સ્ટેશન પર કોન્કોર્સ લિફ્ટ અટકી ગઈ છે અને અંદર ૪ મુસાફરો ફસાયા છે. અંદર ગૂંગળામણ થઈ રહી છે, પંખો પણ બંધ છે!',
    status: 'Escalated'
  },
  // 3. CRITICAL SAFETY - Trapped in lift (Hindi Script)
  {
    id: 'LS-2026-003',
    referenceId: 'PAPER-109',
    source: 'Paper Form',
    station: 'Sachivalaya',
    dateTime: '2026-10-10T10:02:00Z',
    rawText: 'गेट नंबर 2 की लिफ्ट में अचानक बिजली गुल होने से 2 लोग अंदर फंस गए हैं। अलार्म बटन काम नहीं कर रहा है, तुरंत तकनीकी दल भेजें।',
    status: 'Open'
  },
  // 4. CRITICAL SAFETY - Bare Wire / Shock hazard (Gujlish)
  {
    id: 'LS-2026-004',
    referenceId: 'APP-9844',
    source: 'App',
    station: 'PDEU',
    dateTime: '2026-10-10T10:15:00Z',
    rawText: 'Platform par open bare wire che short circuit thai che. Chhokro bachiyo electric current lagta. Please switch off power immediately!',
    status: 'In Progress'
  },
  // 5. HIGH - Accessibility barrier with Wheelchair (Gujarati Script)
  {
    id: 'LS-2026-005',
    referenceId: 'EMAIL-5501',
    source: 'Email',
    station: 'Sector-10A',
    dateTime: '2026-10-10T10:45:00Z',
    rawText: 'મારા વૃદ્ધ પિતા વ્હીલચેરમાં છે અને સેક્ટર-૧૦A સ્ટેશન પર લિફ્ટ બંધ હોવાથી અમે પ્લેટફોર્મ પર પહોંચી શકતા નથી. રેમ્પ પણ સાંકડો છે.',
    status: 'Open'
  },
  // 6. HIGH - Accessibility Barrier (English)
  {
    id: 'LS-2026-006',
    referenceId: 'APP-9870',
    source: 'App',
    station: 'Sector-24',
    dateTime: '2026-10-10T11:05:00Z',
    rawText: 'Elevator at South concourse has been out of service all morning. A visually impaired passenger was struggling without staff assistance near the stairs.',
    status: 'Open'
  },
  // 7. MEDIUM - Fare deduction glitch (Gujlish)
  {
    id: 'LS-2026-007',
    referenceId: 'APP-9902',
    source: 'App',
    station: 'Raysan',
    dateTime: '2026-10-10T11:20:00Z',
    rawText: 'Raysan station par metro card recharge karyu Rs 200 UPI thi. Account ma thi paise kapai gaya pan smart card ma balance nathi aavyu. Refund apo.',
    status: 'In Progress'
  },
  // 8. MEDIUM - Fare gate error (Hindi Script)
  {
    id: 'LS-2026-008',
    referenceId: 'APP-9915',
    source: 'App',
    station: 'Juna Koba',
    dateTime: '2026-10-10T11:40:00Z',
    rawText: 'ऑटोमैटिक फेयर गेट पर टोकन डाला तो टोकन अंदर फंस गया और गेट नहीं खुला। दोबारा टोकन खरीदना पड़ा। टिकट काउंटर ने पैसे वापस नहीं किए।',
    status: 'Open'
  },
  // 9. MEDIUM - Staff Misbehaviour (Hindi Script)
  {
    id: 'LS-2026-009',
    referenceId: 'SOC-4458',
    source: 'Social Media',
    station: 'Dholakuva Circle',
    dateTime: '2026-10-10T12:05:00Z',
    rawText: 'टिकट काउंटर पर क्लर्क बहुत बदतमीजी से बात कर रहा था। बुजुर्ग महिला को चिल्ला कर लाइन से हटने को कहा। ऐसा अशोभनीय व्यवहार बंद होना चाहिए।',
    status: 'Open'
  },
  // 10. MEDIUM - Staff Behaviour (Gujlish)
  {
    id: 'LS-2026-010',
    referenceId: 'APP-9930',
    source: 'App',
    station: 'Koba Circle',
    dateTime: '2026-10-10T12:30:00Z',
    rawText: 'Security guard entrance gate par bohot rude bolyo ane passenger no bag feki didho inspection na naame. Staff kharab vyavhar kare che.',
    status: 'Open'
  },
  // 11. ROUTINE - Cleanliness / Paan spit (Gujarati Script)
  {
    id: 'LS-2026-011',
    referenceId: 'APP-9942',
    source: 'App',
    station: 'Juna Sachivalaya',
    dateTime: '2026-10-10T13:00:00Z',
    rawText: 'સ્ટેશનના સીડી પાસે કોઈએ પાનની પીચકારી મારી છે અને ડસ્ટબિન કચરાથી ભરાઈ ગયેલ છે. હાઉસકીપિંગ ટીમને મોકલો.',
    status: 'Resolved'
  },
  // 12. ROUTINE - Cleanliness (English)
  {
    id: 'LS-2026-012',
    referenceId: 'EMAIL-5540',
    source: 'Email',
    station: 'Vishwakarma College',
    dateTime: '2026-10-10T13:25:00Z',
    rawText: 'Water cooler near gate 1 has minor leakage resulting in wet slippery floor tiles. Requesting mopping and maintenance.',
    status: 'Open'
  },
  // 13. ROUTINE - Feedback / Ambiguous (English)
  {
    id: 'LS-2026-013',
    referenceId: 'DEMO-FB-001',
    source: 'App',
    station: 'Juna Koba',
    dateTime: '2026-10-10T13:50:00Z',
    rawText: 'Could not easily identify the nearest bus feeder connection outside exit gate 2. Suggesting better route maps.',
    status: 'Open'
  },
  // 14. ROUTINE - Ambiguous / Needs Review (Hindi Script)
  {
    id: 'LS-2026-014',
    referenceId: 'DEMO-FB-009',
    source: 'Social Media',
    station: 'Vishwakarma College',
    dateTime: '2026-10-10T14:15:00Z',
    rawText: 'प्लेटफॉर्म पर मेट्रो आगमन की घोषणा बहुत धीमी आवाज में हो रही है, जिससे सुनने में असुविधा हुई।',
    status: 'Resolved'
  }
];

export function generateSeedComplaints(): Complaint[] {
  return RAW_SEEDS.map(seed => {
    const classification = classifyComplaint(seed.rawText);
    const urgency = calculateUrgency(seed.rawText, classification.department, seed.station);
    const draft = generateDraftReply(
      classification.department,
      classification.detectedLanguage,
      urgency.score,
      seed.station,
      seed.referenceId
    );

    const now = seed.dateTime;

    return {
      id: seed.id,
      referenceId: seed.referenceId,
      source: seed.source,
      rawText: seed.rawText,
      station: seed.station,
      dateTime: seed.dateTime,
      detectedLanguage: classification.detectedLanguage,
      languageConfidence: classification.languageConfidence,
      department: classification.department,
      classificationConfidence: classification.confidence,
      urgencyScore: urgency.score,
      urgencyTier: urgency.tier,
      urgencyReasons: urgency.reasons,
      scoringBreakdown: urgency.breakdown,
      isDepartmentOverridden: false,
      isUrgencyOverridden: false,
      status: seed.status,
      internalNotes: [
        {
          id: `note-${seed.id}-1`,
          note: `Auto-triaged by JanAwaaz engine. Detected ${classification.detectedLanguage} (${Math.round(classification.languageConfidence * 100)}% conf).`,
          author: 'System Intake',
          timestamp: now
        }
      ],
      auditTrail: [
        {
          timestamp: now,
          action: 'INTAKE',
          details: `Grievance registered via ${seed.source}. Priority scored ${urgency.score} (${urgency.tier}).`,
          operator: 'Intake Gateway'
        }
      ],
      draftReply: draft,
      syncStatus: 'synced',
      createdAt: seed.dateTime,
      updatedAt: seed.dateTime
    };
  });
}
