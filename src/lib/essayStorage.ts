export interface SavedEssayData {
  essay: string;
  topicSource: 'generated' | 'custom';
  customTopic: string;
  topic: string;
  selectedTopicId: string;
  timestamp: number;
}

const STORAGE_KEY = 'ace-uplift-essay-draft';

export const saveEssayToStorage = (
  essayData: Omit<SavedEssayData, 'timestamp'>
): void => {
  const dataWithTimestamp: SavedEssayData = {
    ...essayData,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
  } catch (error) {
  }
};

export const getEssayFromStorage = (): SavedEssayData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const data: SavedEssayData = JSON.parse(saved);

    // Check if data is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - data.timestamp > maxAge) {
      clearEssayFromStorage();
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
};

export const clearEssayFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
  }
};

export const hasSavedEssay = (): boolean => {
  return getEssayFromStorage() !== null;
};
