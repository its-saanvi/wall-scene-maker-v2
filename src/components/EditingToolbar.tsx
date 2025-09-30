import React from 'react';
import { useScene } from './SceneProvider';
import { useEditing } from './EditingProvider';
import { Group, Position } from '../types';

export const EditingToolbar: React.FC = () => {
  const { selectedGroup, updateGroup, layout } = useScene();
  const { isEditing, setIsEditing } = useEditing();

  if (!isEditing || !selectedGroup) {
    return null;
  }

  let group: Group | undefined;
  if (selectedGroup.groupType === 'main') {
    group = layout.main;
  } else if (selectedGroup.groupType === 'locked') {
    group = layout.locked;
  } else if (selectedGroup.groupType === 'preparing' && layout.preparing) {
    group = layout.preparing.find(g => g.id === selectedGroup.id);
  }

  if (!group) {
    return null;
  }

  const handleUpdate = (newGroup: Partial<Group>) => {
    if (newGroup.type === 'positions' && group?.type === 'grid') {
      const positions: Position[] = [];
      const { rows, columns } = group;
      for (let i = 0; i < rows * columns; i++) {
        positions.push({
          x: (i % columns) / columns,
          y: Math.floor(i / columns) / rows,
          width: 1 / columns,
          height: 1 / rows,
        });
      }
      newGroup.positions = positions;
    }
    updateGroup(selectedGroup.groupType, selectedGroup.id, newGroup);
  };

  const handleClose = () => {
    if (group?.type === 'positions' && group.positions) {
      for (const pos of group.positions) {
        if (pos.x < 0 || pos.y < 0 || pos.x + pos.width > 1 || pos.y + pos.height > 1) {
          alert('One or more previews are outside the group boundaries.');
          return;
        }
      }
    }
    setIsEditing(false);
  }

  const handleAddPosition = () => {
    if (group.type !== 'positions') return;
    const newPositions = [...(group.positions || []), { x: 0, y: 0, width: 0.2, height: 0.2 }];
    updateGroup(selectedGroup.groupType, selectedGroup.id, { positions: newPositions });
  }

  const handleDeletePosition = (index: number) => {
    if (group.type !== 'positions') return;
    const newPositions = [...(group.positions || [])];
    newPositions.splice(index, 1);
    updateGroup(selectedGroup.groupType, selectedGroup.id, { positions: newPositions });
  }

  const handlePositionChange = (index: number, newPos: Partial<Position>) => {
    if (group.type !== 'positions') return;
    const newPositions = [...(group.positions || [])];
    newPositions[index] = { ...newPositions[index], ...newPos };
    updateGroup(selectedGroup.groupType, selectedGroup.id, { positions: newPositions });
  }

  return (
    <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1D202F', padding: '1rem', border: '1px solid #7aa2f7', borderRadius: '10px', zIndex: 200, display: 'flex', flexDirection: 'column', gap: '1rem', width: '80%', maxWidth: '800px', color: '#c0caf5', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Edit Group</h4>
        <button onClick={handleClose} style={{ backgroundColor: '#f7768e', color: '#1D202F' }}>Close</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label>
          Type:
          <select value={group.type} onChange={e => handleUpdate({ type: e.target.value as 'grid' | 'positions' })} style={{ backgroundColor: '#24283b', color: '#c0caf5', border: '1px solid #7aa2f7' }}>
            <option value="grid">Grid</option>
            <option value="positions">Positions</option>
          </select>
        </label>
        {group.type === 'grid' ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label>
              Rows:
              <input
                type="number"
                value={group.rows}
                onChange={e => handleUpdate({ rows: parseInt(e.target.value) })}
                style={{ width: '50px', backgroundColor: '#24283b', color: '#c0caf5', border: '1px solid #7aa2f7' }}
              />
            </label>
            <label>
              Columns:
              <input
                type="number"
                value={group.columns}
                onChange={e => handleUpdate({ columns: parseInt(e.target.value) })}
                style={{ width: '50px', backgroundColor: '#24283b', color: '#c0caf5', border: '1px solid #7aa2f7' }}
              />
            </label>
          </div>
        ) : (
          <div>
            <button onClick={handleAddPosition}>Add Position</button>
          </div>
        )}
      </div>
      {group.type === 'positions' && (
        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', backgroundColor: '#24283b', borderRadius: '5px' }}>
          {(group.positions || []).map((pos, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>Pos {i + 1}:</span>
              <input type="number" value={pos.x} step={0.01} onChange={e => handlePositionChange(i, { x: parseFloat(e.target.value) })} style={{ width: '60px', backgroundColor: '#24283b', color: '#c0caf5', border: '1px solid #7aa2f7' }} />
              <input type="number" value={pos.y} step={0.01} onChange={e => handlePositionChange(i, { y: parseFloat(e.target.value) })} style={{ width: '60px', backgroundColor: '#24283b', color: '#c0caf5', border: '1px solid #7aa2f7' }} />
              <input type="number" value={pos.width} step={0.01} onChange={e => handlePositionChange(i, { width: parseFloat(e.target.value) })} style={{ width: '60px', backgroundColor: '#24283b', color: '#c0caf5', border: '1px solid #7aa2f7' }} />
              <input type="number" value={pos.height} step={0.01} onChange={e => handlePositionChange(i, { height: parseFloat(e.target.value) })} style={{ width: '60px', backgroundColor: '#24283b', color: '#c0caf5', border: '1px solid #7aa2f7' }} />
              <button onClick={() => handleDeletePosition(i)} style={{ backgroundColor: '#f7768e', color: '#1D202F', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '25px', height: '25px' }}>X</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};