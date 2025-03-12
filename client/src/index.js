import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SolutionBuilder from "./pages/SolutionBuilder/SolutionBuilder.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<SolutionBuilder />} />
    </Routes>
  </BrowserRouter>
);
