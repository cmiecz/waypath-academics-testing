// Performance Analytics Utilities
import { 
  TestAttempt, 
  QuestionAttempt, 
  PerformanceAnalytics, 
  OverallPerformance, 
  QuestionTypePerformance, 
  PassageTypePerformance, 
  DifficultyPerformance,
  TimeAnalysis, 
  ProgressTracking, 
  WeaknessAnalysis,
  QuestionType,
  PassageType,
  Weakness
} from '../types/act';

/**
 * Calculate comprehensive performance analytics from test attempts
 */
export function calculatePerformanceAnalytics(
  attempts: TestAttempt[],
  questionAttempts: QuestionAttempt[]
): PerformanceAnalytics {
  return {
    overall: calculateOverallPerformance(attempts),
    questionTypes: calculateQuestionTypePerformance(questionAttempts),
    passageTypes: calculatePassageTypePerformance(attempts),
    difficultyLevels: calculateDifficultyPerformance(questionAttempts),
    timeAnalysis: calculateTimeAnalysis(attempts, questionAttempts),
    progress: calculateProgressTracking(attempts),
    weaknesses: identifyWeaknesses(questionAttempts, attempts)
  };
}

/**
 * Calculate overall performance metrics
 */
function calculateOverallPerformance(attempts: TestAttempt[]): OverallPerformance {
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      averageTime: 0,
      improvement: 0,
      currentStreak: 0,
      bestStreak: 0
    };
  }

  const totalAttempts = attempts.length;
  const averageScore = attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / totalAttempts;
  const averageTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0) / totalAttempts;

  // Calculate improvement (comparing first half vs second half)
  const sortedAttempts = attempts.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
  const half = Math.floor(sortedAttempts.length / 2);
  const firstHalf = sortedAttempts.slice(0, half);
  const secondHalf = sortedAttempts.slice(half);

  const firstHalfAvg = firstHalf.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / secondHalf.length;
  const improvement = firstHalf.length > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

  // Calculate streaks
  const { currentStreak, bestStreak } = calculateStreaks(sortedAttempts);

  return {
    totalAttempts,
    averageScore: Math.round(averageScore),
    averageTime: Math.round(averageTime),
    improvement: Math.round(improvement),
    currentStreak,
    bestStreak
  };
}

/**
 * Calculate question type performance
 */
function calculateQuestionTypePerformance(questionAttempts: QuestionAttempt[]): QuestionTypePerformance[] {
  const typeGroups = questionAttempts.reduce((groups, attempt) => {
    if (!groups[attempt.questionType]) {
      groups[attempt.questionType] = [];
    }
    groups[attempt.questionType].push(attempt);
    return groups;
  }, {} as Record<QuestionType, QuestionAttempt[]>);

  return Object.entries(typeGroups).map(([questionType, attempts]) => {
    const totalQuestions = attempts.length;
    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const averageTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0) / totalQuestions;

    // Calculate trend (comparing first half vs second half)
    const sortedAttempts = attempts.sort((a, b) => a.timeSpent - b.timeSpent);
    const half = Math.floor(sortedAttempts.length / 2);
    const firstHalf = sortedAttempts.slice(0, half);
    const secondHalf = sortedAttempts.slice(half);

    const firstHalfAccuracy = firstHalf.length > 0 ? 
      (firstHalf.filter(a => a.isCorrect).length / firstHalf.length) * 100 : 0;
    const secondHalfAccuracy = secondHalf.length > 0 ? 
      (secondHalf.filter(a => a.isCorrect).length / secondHalf.length) * 100 : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondHalfAccuracy > firstHalfAccuracy + 5) trend = 'improving';
    else if (secondHalfAccuracy < firstHalfAccuracy - 5) trend = 'declining';

    return {
      questionType: questionType as QuestionType,
      totalQuestions,
      correctAnswers,
      accuracy: Math.round(accuracy),
      averageTime: Math.round(averageTime),
      trend
    };
  });
}

/**
 * Calculate difficulty level performance
 */
