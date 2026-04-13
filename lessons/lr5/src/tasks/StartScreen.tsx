import * as React from 'react';

interface StartScreenProps {
  theme: string;
  soundEnabled: boolean;
  toggleTheme: () => void;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  theme,
  soundEnabled,
  toggleTheme,
  onStart,
}) => {
  const bgGradient =
    theme === 'light'
      ? 'from-purple-500 to-indigo-600'
      : 'from-gray-900 to-black';

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
  const primaryColor =
    theme === 'light' ? 'bg-purple-600' : 'bg-purple-700';
  const primaryHover =
    theme === 'light' ? 'hover:bg-purple-700' : 'hover:bg-purple-800';

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4`}
    >
      <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full`}>
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <h1 className={`text-4xl font-bold mb-2 text-center ${textColor}`}>
          Quiz Game
        </h1>

        <p className={`${mutedText} mb-2 text-center`}>
          MobX + Zustand Edition
        </p>

        <p className={`text-sm ${mutedText} mb-8 text-center`}>
          Звук: {soundEnabled ? '🔊' : '🔇'}
        </p>

        <button
          onClick={onStart}
          className={`w-full ${primaryColor} ${primaryHover} text-white py-4 px-6 rounded-xl font-semibold`}
        >
          Начать игру
        </button>
      </div>
    </div>
  );
};
