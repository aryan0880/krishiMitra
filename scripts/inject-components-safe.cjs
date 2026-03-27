const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'App.tsx');
let f = fs.readFileSync(appPath, 'utf8');

const componentsSrcPath = path.join(__dirname, 'components-src.txt');
const componentsStr = fs.readFileSync(componentsSrcPath, 'utf8');

// 1. Inject the components before `// --- Main App ---`
if (!f.includes('const DiagnosePage =')) {
  f = f.replace('// --- Main App ---', componentsStr + '\n\n// --- Main App ---');
}

// 2. Add the screens to the router switch
// Based on previous view_file, the switch cases look like this:
/*
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
            gpsCoords={gpsCoords}
            onOpenSoilReport={(id) => {
              setSoilReportId(id);
              setCurrentScreen('report');
            }}
          />
        );
*/

const routerTarget = "      case 'profile':";
const routerReplacement = `      case 'chat':
        return <ChatPage language={language} />;
      case 'diagnose':
        return <DiagnosePage language={language} />;
      case 'profile':`;

if (!f.includes("case 'chat':")) {
  f = f.replace(routerTarget, routerReplacement);
}

fs.writeFileSync(appPath, f);
console.log('App.tsx injected successfully');
