from fastapi import APIRouter
from app.api.v1.models.solution_builder import (
    SolutionBuilderRequest,
    SolutionBuilderResponse,
    TemplateRequest,
    CodeSandboxTemplateResponse,
)

from app.functions import solution_builder

router = APIRouter()


@router.post(
    "/get-question", response_model=SolutionBuilderResponse, tags=["Solution Builder"]
)
def get_question(request: SolutionBuilderRequest):
    return solution_builder.get_question(request.architecture, request.history)


@router.post(
    "/get-code-sandbox-template",
    response_model=CodeSandboxTemplateResponse,
    tags=["Solution Builder"],
)
def get_code_sandbox_template(request: TemplateRequest):
    files = solution_builder.get_code_sandbox_template(request.template_name)
    return CodeSandboxTemplateResponse(files=files)
