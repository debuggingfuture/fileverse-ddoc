import { useEffect, useState } from 'react';
import DdocEditor from './packages/ddoc/ddoc-editor';
import { Button } from './packages/ddoc/common/button';
import { Pencil, ScanEye, Share2 } from 'lucide-react';
import { JSONContent } from '@tiptap/react';

function App() {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [enableCollaboration, setEnableCollaboration] = useState(false);
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('Untitled');

  const collaborationId = window.location.pathname.split('/')[2]; // example url - /doc/1234, that why's used second element of array

  useEffect(() => {
    if (collaborationId) {
      const name = prompt('Whats your username');
      if (!name) return;
      setUsername(name);
      setEnableCollaboration(true);
    }
  }, [collaborationId]);

  const renderRightSection = ({
    editor,
  }: {
    editor: JSONContent;
  }): JSX.Element => {
    const publishDoc = () => {
      console.log(editor, title);
    };
    return (
      <div className="flex gap-2">
        <div>
          <Button
            variant="ghost"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? <Pencil size={14} /> : <ScanEye size={14} />}{' '}
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>

        <div>
          <Button onClick={publishDoc}>
            <Share2 size={14} /> Share
          </Button>
        </div>
      </div>
    );
  };

  const renderLeftSection = () => {
    return (
      <div className="flex items-center gap-4">
        <input
          className="max-w-[6rem] lg:max-w-xs focus:outline-none bg-[#f8f9fa]"
          disabled={isPreviewMode}
          type="text"
          placeholder="Untitled"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
    );
  };

  const callUploadApi = async (file: File) => {
    const body = new FormData();
    body.append('file', file);
    body.append('name', file.name);

    try {
      const response = await fetch(`${import.meta.env.API_URL}/upload/public`, {
        method: 'POST',
        headers: {
          'x-api-key': 'hello-world',
        },
        body,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const apiResponse = await response.json();
      return apiResponse;
    } catch (error) {
      // Handle fetch errors or response parsing errors
      console.error('Error during fetch:', error);
      throw error;
    }
  };

  const getImageIpfsHash = async (file: File): Promise<string> => {
    const response = await callUploadApi(file);
    return response.ipfsUrl;
  };

  return (
    <div>
      <DdocEditor
        enableCollaboration={enableCollaboration}
        collaborationId={collaborationId}
        username={username}
        handleImageUploadToIpfs={getImageIpfsHash}
        isPreviewMode={isPreviewMode}
        renderToolRightSection={renderRightSection}
        renderToolLeftSection={renderLeftSection}
        ensResolutionUrl={import.meta.env.ENS_RESOLUTION_URL}
      />
    </div>
  );
}

export default App;
