// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {

          welcomeMessage: "Welcome back!",
          translate: "Translate",
          checkIn: "Check In",
          checkOut: "Check Out",
          raisedBy: "Raised by",
          raisedAt: "Raised At",
          issueIn: "issue In",
          goodMorning: "Good Morning",
          goodAfternoon: "Good Afternoon",
          goodEvening: "Good Evening",
          welcome: "Hey, Welcome! ",
          create_extraordinary: "Let’s create something extraordinary!",
          mobile_label: "Mobile Number",
          mobile_placeholder: "Enter your mobile number",
          login_button: "Login",
          terms_conditions: "Terms & Conditions",
          privacy_policy: "Privacy Policy",
          "checkYourMobile": "Check your mobile 📱",
          "otp_message": "OTP has been sent to {{mobile}}.",
          "enterOtp": "Enter OTP",
          "verifyOtp": "Verify OTP",
          "otpValidationMessage": "Please enter a valid 6-digit OTP.",
          "otpErrorMessage": "An error occurred. Please try again.",
          "loginAgreement": "By logging in, you agree to our",
          "ticketDetails": "Ticket Details",
          "serialNo": "Serial No",
          "description": "Description",
          "assignedAt": "Assigned At",
"assignedTo" :"Assigned To",
          "issueImages": "Issue Images",
          "status": "Status",
          "selectStatus": "Select Status",
          "writeShortDescription": "Write a short description about your issue",
          "assetImages": "Asset Images",
          "addImage": "Add Image",
          "enterOtpForOpenClose": "Enter OTP only in case of Open and Close ticket",
          "customerOtp": "Customer OTP",
          "enterCustomerOtp": "Enter customer OTP",
          "updateStatus": "Update Status",
          "updateTicketStatus": "Update Ticket Status",
          "startAt": "Start at",
          "pincode": "Pincode",
          "selfie": "Selfie",
          "and": "and"
        },
      },
      kn: {
        translation: {

          welcomeMessage: "ಹಿಂತಿರುಗಿದ ಸ್ವಾಗತ!",
          translate: "ಅನುವಾದಿಸಿ",
          checkIn: "ಚೆಕ್ ಇನ್",
          checkOut: "ಚೆಕ್ ಔಟ್",
          raisedBy: "ರೈಸ್ಡ್ ಬೈ",
          raisedAt: "ರೈಸ್ಡ್ ಎಟ್",
          issueIn: "ಸಮಸ್ಯೆ",
          goodMorning: "ಶುಭೋದಯ",
          goodAfternoon: "ಶುಭ ಮಧ್ಯಾಹ್ನ",
          "goodEvening": "ಶುಭ ಸಾಯಂಕಾಲ",
          welcome: "ಹಾಯ್, ಸ್ವಾಗತ! ",
          " Let’s create something extraordinary!": "ನಾವು ಕೆಲವು ಅದ್ಭುತವಾದುದನ್ನು ರಚಿಸೋಣ!",
          "Mobile Number": "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
          mobile_placeholder: "ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
          Login: "ಲಾಗಿನ್",
          "otp_message": "{{mobile}} ಗೆ OTP ಕಳುಹಿಸಲಾಗಿದೆ.",
          terms_conditions: "ನಿಯಮಗಳು ಮತ್ತು ಶರತ್ತುಗಳು",
          privacy_policy: "ಗೋಪನೀಯತೆ ನಿಯಮಗಳು",
          "checkYourMobile": "ನಿಮ್ಮ ಮೊಬೈಲ್ ಪರಿಶೀಲಿಸಿ 📱",
          "otpSentMessage": "OTP ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.",
          "enterOtp": "OTP ನಮೂದಿಸಿ",
          "verifyOtp": "OTP ಪರಿಶೀಲಿಸಿ",
          "otpValidationMessage": "ದಯವಿಟ್ಟು ಸರಿಯಾದ 6-ಅಂಕಿ OTP ನಮೂದಿಸಿ.",
          "otpErrorMessage": "ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.",
          "Enter your mobile number": "ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
          Opened: "ತೆರೆದಿದೆ",
          Assigned: "ನಿಯೋಜಿಸಲಾಗಿದೆ",
          Completed: "ಪೂರ್ಣ",
          "Not Closed": "ಮುಚ್ಚಲಾಗಿಲ್ಲ",
          "loginAgreement": "ಲಾಗಿನ್ ಮಾಡಿ, ನೀವು ನಮ್ಮಗೆ ಒಪ್ಪಿಗೆಯನ್ನೀಡುತ್ತೀರಿ",
          ticketDetails: "ಟಿಕೆಟ್ ವಿವರಗಳು",
          "serialNo": "ಸರಣಿ ಸಂಖ್ಯೆ",
          "description": "ವಿವರಣೆ",
          "assignedAt": "ಒತ್ತಿಸಲಾಗಿದೆ",
          "assignedTo" :"ನೇಮಿತವಾಗಿದೆ",
          "issueImages": "ಸಮಸ್ಯೆಯ ಚಿತ್ರಗಳು",
          "status": "ಸ್ಥಿತಿ",
          "selectStatus": "ಸ್ಥಿತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
          "writeShortDescription": "ನಿಮ್ಮ ಸಮಸ್ಯೆಯ ಕುರಿತು ಚಿಕ್ಕ ವಿವರಣೆಯನ್ನು ಬರೆದು",
          "assetImages": "ಆಸ್ತಿ ಚಿತ್ರಗಳು",
          "addImage": "ಚಿತ್ರವನ್ನು ಸೇರಿಸಿ",
          "enterOtpForOpenClose": "ಟಿಕೆಟ್ ತೆರೆಯಲು ಮತ್ತು ಮುಚ್ಚಲು ಮಾತ್ರ OTP ನಮೂದಿಸಿ",
          "customerOtp": "ಗ್ರಾಹಕ OTP",
          "enterCustomerOtp": "ಗ್ರಾಹಕ OTP ಅನ್ನು ನಮೂದಿಸಿ",
          "updateStatus": "ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಿ",
          "updateTicketStatus": "ಟಿಕೆಟ್ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಿ",
          "enterOtpForOpenClose": "ಟಿಕೆಟ್ ತೆರೆಯಲು ಮತ್ತು ಮುಚ್ಚಲು ಮಾತ್ರ OTP ನಮೂದಿಸಿ",
          ESCALATED: "ಏರಿಸಲಾಗಿದೆ",
          RAISED: "ಏರಿಸಲಾಗಿದೆ",
          TICKET_IN_PROGRESS: "ಟಿಕೆಟ್ ಪ್ರಗತಿಯಲ್ಲಿ",
          TICKET_CLOSED: "ಟಿಕೆಟ್ ಮುಚ್ಚಲಾಗಿದೆ",
          TICKET_ASSIGNED: "ಟಿಕೆಟ್ ನಿಯೋಜಿಸಲಾಗಿದೆ",
          ASSIGNED: "ನಿಯೋಜಿಸಲಾಗಿದೆ",
          DEFAULT: "ಅನಿಯೋಜಿತ",
          "Asset Type": "ಆಸ್ತಿ ಪ್ರಕಾರ",
          "startAt": "ಪ್ರಾರಂಭ",
          "pincode": "ಪಿನ್‌ಕೋಡ್",
          "selfie": "ಸೆಲ್ಫಿ",
           "and": "ಮತ್ತು"
        },
      },
      te: {

        "translation": {
          "getGreetingMessage": "శుభ మధ్యాహ్నం",
          "welcomeMessage": "తిరిగి స్వాగతం!",
          "translate": "అనువదించు",
          "checkIn": "చెక్ ఇన్",
          "checkOut": "చెక్ ఔట్",
          "raisedBy": "ఎంపిక చేసినవారు",
          "raisedAt": "ఎక్కడ ఎక్కించబడింది",
          "issueIn": "సమస్య",
          "goodMorning": "శుభోదయం",
          "goodAfternoon": "శుభ మధ్యాహ్నం",
          "goodEvening": "శుభ సాయంత్రం",
          "welcome": "హాయ్, స్వాగతం! ",
          "otp_message": "{{mobile} }కు OTP పంపబడింది.",
          " Let’s create something extraordinary!": "మనం అద్భుతమైన దాన్ని సృష్టిద్దాం!",
          "Mobile Number": "మొబైల్ నంబరు",
          "mobile_placeholder": "మీ మొబైల్ నంబరును నమోదు చేయండి",
          "Login": "లాగిన్",
          "terms_conditions": "నియమాలు మరియు షరతులు",
          "privacy_policy": "గోప్యతా విధానాలు",
          "checkYourMobile": "మీ మొబైల్ ను తనిఖీ చేయండి 📱",
          "otpSentMessage": "OTP పంపించబడింది.",
          "enterOtp": "OTP నమోదు చేయండి",
          "verifyOtp": "OTP ధృవీకరించండి",
          "otpValidationMessage": "దయచేసి సరైన 6-అంకెల OTP నమోదు చేయండి.",
          "otpErrorMessage": "ఒక దోషం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
          "Enter your mobile number": "మీ మొబైల్ నంబరును నమోదు చేయండి",
          "Opened": "తెరవబడింది",
          "Assigned": "నియమించబడింది",
          "Completed": "పూర్తి అయింది",
          "Not Closed": "మూసివేయబడలేదు",
          "loginAgreement": "లాగిన్ చేసుకుంటే, మీరు మా తో అంగీకరిస్తున్నారు",
          "ticketDetails": "టికెట్ వివరాలు",
          "serialNo": "సీరియల్ నంబర్",
          "description": "వివరణ",
          "assignedAt": "కేటాయించబడింది",
          "assignedTo" :"నియమించబడ్డది",
          "issueImages": "సమస్య చిత్రాలు",
          "status": "స్థితి",
          "selectStatus": "స్థితిని ఎంచుకోండి",
          "writeShortDescription": "మీ సమస్య గురించి చిన్న వివరణ రాయండి",
          "assetImages": "ఆస్తి చిత్రాలు",
          "addImage": "చిత్రం జోడించండి",
          "enterOtpForOpenClose": "టికెట్ ఓపెన్ మరియు క్లోజ్ చేయడానికి మాత్రమే OTP నమోదు చేయండి",
          "customerOtp": "కస్టమర్ OTP",
          "enterCustomerOtp": "కస్టమర్ OTPను నమోదు చేయండి",
          "updateStatus": "స్థితిని నవీకరించండి",
          "updateTicketStatus": "టికెట్ స్థితిని నవీకరించండి",
          "enterOtpForOpenClose": "టికెట్ ఓపెన్ మరియు క్లోజ్ చేయడానికి మాత్రమే OTP నమోదు చేయండి",
          ESCALATED: "పెంపొందించబడింది",
          RAISED: "పెంపొందించబడింది",
          TICKET_IN_PROGRESS: "టికెట్ ప్రగతిలో ఉంది",
          TICKET_CLOSED: "టికెట్ మూసివేయబడింది",
          TICKET_ASSIGNED: "టికెట్ కేటాయించబడింది",
          ASSIGNED: "కేటాయించబడింది",
          DEFAULT: "కేటాయించబడలేదు",
          "Asset Type": "ఆస్తి రకం",
          "startAt": "ప్రారంభించు",
          "pincode": "పిన్‌కోడ్",
          "selfie": "సెల్ఫీ",
          "and":"మరియు"
        },


      }
    },
  });

export default i18n;
