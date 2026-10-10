import { Department, DetectedLanguage } from '../types';

export interface ClassificationResult {
  department: Department;
  confidence: number;
  detectedLanguage: DetectedLanguage;
  languageConfidence: number;
  matchedKeywords: string[];
  isAmbiguous: boolean;
}

// Unicode script regex detectors
const GUJARATI_SCRIPT_REGEX = /[\u0A80-\u0AFF]/;
const DEVANAGARI_SCRIPT_REGEX = /[\u0900-\u097F]/;

// Regional markers in Latin script
const GUJLISH_MARKERS = [
  'che', 'chhe', 'nathi', 'nthi', 'hatun', 'hato', 'hati', 'karyu', 'kare', 'ma', 'mate', 
  'kem', 'su', 'shu', 'aave', 'aavyo', 'lidha', 'apyo', 'badhu', 'kharab', 'saheb', 'bhai',
  'fasai', 'pichkari', 'paan', 'durgandh', 'tapaas', 'jova', 'vadhare', 'ochhu'
];

const HINGLISH_MARKERS = [
  'hai', 'hain', 'nahi', 'nhi', 'tha', 'thi', 'the', 'raha', 'rahi', 'rahe', 'karo', 
  'kiya', 'mein', 'ko', 'se', 'bhi', 'kya', 'kyun', 'bahut', 'phas', 'gaya', 'gayi',
  'kripya', 'madad', 'gandagi', 'badbu', 'battameezi', 'chori'
];

// Department keyword dictionaries across English, Gujarati script, Hindi script, and Latin Romanized
interface KeywordDefinition {
  word: string;
  weight: number;
  exactOnly?: boolean;
}