function calculateDifficultyPerformance(questionAttempts: QuestionAttempt[]): DifficultyPerformance[] {
  const difficultyGroups = questionAttempts.reduce((groups, attempt) => {
    const difficulty = attempt.difficulty || 'Medium';
    if (!groups[difficulty]) {
      groups[difficulty] = [];
    }
    groups[difficulty].push(attempt);
    return groups;
  }, {} as Record<'Easy' | 'Medium' | 'Hard', QuestionAttempt[]>);

  const difficulties: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];
  
  return difficulties.map(difficulty => {
    const attempts = difficultyGroups[difficulty] || [];
    const totalQuestions = attempts.length;
    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const averageTime = totalQuestions > 0 ? 
      attempts.reduce((sum, a) => sum + a.timeSpent, 0) / totalQuestions : 0;

    // Calculate trend (comparing first half vs second half)
    const half = Math.floor(attempts.length / 2);
    const firstHalf = attempts.slice(0, half);
    const secondHalf = attempts.slice(half);

    const firstHalfAccuracy = firstHalf.length > 0 ? 
      (firstHalf.filter(a => a.isCorrect).length / firstHalf.length) * 100 : 0;
    const secondHalfAccuracy = secondHalf.length > 0 ? 
      (secondHalf.filter(a => a.isCorrect).length / secondHalf.length) * 100 : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondHalfAccuracy > firstHalfAccuracy + 5) trend = 'improving';
    else if (secondHalfAccuracy < firstHalfAccuracy - 5) trend = 'declining';

    return {
      difficulty,
      totalQuestions,
      correctAnswers,
      accuracy: Math.round(accuracy),
      averageTime: Math.round(averageTime),
      trend
    };
  }).filter(perf => perf.totalQuestions > 0); // Only return difficulties with data
}

/**
 * Calculate passage type performance
 */
function calculatePassageTypePerformance(attempts: TestAttempt[]): PassageTypePerformance[] {
  const typeGroups = attempts.reduce((groups, attempt) => {
    const passageType = attempt.passageType || 'informational';
    if (!groups[passageType]) {
      groups[passageType] = [];
    }
    groups[passageType].push(attempt);
    return groups;
  }, {} as Record<PassageType, TestAttempt[]>);

  return Object.entries(typeGroups).map(([passageType, attempts]) => {
    const totalPassages = attempts.length;
    const averageScore = attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / totalPassages;
    const averageTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0) / totalPassages;
    const accuracy = averageScore;

    // Calculate trend
    const sortedAttempts = attempts.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
    const half = Math.floor(sortedAttempts.length / 2);
    const firstHalf = sortedAttempts.slice(0, half);
    const secondHalf = sortedAttempts.slice(half);

    const firstHalfAvg = firstHalf.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / secondHalf.length;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondHalfAvg > firstHalfAvg + 5) trend = 'improving';
    else if (secondHalfAvg < firstHalfAvg - 5) trend = 'declining';

    return {
      passageType: passageType as PassageType,
      totalPassages,
      averageScore: Math.round(averageScore),
      averageTime: Math.round(averageTime),
      accuracy: Math.round(accuracy),
      trend
    };
  });
}

/**
 * Calculate time analysis
 */
