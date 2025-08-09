export const messages = {
  "en": {


    label: (label: string, getAorAn: string, t: any) =>
      `Please enter ${getAorAn} ${t(label).toLowerCase()}`,
    label2: (label: string, getAorAn: string, t: any) =>
      `Please enter ${getAorAn} ${t(label).toLowerCase()}`,

    label1: (label: string, getAorAn: string, t: any) =>
      `Please select ${getAorAn} ${t(label).toLowerCase()}`,

    min: (min: any) => `Min. length should be ${min}`,

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

    label: (label: string, getAorAn: string, t: any) =>
      `దయచేసి ${t(label)} నమోదు చేయండి`,
    label2: (label: string, getAorAn: string, t: any) => `దయచేసి ${t(label)}`,
    label1: (label: string, getAorAn: string, t: any) =>
      `దయచేసి ${t(label)} ఎంచుకోండి`,
    "min": (min: any,) => `కనీస పొడవు ${(min)} అక్షరాలు ఉండాలి`,
  },
  "ta": {

    label: (label: string, getAorAn: string, t: any) =>
      `தயவுசெய்து ${t(label)} உள்ளிடவும்`,
    label2: (label: string, getAorAn: string, t: any) =>
      `தயவுசெய்து ${t(label)} உள்ளிடவும்`,
    label1: (label: string, getAorAn: string, t: any) =>
      `தயவுசெய்து ${t(label)} தேர்வு செய்யவும்`,
    "min": (min: any) => `${(min)} எழுத்துகளுக்கு குறைந்தபட்ச நீளம் வேண்டும்`,


  },
  "hi": {

    label: (label: string, getAorAn: string, t: any) =>
      `कृपया ${t(label)} दर्ज करें`,
    label2: (label: string, getAorAn: string, t: any) =>
      `कृपया ${t(label)} दर्ज करें`,
    label1: (label: string, getAorAn: string, t: any) =>
      `कृपया ${t(label)} चुनें`,
    min: (min: any) => `न्यूनतम लंबाई ${min} अक्षर होनी चाहिए`,

  },

  "mr": {
    label: (label: string, getAorAn: string, t: any) =>
      `कृपया ${t(label)} दर्ज करें`,
    label2: (label: string, getAorAn: string, t: any) =>
      `कृपया ${t(label)} दर्ज करें`,
    label1: (label: string, getAorAn: string, t: any) =>
      `कृपया ${t(label)} चुनें`,
    "min": (min: any) => `किमान लांबी ${min} असावी`,

  },
  "ml": {

    label: (label: string, getAorAn: string, t: any) =>
      `ദയവായി ${t(label)} നൽകുക`,
    label2: (label: string, getAorAn: string, t: any) =>
      `ദയവായി ${t(label)} നൽകുക`,
    label1: (label: string, getAorAn: string, t: any) =>
      `ദയവായി ${t(label)} തിരഞ്ഞെടുക്കുക`,
    "min": (min: any) => `കുറഞ്ഞത് ${min} അക്ഷരങ്ങൾ വേണം`,

  }


};