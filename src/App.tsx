/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Home, 
  LayoutGrid, 
  ClipboardList, 
  User, 
  ArrowRight, 
  Droplets, 
  Wind, 
  CloudSun,
  Leaf,
  Info,
  Bell,
  Languages,
  Menu,
  Sparkles,
  Sprout,
  CircleUser
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Screen = 'landing' | 'signup' | 'input' | 'dashboard' | 'report';
type Language = 'English' | 'Hindi' | 'Marathi';
type CropStage = 'Seedling' | 'Vegetative' | 'Flowering' | 'Harvest';
type Crop = 'Maize' | 'Wheat' | 'Rice' | 'Cotton';

type WeatherSummary = {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecastSummary: string;
};

type RecommendationData = {
  id: number;
  irrigationText: string;
  fertilizerText: string;
  rationale: string;
  progress: number;
  nextStage?: string;
  reasons?: string[];
  irrigationMm?: number;
  fertilizerNKg?: number;
  fertilizerPKg?: number;
  fertilizerKKg?: number;
};

type SensorReading = {
  sensorReadingId: number;
  createdAt: string;
  crop: string;
  stage: string;
  moisture: number;
  n: number;
  p: number;
  k: number;
  ph: number;
  locationName: string | null;
  lat: number | null;
  lon: number | null;
};

type AnalyticsSummary = {
  runsCount: number;
  totalIrrigationMm: number;
  avgIrrigationMm: number | null;
  totalFertilizerNKg: number;
  totalFertilizerPKg: number;
  totalFertilizerKKg: number;
};

type SoilReportResponse = {
  runId: number;
  createdAt: string;
  sensor: {
    sensorReadingId: number;
    createdAt: string;
    crop: string;
    stage: string;
    moisture: number;
    n: number;
    p: number;
    k: number;
    ph: number;
    locationName: string | null;
    lat: number | null;
    lon: number | null;
  };
  recommendation: {
    irrigationWhen: string | null;
    irrigationMm: number | null;
    fertilizerNKg: number | null;
    fertilizerPKg: number | null;
    fertilizerKKg: number | null;
    reasons: string[];
    rationale: string | null;
    progress: number | null;
    nextStage: string | null;
  };
  weather: WeatherSummary | null;
};

