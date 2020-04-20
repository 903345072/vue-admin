
export function getParentsss(json, text) {
  for (var i = 0; i < json.length; i++) {
    if (node) {
      break
    }
    var obj = json[i]
    if (!obj || !obj.text) {
      continue
    }


    if (obj.text === text) {

      node = obj
      break
    } else {

      if (obj.children && obj.children.length !== 0) {
        parentNode = obj
        //递归往下找        getNode(obj.children, text);
      } else {
        //跳出当前递归，返回上层递归
        continue;
      }
    }
  }

  //5.如果木有找到父节点，置为null，因为没有父亲
  if (!node) {
    parentNode = null;
  }

  //6.返回结果obj
  return {
    parentNode: parentNode,
    node: node
  };
}
