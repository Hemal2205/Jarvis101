import { useState } from 'react';

export const useCloseWarning = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [learningData, setLearningData] = useState<{
    skill_name: string;
    progress: number;
    time_spent: number;
    session_id: string;
  } | undefined>(undefined);

  const showWarning = (data?: {
    skill_name: string;
    progress: number;
    time_spent: number;
    session_id: string;
  }) => {
    setLearningData(data);
    setIsVisible(true);
  };

  const hideWarning = () => {
    setIsVisible(false);
    setLearningData(undefined);
  };

  return { isVisible, learningData, showWarning, hideWarning };
}; 