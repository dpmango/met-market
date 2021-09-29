// https://stackoverflow.com/questions/49308484/how-to-find-object-with-id-value-in-deep-nested-array/49308569
// plan B https://github.com/blackflux/object-scan

export const findNodeById = (nodes, id) => {
  let res;

  function findNode(nodes, id) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        res = nodes[i];
        break;
      }
      if (nodes[i].categories) {
        findNode(nodes[i].categories, id);
      }
    }
  }

  findNode(nodes, id);

  return res;
};
