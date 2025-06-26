export const messages = {
  "en": {

    "label": (label: string, getAorAn: any) => `Please enter ${getAorAn} ${label.toLowerCase()}`,
    "label1": (label: string, getAorAn: any) => `Please select ${getAorAn} ${label.toLowerCase()}`,
    "min": (min: any) => `Min. length should be ${(min)}`,

  },
  "kn": {
    label: (label: string, getAorAn: string, t: any) =>
      `ದಯವಿಟ್ಟು ${t(label)} ಅನ್ನು ನಮೂದಿಸಿ`,
    label2: (label: string, getAorAn: string, t: any) => `ದಯವಿಟ್ಟು ${t(label)} `,
    label1: (label: string, getAorAn: string, t: any) =>
      `ದಯವಿಟ್ಟು ${t(label)} ಆಯ್ಕೆಮಾಡಿ`,
    "min": (min: any,) => `ಕನಿಷ್ಟ ಉದ್ದ ${(min)} ಅಕ್ಷರಗಳು ಇರಬೇಕು`,


  },
  "te": {

    "label": (label: string) => `దయచేసి ${label.toLowerCase()} నమోదు చేయండి`,
    "label1": (label: string) => `దయచేసి ఒక ${label.toLowerCase()} ఎంచుకోండి`,
    "min": (min: any,) => `కనీస పొడవు ${(min)} అక్షరాలు ఉండాలి`,

    "fieldOrNormal": (getRemoteORField: any) => `మొదట మా ${getRemoteORField()} రిమోట్ బృందం మీ టికెట్‌ను ప్రాధాన్యత ఇస్తుంది మరియు సమస్యను నిర్ధారిస్తుంది.`,
  },
  "ta": {

    "label": (label: string) => `தயவுசெய்து ${label.toLowerCase()} உள்ளிடவும்`,
    "label1": (label: string) => `${label.toLowerCase()} தேர்வு செய்யவும்`,
    "min": (min: any) => `${(min)} எழுத்துகளுக்கு குறைந்தபட்ச நீளம் வேண்டும்`,
    "fieldOrNormal": (getRemoteORField: any) => `முதலில் எங்கள் ${getRemoteORField()} ரிமோட் குழு உங்கள் டிக்கெட்டை முன்னுரிமை அளிக்கும் மற்றும் பிரச்சினையை தீர்க்கும்.`,

  },
  "hi": {

    "label": (label: string) => `कृपया ${label.toLowerCase()} दर्ज करें`,
    "label1": (label: string) => `कृपया एक ${label.toLowerCase()} चुनें`,
    "min": (min: any) => `न्यूनतम लंबाई ${(min)} अक्षर होनी चाहिए`,
    "fieldOrNormal": (getRemoteORField: any) => `पहले हमारे ${getRemoteORField()} रिमोट टीम आपके टिकट को प्राथमिकता देती है और समस्या का समाधान करती है.`

  },

  "mr": {
    "label": (label: string, getAorAn: any) => `कृपया ${getAorAn} ${label.toLowerCase()} प्रविष्ट करा`,
    "label1": (label: string, getAorAn: any) => `कृपया ${getAorAn} ${label.toLowerCase()} निवडा`,
    "min": (min: any) => `किमान लांबी ${min} असावी`,

  },
  "ml": {
    "label": (label: string, getAorAn: any) => `${getAorAn} ${label.toLowerCase()} നൽകുക`,
    "label1": (label: string, getAorAn: any) => `${getAorAn} ${label.toLowerCase()} തിരഞ്ഞെടുക്കുക`,
    "min": (min: any) => `കുറഞ്ഞത് ${min} അക്ഷരങ്ങൾ വേണം`,

  }


};