const DEPARTMENT_KEYWORDS: Record<Department, KeywordDefinition[]> = {
  'Safety': [
    // English
    { word: 'fire', weight: 4.5 },
    { word: 'smoke', weight: 4.0 },
    { word: 'spark', weight: 4.0 },
    { word: 'sparking', weight: 4.0 },
    { word: 'short circuit', weight: 4.5 },
    { word: 'shock', weight: 4.0 },
    { word: 'electric shock', weight: 5.0 },
    { word: 'bare wire', weight: 4.5 },
    { word: 'wire exposed', weight: 4.5 },
    { word: 'trapped', weight: 5.0 },
    { word: 'stuck inside', weight: 4.5 },
    { word: 'suffocating', weight: 5.0 },
    { word: 'fainted', weight: 4.5 },
    { word: 'unconscious', weight: 5.0 },
    { word: 'bleeding', weight: 4.5 },
    { word: 'injury', weight: 4.0 },
    { word: 'injured', weight: 4.0 },
    { word: 'blood', weight: 4.0 },
    { word: 'harassment', weight: 4.5 },
    { word: 'assault', weight: 5.0 },
    { word: 'molestation', weight: 5.0 },
    { word: 'theft', weight: 3.5 },
    { word: 'thief', weight: 3.5 },
    { word: 'robbery', weight: 4.0 },
    { word: 'track crossing', weight: 4.0 },
    { word: 'jumped', weight: 4.5 },
    { word: 'stampede', weight: 5.0 },
    { word: 'emergency', weight: 3.5 },
    { word: 'hazard', weight: 3.5 },
    { word: 'danger', weight: 3.5 },
    { word: 'dangerous', weight: 3.5 },
    { word: 'broken glass', weight: 3.0 },

    // Gujarati Script
    { word: 'આગ', weight: 5.0 },
    { word: 'ધૂમાડો', weight: 4.5 },
    { word: 'ધૂમાડા', weight: 4.5 },
    { word: 'તણખા', weight: 4.0 },
    { word: 'શોર્ટ સર્કિટ', weight: 4.5 },
    { word: 'કરંટ', weight: 4.5 },
    { word: 'વાયર ખુલ્લો', weight: 4.5 },
    { word: 'ફસાયા', weight: 4.5 },
    { word: 'ફસાઈ ગયા', weight: 5.0 },
    { word: 'ગૂંગળામણ', weight: 5.0 },
    { word: 'બેભાન', weight: 5.0 },
    { word: 'લોહી', weight: 4.5 },
    { word: 'ઈજા', weight: 4.0 },
    { word: 'છેડતી', weight: 5.0 },
    { word: 'ચોરી', weight: 3.5 },
    { word: 'જોખમ', weight: 4.0 },
    { word: 'કટોકટી', weight: 4.0 },
    { word: 'પાટા પર', weight: 4.5 },

    // Hindi Script
    { word: 'आग', weight: 5.0 },
    { word: 'धुआं', weight: 4.5 },
    { word: 'धुआँ', weight: 4.5 },
    { word: 'चिंगारी', weight: 4.0 },
    { word: 'शॉर्ट सर्किट', weight: 4.5 },
    { word: 'करंट', weight: 4.5 },
    { word: 'नंगा तार', weight: 4.5 },
    { word: 'फंस गया', weight: 4.5 },
    { word: 'फंसे हुए', weight: 5.0 },
    { word: 'दम घुट', weight: 5.0 },
    { word: 'बेहोश', weight: 5.0 },
    { word: 'खून', weight: 4.5 },
    { word: 'चोट', weight: 4.0 },
    { word: 'छेड़छाड़', weight: 5.0 },
    { word: 'चोरी', weight: 3.5 },
    { word: 'खतरा', weight: 4.0 },
    { word: 'आपातकाल', weight: 4.0 },
    { word: 'भगदड़', weight: 5.0 },

    // Gujlish / Hinglish Romanized
    { word: 'aag', weight: 4.5 },
    { word: 'dhumaado', weight: 4.0 },
    { word: 'dhuan', weight: 4.0 },
    { word: 'current', weight: 4.0 },
    { word: 'short circuit', weight: 4.5 },
    { word: 'fasai gaya', weight: 4.5 },
    { word: 'fasaya', weight: 4.5 },
    { word: 'phas gaya', weight: 4.5 },
    { word: 'trapped', weight: 4.5 },
    { word: 'behosh', weight: 4.5 },
    { word: 'lohi', weight: 4.0 },
    { word: 'chot', weight: 3.5 },
    { word: 'chori', weight: 3.5 },
    { word: 'chedchad', weight: 4.5 },
    { word: 'danger', weight: 3.5 },
    { word: 'khatra', weight: 4.0 }
  ],

  'Lifts & Accessibility': [
    // English
    { word: 'lift', weight: 3.5 },
    { word: 'elevator', weight: 4.0 },
    { word: 'escalator', weight: 3.5 },
    { word: 'wheelchair', weight: 4.5 },
    { word: 'ramp', weight: 3.5 },
    { word: 'tactile', weight: 4.0 },
    { word: 'disabled', weight: 4.0 },
    { word: 'disability', weight: 4.0 },
    { word: 'elderly', weight: 3.0 },
    { word: 'senior citizen', weight: 3.5 },
    { word: 'stairs', weight: 2.0 },
    { word: 'accessibility', weight: 4.0 },
    { word: 'accessible', weight: 3.5 },
    { word: 'lift not working', weight: 4.5 },
    { word: 'lift out of service', weight: 4.5 },
    { word: 'escalator stopped', weight: 4.0 },

    // Gujarati Script
    { word: 'લિફ્ટ', weight: 4.0 },
    { word: 'એસ્કેલેટર', weight: 4.0 },
    { word: 'વ્હીલચેર', weight: 4.5 },
    { word: 'દિવ્યાંગ', weight: 4.5 },
    { word: 'અપંગ', weight: 4.0 },
    { word: 'રેમ્પ', weight: 3.5 },
    { word: 'વૃદ્ધ', weight: 3.0 },
    { word: 'પગથિયાં', weight: 2.5 },
    { word: 'લિફ્ટ બંધ', weight: 4.5 },
    { word: 'ખરાબ લિફ્ટ', weight: 4.0 },

    // Hindi Script
    { word: 'लिफ्ट', weight: 4.0 },
    { word: 'एस्केलेटर', weight: 4.0 },
    { word: 'व्हीलचेयर', weight: 4.5 },
    { word: 'दिव्यांग', weight: 4.5 },
    { word: 'रैंप', weight: 3.5 },
    { word: 'बुजुर्ग', weight: 3.0 },
    { word: 'सीढ़ियां', weight: 2.5 },
    { word: 'लिफ्ट बंद', weight: 4.5 },
    { word: 'लिफ्ट खराब', weight: 4.0 },

    // Gujlish / Hinglish
    { word: 'lift bandh', weight: 4.5 },
    { word: 'lift band', weight: 4.5 },
    { word: 'lift kharab', weight: 4.0 },
    { word: 'escalator bandh', weight: 4.0 },
    { word: 'wheelchair', weight: 4.0 },
    { word: 'ramp nathi', weight: 4.0 },
    { word: 'bujurg', weight: 3.0 },
    { word: 'pagthiya', weight: 2.5 }
  ],

  'Cleanliness': [
    // English
    { word: 'cleanliness', weight: 4.0 },
    { word: 'dirty', weight: 3.5 },
    { word: 'garbage', weight: 4.0 },
    { word: 'litter', weight: 3.5 },
    { word: 'trash', weight: 3.5 },
    { word: 'dustbin', weight: 3.0 },
    { word: 'bin overflowing', weight: 4.0 },
    { word: 'toilet', weight: 3.5 },
    { word: 'washroom', weight: 3.5 },
    { word: 'restroom', weight: 3.5 },
    { word: 'stinking', weight: 4.0 },
    { word: 'stink', weight: 3.5 },
    { word: 'smell', weight: 2.5 },
    { word: 'foul odor', weight: 4.0 },
    { word: 'urine', weight: 4.0 },
    { word: 'vomit', weight: 4.0 },
    { word: 'spit', weight: 3.5 },
    { word: 'spitting', weight: 3.5 },
    { word: 'paan', weight: 3.5 },
    { word: 'gutkha', weight: 3.5 },
    { word: 'leakage', weight: 3.0 },
    { word: 'water puddle', weight: 3.0 },
    { word: 'filthy', weight: 4.0 },
    { word: 'housekeeping', weight: 3.0 },

    // Gujarati Script
    { word: 'ગંદકી', weight: 4.5 },
    { word: 'કચરો', weight: 4.0 },
    { word: 'ડસ્ટબિન', weight: 3.5 },
    { word: 'શૌચાલય', weight: 4.0 },
    { word: 'ટોયલેટ', weight: 3.5 },
    { word: 'દુર્ગંધ', weight: 4.0 },
    { word: 'વાસ', weight: 2.5 },
    { word: 'ઉલટી', weight: 4.0 },
    { word: 'પેશાબ', weight: 4.0 },
    { word: 'પાનની પીચકારી', weight: 4.5 },
    { word: 'પીચકારી', weight: 4.0 },
    { word: 'ગુટખા', weight: 3.5 },
    { word: 'પાણી ભરાયું', weight: 3.5 },
    { word: 'સ્વચ્છતા નથી', weight: 4.0 },

    // Hindi Script
    { word: 'गंदगी', weight: 4.5 },
    { word: 'कचरा', weight: 4.0 },
    { word: 'कूड़ेदान', weight: 3.5 },
    { word: 'शौचालय', weight: 4.0 },
    { word: 'टॉयलेट', weight: 3.5 },
    { word: 'बदबू', weight: 4.0 },
    { word: 'उल्टी', weight: 4.0 },
    { word: 'पेशाब', weight: 4.0 },
    { word: 'पान की पीक', weight: 4.5 },
    { word: 'गुटखा', weight: 3.5 },
    { word: 'सफाई नहीं', weight: 4.0 },

    // Gujlish / Hinglish
    { word: 'gandagi', weight: 4.5 },
    { word: 'kachro', weight: 4.0 },
    { word: 'kachra', weight: 4.0 },
    { word: 'badbu', weight: 4.0 },
    { word: 'durgandh', weight: 4.0 },
    { word: 'paan pichkari', weight: 4.5 },
    { word: 'toilet ganda', weight: 4.0 },
    { word: 'safai nathi', weight: 4.0 },
    { word: 'safai nahi', weight: 4.0 }
  ],

  'Fare & Ticketing': [
    // English
    { word: 'fare', weight: 4.0 },
    { word: 'ticket', weight: 3.5 },
    { word: 'ticketing', weight: 3.5 },
    { word: 'token', weight: 4.0 },
    { word: 'smart card', weight: 4.0 },
    { word: 'metro card', weight: 4.0 },
    { word: 'recharge', weight: 3.5 },
    { word: 'top-up', weight: 3.5 },
    { word: 'balance deducted', weight: 4.5 },
    { word: 'money deducted', weight: 4.5 },
    { word: 'refund', weight: 4.5 },
    { word: 'overcharged', weight: 4.5 },
    { word: 'overcharging', weight: 4.5 },
    { word: 'extra money', weight: 3.5 },
    { word: 'gate not opening', weight: 3.5 },
    { word: 'turnstile', weight: 3.5 },
    { word: 'qr code', weight: 3.5 },
    { word: 'upi failed', weight: 4.0 },
    { word: 'tvm', weight: 4.0 },
    { word: 'ticket vending machine', weight: 4.5 },
    { word: 'change not returned', weight: 4.0 },

    // Gujarati Script
    { word: 'ટિકિટ', weight: 4.0 },
    { word: 'ટોકન', weight: 4.0 },
    { word: 'મેટ્રો કાર્ડ', weight: 4.0 },
    { word: 'પૈસા કપાઈ ગયા', weight: 4.5 },
    { word: 'રિફંડ', weight: 4.5 },
    { word: 'વધુ ભાડું', weight: 4.5 },
    { word: 'વધારાના પૈસા', weight: 4.0 },
    { word: 'ક્યુઆર કોડ', weight: 3.5 },
    { word: 'મશીન પૈસા ગળી ગયું', weight: 4.5 },
    { word: 'ગેઇટ ન ખૂલ્યો', weight: 3.5 },

    // Hindi Script
    { word: 'टिकट', weight: 4.0 },
    { word: 'टोकन', weight: 4.0 },
    { word: 'मेट्रो कार्ड', weight: 4.0 },
    { word: 'पैसे कट गए', weight: 4.5 },
    { word: 'रिफंड', weight: 4.5 },
    { word: 'अधिक किराया', weight: 4.5 },
    { word: 'ज्यादा पैसे', weight: 4.0 },
    { word: 'क्यूआर कोड', weight: 3.5 },
    { word: 'गेट नहीं खुला', weight: 3.5 },
    { word: 'मशीन खराब', weight: 3.0 },

    // Gujlish / Hinglish
    { word: 'paise kapi gaya', weight: 4.5 },
    { word: 'paise kat gaye', weight: 4.5 },
    { word: 'ticket machine', weight: 4.0 },
    { word: 'refund nathi', weight: 4.5 },
    { word: 'refund nahi mila', weight: 4.5 },
    { word: 'vadhare paisa', weight: 4.0 },
    { word: 'zyada paise', weight: 4.0 },
    { word: 'card recharge', weight: 3.5 },
    { word: 'token fasai', weight: 4.0 }
  ],

  'Staff Behaviour': [
    // English
    { word: 'staff', weight: 3.0 },
    { word: 'conductor', weight: 3.5 },
    { word: 'security guard', weight: 4.0 },
    { word: 'guard', weight: 2.5 },
    { word: 'ticket clerk', weight: 4.0 },
    { word: 'operator', weight: 2.5 },
    { word: 'employee', weight: 3.0 },
    { word: 'rude', weight: 4.5 },
    { word: 'misbehaved', weight: 4.5 },
    { word: 'misbehaviour', weight: 4.5 },
    { word: 'bad behaviour', weight: 4.5 },
    { word: 'abusive', weight: 4.5 },
    { word: 'shouting', weight: 4.0 },
    { word: 'shouted', weight: 4.0 },
    { word: 'insulted', weight: 4.5 },
    { word: 'unhelpful', weight: 3.5 },
    { word: 'arrogant', weight: 4.0 },
    { word: 'pushed me', weight: 4.5 },
    { word: 'bribe', weight: 4.5 },
    { word: 'corruption', weight: 4.5 },
    { word: 'ignored passenger', weight: 3.5 },

    // Gujarati Script
    { word: 'કર્મચારી', weight: 3.5 },
    { word: 'સ્ટાફ', weight: 3.5 },
    { word: 'ગાર્ડ', weight: 3.0 },
    { word: 'ખરાબ વર્તન', weight: 4.5 },
    { word: 'ગેરવર્તણૂક', weight: 4.5 },
    { word: 'અપશબ્દો', weight: 4.5 },
    { word: 'ગાળો આપી', weight: 4.5 },
    { word: 'ઉદ્ધત વર્તન', weight: 4.5 },
    { word: 'ધક્કો માર્યો', weight: 4.5 },
    { word: 'મદદ ન કરી', weight: 4.0 },
    { word: 'લાંચ', weight: 4.5 },

    // Hindi Script
    { word: 'कर्मचारी', weight: 3.5 },
    { word: 'स्टाफ', weight: 3.5 },
    { word: 'गार्ड', weight: 3.0 },
    { word: 'दुर्व्यवहार', weight: 4.5 },
    { word: 'बदतमीजी', weight: 4.5 },
    { word: 'गाली दी', weight: 4.5 },
    { word: 'अभद्र व्यवहार', weight: 4.5 },
    { word: 'धक्का दिया', weight: 4.5 },
    { word: 'चिल्लाया', weight: 4.0 },
    { word: 'मदद नहीं की', weight: 4.0 },
    { word: 'रिश्वत', weight: 4.5 },

    // Gujlish / Hinglish
    { word: 'staff battameezi', weight: 4.5 },
    { word: 'guard pushed', weight: 4.5 },
    { word: 'rude bolyo', weight: 4.5 },
    { word: 'gaali api', weight: 4.5 },
    { word: 'misbehaviour', weight: 4.5 },
    { word: 'kharab vyavhar', weight: 4.5 },
    { word: 'shouting karyu', weight: 4.0 },
    { word: 'help nathi karta', weight: 4.0 }
  ],

  'Other / Needs Review': [
    { word: 'announcement', weight: 2.5 },
    { word: 'signage', weight: 2.5 },
    { word: 'wayfinding', weight: 2.5 },
    { word: 'display board', weight: 2.5 },
    { word: 'frequency', weight: 2.0 },
    { word: 'schedule', weight: 2.0 },
    { word: 'crowd', weight: 2.0 },
    { word: 'last mile', weight: 2.0 },
    { word: 'bus connection', weight: 2.0 },
    { word: 'ac not cool', weight: 2.5 },
    { word: 'fan', weight: 2.0 },
    { word: 'temperature', weight: 2.0 }
  ]
};

