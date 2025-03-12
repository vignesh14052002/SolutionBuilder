import { v4 as uuidv4 } from "uuid";

export function buildTreeFromData(data) {
  return buildTree("start",data);
}

function buildTree(node_id,decision_tree_data) {
  if (!node_id || !Object.keys(decision_tree_data).includes(node_id)) return;

  const node = decision_tree_data[node_id];
  let label = [];
  if (node.solution) label.push(node.solution);
  if (node.question) label.push(node.question);
  if (node.title) label.push(node.title);
  const _node = {
    ...node,
    id: uuidv4(),
    label: label.join("\n"),
    children: [],
  };
  if (node.choices) {
    return {
      ..._node,
      children: node.choices.map((choice) => {
        return {
          id: uuidv4(),
          label: choice.choice,
          children: [buildTree(choice.next?.toString(),decision_tree_data)].filter(
            (e) => e !== undefined
          ),
        };
      }),
    };
  }
  if (node.stages) {
    return {
      ..._node,
      children: node.stages.map((stage) => {
        return {
          ...stage,
          id: uuidv4(),
          label: stage.stage,
          children: [buildTree(stage.next?.toString(),decision_tree_data)].filter(
            (e) => e !== undefined
          ),
        };
      }),
    };
  }
  if (node.next) {
    return {
      ..._node,
      children: [buildTree(node.next.toString(),decision_tree_data)].filter(
        (e) => e !== undefined
      ),
    };
  }
  return _node;
}
export function calculateDepths(node) {
   let allDepth = 0;
  node.children.forEach(child => {
    child.longestLeafNodeDepth = (node.question ? 1 : 0) + calculateDepths(child);
    if (node.stages){
      allDepth += child.longestLeafNodeDepth;
    }
    else{
      allDepth = Math.max(allDepth, child.longestLeafNodeDepth);
    }
  });
  node.longestLeafNodeDepth = allDepth;
  return allDepth;  
}
