import * as React from 'react';

interface FinishScreenProps {
  theme: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  onRestart: () => void;
}

export const FinishScreen: React.FC<FinishScreenProps> = ({
  theme,
  score,
  correctAnswers,
  totalQuestions,
  onRestart,
}) => {
  const percentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  const getEmoji = () => {
    if (percentage >= 80) return '🏆';
    if (percentage >= 60) return '😊';
    if (percentage >= 40) return '🤔';
    return '😢';
  };

  const bgGradient =
    theme === 'light'
      ? 'from-purple-500 to-indigo-600'
      : 'from-gray-900 to-black';

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const primaryColor =
    theme === 'light' ? 'bg-purple-600' : 'bg-purple-700';

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4`}
    >
      <div
        className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center`}
      >
        <div className="text-6xl mb-4">{getEmoji()}</div>

        <h2 className={`text-3xl font-bold mb-4 ${textColor}`}>
          Игра завершена!
        </h2>

        <p className="text-5xl font-bold mb-2">{score}</p>

        <p className="mb-4">
          Правильных ответов: {correctAnswers} из {totalQuestions}
        </p>

        <p className="text-2xl font-bold mb-6">{percentage}%</p>

        <button
          onClick={onRestart}
          className={`w-full ${primaryColor} text-white py-3 px-6 rounded-xl font-semibold`}
        >
          Играть снова
        </button>
      </div>
    </div>
  );
};
