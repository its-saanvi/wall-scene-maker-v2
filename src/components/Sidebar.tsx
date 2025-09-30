import React from 'react';
import { useScene } from './SceneProvider';
import { ImageIcon, ResizeIcon, PlusIcon } from './icons';

export const Sidebar: React.FC = () => {
  const { setBackgroundImage, originalCanvasSize, setOriginalCanvasSize, addGroup } = useScene();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setBackgroundImage(imageUrl);

        const img = new Image();
        img.onload = () => {
          setOriginalCanvasSize({ width: img.width, height: img.height });
        };
        img.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ width: '200px', backgroundColor: '#1D202F', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'fixed', top: '50%', left: '10px', transform: 'translateY(-50%)', borderRadius: '0 10px 10px 0', boxShadow: '0 0 20px rgba(0,0,0,0.5)', zIndex: 10 }}>
      <div>
        <h3 style={{ color: '#c0caf5', margin: 0, marginBottom: '1rem' }}>Canvas</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={handleBrowseClick} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon />
            Set Background
          </button>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} ref={fileInputRef} />
          <div style={{ color: '#c0caf5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ResizeIcon />
              <span>Canvas Size</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                value={originalCanvasSize.width}
                onChange={e => setOriginalCanvasSize(cs => ({ ...cs, width: parseInt(e.target.value) }))}
                style={{ width: '80px', backgroundColor: '#24283b', color: '#c0caf5', border: '1px solid #7aa2f7' }}
              />
              x
              <input
                type="number"
                value={originalCanvasSize.height}
                onChange={e => setOriginalCanvasSize(cs => ({ ...cs, height: parseInt(e.target.value) }))}
                style={{ width: '80px', backgroundColor: '#24283b', color: '#c0caf5', border: '1px solid #7aa2f7' }}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 style={{ color: '#c0caf5', margin: 0, marginBottom: '1rem' }}>Groups</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => addGroup('main')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusIcon />
            Add Main Group
          </button>
          <button onClick={() => addGroup('preparing')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusIcon />
            Add Preparing Group
          </button>
          <button onClick={() => addGroup('locked')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusIcon />
            Add Locked Group
          </button>
        </div>
      </div>
    </div>
  );
};