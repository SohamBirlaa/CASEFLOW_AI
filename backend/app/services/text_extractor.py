import os
import pypdf

def extract_text_from_txt(file_path: str) -> str:
    """Reads raw text from a UTF-8 encoded text file."""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts text from all pages of a PDF using pypdf."""
    text_content = []
    with open(file_path, "rb") as f:
        reader = pypdf.PdfReader(f)
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text_content.append(extracted)
                
    return "\n".join(text_content)

def extract_text(file_path: str, mime_type: str) -> str:
    """
    Router function that directs the physical file to the correct parsing engine 
    based on its stored MIME type.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Physical file missing from server: {file_path}")
        
    if "pdf" in mime_type.lower():
        return extract_text_from_pdf(file_path)
    elif "text" in mime_type.lower() or "txt" in mime_type.lower():
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported MIME type for AI text extraction: {mime_type}")