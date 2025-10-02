import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Layout, Group, GridGroup, PositionsGroup } from '../types';

interface SceneContextType {
  layout: Layout;
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
  backgroundImage: string | null;
  setBackgroundImage: React.Dispatch<React.SetStateAction<string | null>>;
  updateGroup: (groupType: 'main' | 'locked' | 'preparing', id: string | undefined, newGroup: Partial<Group>) => void;
  updateGroupPosition: (groupType: 'main' | 'locked' | 'preparing', groupId: string | undefined, positionIndex: number, newPosition: { x?: number; y?: number; width?: number; height?: number }) => void;
  deleteGroup: (groupType: 'main' | 'locked' | 'preparing', id: string | undefined) => void;
  originalCanvasSize: { width: number; height: number };
  setOriginalCanvasSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
  displayCanvasSize: { width: number; height: number };
  selectedGroup: { groupType: 'main' | 'locked' | 'preparing'; id: string } | null;
  setSelectedGroup: React.Dispatch<React.SetStateAction<{ groupType: 'main' | 'locked' | 'preparing'; id: string } | null>>;
  addGroup: (groupType: 'main' | 'preparing' | 'locked') => void;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

export const useScene = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
};

export const SceneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layout, setLayout] = useState<Layout>({});
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [originalCanvasSize, setOriginalCanvasSize] = useState({ width: 1920, height: 1080 });
  const [displayCanvasSize, setDisplayCanvasSize] = useState({ width: 0, height: 0 });
  const [selectedGroup, setSelectedGroup] = useState<{ groupType: 'main' | 'locked' | 'preparing'; id: string } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth * 0.8;
      const newHeight = window.innerHeight * 0.8;
      setDisplayCanvasSize({ width: newWidth, height: newHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addGroup = useCallback((groupType: 'main' | 'preparing' | 'locked') => {
    setLayout(prevLayout => {
      const newLayout = { ...prevLayout };
      const newId = `group-${Date.now()}`;
      const newGroupBase = { id: newId, type: 'grid', rows: 0, columns: 0, x: 100, y: 100, width: 400, height: 300 };

      if (groupType === 'main' && !newLayout.main) {
        newLayout.main = newGroupBase as GridGroup;
      } else if (groupType === 'locked' && !newLayout.locked) {
        newLayout.locked = newGroupBase as GridGroup;
      } else if (groupType === 'preparing') {
        if (!newLayout.preparing) {
          newLayout.preparing = [];
        }
        newLayout.preparing.push(newGroupBase as GridGroup);
      }
      return newLayout;
    });
  }, [setLayout]);

  const updateGroup = (groupType: 'main' | 'locked' | 'preparing', id: string | undefined, newGroup: Partial<Group>) => {
    setLayout(prevLayout => {
      const newLayout = { ...prevLayout };

      const processedGroup = { ...newGroup };
      if (typeof processedGroup.width === 'string') {
        processedGroup.width = parseFloat(processedGroup.width);
      }
      if (typeof processedGroup.height === 'string') {
        processedGroup.height = parseFloat(processedGroup.height);
      }

      if (groupType === 'main' && newLayout.main?.id === id) {
        newLayout.main = { ...newLayout.main, ...processedGroup } as Group;
      } else if (groupType === 'locked' && newLayout.locked?.id === id) {
        newLayout.locked = { ...newLayout.locked, ...processedGroup } as Group;
      } else if (groupType === 'preparing' && newLayout.preparing) {
        const index = newLayout.preparing.findIndex(g => g.id === id);
        if (index !== -1) {
          newLayout.preparing[index] = { ...newLayout.preparing[index], ...processedGroup } as Group;
        }
      }
      return newLayout;
    });
  };

  const updateGroupPosition = (groupType: 'main' | 'locked' | 'preparing', groupId: string | undefined, positionIndex: number, newPosition: { x?: number; y?: number; width?: number; height?: number }) => {
    setLayout(prevLayout => {
      const newLayout = { ...prevLayout };
      let targetGroup: Group | undefined;

      if (groupType === 'main' && newLayout.main?.id === groupId) {
        targetGroup = newLayout.main;
      } else if (groupType === 'locked' && newLayout.locked?.id === groupId) {
        targetGroup = newLayout.locked;
      } else if (groupType === 'preparing' && newLayout.preparing) {
        targetGroup = newLayout.preparing.find(g => g.id === groupId);
      }

      if (targetGroup && targetGroup.type === 'positions' && targetGroup.positions && targetGroup.positions[positionIndex]) {
        const updatedPositions = [...targetGroup.positions];
        updatedPositions[positionIndex] = { ...updatedPositions[positionIndex], ...newPosition };

        if (groupType === 'main' && newLayout.main?.id === groupId) {
          newLayout.main = { ...(newLayout.main as PositionsGroup), positions: updatedPositions };
        } else if (groupType === 'locked' && newLayout.locked?.id === groupId) {
          newLayout.locked = { ...(newLayout.locked as PositionsGroup), positions: updatedPositions };
        } else if (groupType === 'preparing' && newLayout.preparing) {
          const index = newLayout.preparing.findIndex(g => g.id === groupId);
          if (index !== -1) {
            newLayout.preparing[index] = { ...(newLayout.preparing[index] as PositionsGroup), positions: updatedPositions };
          }
        }
      }
      return newLayout;
    });
  };

  const deleteGroup = (groupType: 'main' | 'locked' | 'preparing', id: string | undefined) => {
    setLayout(prevLayout => {
      const newLayout = { ...prevLayout };
      if (groupType === 'main' && newLayout.main?.id === id) {
        delete newLayout.main;
      } else if (groupType === 'locked' && newLayout.locked?.id === id) {
        delete newLayout.locked;
      } else if (groupType === 'preparing' && newLayout.preparing) {
        newLayout.preparing = newLayout.preparing.filter(g => g.id !== id);
      }
      return newLayout;
    });
  };

  return (
    <SceneContext.Provider value={{ layout, setLayout, backgroundImage, setBackgroundImage, addGroup, updateGroup, updateGroupPosition, deleteGroup, originalCanvasSize, setOriginalCanvasSize, displayCanvasSize, selectedGroup, setSelectedGroup }}>
      {children}
    </SceneContext.Provider>
  );
};
