import React, { useEffect } from "react";

import { v4 as uuidv4 } from "uuid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Typography } from "@mui/material";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import InfoIcon from '@mui/icons-material/Info';

import { getMermaidText,updateDiagram } from "../pages/SolutionBuilder/mermaidText";

import {styled} from "@mui/system";

const GlowingButton = styled(IconButton)(({ theme, is_clicked }) => ({
    color: is_clicked ? '#8076c8' : 'default',
  }));

export default function CardView({rootNode,updateCodeSandbox}) {
    const [nodeStack, setNodeStack] = React.useState([]);
    const [solution_path, setSolutionPath] = React.useState([]);
    const [useAI, setUseAI] = React.useState(false);
    const [architectureDiagram, setArchitectureDiagram] = React.useState("graph TD");
    const [chat_history, setChatHistory] = React.useState([]);
  
    const [stateHistory, setStateHistory] = React.useState([]);
    const [currentIndexInHistory, setCurrentIndexInHistory] = React.useState(0);

    useEffect(() => {
        if (!rootNode) return;
        resetRootNode(rootNode);
    }, [rootNode]);

    function resetRootNode(root_node){
      setNodeStack([root_node]);
      setStateHistory([{nodeStack: [root_node], solutionPath: []}]);
      setCurrentIndexInHistory(0);
    }
    
  
    const handleOnChoiceClickAI = (choice) => {
        const c_node = nodeStack[nodeStack.length - 1];
        const newNodeStack = [...nodeStack.slice(0,-1)];
        setNodeStack(newNodeStack);
        const newChatHistory = [...chat_history, {
          question: c_node.question,
          choices: c_node.children.map((child) => child.label),
          answer: choice.label,
        }]
        setChatHistory(newChatHistory);
        fetch("/v1/solution-builder/get-question",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            history: newChatHistory,
            architecture: architectureDiagram,
          }),
        }
        )
        .then((response) => response.json())
        .then((data) => {
          const new_node = {
            id: uuidv4(),
            question: data["next_question"],
            children: data["choices"].map((choice) => {
              return {
                id: uuidv4(),
                label: choice,
              };
            }),
          }
          setNodeStack([...newNodeStack, new_node]);
          const updated_architecture = data["updated_architecture"];
  
          setArchitectureDiagram(updated_architecture);
          updateDiagram(updated_architecture)
        })
  
    }
    const handleOnChoiceClick = (choice) => {
      if (useAI){
        handleOnChoiceClickAI(choice);
        return;
      }
      let children = [choice.children[0]]
      const child = children[0];
      if (!child && popNodeStackOnInvalidNode(child)) {
        alert("Next question not available for selected choice, switching to next block ");
        return;
      }
      let new_solution = [...solution_path];
      if (child.stages){
        children = []
        child.children.slice().reverse().forEach((stage) => {
          if (stage.children){
            children.push(...stage.children)
          }
        }
        )
        if (children.length >0 && !children[0].solution && child.solution){
          children[0].solution = child.solution;
        }
        new_solution.push(child)
      }
      else if (child.children.length === 1 && child.children[0].stages){
        children = []
        child.children[0].children.slice().reverse().forEach((stage) => {
          if (stage.children){
            children.push(...stage.children)
          }
        }
        )
        if (children.length >0 && !children[0].solution && child.solution){
          children[0].solution = child.solution;
        }
        new_solution.push(child.children[0])
      }
      else{
  
        if (!child.question && child.children.length > 0){
         children = child.children;
         if (child.solution){
           children[0].solution = child.solution;
         } 
        }
        new_solution.push(...children);
      }
      const new_node_stack = [...nodeStack.slice(0,-1), ...children];
      const lastNode = new_solution[new_solution.length - 1];
      setNodeStack(new_node_stack);
      setSolutionPath(new_solution);
      updateCodeSandbox(lastNode.template);
      const new_architecture = getMermaidText(new_solution);
      setArchitectureDiagram(new_architecture);
      updateDiagram(new_architecture);
      const newHistory = [...stateHistory.slice(0,currentIndexInHistory+1), {nodeStack: new_node_stack, solutionPath: new_solution}];
      setStateHistory(newHistory);
      setCurrentIndexInHistory(newHistory.length - 1);
    };
  
    const goBackInHistory = () => {
      if (currentIndexInHistory == 0) return;
      const newIndex = currentIndexInHistory - 1;
      updateHistory(newIndex);
    }
    const goForwardInHistory = () => {
      if (currentIndexInHistory == stateHistory.length - 1) return;
      const newIndex = currentIndexInHistory + 1;
      updateHistory(newIndex);
    }
    const updateHistory = (index)=>{
      setCurrentIndexInHistory(index);
      const newHistory = stateHistory[index];
      setNodeStack(newHistory.nodeStack);
      setSolutionPath(newHistory.solutionPath);
      const new_architecture = getMermaidText(newHistory.solutionPath);
      setArchitectureDiagram(new_architecture);
      updateDiagram(new_architecture);
    }
    const popNodeStackOnInvalidNode = (current_node)=>{
      if (nodeStack.length>1 && !current_node?.children?.length>0){
        setNodeStack([...nodeStack.slice(0,-1)]);
        return true;
      }
      return false;
    }
    const current_node = nodeStack.length>0?nodeStack[nodeStack.length - 1]:null;
    popNodeStackOnInvalidNode(current_node);
  
  const getLongestLeafNodeDepth = () => {
    if (!current_node) return 0;
    return nodeStack.reduce((allDepth, node) => {
      return allDepth + node.longestLeafNodeDepth;
    }, 0);
  }

  return <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} maxWidth="50vw">
           <Box sx={{
      position: "fixed",
      top: "10px",
      left: "10px"
    }}>
            <Tooltip title="Use AI">
            <GlowingButton is_clicked={useAI ? 1 : 0} onClick={() => {
          setUseAI(!useAI);
          resetRootNode(rootNode);
        }}>
      <AutoAwesomeIcon />
      </GlowingButton>
      </Tooltip>
      </Box>
          {!current_node && useAI && <Box sx={{
      display: 'flex'
    }}>
            <Typography variant="h5">Preparing next question for you...</Typography>
            <CircularProgress />
          </Box>}
          {current_node && !useAI && <Box sx={{
      display: 'flex',
      position: 'absolute',
      width: '50%',
      justifyContent: 'space-between'
    }}>
              <Box>
              <IconButton onClick={goBackInHistory} sx={{
          display: currentIndexInHistory >= 1 ? 'inline-block' : 'none'
        }}>
                <ArrowBackIosIcon />
              </IconButton>
              </Box>
              <Box>
              <IconButton onClick={goForwardInHistory} sx={{
          display: currentIndexInHistory < stateHistory.length - 1 ? 'inline-block' : 'none'
        }}>
                <ArrowForwardIosIcon />
              </IconButton>
              </Box>
            </Box>}
          {current_node && <Box margin="10px">
              {(current_node.solution || current_node.title) && <Paper sx={{
        display: "flex",
        alignItems: "center",
        marginBottom: "20px",
        backgroundColor: "#cff7d7 !important"
      }} variant="outlined" style={{
        padding: "10px"
      }}>
                  <TipsAndUpdatesIcon />
                  <Typography variant="h5" flexGrow="1" margin="auto" textAlign="center">
                    {current_node.solution || current_node.title}
                  </Typography>
                </Paper>}
              <Typography textAlign="center" sx={{
        marginBottom: "20px"
      }} variant="h4">
          ({currentIndexInHistory + 1}/{getLongestLeafNodeDepth() + currentIndexInHistory + 1}) {current_node.question}
              {current_node.question_info && 
              <Tooltip title={current_node.question_info} placement="top">
                <InfoIcon sx={{marginLeft:1}}/>
                </Tooltip>
              }
              </Typography>
              <Box display="flex" flexDirection="column">
                {current_node.children.map(child => <Button color="inherit" key={child.id} onClick={() => handleOnChoiceClick(child)}>
                    {child.label}
                  </Button>)}
              </Box>
            </Box>}
        </Box>;
}
  