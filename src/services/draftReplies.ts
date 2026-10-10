import { Department, DetectedLanguage, DraftReply } from '../types';

export function generateDraftReply(
  department: Department,
  language: DetectedLanguage,
  urgencyScore: number,
  station: string,
  referenceId: string
): DraftReply {
  const stationLabel = station && station !== 'General' ? station : 'the metro station';
  const refText = referenceId || 'GMRC-REF';

  // 1. GUJARATI TEMPLATES
  if (language === 'Gujarati') {
    if (urgencyScore >= 75 || department === 'Safety') {
      return {
        language: 'Gujarati',
        templateUsed: 'GJ_SAFETY_URGENT',
        isCustomized: false,
        text: `આદરણીય મુસાફર,\n\nતમારી કટોકટીપૂર્ણ સુરક્ષા ફરિયાદ (સંદર્ભ: ${refText}) મેટ્રો કંટ્રોલ રૂમ દ્વારા પ્રાપ્ત થઈ છે. ${stationLabel} સ્ટેશન કંટ્રોલર અને સુરક્ષા સ્ટાફને સ્થળ પર તાત્કાલિક સંજ્ઞાન લેવા સૂચના આપવામાં આવી છે. કૃપા કરીને સુરક્ષિત અંતર જાળવો. તાત્કાલિક સહાય માટે નજીકના મેટ્રો સ્ટાફનો સંપર્ક કરો અથવા હેલ્પલાઈન 112 ડાયલ કરો.\n\n— મેટ્રો ઓપરેશન્સ કંટ્રોલ ડેસ્ક`
      };
    }

    if (department === 'Lifts & Accessibility') {
      return {
        language: 'Gujarati',
        templateUsed: 'GJ_LIFTS_ACCESSIBILITY',
        isCustomized: false,
        text: `આદરણીય મુસાફર,\n\n${stationLabel} સ્ટેશન ખાતે લિફ્ટ/અનુકૂળતા અંગેની તમારી ફરિયાદ (સંદર્ભ: ${refText}) નોંધવામાં આવી છે. મેન્ટેનન્સ ટીમને સુવિધા ચકાસવા માટે નિર્દેશ આપવામાં આવ્યો છે. શારીરિક સહાયતા માટે પ્લેટફોર્મ પર ઉપસ્થિત મેટ્રો સ્ટાફનો સંપર્ક કરી શકો છો.\n\n— મેટ્રો ઓપરેશન્સ કંટ્રોલ ડેસ્ક`
      };
    }

    if (department === 'Cleanliness') {
      return {
        language: 'Gujarati',
        templateUsed: 'GJ_CLEANLINESS',
        isCustomized: false,
        text: `આદરણીય મુસાફર,\n\n${stationLabel} સ્ટેશન પર સ્વચ્છતા અંગે આપનું ધ્યાન દોરવા બદલ આભાર (સંદર્ભ: ${refText}). આ માહિતી સ્ટેશન હાઉસકીપિંગ સુપરવાઈઝરને જરૂરી સફાઈ માટે મોકલવામાં આવી છે. સ્વચ્છ અને સુંદર મેટ્રો જાળવવામાં સહકાર આપવા બદલ આભાર.\n\n— મેટ્રો ઓપરેશન્સ કંટ્રોલ ડેસ્ક`
      };
    }

    if (department === 'Fare & Ticketing') {
      return {
        language: 'Gujarati',
        templateUsed: 'GJ_FARE_TICKETING',
        isCustomized: false,
        text: `આદરણીય મુસાફર,\n\nટિકિટ/ભાડા સંબંધી તમારી ફરિયાદ (સંદર્ભ: ${refText}) ની નોંધ લેવામાં આવી છે. અમારા ટિકિટિંગ વિભાગ દ્વારા ટ્રાન્ઝેક્શન લોગની ચકાસણી કરવામાં આવી રહી છે. જો વધુ વિગતની જરૂર પડે તો કૃપા કરીને સ્ટેશન ટિકિટ કાઉન્ટરનો સંપર્ક કરો.\n\n— મેટ્રો ઓપરેશન્સ કંટ્રોલ ડેસ્ક`
      };
    }

    if (department === 'Staff Behaviour') {
      return {
        language: 'Gujarati',
        templateUsed: 'GJ_STAFF_BEHAVIOUR',
        isCustomized: false,
        text: `આદરણીય મુસાફર,\n\nસ્ટાફના વર્તન અંગેની તમારી ફરિયાદ (સંદર્ભ: ${refText}) ગંભીરતાથી નોંધવામાં આવી છે. આ બાબત સ્ટેશન મેનેજર અને પ્રશાસનને આંતરિક સમીક્ષા માટે સોંપવામાં આવી છે. મુસાફરો પ્રત્યે સૌજન્યપૂર્ણ વર્તન અમારી પ્રાથમિકતા છે.\n\n— મેટ્રો ઓપરેશન્સ કંટ્રોલ ડેસ્ક`
      };
    }

    return {
      language: 'Gujarati',
      templateUsed: 'GJ_GENERAL',
      isCustomized: false,
      text: `આદરણીય મુસાફર,\n\nતમારી ફરિયાદ/પ્રતિસાદ (સંદર્ભ: ${refText}) પ્રાપ્ત થયો છે. સંબંધિત વિભાગ દ્વારા તેની સમીક્ષા કરવામાં આવી રહી છે. મેટ્રો સેવાઓને સુધારવામાં મદદ કરવા બદલ આભાર.\n\n— મેટ્રો ઓપરેશન્સ કંટ્રોલ ડેસ્ક`
    };
  }

  // 2. HINDI TEMPLATES
  if (language === 'Hindi') {
    if (urgencyScore >= 75 || department === 'Safety') {
      return {
        language: 'Hindi',
        templateUsed: 'HI_SAFETY_URGENT',
        isCustomized: false,
        text: `प्रिय यात्री,\n\nआपकी आपातकालीन सुरक्षा शिकायत (संदर्भ: ${refText}) मेट्रो कंट्रोल रूम को प्राप्त हुई है। ${stationLabel} स्टेशन कंट्रोलर एवं सुरक्षा टीम को तत्काल स्थल पर संज्ञान लेने हेतु सूचित कर दिया गया है। कृपया सुरक्षित दूरी बनाए रखें। किसी भी त्वरित सहायता हेतु स्टेशन कर्मचारी या हेल्पलाइन 112 से संपर्क करें।\n\n— मेट्रो ऑपरेशंस कंट्रोल डेस्क`
      };
    }

    if (department === 'Lifts & Accessibility') {
      return {
        language: 'Hindi',
        templateUsed: 'HI_LIFTS_ACCESSIBILITY',
        isCustomized: false,
        text: `प्रिय यात्री,\n\n${stationLabel} स्टेशन पर लिफ्ट/सुगमता संबंधी आपकी शिकायत (संदर्भ: ${refText}) दर्ज कर ली गई है। स्टेशन रखरखाव टीम को तकनीकी निरीक्षण हेतु निर्देशित किया गया है। भौतिक सहायता हेतु प्लेटफॉर्म पर उपस्थित मेट्रो कर्मचारी से संपर्क किया जा सकता है।\n\n— मेट्रो ऑपरेशंस कंट्रोल डेस्क`
      };
    }

    if (department === 'Cleanliness') {
      return {
        language: 'Hindi',
        templateUsed: 'HI_CLEANLINESS',
        isCustomized: false,
        text: `प्रिय यात्री,\n\n${stationLabel} स्टेशन पर स्वच्छता संबंधी सूचना देने हेतु धन्यवाद (संदर्भ: ${refText})। यह विवरण स्टेशन हाउसकीपिंग सुपरवाइजर को त्वरित सफाई हेतु प्रेषित कर दिया गया है। स्वच्छ मेट्रो परिसर बनाए रखने में सहयोग के लिए आभार।\n\n— मेट्रो ऑपरेशंस कंट्रोल डेस्क`
      };
    }

    if (department === 'Fare & Ticketing') {
      return {
        language: 'Hindi',
        templateUsed: 'HI_FARE_TICKETING',
        isCustomized: false,
        text: `प्रिय यात्री,\n\n${stationLabel} स्टेशन पर किराया/टिकटिंग संबंधी आपकी शिकायत (संदर्भ: ${refText}) दर्ज की गई है। टिकटिंग सिस्टम द्वारा लेनदेन विवरण की जांच की जा रही है। आवश्यकता पड़ने पर कृपया स्टेशन टिकट काउंटर से संपर्क करें।\n\n— मेट्रो ऑपरेशंस कंट्रोल डेस्क`
      };
    }

    if (department === 'Staff Behaviour') {
      return {
        language: 'Hindi',
        templateUsed: 'HI_STAFF_BEHAVIOUR',
        isCustomized: false,
        text: `प्रिय यात्री,\n\nकर्मचारी आचरण संबंधी आपकी शिकायत (संदर्भ: ${refText}) को गंभीरता से संज्ञान में लिया गया है। इस संबंध में उचित विभागीय समीक्षा हेतु स्टेशन प्रबंधन को सूचित कर दिया गया है। यात्रियों के प्रति सम्मानजनक व्यवहार हमारी प्रतिबद्धता है।\n\n— मेट्रो ऑपरेशंस कंट्रोल डेस्क`
      };
    }

    return {
      language: 'Hindi',
      templateUsed: 'HI_GENERAL',
      isCustomized: false,
      text: `प्रिय यात्री,\n\nआपकी शिकायत/प्रतिक्रिया (संदर्भ: ${refText}) दर्ज कर ली गई है। संबंधित विभाग द्वारा इसकी समीक्षा की जा रही है। मेट्रो सेवा सुधार में योगदान हेतु धन्यवाद।\n\n— मेट्रो ऑपरेशंस कंट्रोल डेस्क`
    };
  }

  // 3. GUJLISH / HINGLISH TEMPLATES
  if (language === 'Gujlish/Hinglish') {
    if (urgencyScore >= 75 || department === 'Safety') {
      return {
        language: 'Gujlish/Hinglish',
        templateUsed: 'MIXED_SAFETY_URGENT',
        isCustomized: false,
        text: `Aadarniya Musafar / Dear Passenger,\n\nTamari urgent safety report (Ref: ${refText}) Metro Operations Desk dwara prapt thai che. ${stationLabel} station controller ane security team ne turant site inspection mate alert karya che. Kripya safe distance rakhjo. Urgent sahayata mate station staff no sampark karo.\n\n— Metro Operations Control Desk`
      };
    }

    if (department === 'Lifts & Accessibility') {
      return {
        language: 'Gujlish/Hinglish',
        templateUsed: 'MIXED_LIFTS_ACCESSIBILITY',
        isCustomized: false,
        text: `Aadarniya Musafar,\n\n${stationLabel} par lift/accessibility issue (Ref: ${refText}) register thai gayu che. Maintenance team ne check karva mate assign karyu che. Platform par station staff physical assistance mate available che.\n\n— Metro Operations Control Desk`
      };
    }

    return {
      language: 'Gujlish/Hinglish',
      templateUsed: 'MIXED_GENERAL',
      isCustomized: false,
      text: `Aadarniya Musafar,\n\nTamari grievance (Ref: ${refText}) regarding ${department} at ${stationLabel} register thai che. Metro operations team aani review kari rahi che. Metro services ma support mate aabhar.\n\n— Metro Operations Control Desk`
    };
  }

  // 4. ENGLISH TEMPLATES (Default & Fallback)
  if (urgencyScore >= 75 || department === 'Safety') {
    return {
      language: 'English',
      templateUsed: 'EN_SAFETY_URGENT',
      isCustomized: false,
      text: `Dear Passenger,\n\nYour urgent safety report (Reference: ${refText}) has been logged by the Metro Operations Desk. Station controllers and duty security staff at ${stationLabel} have been notified for immediate on-site inspection. Please maintain a safe distance. For emergency assistance on platform, contact station staff immediately or call 112.\n\n— Metro Operations Control Desk`
    };
  }

  if (department === 'Lifts & Accessibility') {
    return {
      language: 'English',
      templateUsed: 'EN_LIFTS_ACCESSIBILITY',
      isCustomized: false,
      text: `Dear Passenger,\n\nThank you for alerting us regarding the accessibility barrier at ${stationLabel} (Reference: ${refText}). Our station facilities supervisor has been notified to inspect and service the equipment. If immediate boarding assistance is required, please request help from platform staff.\n\n— Metro Operations Control Desk`
    };
  }

  if (department === 'Cleanliness') {
    return {
      language: 'English',
      templateUsed: 'EN_CLEANLINESS',
      isCustomized: false,
      text: `Dear Passenger,\n\nThank you for bringing this cleanliness issue at ${stationLabel} to our attention (Reference: ${refText}). The report has been routed to the station housekeeping supervisor for sanitation action. Thank you for helping keep our metro clean.\n\n— Metro Operations Control Desk`
    };
  }

  if (department === 'Fare & Ticketing') {
    return {
      language: 'English',
      templateUsed: 'EN_FARE_TICKETING',
      isCustomized: false,
      text: `Dear Passenger,\n\nYour ticketing / fare dispute (Reference: ${refText}) has been recorded. Our revenue operations team is reviewing the transaction log. If you require immediate adjustment, please present your reference ID at any station customer care counter.\n\n— Metro Operations Control Desk`
    };
  }

  if (department === 'Staff Behaviour') {
    return {
      language: 'English',
      templateUsed: 'EN_STAFF_BEHAVIOUR',
      isCustomized: false,
      text: `Dear Passenger,\n\nWe have recorded your grievance concerning staff conduct (Reference: ${refText}). The matter has been forwarded to the station manager for formal administrative review. Professional passenger courtesy is our top priority.\n\n— Metro Operations Control Desk`
    };
  }

  return {
    language: 'English',
    templateUsed: 'EN_GENERAL',
    isCustomized: false,
    text: `Dear Passenger,\n\nYour feedback / grievance (Reference: ${refText}) has been recorded by Metro Operations. The relevant department is reviewing the report. Thank you for helping us improve metro operations.\n\n— Metro Operations Control Desk`
  };
}
