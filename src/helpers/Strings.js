export const formatUGC = (txt) => {
  return txt.trim().replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, '');
};
