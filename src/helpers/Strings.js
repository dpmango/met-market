export const formatUGC = (txt) => {
  return txt.trim().replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, '');
};

function clearMorphologyInSearchTerm(searchTerm) {
  let trimmedSearchTerm = searchTerm
    .replaceAll('\n', ' ')
    .replaceAll('\r', ' ')
    .replaceAll('\t', ' ')
    // eslint-disable-next-line quotes
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
