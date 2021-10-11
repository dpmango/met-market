/* eslint-disable quotes */

export const formatUGC = (txt) => {
  return txt.trim().replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, '');
};

export function prepareSmartSearchRegexp(str) {
  const strings = str.match(/"[^"]+"|[^ ]+/g) || [''];

  let regexPattern =
    '^(?=.*?(^|\\s)' +
    strings
      .map((e) => {
        if ('"' === e.charAt(0)) {
          let f = e.match(/^"(.*)"$/);
          e = f ? f[1] : e;
        }
        return escapeRegExp(e.replace('"', '').replace('(', '').replace(')', ''));
      })
      .join(')(?=.*?(^|\\s)') +
    ').*$';
  return regexPattern;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function clearMorphologyInSearchTerm(searchTerm) {
  let trimmedSearchTerm = searchTerm
    .replaceAll('\n', ' ')
    .replaceAll('\r', ' ')
    .replaceAll('\t', ' ')
    .replaceAll("'", ' ')
    .replaceAll('"', ' ')
    .replaceAll('`', ' ')
    .trim();
  let blocks = trimmedSearchTerm.split(' ');
  ['ые', 'ый', 'ая', 'ами', 'ой', 'ем', 'ие', 'ий', 'ой', 'иеся', 'ийся', 'аяся'].forEach((ch) => {
    blocks = blocks.map((b) => {
      return b.length >= 6 ? trimRightChars(b, ch) : b;
    });
  });
  let joined = blocks.join(' ');
  return joined;
}

function trimRightChars(str, chars) {
  return str.replace(new RegExp(`${chars}\$`, 'g'), '');
}

export const applyNameShort = (x) => {
  return x
    .replace('нержавеющие', 'нерж.')
    .replace('нержавеющий', 'нерж.')
    .replace('никельсодержащий', 'никель')
    .replace('равнополочный', 'рвнпр.')
    .replace('обыкновенного качества', 'об. кач.')
    .replace('низколегированный', 'н/л')
    .replace('низколегированные', 'н/л')
    .replace('электросварные', 'э/с')
    .replace('жаропрочный', 'жар.')
    .replace('горячекатаный', 'горяч.')
    .replace('инструментальный', 'инстр.');
};
