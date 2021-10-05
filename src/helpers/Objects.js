// https://stackoverflow.com/questions/49308484/how-to-find-object-with-id-value-in-deep-nested-array/49308569
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

export const findObjectInHierarchy = (hierarchicalObject, childName, propName, value) => {
  if (propName === undefined || value === undefined || childName === undefined || hierarchicalObject === undefined)
    return null;
  let result = null;
  if (hierarchicalObject instanceof Array) {
    for (const hierarchicalObjectItem of hierarchicalObject) {
      result = findObjectInHierarchy(hierarchicalObjectItem, childName, propName, value);
      if (result) break;
    }
  } else {
    if (hierarchicalObject[propName] === value) return hierarchicalObject;
    if (hierarchicalObject[childName] && hierarchicalObject[childName] instanceof Array) {
      result = findObjectInHierarchy(hierarchicalObject[childName], childName, propName, value);
    }
  }
  return result;
};

export const findNodeByName = (nodes, name) => {
  let res;

  function findNode(nodes, name) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].name === name) {
        res = nodes[i];
        break;
      }
      if (nodes[i].categories) {
        findNode(nodes[i].categories, name);
      }
    }
  }

  findNode(nodes, name);

  return res;
};