function calculateTimeAnalysis(attempts: TestAttempt[], questionAttempts: QuestionAttempt[]): TimeAnalysis {
  const averageTimePerQuestion = questionAttempts.length > 0 ? 
    questionAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / questionAttempts.length : 0;

  const averageReadingTime = attempts.length > 0 ? 
    attempts.reduce((sum, a) => sum + (a.readingTime || 0), 0) / attempts.length : 0;

  const averageAnsweringTime = attempts.length > 0 ? 
    attempts.reduce((sum, a) => sum + (a.answeringTime || 0), 0) / attempts.length : 0;

  // Time distribution
  const timeDistribution = {
    fast: questionAttempts.filter(a => a.timeSpent < 30).length,
    medium: questionAttempts.filter(a => a.timeSpent >= 30 && a.timeSpent <= 60).length,
    slow: questionAttempts.filter(a => a.timeSpent > 60).length
  };

  // Time by question type
  const timeByQuestionType = questionAttempts.reduce((acc, attempt) => {
    if (!acc[attempt.questionType]) {
      acc[attempt.questionType] = [];
    }
    acc[attempt.questionType].push(attempt.timeSpent);
    return acc;
  }, {} as Record<QuestionType, number[]>);

  const avgTimeByQuestionType = Object.entries(timeByQuestionType).reduce((acc, [type, times]) => {
    acc[type as QuestionType] = times.reduce((sum, time) => sum + time, 0) / times.length;
    return acc;
  }, {} as Record<QuestionType, number>);

  // Time by passage type
  const timeByPassageType = attempts.reduce((acc, attempt) => {
    const passageType = attempt.passageType || 'informational';
    if (!acc[passageType]) {
      acc[passageType] = [];
    }
    acc[passageType].push(attempt.timeSpent);
    return acc;
  }, {} as Record<PassageType, number[]>);

  const avgTimeByPassageType = Object.entries(timeByPassageType).reduce((acc, [type, times]) => {
    acc[type as PassageType] = times.reduce((sum, time) => sum + time, 0) / times.length;
    return acc;
  }, {} as Record<PassageType, number>);

  return {
    averageTimePerQuestion: Math.round(averageTimePerQuestion),
    averageReadingTime: Math.round(averageReadingTime),
    averageAnsweringTime: Math.round(averageAnsweringTime),
    timeDistribution,
    timeByQuestionType: avgTimeByQuestionType,
    timeByPassageType: avgTimeByPassageType
  };
}

/**
 * Calculate progress tracking over time
 */
function calculateProgressTracking(attempts: TestAttempt[]): ProgressTracking {
  const sortedAttempts = attempts.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

  // Daily progress
  const dailyProgress = calculateDailyProgress(sortedAttempts);
  
  // Weekly progress
  const weeklyProgress = calculateWeeklyProgress(sortedAttempts);
  
  // Monthly progress
  const monthlyProgress = calculateMonthlyProgress(sortedAttempts);

  // Score and time trends
  const scoreTrend = sortedAttempts.map(a => Math.round((a.score / a.totalQuestions) * 100));
  const timeTrend = sortedAttempts.map(a => a.timeSpent);

  return {
    dailyProgress,
    weeklyProgress,
    monthlyProgress,
    scoreTrend,
    timeTrend
  };
}

/**
 * Identify weaknesses and provide recommendations
 */
function identifyWeaknesses(questionAttempts: QuestionAttempt[], attempts: TestAttempt[]): WeaknessAnalysis {
  const weaknesses: Weakness[] = [];

  // Question type weaknesses
  const questionTypePerformance = calculateQuestionTypePerformance(questionAttempts);
  questionTypePerformance.forEach(perf => {
    if (perf.accuracy < 70) {
      weaknesses.push({
        category: 'questionType',
        name: perf.questionType,
        severity: perf.accuracy < 50 ? 'high' : perf.accuracy < 60 ? 'medium' : 'low',
        accuracy: perf.accuracy,
        averageTime: perf.averageTime,
        improvement: 0,
        description: `Low accuracy (${perf.accuracy}%) in ${perf.questionType} questions`
      });
    }
  });

  // Passage type weaknesses
  const passageTypePerformance = calculatePassageTypePerformance(attempts);
  passageTypePerformance.forEach(perf => {
    if (perf.accuracy < 70) {
      weaknesses.push({
        category: 'passageType',
        name: perf.passageType,
        severity: perf.accuracy < 50 ? 'high' : perf.accuracy < 60 ? 'medium' : 'low',
        accuracy: perf.accuracy,
        averageTime: perf.averageTime,
        improvement: 0,
        description: `Low accuracy (${perf.accuracy}%) in ${perf.passageType} passages`
      });
    }
  });

  // Time management weaknesses
  const timeAnalysis = calculateTimeAnalysis(attempts, questionAttempts);
  if (timeAnalysis.averageTimePerQuestion > 60) {
    weaknesses.push({
      category: 'timeManagement',
      name: 'Slow Response Time',
      severity: 'high',
      accuracy: 0,
      averageTime: timeAnalysis.averageTimePerQuestion,
      improvement: 0,
      description: `Average time per question is ${timeAnalysis.averageTimePerQuestion}s, which is too slow`
    });
  }

  // Sort by severity and accuracy
  weaknesses.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return a.accuracy - b.accuracy;
  });

  const topWeaknesses = weaknesses.slice(0, 5);
  const recommendations = generateRecommendations(topWeaknesses);
  const focusAreas = topWeaknesses.map(w => w.name);

  return {
    topWeaknesses,
    recommendations,
    focusAreas
  };
}

