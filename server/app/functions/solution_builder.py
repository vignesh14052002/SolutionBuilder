from app.llm.gemini import get_gemini_llm
from app.prompts.solution_builder import ask_question_prompt_template
import json
from app.api.v1.models.solution_builder import Message, SolutionBuilderResponse
import os
import base64

CURRENT_DIR = os.path.dirname(__file__)
PROJECT_TEMPLATE_DIR = os.path.join(CURRENT_DIR, "..", "..", "..", "project_template")


def decode_response(response: str) -> SolutionBuilderResponse:
    remove_markdown = ["json"]
    for mark in remove_markdown:
        response = response.lstrip(f"```{mark}\n").rstrip(f"\n```")
    return SolutionBuilderResponse(**json.loads(response))


def format_history(history: list[Message]) -> str:
    result = ""
    for message in history:
        result += f"""
You:
    question: {message.question}
    choices: {message.choices}
User:
    answer: {message.answer}
"""
    return result


def get_question(architecture: str, history: list[Message]) -> SolutionBuilderResponse:
    gemini = get_gemini_llm("gemini-1.5-pro-latest")
    """Get question from the solution builder."""
    prompt = ask_question_prompt_template.format(
        architecture=architecture, history=format_history(history)
    )
    response = gemini.invoke(prompt)
    return decode_response(response.content)


def get_files(dir_path):
    file_contents = {}
    folders_to_ignore = ["node_modules", ".venv"]
    files_to_ignore = ["package-lock.json"]
    for root, dirs, files in os.walk(dir_path):
        # Ignore node_modules and .venv directories
        dirs[:] = [d for d in dirs if d not in folders_to_ignore]
        for file in files:
            if file in files_to_ignore:
                continue
            # if len(file_contents) > 12:
            #     continue
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, dir_path).replace("\\", "/")
            with open(file_path, "rb") as f:  # Open file in binary mode
                content = f.read()
                # Check if the file is a text file or binary file
                try:
                    content.decode("utf-8")
                    is_text = True
                except UnicodeDecodeError:
                    is_text = False
                if is_text:
                    file_contents[relative_path] = {"content": content.decode("utf-8")}
                else:
                    file_contents[relative_path] = {
                        "content": base64.b64encode(content).decode("utf-8"),
                        "isBinary": True,
                    }
    return file_contents


def get_code_sandbox_template(template_name: str) -> dict:
    dir_path = os.path.join(PROJECT_TEMPLATE_DIR, template_name)
    return get_files(dir_path)
