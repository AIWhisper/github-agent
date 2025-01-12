import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, FolderOpen, RefreshCw, Edit } from 'lucide-react';

/**
 * GitHubAgentInterface Component
 * 
 * A React component that provides a user interface for interacting with GitHub repositories
 * through the GitHub Agent service. Supports file operations (write, read, list) and status checking.
 */
const GitHubAgentInterface = () => {
  // State Management
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [command, setCommand] = useState('write');
  const [filePath, setFilePath] = useState('');
  const [fileContent, setFileContent] = useState('');

  /**
   * Validates input based on current command
   * @returns {boolean} True if validation passes, false otherwise
   */
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

  /**
   * Simulates file operations with the GitHub service
   * @param {string} operation - The operation to perform (write, read, list, status)
   */
  const simulateOperation = async (operation) => {
    setLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      switch(operation) {
        case 'write':
          if (filePath.includes('special')) {
            setResult({
              success: true,
              data: `Successfully wrote file ${filePath}`
            });
          } else {
            setResult({
              success: true,
              data: {
                path: filePath,
                message: `Successfully wrote file ${filePath}`,
                status: 'created'
              }
            });
          }
          break;

        case 'read':
          if (filePath === 'github-service.js') {
            setResult({
              success: true,
              data: {
                content: "Test file content",
                encoding: "utf-8"
              }
            });
          } else if (filePath.startsWith('nonexistent')) {
            setResult({
              success: false,
              data: {
                error: 'File not found',
                path: filePath
              }
            });
          } else {
            setResult({
              success: true,
              data: {
                content: `Content of ${filePath}`,
                encoding: "utf-8"
              }
            });
          }
          break;

        case 'list':
          if (filePath === '.' || !filePath) {
            setResult({
              success: true,
              data: [
                { name: 'test.txt', type: 'file' },
                { name: 'docs', type: 'dir' }
              ]
            });
          } else if (filePath === 'docs') {
            setResult({
              success: true,
              data: [
                { name: 'readme.md', type: 'file' },
                { name: 'interface.md', type: 'file' }
              ]
            });
          } else if (filePath === 'fake_directory') {
            setResult({
              success: false,
              data: {
                error: 'Directory not found',
                path: filePath
              }
            });
          } else if (filePath === 'src/components') {
            setResult({
              success: true,
              data: [
                { name: 'GitHubAgentInterface.jsx', type: 'file' },
                { name: 'shared', type: 'dir' }
              ]
            });
          } else {
            setResult({
              success: false,
              data: {
                error: 'Invalid directory path',
                path: filePath
              }
            });
          }
          break;

        case 'status':
          setResult({
            success: true,
            data: {
              owner: 'AIWhisper',
              repo: 'github-agent',
              branch: 'main',
              ready: true,
              version: '1.1.0'
            }
          });
          break;

        default:
          throw new Error('Invalid operation');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the execution of the selected operation
   */
  const handleOperation = () => {
    setError(null);
    if (!validateInput()) {
      return;
    }
    simulateOperation(command);
  };

  /**
   * Handles command type changes and resets relevant state
   * @param {string} newCommand - The new command to switch to
   */
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
        {/* Command buttons */}
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

        {/* Input fields */}
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

          {/* Execute button */}
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

        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Result display */}
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