const COPY: Record<Language, any> = {
  English: {
    nav: { home: 'Home', input: 'Input', analysis: 'Analysis', profile: 'Profile' },
    landing: {
      heroTitle1: 'Smart Farming',
      heroTitle2: 'Decisions, Simplified',
      heroSubtitle: 'Empowering farmers with AI-driven insights for better yields and healthier soil.',
      chooseLanguage: 'Choose Your Language',
      ecoSmartTitle: 'Eco-Smart',
      ecoSmartDesc: 'AI insights optimized for sustainable land management.',
      accuracy: 'Accuracy',
      irrigation: 'Irrigation',
      continue: 'Continue',
    },
    input: {
      fieldAnalysis: 'Field Analysis',
      fieldStatusTitle: 'Field Status Update',
      fieldStatusDesc: 'Enter current soil and crop metrics to receive your AI-powered optimization strategy.',
      soilMoistureLabel: 'Soil Moisture (%)',
      soilMoistureSub: 'Current volumetric water content',
      dry: 'Dry',
      optimal: 'Optimal',
      saturated: 'Saturated',
      cropStageTitle: 'Crop Stage',
      cropStageSub: 'Select the current growth phase',
      cropTypeTitle: 'Crop Type',
      cropTypeSub: 'Select crop to tailor recommendations',
      phLabel: 'Soil pH',
      phSub: 'Acidity / alkalinity of soil',
      nutrientN: 'Nitrogen (N)',
      nutrientP: 'Phosphorus (P)',
      nutrientK: 'Potassium (K)',
      stageSeedling: 'Seedling',
      stageVegetative: 'Vegetative',
      stageFlowering: 'Flowering',
      stageHarvest: 'Harvest',
      getRecommendation: 'Get Recommendation',
      calculating: 'Calculating...',
      realTimeSatelliteSensor: 'Calculated using real-time satellite & sensor data',
      recommendationFailed: 'Failed to get recommendation. Please try again.',
      gpsLoading: 'Getting GPS location...',
      gpsUsing: 'Using GPS location.',
      gpsDenied: 'GPS not available. Please select a city.',
      selectCity: 'Select city',
      hasSoilCard: 'Do you have a Soil Health Card?',
      soilCardDesc: 'Your card contains precise soil nutrient data. Having it means we can give more accurate recommendations.',
      soilCardTitle: 'Soil Health Card',
      soilCardSub: 'Issued by government / Krishi Kendra. Contains NPK, pH and more.',
      yesSoilCard: 'Yes, I have it',
      noSoilCard: "No, I don't have one",
      soilTypeLabel: 'Soil Type',
      soilTypeSub: 'Approximate values will be used',
      soilTypeDesc: 'Select your soil type and we will estimate the soil parameters for you.',
      soilTypeClay: 'Clay',
      soilTypeSandy: 'Sandy',
      soilTypeLoamy: 'Loamy',
      lastFertilizerLabel: 'Last Fertilizer Used',
      lastFertilizerPlaceholder: 'e.g. Urea, DAP',
    },
    dashboard: {
      currentWeather: 'Current Weather',
      humidity: 'Humidity',
      windSpeed: 'Wind Speed',
      todaysProtocol: "Today's Protocol",
      smartRecommendations: 'Smart Recommendations',
      actionRequired: 'Action Required',
      fertilization: 'Fertilization',
      analysisRationale: 'Analysis Rationale',
      viewDetailedSoilReport: 'View Detailed Soil Report',
      progressTitle: 'Growth Stage',
      progressRight: 'Next Stage',
      stageSowing: 'Sowing',
      stageVegetative: 'Vegetative',
      stageFlowering: 'Flowering',
      stageHarvest: 'Harvest',
      latestMonitoringTitle: 'Latest Monitoring',
      trendsTitle: 'Trends (Last 5 readings)',
      analyticsTitle: 'Usage Analytics',
      reasonsTitle: 'Explainable Reasons',
      protocolIrrigationFallback: 'Irrigate today',
      protocolFertilizerFallback: 'Apply 20kg Nitrogen',
      rationaleFallback:
        'Soil moisture is low and temperature is high, which increases water loss through evapotranspiration. Nitrogen levels may be below the optimal threshold for the vegetative stage, risking stunted growth if not addressed within 24 hours.',
      alertStage: 'Stage',
    },
    signup: {
      title: 'Get Started',
      subtitle: 'Tell us a bit about your farm',
      nameLabel: 'Farmer Name',
      namePlaceholder: 'e.g. Rahul Patil',
      locationLabel: 'Village/City',
      locationPlaceholder: 'e.g. Pune, MH',
      cropLabel: 'Primary Crop',
      selectCrop: 'Select Crop',
      continue: 'Create Profile',
    },
    profile: {
      title: 'Farmer Profile',
      subtitle: 'Your agricultural identity',
      logout: 'Logout',
      edit: 'Edit Profile',
      stats: 'Farm Stats',
      memberSince: 'Member Since',
      location: 'Location',
      preferredCrop: 'Preferred Crop',
    },
  },
  Hindi: {
    nav: { home: 'होम', input: 'इनपुट', analysis: 'विश्लेषण', profile: 'प्रोफाइल' },
    landing: {
      heroTitle1: 'स्मार्ट खेती',
      heroTitle2: 'निर्णय, सरल किए गए',
      heroSubtitle: 'बेहतर उत्पादन और स्वस्थ मिट्टी के लिए किसानों को AI-आधारित अंतर्दृष्टि।',
      chooseLanguage: 'अपनी भाषा चुनें',
      ecoSmartTitle: 'ईको- स्मार्ट',
      ecoSmartDesc: 'सतत भूमि प्रबंधन के लिए अनुकूलित AI अंतर्दृष्टि।',
      accuracy: 'सटीकता',
      irrigation: 'सिंचाई',
      continue: 'जारी रखें',
    },
    input: {
      fieldAnalysis: 'फसल विश्लेषण',
      fieldStatusTitle: 'खेत की स्थिति अपडेट',
      fieldStatusDesc: 'AI-आधारित ऑप्टिमाइज़ेशन रणनीति पाने के लिए वर्तमान मिट्टी और फसल मेट्रिक्स दर्ज करें।',
      soilMoistureLabel: 'मिट्टी की नमी (%)',
      soilMoistureSub: 'वर्तमान वॉल्यूमेट्रिक जल सामग्री',
      dry: 'सूखी',
      optimal: 'उत्तम',
      saturated: 'संतृप्त',
      cropStageTitle: 'फसल का चरण',
      cropStageSub: 'विकास के वर्तमान चरण का चयन करें',
      cropTypeTitle: 'फसल का प्रकार',
      cropTypeSub: 'अनुशंसाएं फसल के अनुसार बनती हैं',
      phLabel: 'मिट्टी का pH',
      phSub: 'मिट्टी की अम्लीयता / क्षारीयता',
      nutrientN: 'नाइट्रोजन (N)',
      nutrientP: 'फॉस्फोरस (P)',
      nutrientK: 'पोटैशियम (K)',
      stageSeedling: 'अंकुर अवस्था',
      stageVegetative: 'वनस्पतिक अवस्था',
      stageFlowering: 'फूल आने की अवस्था',
      stageHarvest: 'कटाई अवस्था',
      getRecommendation: 'सिफारिश लें',
      calculating: 'गणना हो रही है...',
      realTimeSatelliteSensor: 'रियल-टाइम सैटेलाइट और सेंसर डेटा से गणना की गई',
      recommendationFailed: 'सिफारिश नहीं मिल पाई। कृपया फिर से प्रयास करें।',
      gpsLoading: 'आपका GPS स्थान प्राप्त किया जा रहा है...',
      gpsUsing: 'GPS स्थान उपयोग किया जा रहा है।',
      gpsDenied: 'GPS उपलब्ध नहीं है। कृपया शहर चुनें।',
      selectCity: 'शहर चुनें',
      hasSoilCard: 'क्या आपके पास मृदा स्वास्थ्य कार्ड है?',
      soilCardDesc: 'आपके कार्ड में सटीक मिट्टी पोषक डेटा है। इससे हम अधिक सटीक सिफारिशें दे सकते हैं।',
      soilCardTitle: 'मृदा स्वास्थ्य कार्ड',
      soilCardSub: 'सरकार / कृषि केंद्र द्वारा जारी। NPK, pH और अधिक जानकारी शामिल।',
      yesSoilCard: 'हाँ, मेरे पास है',
      noSoilCard: 'नहीं, मेरे पास नहीं है',
      soilTypeLabel: 'मिट्टी का प्रकार',
      soilTypeSub: 'अनुमानित मान उपयोग किए जाएंगे',
      soilTypeDesc: 'अपनी मिट्टी का प्रकार चुनें और हम आपके लिए मिट्टी के मापदंड अनुमानित करेंगे।',
      soilTypeClay: 'चिकनी मिट्टी',
      soilTypeSandy: 'रेतीली मिट्टी',
      soilTypeLoamy: 'दोमट मिट्टी',
      lastFertilizerLabel: 'अंतिम उर्वरक उपयोग',
      lastFertilizerPlaceholder: 'जैसे यूरिया, DAP',
    },
    dashboard: {
      currentWeather: 'वर्तमान मौसम',
      humidity: 'आर्द्रता',
      windSpeed: 'हवा की रफ्तार',
      todaysProtocol: 'आज की प्रक्रिया',
      smartRecommendations: 'स्मार्ट सिफारिशें',
      actionRequired: 'तुरंत करने योग्य',
      fertilization: 'उर्वरक',
      analysisRationale: 'विश्लेषण का कारण',
      viewDetailedSoilReport: 'विस्तृत मिट्टी रिपोर्ट देखें',
      progressTitle: 'वृद्धि चरण',
      progressRight: 'अगला चरण',
      stageSowing: 'बुवाई',
      stageVegetative: 'वनस्पतिक',
      stageFlowering: 'फूल आना',
      stageHarvest: 'कटाई',
      latestMonitoringTitle: 'नवीनतम निगरानी',
      trendsTitle: 'ट्रेंड्स (पिछली 5 रीडिंग)',
      analyticsTitle: 'उपयोग विश्लेषण',
      reasonsTitle: 'समझने योग्य कारण',
      protocolIrrigationFallback: 'आज सिंचाई करें',
      protocolFertilizerFallback: '20 किग्रा नाइट्रोजन डालें',
      rationaleFallback:
        'मिट्टी की नमी कम है और तापमान अधिक है, जिससे बाष्पोत्सर्जन के कारण पानी की हानि बढ़ती है। नाइट्रोजन स्तर वनस्पतिक अवस्था के लिए इष्टतम सीमा से कम हो सकते हैं, जिससे 24 घंटों के भीतर ध्यान न देने पर वृद्धि रुक सकती है।',
      alertStage: 'चरण',
    },
    signup: {
      title: 'शुरुआत करें',
      subtitle: 'हमें अपने खेत के बारे में थोड़ा बताएं',
      nameLabel: 'किसान का नाम',
      namePlaceholder: 'जैसे राहुल पाटिल',
      locationLabel: 'गाँव/शहर',
      locationPlaceholder: 'जैसे पुणे, महाराष्ट्र',
      cropLabel: 'मुख्य फसल',
      selectCrop: 'फसल चुनें',
      continue: 'प्रोफ़ाइल बनाएं',
    },
    profile: {
      title: 'किसान प्रोफ़ाइल',
      subtitle: 'आपकी कृषि पहचान',
      logout: 'लॉगआउट',
      edit: 'प्रोफ़ाइल बदलें',
      stats: 'खेत के आँकड़े',
      memberSince: 'सदस्यता की तिथि',
      location: 'स्थान',
      preferredCrop: 'पसंदीदा फसल',
    },
  },
  Marathi: {
    nav: { home: 'होम', input: 'इनपुट', analysis: 'विश्लेषण', profile: 'प्रोफाइल' },
    landing: {
      heroTitle1: 'स्मार्ट शेती',
      heroTitle2: 'निर्णय, सोपे करून',
      heroSubtitle: 'उत्तम उत्पादन आणि निरोगी मातीसाठी शेतकऱ्यांना AI-आधारित अंतर्दृष्टी.',
      chooseLanguage: 'तुमची भाषा निवडा',
      ecoSmartTitle: 'ईको-स्मार्ट',
      ecoSmartDesc: 'शाश्वत जमीन व्यवस्थापनासाठी अनुकूलित AI अंतर्दृष्टी.',
      accuracy: 'अचूकता',
      irrigation: 'सिंचन',
      continue: 'पुढे',
    },
    input: {
      fieldAnalysis: 'शेती विश्लेषण',
      fieldStatusTitle: 'शेत स्थिती अपडेट',
      fieldStatusDesc: 'AI-आधारित ऑप्टिमायझेशन रणनीती मिळवण्यासाठी सध्याची माती आणि पिकाची माहिती द्या.',
      soilMoistureLabel: 'मातीतील ओलावा (%)',
      soilMoistureSub: 'मोजलेला वॉल्यूमेट्रिक पाणी प्रमाण',
      dry: 'कोरडी',
      optimal: 'उत्तम',
      saturated: 'संतृप्त',
      cropStageTitle: 'पिकाचा टप्पा',
      cropStageSub: 'पिकाची सध्याची वाढ अवस्था निवडा',
      cropTypeTitle: 'पिकाचा प्रकार',
      cropTypeSub: 'शिफारस पिकानुसार बदलेल',
      phLabel: 'मातीचा pH',
      phSub: 'मातीची आम्लता / क्षारता',
      nutrientN: 'नायट्रोजन (N)',
      nutrientP: 'फॉस्फरस (P)',
      nutrientK: 'पोटॅशियम (K)',
      stageSeedling: 'रोप अवस्था',
      stageVegetative: 'वनस्पतिजन्य अवस्था',
      stageFlowering: 'फुलोरा अवस्था',
      stageHarvest: 'काढणी अवस्था',
      getRecommendation: 'शिफारस मिळवा',
      calculating: 'गणना सुरू आहे...',
      realTimeSatelliteSensor: 'रिअल-टाइम उपग्रह आणि सेन्सर डेटावरून गणना',
      recommendationFailed: 'शिफारस मिळू शकली नाही. कृपया पुन्हा प्रयत्न करा।',
      gpsLoading: 'तुमचे GPS स्थान मिळवले जात आहे...',
      gpsUsing: 'GPS स्थान वापरले जात आहे.',
      gpsDenied: 'GPS उपलब्ध नाही. कृपया शहर निवडा.',
      selectCity: 'शहर निवडा',
      hasSoilCard: 'तुमच्याकडे मृदा आरोग्य कार्ड आहे का?',
      soilCardDesc: 'तुमच्या कार्डमध्ये अचूक माती पोषक डेटा आहे. यामुळे आम्ही अधिक अचूक शिफारसी देऊ शकतो.',
      soilCardTitle: 'मृदा आरोग्य कार्ड',
      soilCardSub: 'सरकार / कृषी केंद्राद्वारे जारी. NPK, pH आणि अधिक माहिती समाविष्ट.',
      yesSoilCard: 'होय, माझ्याकडे आहे',
      noSoilCard: 'नाही, माझ्याकडे नाही',
      soilTypeLabel: 'मातीचा प्रकार',
      soilTypeSub: 'अंदाजे मूल्ये वापरली जातील',
      soilTypeDesc: 'तुमचा मातीचा प्रकार निवडा आणि आम्ही तुमच्यासाठी मातीचे मापदंड अनुमानित करू.',
      soilTypeClay: 'चिकणमाती',
      soilTypeSandy: 'वाळूयुक्त माती',
      soilTypeLoamy: 'गाळाची माती',
      lastFertilizerLabel: 'शेवटचे वापरलेले खत',
      lastFertilizerPlaceholder: 'उदा. युरिया, DAP',
    },
    dashboard: {
      currentWeather: 'सध्याचे हवामान',
      humidity: 'आर्द्रता',
      windSpeed: 'वाऱ्याचा वेग',
      todaysProtocol: 'आजची प्रक्रिया',
      smartRecommendations: 'स्मार्ट शिफारसी',
      actionRequired: 'करावयाची कृती',
      fertilization: 'खत देणे',
      analysisRationale: 'विश्लेषणाचे कारण',
      viewDetailedSoilReport: 'विस्तृत माती अहवाल पहा',
      progressTitle: 'वाढीचा टप्पा',
      progressRight: 'पुढचा टप्पा',
      stageSowing: 'पेरणी',
      stageVegetative: 'वनस्पतिजन्य',
      stageFlowering: 'फुलोरा',
      stageHarvest: 'काढणी',
      latestMonitoringTitle: 'अलीकडील निरीक्षण',
      trendsTitle: 'ट्रेंड्स (शेवटच्या 5 रीडिंग)',
      analyticsTitle: 'वापर विश्लेषण',
      reasonsTitle: 'स्पष्ट कारणे',
      protocolIrrigationFallback: 'आज सिंचन करा',
      protocolFertilizerFallback: '20 किग्रा नायट्रोजन द्या',
      rationaleFallback:
        'मातीतील ओलावा कमी आहे आणि तापमान जास्त आहे, त्यामुळे बाष्पीभवनामुळे पाण्याची गळती वाढते. वनस्पतिजन्य अवस्थेसाठी नायट्रोजनची पातळी इष्टतम मर्यादेपेक्षा कमी असू शकते; 24 तासांच्या आत उपाय न केल्यास वाढ खुंटू शकते.',
      alertStage: 'टप्पा',
    },
    signup: {
      title: 'सुरुवात करूया',
      subtitle: 'तुमच्या शेतीबद्दल थोडे सांगा',
      nameLabel: 'शेतकऱ्याचे नाव',
      namePlaceholder: 'उदा. राहुल पाटील',
      locationLabel: 'गाव/शहर',
      locationPlaceholder: 'उदा. पुणे, महाराष्ट्र',
      cropLabel: 'मुख्य पीक',
      selectCrop: 'पीक निवडा',
      continue: 'प्रोफाईल तयार करा',
    },
    profile: {
      title: 'शेतकरी प्रोफाईल',
      subtitle: 'तुमची कृषी ओळख',
      logout: 'लॉगआउट',
      edit: 'प्रोफाईल संपादित करा',
      stats: 'शेतीची आकडेवारी',
      memberSince: 'सभासदत्व तारीख',
      location: 'ठिकाण',
      preferredCrop: 'आवडते पीक',
    },
  },
};

