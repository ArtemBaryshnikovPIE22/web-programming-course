type EssayRubric = {
  maxPoints: number;
  criteria: {
    name: string;
    maxPoints: number;
  }[];
};

export class ScoringService {
   //Подсчет баллов
  scoreMultipleSelect(correctAnswers: string[], studentAnswers: string[]): number {
    if (!correctAnswers.length || !studentAnswers.length) {
      return 0;
    }

    let score = 0;
    
    // Создаем множества для быстрого поиска
    const correctSet = new Set(correctAnswers);
    const studentSet = new Set(studentAnswers);
    
    // Начисляем за все правильные ответы
    for (const answer of correctSet) {
      if (studentSet.has(answer)) {
        score += 1;
      }
    }
    
    // Отнимаем за лишние (неправильные) варианты
    for (const answer of studentSet) {
      if (!correctSet.has(answer)) {
        score -= 0.5;
      }
    }
    
    return Math.max(0, score);
  }

  // Подсчет баллов для essay вопросов
  scoreEssay(grades: number[], rubric: EssayRubric): number {
    if (grades.length !== rubric.criteria.length) {
      throw new Error('Количество оценок должно соответствовать количеству критериев');
    }

    let totalScore = 0;
    
    for (let i = 0; i < grades.length; i++) {
      const grade = grades[i];
      const maxForCriterion = rubric.criteria[i].maxPoints;
      
      if (grade > maxForCriterion) {
        throw new Error(`Оценка по критерию "${rubric.criteria[i].name}" не может превышать ${maxForCriterion}`);
      }
      
      if (grade < 0) {
        throw new Error('Оценка не может быть отрицательной');
      }
      
      totalScore += grade;
    }
    
    
    return Math.min(totalScore, rubric.maxPoints);
  }

  scoreQuestion(
    questionType: string,
    correctAnswer: any,
    studentAnswer: any,
    rubric?: EssayRubric
  ): number {
    switch (questionType) {
      case 'multiple-select':
        return this.scoreMultipleSelect(correctAnswer, studentAnswer);
      
      case 'single-select':
        
        return correctAnswer === studentAnswer ? 1 : 0;
      
      case 'essay':
        if (!rubric) {
          throw new Error('Для essay вопросов необходима рубрика оценивания');
        }
        return this.scoreEssay(studentAnswer, rubric);
      
      default:
        throw new Error(`Неподдерживаемый тип вопроса: ${questionType}`);
    }
  }
}

export const scoringService = new ScoringService();