FROM python:3.11-slim

WORKDIR /app

# Install uv for faster deps
RUN pip install uv

# Copy project files
COPY pyproject.toml .

# Install dependencies
RUN uv pip install --system -e .

# Copy source
COPY src ./src

# Expose port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
