const fs = require('fs');
let f = fs.readFileSync('src/App.tsx', 'utf8');

f = f.replace(
  /CircleUser\r?\n} from 'lucide-react';/, 
  "CircleUser,\n  Camera,\n  MessageCircle,\n  ArrowLeft\n} from 'lucide-react';"
);

f = f.replace(
  /Hindi: \{\r?\n\s+nav: \{ home: 'होम', input: 'इनपुट', analysis: 'विश्लेषण', profile: 'प्रोफाइल' \},/, 
  "Hindi: {\n    nav: { home: 'होम', input: 'इनपुट', analysis: 'विश्लेषण', profile: 'प्रोफाइल', diagnose: 'निदान', chat: 'AI से पूछें' },"
);

f = f.replace(
  /Marathi: \{\r?\n\s+nav: \{ home: 'होम', input: 'इनपुट', analysis: 'विश्लेषण', profile: 'प्रोफाइल' \},/, 
  "Marathi: {\n    nav: { home: 'होम', input: 'इनपुट', analysis: 'विश्लेषण', profile: 'प्रोफाइल', diagnose: 'निदान', chat: 'AI ला विचारा' },"
);

f = f.replace(
  /const tabs = \[\s+\{ id: 'home', label: COPY\[language\]\.nav\.home, icon: Home, screen: 'landing' as Screen \},\s+\{ id: 'input', label: COPY\[language\]\.nav\.input, icon: LayoutGrid, screen: 'input' as Screen \},\s+\{ id: 'analysis', label: COPY\[language\]\.nav\.analysis, icon: ClipboardList, screen: 'dashboard' as Screen \},\s+\{ id: 'profile', label: COPY\[language\]\.nav\.profile, icon: User, screen: 'profile' as Screen \},\s+\];/g, 
  `const tabs = [
    { id: 'input', label: COPY[language].nav.input, icon: LayoutGrid, screen: 'input' as Screen },
    { id: 'diagnose', label: COPY[language].nav.diagnose, icon: Camera, screen: 'diagnose' as Screen },
    { id: 'analysis', label: COPY[language].nav.analysis, icon: ClipboardList, screen: 'dashboard' as Screen },
    { id: 'chat', label: COPY[language].nav.chat, icon: MessageCircle, screen: 'chat' as Screen },
    { id: 'profile', label: COPY[language].nav.profile, icon: User, screen: 'profile' as Screen },
  ];`
);

f = f.replace(
  /const getActiveTab = \(\) => \{\s+if \(currentScreen === 'landing'\) return 'home';\s+if \(currentScreen === 'input'\) return 'input';\s+if \(currentScreen === 'dashboard' \|\| currentScreen === 'report'\) return 'analysis';\s+return 'home';\s+\};/g, 
  `const getActiveTab = () => {
    if (currentScreen === 'input') return 'input';
    if (currentScreen === 'diagnose') return 'diagnose';
    if (currentScreen === 'chat') return 'chat';
    if (currentScreen === 'dashboard' || currentScreen === 'report') return 'analysis';
    if (currentScreen === 'profile') return 'profile';
    return '';
  };`
);

fs.writeFileSync('src/App.tsx', f);
console.log('App.tsx patched successfully');
