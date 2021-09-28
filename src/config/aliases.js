const aliases = (prefix = 'src') => ({
  '@src': `${prefix}`,
  '@c': `${prefix}/components`,
  '@components': `${prefix}/components`,
  '@ui': `${prefix}/components/UI`,
  '@helpers': `${prefix}/helpers`,
  '@services': `${prefix}/services`,
  '@config': `${prefix}/config`,
  '@styles': `${prefix}/styles`,
  '@store': `${prefix}/store`,
  '@api': `${prefix}/api`,
  '@assets': `${prefix}/assets`,
});

module.exports = aliases;