/**
 * Detect language of text using script analysis and vocabulary heuristics.
 */
export function detectLanguage(text: string): { language: DetectedLanguage; confidence: number } {
  const clean = text.trim();
  if (!clean) return { language: 'Unknown', confidence: 0 };

  const gujaratiChars = (clean.match(/[\u0A80-\u0AFF]/g) || []).length;
  const devanagariChars = (clean.match(/[\u0900-\u097F]/g) || []).length;
  const totalChars = clean.replace(/\s+/g, '').length;

  if (gujaratiChars > 0 && gujaratiChars / totalChars > 0.15) {
    const confidence = Math.min(1.0, 0.6 + (gujaratiChars / totalChars) * 0.4);
    return { language: 'Gujarati', confidence: Number(confidence.toFixed(2)) };
  }

  if (devanagariChars > 0 && devanagariChars / totalChars > 0.15) {
    const confidence = Math.min(1.0, 0.6 + (devanagariChars / totalChars) * 0.4);
    return { language: 'Hindi', confidence: Number(confidence.toFixed(2)) };
  }

  // Latin characters: check Gujlish vs Hinglish vs English
  const lower = clean.toLowerCase();
  const words = lower.split(/[^a-zA-Z0-9]+/).filter(Boolean);

  let gujlishMatches = 0;
  let hinglishMatches = 0;

  for (const word of words) {
    if (GUJLISH_MARKERS.includes(word)) gujlishMatches++;
    if (HINGLISH_MARKERS.includes(word)) hinglishMatches++;
  }

  if (gujlishMatches >= 2 || (gujlishMatches >= 1 && words.length <= 6)) {
    return { language: 'Gujlish/Hinglish', confidence: 0.85 };
  }

  if (hinglishMatches >= 2 || (hinglishMatches >= 1 && words.length <= 6)) {
    return { language: 'Gujlish/Hinglish', confidence: 0.80 };
  }

  // If words exist and are latin, assume English
  if (words.length > 0) {
    return { language: 'English', confidence: 0.90 };
  }

  return { language: 'Unknown', confidence: 0.3 };
}

