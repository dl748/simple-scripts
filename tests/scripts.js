module.exports = async(scripts) => {
  await scripts.register('build', async() => {
  });
  await scripts.importSubdirectories();
};
