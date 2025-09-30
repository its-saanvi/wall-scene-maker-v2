import React, { useRef } from 'react';
import { useScene } from './SceneProvider';
import { Group, Layout, PositionsGroup, type LayoutUnparsed } from '../types';

interface ToolbarProps { }

export const Toolbar: React.FC<ToolbarProps> = () => {
  const { setLayout, originalCanvasSize, layout } = useScene();
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const validateCoordinates = (x: number, y: number, width: number, height: number, canvasWidth: number, canvasHeight: number): string | null => {
    const tolerance = 0.001;
    if (x < -tolerance || y < -tolerance) {
      return 'Coordinates cannot be negative.';
    }
    if (x + width > canvasWidth + tolerance || y + height > canvasHeight + tolerance) {
      return 'Group extends beyond canvas boundaries.';
    }
    return null;
  };

  const exportLayout = () => {
    const layoutToExport: Partial<Layout> = {};

    const scaleAndCleanGroup = (group: Group) => {
      const { type, id, ...rest } = group;
      const scaledGroup: any = { ...rest };

      if (type === 'grid') {
        const validationError = validateCoordinates(group.x, group.y, group.width, group.height, originalCanvasSize.width, originalCanvasSize.height);
        if (validationError) {
          alert(validationError);
          throw new Error(validationError);
        }
      } else if (type === 'positions' && (group as PositionsGroup).positions) {
        for (const pos of (group as PositionsGroup).positions) {
          const validationError = validateCoordinates(pos.x, pos.y, pos.width, pos.height, originalCanvasSize.width, originalCanvasSize.height);
          if (validationError) {
            alert(validationError);
            throw new Error(validationError);
          }
        }
      }

      if (scaledGroup.x !== undefined) scaledGroup.x /= originalCanvasSize.width;
      if (scaledGroup.y !== undefined) scaledGroup.y /= originalCanvasSize.height;
      if (scaledGroup.width !== undefined) scaledGroup.width /= originalCanvasSize.width;
      if (scaledGroup.height !== undefined) scaledGroup.height /= originalCanvasSize.height;

      if (type === 'positions' && (scaledGroup as PositionsGroup).positions) {
        scaledGroup.positions = (scaledGroup as PositionsGroup).positions.map(pos => ({
          x: pos.x / originalCanvasSize.width,
          y: pos.y / originalCanvasSize.height,
          width: pos.width / originalCanvasSize.width,
          height: pos.height / originalCanvasSize.height,
        }));
      }
      return scaledGroup;
    };

    try {
      if (layout.main) {
        layoutToExport.main = scaleAndCleanGroup(layout.main);
      }
      if (layout.preparing) {
        layoutToExport.preparing = layout.preparing.map(scaleAndCleanGroup);
      }
      if (layout.locked) {
        layoutToExport.locked = scaleAndCleanGroup(layout.locked);
      }
      if (layout.replaceLockedInstances) {
        layoutToExport.replaceLockedInstances = layout.replaceLockedInstances;
      }
    } catch (error) {
      console.error('Export validation failed:', error);
      return;
    }

    const data = JSON.stringify(layoutToExport, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layout.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedLayout: LayoutUnparsed = JSON.parse(e.target?.result as string);
          const convertToPixels = (value: number, dimension: 'width' | 'height') => {
            return value < 1 ? value * (dimension === 'width' ? originalCanvasSize.width : originalCanvasSize.height) : value;
          };

          const getGroupType = (group: any): 'grid' | 'positions' => {
            return 'positions' in group ? 'positions' : 'grid';
          };

          let groupId = 0;

          const processGroup = (group: any): Group => {
            let newGroup = {
              id: `${groupId}`,
              type: getGroupType(group),
              ...group
            };
            groupId++;

            newGroup.x = convertToPixels(group.x, 'width');
            newGroup.y = convertToPixels(group.y, 'height');
            newGroup.width = convertToPixels(group.width, 'width');
            newGroup.height = convertToPixels(group.height, 'height');

            if (newGroup.type === 'positions' && newGroup.positions) {
              newGroup.positions = newGroup.positions.map((pos: any) => ({
                x: convertToPixels(pos.x, 'width'),
                y: convertToPixels(pos.y, 'height'),
                width: convertToPixels(pos.width, 'width'),
                height: convertToPixels(pos.height, 'height'),
              }));
            }

            return newGroup as Group;
          };

          const processedLayout: Layout = {};
          if (importedLayout.main) processedLayout.main = processGroup(importedLayout.main);
          if (importedLayout.preparing) processedLayout.preparing = importedLayout.preparing.map(processGroup);
          if (importedLayout.locked) processedLayout.locked = processGroup(importedLayout.locked);
          if (importedLayout.replaceLockedInstances) processedLayout.replaceLockedInstances = importedLayout.replaceLockedInstances;

          setLayout(processedLayout);
        } catch (error) {
          alert('Error parsing layout file. Please ensure it is a valid JSON.');
          console.error('Error parsing layout file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImportClick = () => {
    importFileInputRef.current?.click();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '60px',
        backgroundColor: '#1D202F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        zIndex: 20,
        boxSizing: 'border-box',
      }}>
      <h1 style={{ color: '#c0caf5', margin: 0, gridColumn: '2' }}>Wall Scene Maker V2</h1> {/* Title in left column */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', justifyContent: 'flex-end', gridColumn: '3' }}> {/* Buttons in right column */}
        <button onClick={handleImportClick}>
          Import Layout
        </button>
        <input type="file" accept=".json" onChange={handleImportFileChange} style={{ display: 'none' }} ref={importFileInputRef} />
        <button onClick={exportLayout} style={{ backgroundColor: '#7aa2f7', color: '#1D202F' }}>
          Export Layout
        </button>
      </div>
    </div >
  );
};
