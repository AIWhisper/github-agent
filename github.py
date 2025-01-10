import os
import time
import requests
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from functools import wraps
from langchain_core.documents import Document

load_dotenv()

class GitHubService:
    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv('GITHUB_TOKEN')
        self.base_url = 'https://api.github.com'
        self.default_headers = {
            'Accept': 'application/vnd.github.v3+json',
            **(({'Authorization': f'token {self.token}'} if self.token else {}))
        }

    def _with_retry(self, max_retries: int = 3, backoff_factor: float = 0.5):
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                last_exception = None
                for attempt in range(max_retries):
                    try:
                        return func(*args, **kwargs)
                    except requests.RequestException as e:
                        last_exception = e
                        
                        if isinstance(e, requests.HTTPError) and 400 <= e.response.status_code < 500:
                            raise
                        
                        wait_time = backoff_factor * (2 ** attempt)
                        print(f"Retry attempt {attempt + 1}: Waiting {wait_time} seconds")
                        time.sleep(wait_time)
                
                raise last_exception or Exception("All retry attempts failed")
            return wrapper
        return decorator

    @_with_retry()
    def fetch_github(self, owner: str, repo: str, endpoint: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/repos/{owner}/{repo}/{endpoint}"
        headers = {
            **self.default_headers,
            'Content-Type': 'application/json'
        }

        try:
            response = requests.get(
                url, 
                headers=headers, 
                params=params
            )
            
            response.raise_for_status()
            return response.json()
        
        except requests.RequestException as e:
            print(f"GitHub API Error: {e}")
            if hasattr(e, 'response'):
                print(f"Response content: {e.response.text}")
            raise

    def fetch_github_issues(self, owner: str, repo: str, **kwargs) -> List[Document]:
        data = self.fetch_github(owner, repo, "issues", params=kwargs)
        return self.load_issues(data)

    def load_issues(self, issues: List[Dict[str, Any]]) -> List[Document]:
        docs = []
        for entry in issues:
            metadata = {
                "author": entry["user"]["login"],
                "comments": entry["comments"],
                "body": entry.get("body", ""),
                "labels": [label["name"] for label in entry.get("labels", [])],
                "created_at": entry["created_at"],
                "state": entry["state"],
                "number": entry["number"]
            }
            
            data = f"{entry['title']} {entry.get('body', '')}" 
            doc = Document(page_content=data, metadata=metadata)
            docs.append(doc)

        return docs

    def get_repository_file(self, owner: str, repo: str, path: str) -> Dict[str, Any]:
        return self.fetch_github(owner, repo, f"contents/{path}")

    def create_issue(self, owner: str, repo: str, title: str, body: str, labels: Optional[List[str]] = None) -> Dict[str, Any]:
        endpoint = f"{self.base_url}/repos/{owner}/{repo}/issues"
        headers = {
            **self.default_headers,
            'Content-Type': 'application/json'
        }
        
        payload = {
            "title": title,
            "body": body,
            **("labels": labels if labels else {})
        }

        try:
            response = requests.post(
                endpoint,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        
        except requests.RequestException as e:
            print(f"GitHub Issue Creation Error: {e}")
            if hasattr(e, 'response'):
                print(f"Response content: {e.response.text}")
            raise