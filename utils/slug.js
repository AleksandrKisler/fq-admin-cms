const ruMap= {
  а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',
  м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',
  щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',
};
export function slugifyRu(input, max = 64) {
  if (!input) return '';
  const lower = input.toLowerCase();
  let out = '';
  for (const ch of lower) {
    if (ruMap[ch]) out += ruMap[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else if (/[ \-_]+/.test(ch)) out += '-';
  }
  out = out.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return out.slice(0, max);
}
