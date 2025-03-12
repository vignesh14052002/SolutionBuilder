function getMermaidId(text) {
  // If the text already contains Mermaid elements, return as is
  if (text.includes("[") && text.includes("]")) return text;

  // Convert all non-alphanumeric characters to underscores
  const id = text.replace(/[^a-zA-Z0-9]/g, "_");
  // If id is unchanged, return original text
  if (id == text) return text;

  return `${id}[${text}]`;
}

export function getMermaidText(nodes) {
  const mermaidTexts = ["graph TD"];
  let lastId = null;

  function updateText(node) {
    if (!node.block) return;

    let nodeText = getMermaidId(node.block.text);

    // Handle blocks of type 'replace'
    if (node.block.type === "replace" && mermaidTexts.length > 1) {
      const lastLine = mermaidTexts.pop();
      lastId = lastLine.includes("-->") ? lastLine.split("-->")[0].trim() : null;
    }

    // Handle parent blocks
    if (node.block.parent) {
      lastId = getMermaidId(node.block.parent);
    }

    // Add text to Mermaid diagram
    if (!lastId) {
      mermaidTexts.push(nodeText);
      lastId = nodeText;
      return;
    }

    mermaidTexts.push(`${lastId} --> ${nodeText}\n`);
    lastId = nodeText;
  }

  nodes.forEach(node => {
    if (node.block && node.stages) {
      const firstChild = node.children[0];

      // Update parent for the first child if it exists
      if (firstChild.block) {
        const lastItem = mermaidTexts[mermaidTexts.length - 1];
        firstChild.block.parent = lastItem.includes("-->") 
          ? lastItem.split("-->")[1].trim() 
          : lastItem;
      }

      updateText(firstChild);
      mermaidTexts.push(`subgraph ${getMermaidId(node.block.text)}`);

      // Update text for remaining children
      node.children.slice(1).forEach(updateText);
      
      mermaidTexts.push("end");
    } else {
      updateText(node);
    }
  });

  return mermaidTexts.length === 1 ? "" : mermaidTexts.join("\n");
}

export const updateDiagram = text => {
  const mermaidElement = document.getElementById("mermaid");
  if (mermaidElement) {
    mermaidElement.innerHTML = text;
    mermaidElement.removeAttribute("data-processed");
    window.mermaid.init(undefined, mermaidElement);
  }
};