// --- Components ---

const BottomNav = ({
  activeTab,
  onTabChange,
  language,
}: {
  activeTab: string;
  onTabChange: (tab: Screen) => void;
  language: Language;
}) => {
  const tabs = [
    { id: 'home', label: COPY[language].nav.home, icon: Home, screen: 'landing' as Screen },
    { id: 'input', label: COPY[language].nav.input, icon: LayoutGrid, screen: 'input' as Screen },
    { id: 'analysis', label: COPY[language].nav.analysis, icon: ClipboardList, screen: 'dashboard' as Screen },
    { id: 'profile', label: COPY[language].nav.profile, icon: User, screen: 'profile' as Screen },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 pt-2 bg-[#f9f8f2] z-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex justify-around py-2 px-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.screen)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                isActive ? 'bg-[#1f4d2b] text-white' : 'text-gray-400'
              }`}
            >
              <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SignupPage = ({
  onSuccess,
  language,
}: {
  onSuccess: (user: { name: string; location: string; crop: string }) => void;
  language: Language;
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [crop, setCrop] = useState<Crop>('Maize');
  const c = COPY[language].signup;

  return (
    <div className="flex flex-col gap-8 pb-24">
      <div className="flex flex-col gap-1 px-1">
        <h2 className="text-2xl font-bold text-gray-900">{c.title}</h2>
        <p className="text-sm text-gray-500 font-medium">{c.subtitle}</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{c.nameLabel}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#f5f5f0] p-4 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none"
            placeholder={c.namePlaceholder}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{c.locationLabel}</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-[#f5f5f0] p-4 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none"
            placeholder={c.locationPlaceholder}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{c.cropLabel}</label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value as Crop)}
            className="w-full bg-[#f5f5f0] p-4 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none appearance-none"
          >
            <option value="Maize">Maize</option>
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice</option>
            <option value="Cotton">Cotton</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => {
          if (name && location) {
            onSuccess({ name, location, crop });
          }
        }}
        disabled={!name || !location}
        className="w-full bg-[#1f4d2b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-green-900/10 disabled:opacity-50"
      >
        {c.continue} <ArrowRight size={20} />
      </button>
    </div>
  );
};

const LandingPage = ({ 
  onNext, 
  initialLang,
}: { 
  onNext: (lang: Language) => void;
  initialLang: Language;
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>(initialLang);
  const c = COPY[selectedLang];

  const languages: { name: Language, label: string, sub: string }[] = [
    { name: 'English', label: 'English', sub: 'Primary Global Language' },
    { name: 'Hindi', label: 'Hindi', sub: 'हिंदी - आधिकारिक भाषा' },
    { name: 'Marathi', label: 'Marathi', sub: 'मराठी - प्रादेशिक भाषा' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sprout size={20} className="text-[#1f4d2b]" />
          <h1 className="text-lg font-bold text-[#1f4d2b]">KrishiMitra</h1>
        </div>
        <Languages size={18} className="text-gray-400" />
      </div>

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm">
        <img 
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80" 
          alt="Farmer in Modern Field" 
          className="w-full h-[320px] object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f9f8f2] via-[#f9f8f2]/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2 bg-gradient-to-t from-[#f9f8f2] to-transparent">
          <h2 className="text-3xl font-bold leading-tight text-[#1f4d2b] drop-shadow-sm">
            {c.landing.heroTitle1}<br />{c.landing.heroTitle2}
          </h2>
          <p className="text-sm text-gray-800 font-semibold leading-relaxed">
            {c.landing.heroSubtitle}
          </p>
        </div>
      </div>

      {/* Language Selection */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <div className="p-1 bg-[#e6f4ea] rounded-full text-[#1f4d2b]">
            <Languages size={14} />
          </div>
          <h3 className="text-sm font-bold text-gray-800">{c.landing.chooseLanguage}</h3>
        </div>
        <div className="flex flex-col gap-2">
          {languages.map((lang) => (
            <button
              key={lang.name}
              onClick={() => setSelectedLang(lang.name)}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                selectedLang === lang.name 
                ? 'bg-white border-[#1f4d2b] shadow-sm' 
                : 'bg-white/50 border-transparent text-gray-700'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold text-sm">{lang.label}</span>
                <span className="text-[10px] text-gray-400">{lang.sub}</span>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedLang === lang.name ? 'border-[#1f4d2b]' : 'border-gray-200'
              }`}>
                {selectedLang === lang.name && <div className="w-2 h-2 rounded-full bg-[#1f4d2b]" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Eco-Smart Card */}
      <div className="bg-[#e6f4ea] p-5 rounded-2xl flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#1f4d2b]">
            <Leaf size={18} fill="currentColor" />
            <h3 className="font-bold text-sm">{c.landing.ecoSmartTitle}</h3>
          </div>
          <p className="text-[10px] text-gray-600 font-medium">
            {c.landing.ecoSmartDesc}
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1 bg-[#d1e7d8] p-3 rounded-xl flex flex-col items-center justify-center gap-1">
            <span className="text-sm font-bold text-[#1f4d2b]">98%</span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{c.landing.accuracy}</span>
          </div>
          <div className="flex-1 bg-[#d1e7d8] p-3 rounded-xl flex flex-col items-center justify-center gap-1">
            <Droplets size={14} className="text-[#1f4d2b]" />
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{c.landing.irrigation}</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="flex items-center justify-center gap-1 opacity-40">
        <Sprout size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">KrishiMitra</span>
      </div>

      {/* CTA Button */}
      <button 
        onClick={() => onNext(selectedLang)}
        className="w-full bg-[#1f4d2b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-green-900/20"
      >
        {c.landing.continue} <ArrowRight size={18} />
      </button>
    </div>
  );
};

