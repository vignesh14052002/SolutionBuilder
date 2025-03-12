import os
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import solution_builder
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI(
    title="Chat with Knowledge Base API Documentation",
    version="0.0.1",
    description="API Documentation for Knowledge Base Chatbot",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    solution_builder.router,
    prefix="/v1/solution-builder",
    tags=["Solution Builder"],
)

# Serving - static files
static_files_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
app.mount("/static", StaticFiles(directory=static_files_path), name="static")


@app.get("/{full_path:path}", response_class=HTMLResponse)
def read_index(full_path: str):
    """Serve the index.html file of front-end code at the root."""
    if full_path.endswith(".json"):
        return FileResponse(os.path.join(static_files_path, full_path))
    return FileResponse(os.path.join(static_files_path, "index.html"))


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)


if __name__ == "__main__":
    main()
