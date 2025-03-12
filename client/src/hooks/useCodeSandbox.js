import { useState } from "react";
import { getParameters } from "codesandbox/lib/api/define";
import { SERVER_URL } from "../constants";

const defaultFileParameters = getParameters({
  files: {
    "index.js": {
      content: "console.log('hello')",
    },
    "package.json": {
      content: { dependencies: {} },
    },
  },
});

const DEFAULT_SANDBOX_URL = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${defaultFileParameters}`;

const useCodeSandbox = () => {
  const [codeSandboxUrl, setCodeSandboxUrl] = useState(DEFAULT_SANDBOX_URL);

  const fetchTemplate = async (templateName) => {
    if (!templateName) return null;
    const response = await fetch(`${SERVER_URL}/v1/solution-builder/get-code-sandbox-template`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_name: templateName }),
    });
    return response.json();
  };

  const defineSandbox = async (parameters) => {
    const response = await fetch("https://codesandbox.io/api/v1/sandboxes/define?json=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parameters }),
    });
    return response.json();
  };

  const updateCodeSandbox = async (templateName) => {
    try {
      const templateData = await fetchTemplate(templateName);
      if (templateData) {
        const sandboxData = await defineSandbox(getParameters(templateData));
        const url = `https://codesandbox.io/p/sandbox/${sandboxData.sandbox_id}`;
        setCodeSandboxUrl(url);
      }
    } catch (error) {
      console.error("Failed to update CodeSandbox URL:", error);
    }
  };

  return { codeSandboxUrl, updateCodeSandbox };
};

export default useCodeSandbox;