const InputFormPage = ({ 
  onNext, 
  onRecommendationReady,
  language,
}: { 
  onNext: () => void;
  onRecommendationReady: (data: { recommendation: RecommendationData; weather: WeatherSummary }) => void;
  language: Language;
}) => {
  const [moisture, setMoisture] = useState(45);
  const [nutrients, setNutrients] = useState({ n: 0, p: 0, k: 0 });
  const [crop, setCrop] = useState<Crop>('Maize');
  const [ph, setPh] = useState(6.5);
  const [stage, setStage] = useState<CropStage>('Vegetative');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSoilCard, setHasSoilCard] = useState<boolean | null>(null);
  const [soilType, setSoilType] = useState<'Clay' | 'Sandy' | 'Loamy'>('Loamy');
  const [lastFertilizer, setLastFertilizer] = useState('');
  const c = COPY[language];

  const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
    Pune: { lat: 18.5204, lon: 73.8567 },
    Mumbai: { lat: 19.076, lon: 72.8777 },
    Delhi: { lat: 28.6139, lon: 77.209 },
    Bengaluru: { lat: 12.9716, lon: 77.5946 },
    Hyderabad: { lat: 17.385, lon: 78.4867 },
    Chennai: { lat: 13.0827, lon: 80.2707 },
    Ahmedabad: { lat: 23.0225, lon: 72.5714 },
    Jaipur: { lat: 26.9124, lon: 75.7873 },
    Nagpur: { lat: 21.1458, lon: 79.0882 },
    Kolkata: { lat: 22.5726, lon: 88.3639 },
  };

  const SOIL_PRESETS: Record<string, { moisture: number; n: number; p: number; k: number; ph: number }> = {
    Clay:  { moisture: 60, n: 40, p: 30, k: 35, ph: 6.5 },
    Sandy: { moisture: 25, n: 20, p: 15, k: 20, ph: 6.0 },
    Loamy: { moisture: 50, n: 50, p: 40, k: 45, ph: 6.8 },
  };

  const [gpsMode, setGpsMode] = useState<'idle' | 'loading' | 'gps' | 'denied'>('idle');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Pune');

  useEffect(() => {
    let cancelled = false;

    const geo = navigator.geolocation;
    if (!geo) {
      setGpsMode('denied');
      setGpsCoords(null);
      return;
    }

    setGpsMode('loading');
    geo.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setGpsCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setGpsMode('gps');
      },
      () => {
        if (cancelled) return;
        setGpsCoords(null);
        setGpsMode('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 5 * 60 * 1000,
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveLocation = gpsCoords
    ? { lat: gpsCoords.lat, lon: gpsCoords.lon, name: 'GPS' }
    : { lat: CITY_COORDS[selectedCity].lat, lon: CITY_COORDS[selectedCity].lon, name: selectedCity };

  const preset = SOIL_PRESETS[soilType];

  const handleSubmit = async (overrides?: { moisture: number; nutrients: { n: number; p: number; k: number }; ph: number }) => {
    try {
      setError(null);
      setLoading(true);
      const body = overrides
        ? { moisture: overrides.moisture, nutrients: overrides.nutrients, ph: overrides.ph, stage, crop, language, location: effectiveLocation }
        : { moisture, nutrients, stage, crop, ph, language, location: effectiveLocation };
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(c.input.recommendationFailed);
      const data = await response.json();
      const recommendation: RecommendationData = {
        id: data.id,
        irrigationText: data.irrigationText,
        fertilizerText: data.fertilizerText,
        rationale: data.rationale,
        progress: data.progress,
      };
      const weatherData: WeatherSummary = data.weather;
      onRecommendationReady({ recommendation, weather: weatherData });
      onNext();
    } catch (e: any) {
      setError(e.message || c.input.recommendationFailed);
    } finally {
      setLoading(false);
    }
  };

  // ---- SCREEN: Soil Card Question ----
  if (hasSoilCard === null) {
    return (
      <div className="flex flex-col gap-8 pb-24">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sprout size={20} className="text-[#1f4d2b]" />
            <h1 className="text-lg font-bold text-[#1f4d2b]">KrishiMitra</h1>
          </div>
        </div>
        <div className="flex flex-col gap-1 px-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.input.fieldAnalysis}</span>
          <h2 className="text-2xl font-bold text-gray-900">{c.input.hasSoilCard}</h2>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">{c.input.soilCardDesc}</p>
        </div>
        <div className="bg-[#e6f4ea] rounded-3xl p-8 flex flex-col items-center gap-4">
          <div className="p-4 bg-[#1f4d2b] rounded-2xl text-white">
            <Leaf size={36} fill="currentColor" />
          </div>
          <span className="text-sm font-bold text-[#1f4d2b] text-center">{c.input.soilCardTitle}</span>
          <span className="text-[10px] text-gray-500 font-medium text-center leading-relaxed">{c.input.soilCardSub}</span>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setHasSoilCard(true)}
            className="w-full bg-[#1f4d2b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-green-900/20"
          >
            <Leaf size={18} /> {c.input.yesSoilCard}
          </button>
          <button
            onClick={() => setHasSoilCard(false)}
            className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
          >
            {c.input.noSoilCard}
          </button>
        </div>
      </div>
    );
  }

  // ---- SCREEN: Flow B � No Soil Health Card (simplified) ----
  if (hasSoilCard === false) {
    return (
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sprout size={20} className="text-[#1f4d2b]" />
            <h1 className="text-lg font-bold text-[#1f4d2b]">KrishiMitra</h1>
          </div>
          <button onClick={() => setHasSoilCard(null)} className="text-xs font-bold text-[#1f4d2b] bg-[#e6f4ea] px-3 py-1.5 rounded-xl">? Back</button>
        </div>
        <div className="flex flex-col gap-1 px-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.input.fieldAnalysis}</span>
          <h2 className="text-2xl font-bold text-gray-900">{c.input.fieldStatusTitle}</h2>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">{c.input.soilTypeDesc}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1f4d2b] rounded-lg text-white"><Leaf size={18} /></div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">{c.input.soilTypeLabel}</span>
              <span className="text-[10px] text-gray-400 font-medium">{c.input.soilTypeSub}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {(['Clay', 'Sandy', 'Loamy'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSoilType(type)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  soilType === type ? 'bg-[#1f4d2b] text-white shadow-md' : 'bg-[#f5f5f0] text-gray-600'
                }`}
              >
                {c.input[`soilType${type}`] as string}
              </button>
            ))}
          </div>
          <div className="bg-[#f5f5f0] rounded-xl p-3 flex gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-gray-500">~Moisture: {preset.moisture}%</span>
            <span className="text-[10px] font-bold text-gray-500">pH: {preset.ph}</span>
            <span className="text-[10px] font-bold text-gray-500">N: {preset.n}</span>
            <span className="text-[10px] font-bold text-gray-500">P: {preset.p}</span>
            <span className="text-[10px] font-bold text-gray-500">K: {preset.k}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1f4d2b] rounded-lg text-white"><Sprout size={18} /></div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">{c.input.cropTypeTitle}</span>
              <span className="text-[10px] text-gray-400 font-medium">{c.input.cropTypeSub}</span>
            </div>
          </div>
          <select value={crop} onChange={(e) => setCrop(e.target.value as Crop)} className="w-full bg-[#f5f5f0] p-4 rounded-xl text-sm font-bold text-gray-700 focus:outline-none appearance-none">
            <option value="Maize">Maize</option>
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice</option>
            <option value="Cotton">Cotton</option>
          </select>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1f4d2b] rounded-lg text-white"><Sprout size={18} /></div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">{c.input.cropStageTitle}</span>
              <span className="text-[10px] text-gray-400 font-medium">{c.input.cropStageSub}</span>
            </div>
          </div>
          <select value={stage} onChange={(e) => setStage(e.target.value as CropStage)} className="w-full bg-[#f5f5f0] p-4 rounded-xl text-sm font-bold text-gray-700 focus:outline-none appearance-none">
            <option value="Seedling">{c.input.stageSeedling}</option>
            <option value="Vegetative">{c.input.stageVegetative}</option>
            <option value="Flowering">{c.input.stageFlowering}</option>
            <option value="Harvest">{c.input.stageHarvest}</option>
          </select>
        </div>
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={() => handleSubmit({ moisture: preset.moisture, nutrients: { n: preset.n, p: preset.p, k: preset.k }, ph: preset.ph })}
            disabled={loading}
            className="w-full bg-[#1f4d2b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-green-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? c.input.calculating : c.input.getRecommendation} <Sparkles size={18} />
          </button>
          {error && <p className="text-[10px] text-center text-red-500 font-medium">{error}</p>}
          {gpsMode === 'loading' && <p className="text-[10px] text-center text-gray-500 font-medium">{c.input.gpsLoading}</p>}
          {gpsMode === 'gps' && <p className="text-[10px] text-center text-gray-500 font-medium">{c.input.gpsUsing}</p>}
          {gpsMode === 'denied' && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-center text-gray-600 font-medium">{c.input.gpsDenied}</p>
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full bg-white p-3 rounded-xl text-xs font-bold text-gray-700 focus:outline-none appearance-none border border-gray-100">
                {Object.keys(CITY_COORDS).map((city) => (<option key={city} value={city}>{city}</option>))}
              </select>
            </div>
          )}
          <p className="text-[10px] text-center text-gray-400 font-medium">{c.input.realTimeSatelliteSensor}</p>
        </div>
      </div>
    );
  }

  // ---- SCREEN: Flow A � Has Soil Health Card (detailed) ----
  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sprout size={20} className="text-[#1f4d2b]" />
          <h1 className="text-lg font-bold text-[#1f4d2b]">KrishiMitra</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setHasSoilCard(null)} className="text-xs font-bold text-[#1f4d2b] bg-[#e6f4ea] px-3 py-1.5 rounded-xl">? Back</button>
          <div className="relative">
            <Bell size={18} className="text-gray-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full border-2 border-[#f9f8f2]" />
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 font-bold text-xs">
            A
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 px-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.input.fieldAnalysis}</span>
        <h2 className="text-2xl font-bold text-gray-900">{c.input.fieldStatusTitle}</h2>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          {c.input.fieldStatusDesc}
        </p>
      </div>

      {/* Soil Moisture Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#e6f4ea] rounded-xl text-[#1f4d2b]">
            <Droplets size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">{c.input.soilMoistureLabel}</span>
            <span className="text-[10px] text-gray-400 font-medium">{c.input.soilMoistureSub}</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-[#f5f5f0] px-6 py-3 rounded-xl flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-800">{moisture}</span>
            <span className="text-xl font-bold text-gray-400">%</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={moisture}
            onChange={(e) => setMoisture(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1f4d2b]"
          />
          <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest">
            <span>{c.input.dry}</span>
            <span className="text-[#1f4d2b]">{c.input.optimal}</span>
            <span>{c.input.saturated}</span>
          </div>
        </div>
      </div>

      {/* Soil pH Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#e6f4ea] rounded-xl text-[#1f4d2b]">
            <Leaf size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">{c.input.phLabel}</span>
            <span className="text-[10px] text-gray-400 font-medium">{c.input.phSub}</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="bg-[#f5f5f0] px-6 py-3 rounded-xl flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-800">{ph}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="number"
            value={ph}
            onChange={(e) => setPh(parseFloat(e.target.value) || 0)}
            step={0.1}
            min={3.5}
            max={9.5}
            className="w-full bg-[#f5f5f0] p-4 rounded-xl text-sm font-bold text-gray-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Nutrients Section */}
      <div className="flex flex-col gap-3">
        {[
          { id: 'n', label: c.input.nutrientN, value: nutrients.n },
          { id: 'p', label: c.input.nutrientP, value: nutrients.p },
          { id: 'k', label: c.input.nutrientK, value: nutrients.k },
        ].map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-gray-400">
              <Sprout size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </div>
            <input 
              type="number" 
              value={item.value}
              onChange={(e) => setNutrients({...nutrients, [item.id as keyof typeof nutrients]: parseInt(e.target.value) || 0})}
              className="text-3xl font-bold text-gray-800 bg-transparent focus:outline-none text-center w-full"
            />
          </div>
        ))}
      </div>

      {/* Crop Type */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1f4d2b] rounded-lg text-white">
            <Sprout size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">{c.input.cropTypeTitle}</span>
            <span className="text-[10px] text-gray-400 font-medium">{c.input.cropTypeSub}</span>
          </div>
        </div>

        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value as Crop)}
          className="w-full bg-[#f5f5f0] p-4 rounded-xl text-sm font-bold text-gray-700 focus:outline-none appearance-none"
        >
          <option value="Maize">Maize</option>
          <option value="Wheat">Wheat</option>
          <option value="Rice">Rice</option>
          <option value="Cotton">Cotton</option>
        </select>
      </div>

      {/* Crop Stage */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1f4d2b] rounded-lg text-white">
            <Sprout size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">{c.input.cropStageTitle}</span>
            <span className="text-[10px] text-gray-400 font-medium">{c.input.cropStageSub}</span>
          </div>
        </div>
        <select 
          value={stage}
          onChange={(e) => setStage(e.target.value as CropStage)}
          className="w-full bg-[#f5f5f0] p-4 rounded-xl text-sm font-bold text-gray-700 focus:outline-none appearance-none"
        >
          <option value="Seedling">{c.input.stageSeedling}</option>
          <option value="Vegetative">{c.input.stageVegetative}</option>
          <option value="Flowering">{c.input.stageFlowering}</option>
          <option value="Harvest">{c.input.stageHarvest}</option>
        </select>
      </div>

      {/* CTA Button */}
      <div className="flex flex-col gap-3 mt-2">
        <button 
          onClick={async () => {
            try {
              setError(null);
              setLoading(true);
              const response = await fetch('/api/recommendations', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  moisture,
                  nutrients,
                  stage,
                  crop,
                  ph,
                  language,
                  location: effectiveLocation,
                }),
              });
              if (!response.ok) {
                throw new Error(c.input.recommendationFailed);
              }
              const data = await response.json();
              const recommendation: RecommendationData = {
                id: data.id,
                irrigationText: data.irrigationText,
                fertilizerText: data.fertilizerText,
                rationale: data.rationale,
                progress: data.progress,
              };
              const weather: WeatherSummary = data.weather;
              onRecommendationReady({ recommendation, weather });
              onNext();
            } catch (e: any) {
              setError(e.message || c.input.recommendationFailed);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full bg-[#1f4d2b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-green-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? c.input.calculating : c.input.getRecommendation} <Sparkles size={18} />
        </button>
        {error && (
          <p className="text-[10px] text-center text-red-500 font-medium">
            {error}
          </p>
        )}
        {gpsMode === 'loading' && (
          <p className="text-[10px] text-center text-gray-500 font-medium">
            {c.input.gpsLoading}
          </p>
        )}
        {gpsMode === 'gps' && (
          <p className="text-[10px] text-center text-gray-500 font-medium">
            {c.input.gpsUsing}
          </p>
        )}
        {gpsMode === 'denied' && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-center text-gray-600 font-medium">
              {c.input.gpsDenied}
            </p>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-white p-3 rounded-xl text-xs font-bold text-gray-700 focus:outline-none appearance-none border border-gray-100"
            >
              {Object.keys(CITY_COORDS).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}
        <p className="text-[10px] text-center text-gray-400 font-medium">
          {c.input.realTimeSatelliteSensor}
        </p>
      </div>
    </div>
  );
};

const DashboardPage = ({
  recommendation,
  weather,
  language,
  onOpenSoilReport,
}: {
  recommendation: RecommendationData | null;
  weather: WeatherSummary | null;
  language: Language;
  onOpenSoilReport: (runId: number) => void;
}) => {
  const c = COPY[language];
  const temperature = weather?.temperature ?? 28;
  const humidity = weather?.humidity ?? 60;
  const windSpeed = weather?.windSpeed ?? 10;
  const condition = weather?.condition ?? 'Field conditions';
  const protocolIrrigation = recommendation?.irrigationText ?? c.dashboard.protocolIrrigationFallback;
  const protocolFertilizer = recommendation?.fertilizerText ?? c.dashboard.protocolFertilizerFallback;
  const rationale = recommendation?.rationale ?? c.dashboard.rationaleFallback;
  const progress = recommendation?.progress ?? 65;

  const [latestSensor, setLatestSensor] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [latestRes, historyRes, analyticsRes] = await Promise.all([
          fetch('/api/sensors/latest'),
          fetch('/api/sensors/history?limit=5'),
          fetch('/api/analytics/summary'),
        ]);

        if (!latestRes.ok || !historyRes.ok || !analyticsRes.ok) return;

        const latestRaw = await latestRes.json();
        const historyRaw = await historyRes.json();
        const analyticsRaw = await analyticsRes.json();

        if (cancelled) return;

        if (latestRaw) {
          setLatestSensor({
            sensorReadingId: latestRaw.id,
            createdAt: latestRaw.created_at,
            crop: latestRaw.crop,
            stage: latestRaw.stage,
            moisture: latestRaw.moisture,
            n: latestRaw.n,
            p: latestRaw.p,
            k: latestRaw.k,
            ph: latestRaw.ph,
            locationName: latestRaw.location_name,
            lat: latestRaw.lat,
            lon: latestRaw.lon,
          });
        }

        setHistory(
          (historyRaw ?? []).map((r: any) => ({
            sensorReadingId: r.id,
            createdAt: r.created_at,
            crop: r.crop,
            stage: r.stage,
            moisture: r.moisture,
            n: r.n,
            p: r.p,
            k: r.k,
            ph: r.ph,
            locationName: r.location_name,
            lat: r.lat,
            lon: r.lon,
          })),
        );

        setAnalytics(analyticsRaw as AnalyticsSummary);
      } catch {
        // Ignore dashboard load errors for now.
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const localizedStageLabel = (stageValue: string) => {
    switch (stageValue) {
      case 'Seedling':
        return c.input.stageSeedling;
      case 'Vegetative':
        return c.input.stageVegetative;
      case 'Flowering':
        return c.input.stageFlowering;
      case 'Harvest':
        return c.input.stageHarvest;
      default:
        return stageValue;
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Menu size={20} className="text-gray-800" />
          <h1 className="text-lg font-bold text-[#1f4d2b]">KrishiMitra</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 font-bold text-xs border-2 border-white shadow-sm">
          A
        </div>
      </div>

      {/* Weather Section */}
      <div className="flex flex-col gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.dashboard.currentWeather}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-800">{temperature}°</span>
              <span className="text-xl font-bold text-gray-400">C</span>
            </div>
            <span className="text-xs font-bold text-gray-500">{condition}</span>
          </div>
          <div className="w-16 h-16 bg-[#e6f4ea] rounded-full flex items-center justify-center text-[#1f4d2b]">
            <CloudSun size={32} />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
            <Droplets size={18} className="text-blue-400" />
            <span className="text-sm font-bold text-gray-800">{humidity}%</span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{c.dashboard.humidity}</span>
          </div>
          <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
            <Wind size={18} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-800">{windSpeed} km/h</span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{c.dashboard.windSpeed}</span>
          </div>
        </div>
      </div>

      {/* Latest Monitoring */}
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
          {c.dashboard.latestMonitoringTitle}
        </span>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">
              {latestSensor?.crop ?? '--'}
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {latestSensor ? localizedStageLabel(latestSensor.stage) : ''}
            </span>
          </div>

          <div className="text-xs text-gray-700 font-medium">
            Moisture: {latestSensor?.moisture ?? '--'}% • {c.input.phLabel}: {latestSensor?.ph?.toFixed(1) ?? '--'} • N: {latestSensor?.n ?? '--'} P: {latestSensor?.p ?? '--'} K: {latestSensor?.k ?? '--'}
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
          {c.dashboard.trendsTitle}
        </span>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3">
          {history.length === 0 ? (
            <p className="text-xs text-gray-500 font-medium">No history yet.</p>
          ) : (
            history.map((r) => (
              <div key={r.sensorReadingId} className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-gray-500">
                  {r.crop}
                </span>
                <span className="text-[10px] font-bold text-gray-800">
                  {r.moisture}% • pH {r.ph.toFixed(1)}
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  N {r.n} P {r.p} K {r.k}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Today's Protocol */}
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{c.dashboard.todaysProtocol}</span>
        <div className="bg-[#1f4d2b] p-6 rounded-3xl shadow-lg flex flex-col gap-6">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-sm">{c.dashboard.smartRecommendations}</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-white">
              <div className="p-2 bg-white/10 rounded-full">
                <Droplets size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">{c.dashboard.actionRequired}</span>
                <span className="text-sm font-bold">{protocolIrrigation}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white">
              <div className="p-2 bg-white/10 rounded-full">
                <Sprout size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">{c.dashboard.fertilization}</span>
                <span className="text-sm font-bold">{protocolFertilizer}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Rationale */}
      <div className="bg-[#f5f5f0] p-6 rounded-3xl flex flex-col gap-4 border border-gray-100">
        <div className="flex items-center gap-2 text-gray-800">
          <Info size={18} />
          <h3 className="font-bold text-sm">{c.dashboard.analysisRationale}</h3>
        </div>
        {recommendation?.reasons?.length ? (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {c.dashboard.reasonsTitle}
            </span>
            <ul className="list-disc pl-4 text-xs text-gray-600 font-medium">
              {recommendation.reasons.map((r, idx) => (
                <li key={`${idx}-${r}`} className="mt-1">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="text-xs text-gray-600 font-medium leading-relaxed">
          {rationale}
        </p>
        <button
          className="w-full bg-white py-3 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-center gap-2 shadow-sm border border-gray-100"
          onClick={() => {
            if (!recommendation) return;
            onOpenSoilReport(recommendation.id);
          }}
          disabled={!recommendation}
        >
          {c.dashboard.viewDetailedSoilReport} <ArrowRight size={14} />
        </button>
      </div>

      {/* Usage Analytics */}
      <div className="bg-white p-6 rounded-3xl flex flex-col gap-4 border border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-800">
            <Sparkles size={18} />
            <h3 className="font-bold text-sm">{c.dashboard.analyticsTitle}</h3>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {analytics ? `${analytics.runsCount} runs` : ''}
          </span>
        </div>
        <div className="text-xs text-gray-700 font-medium">
          Total irrigation: {analytics?.totalIrrigationMm ?? '--'} mm • Total Fertilizer N: {analytics?.totalFertilizerNKg ?? '--'} kg • P: {analytics?.totalFertilizerPKg ?? '--'} kg • K: {analytics?.totalFertilizerKKg ?? '--'} kg
        </div>
      </div>

      {/* Progress Section */}
      <div className="flex flex-col gap-4 px-1 pb-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-gray-800">
            {(latestSensor?.crop ?? 'Crop') + ' ' + c.dashboard.progressTitle}
          </span>
          <span className="text-xs font-bold text-gray-800">
            {recommendation?.nextStage ? `${c.dashboard.progressRight}: ${localizedStageLabel(recommendation.nextStage)}` : c.dashboard.progressRight}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#1f4d2b] rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest">
          <span>{c.dashboard.stageSowing}</span>
          <span>{c.dashboard.stageVegetative}</span>
          <span>{c.dashboard.stageFlowering}</span>
          <span>{c.dashboard.stageHarvest}</span>
        </div>
      </div>
    </div>
  );
};

const SoilReportPage = ({
  runId,
  language,
  onBack,
}: {
  runId: number;
  language: Language;
  onBack: () => void;
}) => {
  const c = COPY[language];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SoilReportResponse | null>(null);

  const stageLabel = (stageValue: string) => {
    switch (stageValue) {
      case 'Seedling':
        return c.input.stageSeedling;
      case 'Vegetative':
        return c.input.stageVegetative;
      case 'Flowering':
        return c.input.stageFlowering;
      case 'Harvest':
        return c.input.stageHarvest;
      default:
        return stageValue;
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/soil-report/${runId}`);
        if (!res.ok) throw new Error('Failed to load report');
        const data = (await res.json()) as SoilReportResponse;
        if (cancelled) return;
        setReport(data);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? 'Failed to load report');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [runId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white border border-gray-100 rounded-xl shadow-sm"
          >
            {'<'}
          </button>
          <h1 className="text-lg font-bold text-[#1f4d2b]">Soil Report</h1>
        </div>
        <p className="text-xs text-gray-500 font-medium">Loading...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white border border-gray-100 rounded-xl shadow-sm"
          >
            {'<'}
          </button>
          <h1 className="text-lg font-bold text-[#1f4d2b]">Soil Report</h1>
        </div>
        <p className="text-xs text-red-500 font-medium">{error ?? 'Failed to load report'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-800 font-bold"
          >
            {'<'}
          </button>
          <h1 className="text-lg font-bold text-[#1f4d2b]">{c.dashboard.viewDetailedSoilReport}</h1>
        </div>
      </div>

      {/* Sensor snapshot */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-800">
          <Info size={18} />
          <h3 className="font-bold text-sm">Soil Snapshot</h3>
        </div>
        <div className="text-xs text-gray-700 font-medium leading-relaxed">
          <div>
            Crop: {report.sensor.crop} • Stage: {stageLabel(report.sensor.stage)}
          </div>
          <div>
            Moisture: {report.sensor.moisture}% • {c.input.phLabel}: {report.sensor.ph.toFixed(1)}
          </div>
          <div>
            N: {report.sensor.n} • P: {report.sensor.p} • K: {report.sensor.k}
          </div>
          <div>
            Location: {report.sensor.locationName ?? '—'}{report.sensor.lat != null && report.sensor.lon != null ? ` (${report.sensor.lat.toFixed(3)}, ${report.sensor.lon.toFixed(3)})` : ''}
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-[#f5f5f0] p-6 rounded-3xl flex flex-col gap-4 border border-gray-100">
        <div className="flex items-center gap-2 text-gray-800">
          <Sparkles size={18} />
          <h3 className="font-bold text-sm">Recommendation Details</h3>
        </div>

        <div className="text-xs text-gray-700 font-medium leading-relaxed">
          <div>
            Irrigation: {report.recommendation.irrigationWhen ?? '—'} • {report.recommendation.irrigationMm ?? 0} mm
          </div>
          <div>
            Fertilizer (kg/acre): N {report.recommendation.fertilizerNKg ?? 0}, P {report.recommendation.fertilizerPKg ?? 0}, K {report.recommendation.fertilizerKKg ?? 0}
          </div>
          <div>
            Next stage: {report.recommendation.nextStage ? stageLabel(report.recommendation.nextStage) : '—'}
          </div>
        </div>

        {report.recommendation.reasons?.length ? (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {c.dashboard.reasonsTitle}
            </span>
            <ul className="list-disc pl-4 text-xs text-gray-600 font-medium">
              {report.recommendation.reasons.map((r, idx) => (
                <li key={`${idx}-${r}`} className="mt-1">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="text-xs text-gray-600 font-medium leading-relaxed">
          {report.recommendation.rationale ?? ''}
        </p>
      </div>

      {/* Weather snapshot */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-800">
          <CloudSun size={18} />
          <h3 className="font-bold text-sm">Weather Snapshot</h3>
        </div>
        {report.weather ? (
          <div className="text-xs text-gray-700 font-medium leading-relaxed">
            <div>
              Temperature: {report.weather.temperature}°C • {report.weather.condition}
            </div>
            <div>
              Humidity: {report.weather.humidity}% • Wind: {report.weather.windSpeed} km/h
            </div>
            <div>{report.weather.forecastSummary}</div>
          </div>
        ) : (
          <p className="text-xs text-gray-500 font-medium">Weather unavailable.</p>
        )}
      </div>
    </div>
  );
};

const ProfilePage = ({
  user,
  language,
  onLogout,
}: {
  user: { name: string; location: string; crop: string } | null;
  language: Language;
  onLogout: () => void;
}) => {
  const c = COPY[language].profile;
  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden bg-[#1f4d2b] rounded-[2.5rem] p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl" />
        
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20 shadow-inner">
            <User size={48} className="text-white/80" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
            <p className="text-white/60 text-xs font-medium uppercase tracking-[0.2em] mt-1">{c.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <CloudSun size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.location}</span>
            <span className="text-sm font-bold text-gray-800">{user.location}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
            <Sprout size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.preferredCrop}</span>
            <span className="text-sm font-bold text-gray-800">{user.crop}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button className="w-full bg-[#f5f5f0] text-gray-800 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
          <Sparkles size={18} /> {c.edit}
        </button>
        <button 
          onClick={onLogout}
          className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <Info size={18} /> {c.logout}
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<{ name: string; location: string; crop: string } | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [language, setLanguage] = useState<Language>((localStorage.getItem('lang') as Language) || 'English');
  const [soilReportId, setSoilReportId] = useState<number | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return (
          <LandingPage
            initialLang={language}
            onNext={(lang) => {
              setLanguage(lang);
              localStorage.setItem('lang', lang);
              if (user) {
                setCurrentScreen('input');
              } else {
                setCurrentScreen('signup');
              }
            }}
          />
        );
      case 'signup':
        return (
          <SignupPage
            language={language}
            onSuccess={(u) => {
              setUser(u);
              localStorage.setItem('user', JSON.stringify(u));
              setCurrentScreen('input');
            }}
          />
        );
      case 'input':
        return (
          <InputFormPage
            onNext={() => setCurrentScreen('dashboard')}
            onRecommendationReady={({ recommendation, weather }) => {
              setRecommendation(recommendation);
              setWeather(weather);
            }}
            language={language}
          />
        );
      case 'dashboard':
        return (
          <DashboardPage
            recommendation={recommendation}
            weather={weather}
            language={language}
            onOpenSoilReport={(id) => {
              setSoilReportId(id);
              setCurrentScreen('report');
            }}
          />
        );
      case 'report':
        return soilReportId ? (
          <SoilReportPage
            runId={soilReportId}
            language={language}
            onBack={() => setCurrentScreen('dashboard')}
          />
        ) : (
          <DashboardPage
            recommendation={recommendation}
            weather={weather}
            language={language}
            onOpenSoilReport={(id) => {
              setSoilReportId(id);
              setCurrentScreen('report');
            }}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            user={user}
            language={language}
            onLogout={() => {
              localStorage.removeItem('user');
              setUser(null);
              setCurrentScreen('landing');
            }}
          />
        );
      default:
        return (
          <LandingPage
            initialLang={language}
            onNext={(lang) => {
              setLanguage(lang);
              setCurrentScreen('input');
            }}
          />
        );
    }
  };

  const getActiveTab = () => {
    if (currentScreen === 'landing') return 'home';
    if (currentScreen === 'input') return 'input';
    if (currentScreen === 'dashboard' || currentScreen === 'report') return 'analysis';
    return 'home';
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex justify-center font-sans selection:bg-[#1f4d2b] selection:text-white">
      <div className="w-full max-w-md bg-[#f9f8f2] min-h-screen relative overflow-x-hidden shadow-2xl">
        <main className="px-5 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav 
          activeTab={getActiveTab()} 
          onTabChange={(screen) => setCurrentScreen(screen)} 
          language={language}
        />
      </div>
    </div>
  );
}
