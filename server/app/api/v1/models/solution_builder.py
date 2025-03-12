from pydantic import BaseModel, ConfigDict


class SolutionBuilderResponse(BaseModel):
    updated_architecture: str
    next_question: str
    choices: list[str]

    model_config = ConfigDict(extra="allow")


class Message(BaseModel):
    question: str
    choices: list[str]
    answer: str


class SolutionBuilderRequest(BaseModel):
    architecture: str
    history: list[Message]


class TemplateRequest(BaseModel):
    template_name: str


class CodeSandboxTemplateResponse(BaseModel):
    files: dict
