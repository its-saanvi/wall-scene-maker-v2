import React, { useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useScene } from './SceneProvider';
import { useEditing } from './EditingProvider';
import { Group } from './Group';

interface CanvasProps {
  scale: number;
}

export const Canvas: React.FC<CanvasProps> = ({ scale }) => {
  const { backgroundImage, layout, updateGroup, originalCanvasSize, selectedGroup, setSelectedGroup } = useScene();
  const { isEditing } = useEditing();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedGroup) return;

      const { groupType, id } = selectedGroup;
      let groupToUpdate;
      if (groupType === 'main') groupToUpdate = layout.main;
      if (groupType === 'locked') groupToUpdate = layout.locked;
      if (groupType === 'preparing' && layout.preparing) {
        groupToUpdate = layout.preparing.find(g => g.id === id);
      }

      if (!groupToUpdate) return;

      let newX = groupToUpdate.x;
      let newY = groupToUpdate.y;

      switch (e.key) {
        case 'ArrowUp':
          newY -= 1;
          break;
        case 'ArrowDown':
          newY += 1;
          break;
        case 'ArrowLeft':
          newX -= 1;
          break;
        case 'ArrowRight':
          newX += 1;
          break;
        default:
          return;
      }
      updateGroup(groupType, id, { x: newX, y: newY });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGroup, layout, updateGroup]);

  const renderGroup = (group: any, groupType: 'main' | 'locked' | 'preparing') => (
    <Rnd
      key={group.id}
      position={{
        x: group.x,
        y: group.y,
      }}
      size={{
        width: group.width,
        height: group.height,
      }}
      onDragStart={() => {
        setSelectedGroup({ groupType, id: group.id });
      }}
      onDragStop={(_e, d) => updateGroup(groupType, group.id, { x: d.x, y: d.y })}
      onResizeStop={(_e, _direction, _ref, delta, position) => {
        const newWidth = group.width + delta.width;
        const newHeight = group.height + delta.height;
        updateGroup(groupType, group.id, { width: newWidth, height: newHeight, ...position });
      }}
      onClick={(e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('[data-is-preview="true"]')) {
          return;
        }
        e.stopPropagation();
        setSelectedGroup({ groupType, id: group.id });
      }}
      disableDragging={isEditing || (selectedGroup !== null && selectedGroup.id !== group.id)}
      enableResizing={!(isEditing && selectedGroup?.id === group.id)}
      scale={scale}
      // bounds="parent" // Removed bounds
      minWidth={10 * scale} // Minimum width of 10 pixels (scaled)
      minHeight={10 * scale} // Minimum height of 10 pixels (scaled)
      style={{ border: selectedGroup?.groupType === groupType && selectedGroup?.id === group.id ? '2px solid #7aa2f7' : 'none' }}
    >
      <Group group={group} groupType={groupType} />
    </Rnd>
  );

  return (
    <div
      style={{
        position: 'relative',
        width: originalCanvasSize.width,
        height: originalCanvasSize.height,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: '100% 100%',
      }}
      onClick={() => {
        if (!isEditing) {
          setSelectedGroup(null);
        }
      }}
    >
      {layout.main && renderGroup(layout.main, 'main')}
      {layout.preparing?.map((group) => renderGroup(group, 'preparing'))}
      {layout.locked && renderGroup(layout.locked, 'locked')}
    </div>
  );
};
