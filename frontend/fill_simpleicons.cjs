const si = require('simple-icons');
const fs = require('fs');

const mappings = {
    youtube: 'siYoutube',
    netflix: 'siNetflix',
    yandex: 'siYandex',
    kinopoisk: 'siKinopoisk',
    spotify: 'siSpotify',
    apple: 'siApplemusic',
    microsoft: 'siMicrosoft',
    google: 'siGoogle',
    duolingo: 'siDuolingo'
};

const output = [];
output.push('export const SERVICE_ICONS: Record<string, string> = {');

for (const [key, svName] of Object.entries(mappings)) {
    const icon = si[svName];
    if (icon) {
        let svg = icon.svg.replace('<svg ', '<svg fill="#' + icon.hex + '" ');
        let uri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        output.push('    ' + key + ': \'' + uri + '\',');
    } else {
        console.log('MISSING:', svName);
    }
}
output.push('};');

let content = fs.readFileSync('src/features/clubs/data/serviceCatalog.ts', 'utf8');
content = content.replace(/export const SERVICE_ICONS: Record<string, string> = \{[\s\S]*?\};/, output.join('\n'));
fs.writeFileSync('src/features/clubs/data/serviceCatalog.ts', content);
console.log('Done mapping simple-icons!');
