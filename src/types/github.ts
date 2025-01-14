export type GitHubFunction =
  | 'create_or_update_file'
  | 'search_repositories'
  | 'create_repository'
  | 'get_file_contents'
  | 'push_files'
  | 'create_issue'
  | 'create_pull_request'
  | 'fork_repository'
  | 'create_branch'
  | 'list_commits'
  | 'list_issues'
  | 'update_issue'
  | 'add_issue_comment'
  | 'search_code'
  | 'search_issues'
  | 'search_users'
  | 'get_issue';

export interface GitHubCommand {
  function: GitHubFunction;
  parameters: Record<string, any>;
  requestId: string;
}

export interface GitHubResponse {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    details?: any;
  };
  requestId: string;
}