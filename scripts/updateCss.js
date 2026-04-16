const fs = require('fs');
const file = 'f:/VulnGaurd-AI/artifacts/vulnguard/src/index.css';
let content = fs.readFileSync(file, 'utf8');

const replaceRoot = \
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --card: 0 0% 98%;
  --card-foreground: 0 0% 0%;
  --popover: 0 0% 99%;
  --popover-foreground: 0 0% 0%;
  --primary: 0 0% 0%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96%;
  --secondary-foreground: 0 0% 0%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 40%;
  --accent: 0 0% 96%;
  --accent-foreground: 0 0% 0%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 90%;
  --input: 0 0% 90%;
}
.dark {
  --background: 0 0% 0%;
  --foreground: 0 0% 98%;
  --card: 0 0% 2%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 3%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
}
\;

content = content.replace(/:root\s*\{[\s\S]*?--input:[^;]+;\s*\}/, replaceRoot);
fs.writeFileSync(file, content);
console.log('Updated CSS');

