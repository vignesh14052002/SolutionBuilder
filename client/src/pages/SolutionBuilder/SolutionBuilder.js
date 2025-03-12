import * as React from "react";
import Box from "@mui/material/Box";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import IconButton from "@mui/material/IconButton";
import CodeIcon from '@mui/icons-material/Code';
import CodeOffIcon from '@mui/icons-material/CodeOff';
import useCodeSandbox from "../../hooks/useCodeSandbox";
import TreeView from "../../components/TreeView";
import CardView from "../../components/CardView";
import { buildTreeFromData, calculateDepths } from "./decisionTreeData";
import "./SolutionBuilder.css"

const uiLayout = Object.freeze(
  {
    WITHOUT_CODE_EDITOR:"without editor",
    WITH_CODE_EDITOR:"with code editor"
  }
)
export default function SolutionBuilder() {
  const [decisionTreeData, setDecisionTreeData] = React.useState([]);
  const {codeSandboxUrl, updateCodeSandbox} = useCodeSandbox();
  const [layout,setLayout] = React.useState(uiLayout.WITHOUT_CODE_EDITOR);
  const [questionView, setQuestionView] = React.useState("one_by_one");
  const [rootNode, setRootNode] = React.useState(null);

  React.useEffect(() => {
    //fetch("https://raw.githubusercontent.com/vignesh14052002/KnowledgeBase/master/knowledge_base/AI/decision_tree.json")
    fetch("./decision_tree.json")
      .then((response) => response.json())
      .then((data) => {
        const _rootNode = buildTreeFromData(data);
        calculateDepths(_rootNode);
        setRootNode(_rootNode);
        setDecisionTreeData([_rootNode]);
      });
  }, []);

  const toggleView = () => {
    setQuestionView(questionView === "one_by_one" ? "tree" : "one_by_one");
};

const toggleCodeEditor = () => {
    setLayout(layout === uiLayout.WITHOUT_CODE_EDITOR ? uiLayout.WITH_CODE_EDITOR : uiLayout.WITHOUT_CODE_EDITOR);
};
    
  return (
    <Box className={layout === uiLayout.WITHOUT_CODE_EDITOR?"container-without-code-editor":"container"} sx={{ display: "flex" }} minHeight="100vh" minWidth="100vw">
      
      <Box sx={{ position: "fixed", bottom: "10px", left: "10px" }}>
        <IconButton onClick={toggleView}>
          {questionView === "one_by_one" && <AccountTreeIcon />}
          {questionView === "tree" && <FormatAlignCenterIcon />}
        </IconButton>
      </Box>
      <Box sx={{ position: "fixed", bottom: "10px", right: "10px" }}>
        <IconButton onClick={toggleCodeEditor} style={{backgroundColor:layout === uiLayout.WITH_CODE_EDITOR?"white":"inherit"}}>
          {layout===uiLayout.WITH_CODE_EDITOR && <CodeOffIcon/>}
          {layout===uiLayout.WITHOUT_CODE_EDITOR && <CodeIcon/>}
        </IconButton>
      </Box>
      <Box sx={{ display: "flex", flexDirection: layout === uiLayout.WITHOUT_CODE_EDITOR?"row":"column", flexGrow:1 }}>
      {questionView === "one_by_one" && (
        <CardView  rootNode={rootNode} updateCodeSandbox={updateCodeSandbox}/>
      )}
      {questionView === "tree" && (
        <TreeView decisionTreeData={decisionTreeData}/>
      )}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
        maxWidth="50vw"
        sx={{ borderLeft: "2px solid grey" }}
        className="diagram"
      >
        {questionView === "tree" && (
          <h3>Block diagram not supported in tree view</h3>
        )}
        <pre id="mermaid" style={{display:questionView === "one_by_one"?"block":"none"}}></pre>
      </Box>
      </Box>
      {layout === uiLayout.WITH_CODE_EDITOR && 
      <iframe title="codeSandbox" style={{width:"100%"}} src={codeSandboxUrl}></iframe>}
    </Box>
  );
}