/**
 * Classifies a complaint text into a department queue.
 * Pure offline heuristic engine.
 */
export function classifyComplaint(rawText: string): ClassificationResult {
  const { language, confidence: langConfidence } = detectLanguage(rawText);
  const normalized = rawText.toLowerCase();

  const scores: Record<Department, number> = {
    'Safety': 0,
    'Lifts & Accessibility': 0,
    'Cleanliness': 0,
    'Fare & Ticketing': 0,
    'Staff Behaviour': 0,
    'Other / Needs Review': 0
  };

  const allMatchedKeywords: Record<Department, string[]> = {
    'Safety': [],
    'Lifts & Accessibility': [],
    'Cleanliness': [],
    'Fare & Ticketing': [],
    'Staff Behaviour': [],
    'Other / Needs Review': []
  };

  for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS) as [Department, KeywordDefinition[]][]) {
    for (const kw of keywords) {
      const target = kw.word.toLowerCase();
      if (normalized.includes(target)) {
        scores[dept] += kw.weight;
        allMatchedKeywords[dept].push(kw.word);
      }
    }
  }

  // Special heuristic: If text mentions trapped/stuck in a lift,
  // Safety has highest priority because a trapped passenger is an immediate emergency!
  const hasLiftTrapped = (
    (normalized.includes('lift') || normalized.includes('લિફ્ટ') || normalized.includes('लिफ्ट')) &&
    (normalized.includes('trapped') || normalized.includes('fasai') || normalized.includes('phas') || 
     normalized.includes('stuck') || normalized.includes('ફસાયા') || normalized.includes('फंसे') || normalized.includes('दम'))
  );

  if (hasLiftTrapped) {
    scores['Safety'] += 6.0;
    allMatchedKeywords['Safety'].push('trapped passenger in lift');
  }

  // Find department with maximum score
  let bestDept: Department = 'Other / Needs Review';
  let highestScore = 0;

  for (const [dept, score] of Object.entries(scores) as [Department, number][]) {
    if (score > highestScore) {
      highestScore = score;
      bestDept = dept;
    }
  }

  // Minimum threshold to prevent false classification
  const MIN_SCORE_THRESHOLD = 2.5;

  if (highestScore < MIN_SCORE_THRESHOLD) {
    return {
      department: 'Other / Needs Review',
      confidence: 0.35,
      detectedLanguage: language,
      languageConfidence: langConfidence,
      matchedKeywords: allMatchedKeywords['Other / Needs Review'],
      isAmbiguous: true
    };
  }

  // Calculate normalized confidence (0.4 to 0.98)
  const confidence = Math.min(0.98, Number((0.45 + (highestScore / (highestScore + 4.0)) * 0.5).toFixed(2)));
  const isAmbiguous = highestScore < 4.0;

  return {
    department: bestDept,
    confidence,
    detectedLanguage: language,
    languageConfidence: langConfidence,
    matchedKeywords: allMatchedKeywords[bestDept],
    isAmbiguous
  };
}
