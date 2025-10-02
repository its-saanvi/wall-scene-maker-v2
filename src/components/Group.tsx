import React from 'react';
import { Rnd } from 'react-rnd';
import { type Group as GroupType } from '../types';
import { useScene } from './SceneProvider';
import { useEditing } from './EditingProvider';
import DirtImage from "/dirt.png";

interface GroupProps {
  group: GroupType;
  groupType: 'main' | 'preparing' | 'locked';
}

export const Group: React.FC<GroupProps> = ({ group, groupType }) => {
  const { deleteGroup, setSelectedGroup, updateGroupPosition, selectedGroup } = useScene();
  const { isEditing, setIsEditing } = useEditing();

  const handleDelete = () => {
    deleteGroup(groupType, group.id);
  };

  const handleEdit = () => {
    setSelectedGroup({ groupType, id: group.id!! });
    setIsEditing(true);
  }

  const renderPreviews = () => {
    const backgroundImage = DirtImage;
    const previewStyle: React.CSSProperties = {
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      border: '1px solid #414868', // tokyonight darker blue
      boxSizing: 'border-box',
      boxShadow: '0 0 10px rgba(0,0,0,0.75)',
    };

    if (group.type === 'grid') {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', height: '100%' }}>
          {Array.from({ length: group.rows * group.columns }).map((_, i) => (
            <div key={i} style={{ ...previewStyle, width: `${100 / group.columns}%`, height: `${100 / group.rows}%` }} data-is-preview="true">
              <img src={backgroundImage} alt={"dirt.png"} style={{ width: '100%', height: '100%', objectFit: 'fill' }} draggable={false} onDragStart={(e) => e.preventDefault()} />
            </div>
          ))}
        </div>
      )
    } else {
      if (!group.positions) return null;
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {group.positions.map((pos, i) => (
            <Rnd
              key={i}
              bounds="parent"
              position={{
                x: pos.x * group.width,
                y: pos.y * group.height,
              }}
              size={{
                width: pos.width * group.width,
                height: pos.height * group.height,
              }}
              onDragStop={(_e, d) => updateGroupPosition(groupType, group.id, i, { x: d.x / group.width, y: d.y / group.height })}
              onResizeStop={(_e, _direction, ref, _delta, newPosition) => {
                const newWidth = parseFloat(ref.style.width) / group.width;
                const newHeight = parseFloat(ref.style.height) / group.height;
                const newX = newPosition.x / group.width;
                const newY = newPosition.y / group.height;
                updateGroupPosition(groupType, group.id, i, { width: newWidth, height: newHeight, x: newX, y: newY });
              }}
              disableDragging={!isEditing}
              enableResizing={isEditing}
            >
              <div
                style={{
                  ...previewStyle,
                  width: '100%',
                  height: '100%',
                }}
                data-is-preview="true"
              >
                <img src={backgroundImage} alt={"dirt.png"} style={{ width: '100%', height: '100%' }} draggable={false} onDragStart={(e) => e.preventDefault()} />
              </div>
            </Rnd>
          ))}
        </div>
      );
    }
  };

  const isSelected = selectedGroup?.id === group.id;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {!isSelected && (
        <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)', color: '#c0caf5', padding: '2px 5px', fontSize: '0.8em', zIndex: 10 }}>
          {groupType.toUpperCase()}
        </div>
      )}
      {renderPreviews()}
      <button onClick={handleEdit} style={{ position: 'absolute', top: 5, right: 40, padding: '5px 10px' }}>
        Edit
      </button>
      <button onClick={handleDelete} style={{ position: 'absolute', top: 5, right: 5, backgroundColor: '#f7768e', color: '#1D202F', border: 'none', borderRadius: '50%', width: '25px', height: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        X
      </button>
    </div>
  );
};
