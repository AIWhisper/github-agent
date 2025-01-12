import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, FolderOpen, RefreshCw, Edit } from 'lucide-react';
import githubService from '../../../github-service';

const GitHubAgentInterface = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [command, setCommand] = useState('write');
  const [filePath, setFilePath] = useState('');
  const [fileContent, setFileContent] = useState('');

  const validateInput = () => {
    if (command === 'write') {
      if (!filePath.trim()) {
        setError('File path is required');
        return false;
      }
      if (!fileContent.trim()) {
        setError('File content is required');
        return false;
      }
    } else if ((command === 'read' || command === 'write') && !filePath.trim()) {
      setError('File path is required');
      return false;
    }
    return true;
  };

  const executeOperation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      switch(command) {
        case 'write':
          response = await githubService.writeFile(filePath, fileContent);
          break;

        case 'read':
          response = await githubService.readFile(filePath);
          break;

        case 'list':
          response = await githubService.listFiles(filePath);
          break;

        case 'status':
          response = githubService.getStatus();
          break;

        default:
          throw new Error('Invalid operation');
      }

      if (!response.success) {
        throw new Error(response.error);
      }

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOperation = () => {
    setError(null);
    if (!validateInput()) {
      return;
    }
    executeOperation();
  };

  const handleCommandChange = (newCommand) => {
    setCommand(newCommand);
    setError(null);
    setResult(null);
    if (newCommand === 'status') {
      setFilePath('');
      setFileContent('');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">GitHub Agent Interface</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => handleCommandChange('write')}
            className={`px-4 py-2 rounded flex items-center ${
              command === 'write'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            } hover:bg-opacity-90 transition-colors`}
          >
            <Edit className="w-4 h-4 mr-2" />
            Write
          </button>
          <button
            onClick={() => handleCommandChange('read')}
            className={`px-4 py-2 rounded flex items-center ${
              command === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            } hover:bg-opacity-90 transition-colors`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Read
          </button>
          <button
            onClick={() => handleCommandChange('list')}
            className={`px-4 py-2 rounded flex items-center ${
              command === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            } hover:bg-opacity-90 transition-colors`}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            List
          </button>
          <button
            onClick={() => handleCommandChange('status')}
            className={`px-4 py-2 rounded flex items-center ${
              command === 'status'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            } hover:bg-opacity-90 transition-colors`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Status
          </button>
        </div>

        <div className="space-y-4">
          {command !== 'status' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                File Path:
              </label>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder={command === 'list' ? 'Directory path (. for root)' : 'Enter file path'}
                className="w-full p-2 border rounded"
              />
            </div>
          )}

          {command === 'write' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Content:
              </label>
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Enter file content"
                className="w-full p-2 border rounded h-32"
              />
            </div>
          )}

          <button
            onClick={handleOperation}
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Execute'
            )}
          </button>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <pre className="whitespace-pre-wrap break-all text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GitHubAgentInterface;