import React from "react";

import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { Box, Button } from "@mui/material";

import { TreeItem2, TreeItem2Label } from "@mui/x-tree-view/TreeItem2";

function CustomLabel(props) {
    const { children, ...other } = props;
    return (
      <TreeItem2Label {...other}>
        {children.split("\n").map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </TreeItem2Label>
    );
  }
  const CustomTreeItem = React.forwardRef((props, ref) => {
    return (
      <TreeItem2
        ref={ref}
        {...props}
        slots={{
          label: CustomLabel,
        }}
      />
    );
  });

export default function TreeView({
  decisionTreeData,
}) {
    
const [expandedItems, setExpandedItems] = React.useState([]);

const handleExpandedItemsChange = (event, itemIds) => {
    setExpandedItems(itemIds);
  };

  const handleExpandClick = () => {
    setExpandedItems((oldExpanded) =>
      oldExpanded.length === 0 ? getAllItemsWithChildrenItemIds() : []
    );
  };
    const getAllItemsWithChildrenItemIds = () => {
      const itemIds = [];
      const registerItemId = (item) => {
        if (item.children?.length) {
          itemIds.push(item.id);
          item.children.forEach(registerItemId);
        }
      };
  
      decisionTreeData.forEach(registerItemId);
  
      return itemIds;
    };
  return <Box minHeight="100vh" width="50%">
          <Box>
            <Button onClick={handleExpandClick}>
              {expandedItems.length === 0 ? "Expand all" : "Collapse all"}
            </Button>
          </Box>
          <Box sx={{
      minHeight: 352,
      minWidth: 250
    }}>
            <RichTreeView items={decisionTreeData} slots={{
        item: CustomTreeItem
      }} expandedItems={expandedItems} onExpandedItemsChange={handleExpandedItemsChange} />
          </Box>
        </Box>;
}
  