/**
 * Helper functions
 */
function calculateStreaks(attempts: TestAttempt[]): { currentStreak: number; bestStreak: number } {
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (let i = attempts.length - 1; i >= 0; i--) {
    const accuracy = (attempts[i].score / attempts[i].totalQuestions) * 100;
    if (accuracy >= 70) {
      tempStreak++;
      if (i === attempts.length - 1) {
        currentStreak = tempStreak;
      }
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 0;
    }
  }

  bestStreak = Math.max(bestStreak, tempStreak);
  return { currentStreak, bestStreak };
}

function calculateDailyProgress(attempts: TestAttempt[]) {
  // Implementation for daily progress calculation
  return [];
}

function calculateWeeklyProgress(attempts: TestAttempt[]) {
  // Implementation for weekly progress calculation
  return [];
}

function calculateMonthlyProgress(attempts: TestAttempt[]) {
  // Implementation for monthly progress calculation
  return [];
}

function generateRecommendations(weaknesses: Weakness[]): string[] {
  const recommendations: string[] = [];

  weaknesses.forEach(weakness => {
    switch (weakness.category) {
      case 'questionType':
        recommendations.push(`Focus on practicing ${weakness.name} questions to improve accuracy`);
        break;
      case 'passageType':
        recommendations.push(`Spend more time reading ${weakness.name} passages to build familiarity`);
        break;
      case 'timeManagement':
        recommendations.push('Practice with timed exercises to improve response speed');
        break;
      case 'difficulty':
        recommendations.push('Start with easier questions and gradually increase difficulty');
        break;
    }
  });

  return recommendations;
}

/**
 * Utility functions for analytics
 */
export function formatQuestionType(questionType: QuestionType): string {
  const typeMap: Record<QuestionType, string> = {
    'detail': 'Detail Questions',
    'inference': 'Inference Questions',
    'main-idea': 'Main Idea Questions',
    'author-purpose': 'Author Purpose Questions',
    'vocabulary': 'Vocabulary Questions',
    'tone': 'Tone Questions',
    'structure': 'Structure Questions',
    'comparison': 'Comparison Questions',
    'cause-effect': 'Cause & Effect Questions',
    'sequence': 'Sequence Questions',
    'generalization': 'Generalization Questions',
    'evaluation': 'Evaluation Questions'
  };
  return typeMap[questionType] || questionType;
}

export function formatPassageType(passageType: PassageType): string {
  const typeMap: Record<PassageType, string> = {
    'prose-fiction': 'Prose Fiction',
    'social-science': 'Social Science',
    'humanities': 'Humanities',
    'natural-science': 'Natural Science',
    'paired-passages': 'Paired Passages',
    'informational': 'Informational'
  };
  return typeMap[passageType] || passageType;
}

export function getSeverityColor(severity: 'low' | 'medium' | 'high'): string {
  switch (severity) {
    case 'low': return '#34c759';
    case 'medium': return '#ff9500';
    case 'high': return '#ff3b30';
    default: return '#86868b';
  }
}

export function getTrendIcon(trend: 'improving' | 'declining' | 'stable'): string {
  switch (trend) {
    case 'improving': return 'fas fa-arrow-up';
    case 'declining': return 'fas fa-arrow-down';
    case 'stable': return 'fas fa-minus';
    default: return 'fas fa-minus';
  }
}

export function getTrendColor(trend: 'improving' | 'declining' | 'stable'): string {
  switch (trend) {
    case 'improving': return '#34c759';
    case 'declining': return '#ff3b30';
    case 'stable': return '#86868b';
    default: return '#86868b';
  }
}





