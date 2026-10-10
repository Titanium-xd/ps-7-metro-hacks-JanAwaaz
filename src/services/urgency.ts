import { Complaint, Department, ScoringBreakdown, UrgencyTier } from '../types';

export interface UrgencyEvaluation {
  score: number;
  tier: UrgencyTier;
  reasons: string[];
  breakdown: ScoringBreakdown;
  isDuplicateOrRelated: boolean;
  relatedComplaintIds: string[];
}

// Critical emergency indicators that trigger high urgency floor (85-100)
const CRITICAL_EMERGENCY_TERMS = [
  // Fire / Hazard
  { term: 'fire', reason: 'Fire danger reported' },
  { term: 'smoke', reason: 'Smoke / burning odour detected' },
  { term: 'આગ', reason: 'આગ (Fire) નો ભય' },
  { term: 'ધૂમાડો', reason: 'ધૂમાડો (Smoke) જોવા મળ્યો' },
  { term: 'आग', reason: 'आग (Fire) का खतरा' },
  { term: 'धुआं', reason: 'धुआं (Smoke) देखा गया' },
  { term: 'dhuan', reason: 'Smoke / burning reported' },
  { term: 'aag', reason: 'Fire hazard reported' },
  { term: 'short circuit', reason: 'Electrical short circuit hazard' },
  { term: 'sparking', reason: 'Dangerous electrical sparks' },
  { term: 'electric shock', reason: 'Electric shock hazard' },
  { term: 'શોર્ટ સર્કિટ', reason: 'શોર્ટ સર્કિટનું જોખમ' },
  { term: 'કરંટ', reason: 'ઇલેક્ટ્રિક કરંટનું જોખમ' },
  { term: 'करंट', reason: 'बिजली का करंट' },

  // Trapped Passenger / Medical
  { term: 'trapped', reason: 'Passenger trapped / locked in enclosed space' },
  { term: 'stuck in lift', reason: 'Passenger trapped inside elevator' },
  { term: 'lift me fas', reason: 'Passenger trapped in lift' },
  { term: 'lift ma fas', reason: 'લિફ્ટમાં મુસાફર ફસાયા' },
  { term: 'ફસાયા', reason: 'મુસાફર લિફ્ટમાં ફસાયા હોવાની માહિતી' },
  { term: 'फंस गया', reason: 'लिफ्ट में यात्री फंसा हुआ' },
  { term: 'फंसे हुए', reason: 'यात्री लिफ्ट में फंसे हैं' },
  { term: 'suffocating', reason: 'Passenger experiencing suffocation' },
  { term: 'unconscious', reason: 'Unconscious passenger needing medical help' },
  { term: 'fainted', reason: 'Passenger collapsed / fainted' },
  { term: 'બેભાન', reason: 'મુસાફર બેભાન હાલતમાં' },
  { term: 'बेहोश', reason: 'यात्री बेहोश' },
  { term: 'bleeding', reason: 'Active bleeding injury reported' },
  { term: 'लोही', reason: 'ઈજા અને લોહી' },
  { term: 'खून', reason: 'चोट और खून बह रहा है' },
  { term: 'harassment', reason: 'Passenger harassment / safety distress' },
  { term: 'assault', reason: 'Physical assault / safety breach' },
  { term: 'છેડતી', reason: 'મહિલા સુરક્ષા / છેડતીની ફરિયાદ' },
  { term: 'छेड़छाड़', reason: 'महिला सुरक्षा शिकायत' },
  { term: 'track crossing', reason: 'Person unauthorized on metro tracks' },
  { term: 'stampede', reason: 'Dangerous overcrowding / stampede risk' }
];

// High urgency indicators (60-79)
const HIGH_URGENCY_TERMS = [
  { term: 'wheelchair', reason: 'Wheelchair passenger accessibility barrier' },
  { term: 'વ્હીલચેર', reason: 'દિવ્યાંગ મુસાફર માટે વ્હીલચેર/રેમ્પ અડચણ' },
  { term: 'व्हीलचेयर', reason: 'दिव्यांग यात्री हेतु व्हीलचेयर बाधा' },
  { term: 'disabled', reason: 'Barrier affecting passenger with disabilities' },
  { term: 'દિવ્યાંગ', reason: 'દિવ્યાંગ મુસાફરને અવરોધ' },
  { term: 'दिव्यांग', reason: 'दिव्यांग यात्री समस्या' },
  { term: 'broken glass', reason: 'Broken glass on platform / train' },
  { term: 'theft', reason: 'Theft / stolen property on premises' },
  { term: 'ચોરી', reason: 'ચોરીનો બનાવ' },
  { term: 'चोरी', reason: 'चोरी की घटना' },
  { term: 'abusive', reason: 'Abusive / threatening staff conduct' },
  { term: 'pushed', reason: 'Physical push / aggressive altercation' },
  { term: 'धक्का दिया', reason: 'यात्री को धक्का देने की शिकायत' }
];

// Medium urgency indicators (35-59)
const MEDIUM_URGENCY_TERMS = [
  { term: 'lift not working', reason: 'Lift out of service (general)' },
  { term: 'lift bandh', reason: 'લિફ્ટ બંધ છે (સામાન્ય)' },
  { term: 'lift band', reason: 'लिफ्ट बंद (सामान्य)' },
  { term: 'overcharged', reason: 'Passenger overcharged / excess fare' },
  { term: 'balance deducted', reason: 'Smart card balance deducted without gate opening' },
  { term: 'પૈસા કપાઈ ગયા', reason: 'કાર્ડમાંથી પૈસા કપાયા છતાં ગેટ ન ખૂલ્યો' },
  { term: 'पैसे कट गए', reason: 'पैसे कटने पर भी गेट नहीं खुला' },
  { term: 'refund', reason: 'Fare refund requested' },
  { term: 'escalator', reason: 'Escalator non-operational' },
  { term: 'rude', reason: 'Rude / unprofessional staff behaviour' },
  { term: 'खराब वर्तन', reason: 'સ્ટાફનું અયોગ્ય વર્તન' },
  { term: 'बदतमीजी', reason: 'स्टाफ द्वारा बदतमीजी' }
];

/**
 * Calculates Urgency Score (0-100) with explainable reasons.
 * Pure offline rule-based computation.
 */
export function calculateUrgency(
  rawText: string,
  department: Department,
  station: string,
  existingComplaints: Complaint[] = []
): UrgencyEvaluation {
  const normalized = rawText.toLowerCase();
  const reasons: string[] = [];
  const keywordDetections: string[] = [];
  const riskMultipliers: string[] = [];
  const adjustments: string[] = [];

  let score = 20; // Default baseline for any passenger grievance

  // Check Department Baseline
  switch (department) {
    case 'Safety':
      score = 65;
      adjustments.push('Safety department baseline (+45)');
      break;
    case 'Lifts & Accessibility':
      score = 40;
      adjustments.push('Accessibility baseline (+20)');
      break;
    case 'Fare & Ticketing':
      score = 30;
      adjustments.push('Fare & ticketing baseline (+10)');
      break;
    case 'Staff Behaviour':
      score = 30;
      adjustments.push('Staff grievance baseline (+10)');
      break;
    case 'Cleanliness':
      score = 20;
      adjustments.push('Cleanliness routine baseline (+0)');
      break;
    default:
      score = 20;
  }

  // 1. Check for Critical Emergency Terms (Floor: 85 - 100)
  let foundCritical = false;
  for (const item of CRITICAL_EMERGENCY_TERMS) {
    if (normalized.includes(item.term.toLowerCase())) {
      foundCritical = true;
      score = Math.max(score + 40, 88);
      reasons.push(item.reason);
      keywordDetections.push(`Critical: "${item.term}"`);
    }
  }

  // 2. Check for High Urgency Terms
  let foundHigh = false;
  for (const item of HIGH_URGENCY_TERMS) {
    if (normalized.includes(item.term.toLowerCase())) {
      foundHigh = true;
      score = Math.max(score, 68);
      reasons.push(item.reason);
      keywordDetections.push(`High: "${item.term}"`);
    }
  }

  // 3. Check for Medium Urgency Terms
  for (const item of MEDIUM_URGENCY_TERMS) {
    if (normalized.includes(item.term.toLowerCase())) {
      if (!foundCritical && !foundHigh) {
        score = Math.max(score, 45);
      }
      reasons.push(item.reason);
      keywordDetections.push(`Medium: "${item.term}"`);
    }
  }

  // 4. Cleanliness Safety Cap
  // Routine cleanliness (litter, spitting, trash) shouldn't automatically become critical
  // unless there's a biohazard / broken glass / blood
  if (department === 'Cleanliness' && !foundCritical && !foundHigh) {
    if (score > 40) {
      score = 35;
      adjustments.push('Routine cleanliness cap applied (max 35)');
    }
    if (reasons.length === 0) {
      reasons.push('Routine sanitation / housekeeping report');
    }
  }

  // 5. Check for Repeated Issues at the Same Station
  let isDuplicateOrRelated = false;
  const relatedComplaintIds: string[] = [];

  if (station && station !== 'General' && existingComplaints.length > 0) {
    const stationMatches = existingComplaints.filter(c => 
      c.station.toLowerCase() === station.toLowerCase() &&
      c.department === department &&
      c.status !== 'Resolved'
    );

    if (stationMatches.length >= 2) {
      isDuplicateOrRelated = true;
      relatedComplaintIds.push(...stationMatches.map(m => m.id));
      score = Math.min(100, score + 12);
      riskMultipliers.push(`Repeated issue multiplier: +12 pts (${stationMatches.length} existing open reports at ${station})`);
      reasons.push(`Repeated issue alert: ${stationMatches.length} unresolved reports in ${department} at ${station}`);
    }
  }

  // Ensure score is bounded between 5 and 100
  score = Math.min(100, Math.max(5, Math.round(score)));

  // If no specific reason recorded, add default explanation
  if (reasons.length === 0) {
    if (department === 'Other / Needs Review') {
      reasons.push('Unclassified / General operational feedback');
    } else {
      reasons.push(`Standard ${department.toLowerCase()} grievance`);
    }
  }

  // Determine Urgency Tier
  let tier: UrgencyTier;
  if (score >= 80) tier = 'CRITICAL';
  else if (score >= 60) tier = 'HIGH';
  else if (score >= 35) tier = 'MEDIUM';
  else tier = 'ROUTINE';

  return {
    score,
    tier,
    reasons,
    breakdown: {
      baseScore: 20,
      keywordDetections,
      riskMultipliers,
      adjustments
    },
    isDuplicateOrRelated,
    relatedComplaintIds
  };
}
