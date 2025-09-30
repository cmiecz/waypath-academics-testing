// ACT Scoring Methodology Implementation
// Based on official ACT scoring guidelines for 2025-2026

export interface ACTSectionScores {
  english: number;
  math: number;
  reading: number;
  science: number;
}

export interface ACTRawScores {
  english: number;
  math: number;
  reading: number;
  science: number;
}

export interface ACTScaledScores {
  english: number;
  math: number;
  reading: number;
  science: number;
}

export interface ACTScoreResult {
  rawScores: ACTRawScores;
  scaledScores: ACTScaledScores;
  compositeScore: number;
  sectionPercentiles: ACTSectionScores;
  compositePercentile: number;
}

// ACT Conversion Tables (approximate based on official guidelines)
const ENGLISH_CONVERSION_TABLE: Record<number, number> = {
  75: 36, 74: 36, 73: 35, 72: 35, 71: 34, 70: 34, 69: 33, 68: 33, 67: 32, 66: 32,
  65: 31, 64: 30, 63: 30, 62: 29, 61: 29, 60: 28, 59: 27, 58: 27, 57: 26, 56: 26,
  55: 25, 54: 24, 53: 24, 52: 23, 51: 23, 50: 22, 49: 22, 48: 21, 47: 21, 46: 20,
  45: 20, 44: 19, 43: 19, 42: 18, 41: 18, 40: 17, 39: 17, 38: 16, 37: 16, 36: 15,
  35: 15, 34: 14, 33: 14, 32: 13, 31: 13, 30: 12, 29: 12, 28: 11, 27: 11, 26: 10,
  25: 10, 24: 9, 23: 9, 22: 8, 21: 8, 20: 7, 19: 7, 18: 6, 17: 6, 16: 5,
  15: 5, 14: 4, 13: 4, 12: 3, 11: 3, 10: 2, 9: 2, 8: 1, 7: 1, 6: 1,
  5: 1, 4: 1, 3: 1, 2: 1, 1: 1, 0: 1
};

const MATH_CONVERSION_TABLE: Record<number, number> = {
  60: 36, 59: 35, 58: 34, 57: 33, 56: 32, 55: 31, 54: 30, 53: 29, 52: 28, 51: 27,
  50: 26, 49: 25, 48: 24, 47: 23, 46: 22, 45: 21, 44: 20, 43: 19, 42: 18, 41: 17,
  40: 16, 39: 15, 38: 14, 37: 13, 36: 12, 35: 11, 34: 10, 33: 9, 32: 8, 31: 7,
  30: 6, 29: 5, 28: 4, 27: 3, 26: 2, 25: 1, 24: 1, 23: 1, 22: 1, 21: 1,
  20: 1, 19: 1, 18: 1, 17: 1, 16: 1, 15: 1, 14: 1, 13: 1, 12: 1, 11: 1,
  10: 1, 9: 1, 8: 1, 7: 1, 6: 1, 5: 1, 4: 1, 3: 1, 2: 1, 1: 1, 0: 1
};

const READING_CONVERSION_TABLE: Record<number, number> = {
  40: 36, 39: 35, 38: 34, 37: 33, 36: 32, 35: 31, 34: 30, 33: 29, 32: 28, 31: 27,
  30: 26, 29: 25, 28: 24, 27: 23, 26: 22, 25: 21, 24: 20, 23: 19, 22: 18, 21: 17,
  20: 16, 19: 15, 18: 14, 17: 13, 16: 12, 15: 11, 14: 10, 13: 9, 12: 8, 11: 7,
  10: 6, 9: 5, 8: 4, 7: 3, 6: 2, 5: 1, 4: 1, 3: 1, 2: 1, 1: 1, 0: 1
};

const SCIENCE_CONVERSION_TABLE: Record<number, number> = {
  40: 36, 39: 35, 38: 34, 37: 33, 36: 32, 35: 31, 34: 30, 33: 29, 32: 28, 31: 27,
  30: 26, 29: 25, 28: 24, 27: 23, 26: 22, 25: 21, 24: 20, 23: 19, 22: 18, 21: 17,
  20: 16, 19: 15, 18: 14, 17: 13, 16: 12, 15: 11, 14: 10, 13: 9, 12: 8, 11: 7,
  10: 6, 9: 5, 8: 4, 7: 3, 6: 2, 5: 1, 4: 1, 3: 1, 2: 1, 1: 1, 0: 1
};

// Percentile tables (approximate based on national averages)
const PERCENTILE_TABLE: Record<number, number> = {
  36: 100, 35: 99, 34: 99, 33: 98, 32: 97, 31: 95, 30: 93, 29: 90, 28: 87, 27: 83,
  26: 78, 25: 73, 24: 67, 23: 61, 22: 55, 21: 48, 20: 42, 19: 36, 18: 30, 17: 25,
  16: 20, 15: 16, 14: 12, 13: 9, 12: 7, 11: 5, 10: 3, 9: 2, 8: 1, 7: 1,
  6: 1, 5: 1, 4: 1, 3: 1, 2: 1, 1: 1
};

/**
 * Convert raw score to scaled score for a specific section
 */
export function convertRawToScaled(rawScore: number, section: keyof ACTRawScores): number {
  const table = {
    english: ENGLISH_CONVERSION_TABLE,
    math: MATH_CONVERSION_TABLE,
    reading: READING_CONVERSION_TABLE,
    science: SCIENCE_CONVERSION_TABLE
  }[section];

  // Find the closest raw score in the table
  let scaledScore = 1;
  for (const [raw, scaled] of Object.entries(table)) {
    if (rawScore >= parseInt(raw)) {
      scaledScore = scaled;
    } else {
      break;
    }
  }

  return scaledScore;
}

/**
 * Get percentile for a scaled score
 */
export function getPercentile(scaledScore: number): number {
  return PERCENTILE_TABLE[scaledScore] || 1;
}

/**
 * Calculate ACT scores using official methodology
 */
export function calculateACTScores(
  englishCorrect: number,
  mathCorrect: number,
  readingCorrect: number,
  scienceCorrect: number,
  englishTotal: number = 75,
  mathTotal: number = 60,
  readingTotal: number = 40,
  scienceTotal: number = 40
): ACTScoreResult {
  // Calculate raw scores (number of correct answers)
  const rawScores: ACTRawScores = {
    english: Math.min(englishCorrect, englishTotal),
    math: Math.min(mathCorrect, mathTotal),
    reading: Math.min(readingCorrect, readingTotal),
    science: Math.min(scienceCorrect, scienceTotal)
  };

  // Convert to scaled scores
  const scaledScores: ACTScaledScores = {
    english: convertRawToScaled(rawScores.english, 'english'),
    math: convertRawToScaled(rawScores.math, 'math'),
    reading: convertRawToScaled(rawScores.reading, 'reading'),
    science: convertRawToScaled(rawScores.science, 'science')
  };

  // Calculate composite score (average of scaled scores, rounded)
  const compositeScore = Math.round(
    (scaledScores.english + scaledScores.math + scaledScores.reading + scaledScores.science) / 4
  );

  // Calculate percentiles
  const sectionPercentiles: ACTSectionScores = {
    english: getPercentile(scaledScores.english),
    math: getPercentile(scaledScores.math),
    reading: getPercentile(scaledScores.reading),
    science: getPercentile(scaledScores.science)
  };

  const compositePercentile = getPercentile(compositeScore);

  return {
    rawScores,
    scaledScores,
    compositeScore,
    sectionPercentiles,
    compositePercentile
  };
}

/**
 * Calculate ACT scores from test attempts
 */
export function calculateACTScoresFromAttempts(attempts: Array<{
  score: number;
  totalQuestions: number;
  passageId: string;
}>, passages: Array<{ id: string; subject: string }>): ACTScoreResult {
  // Group attempts by subject
  const subjectScores: Record<string, { correct: number; total: number }> = {
    English: { correct: 0, total: 0 },
    Math: { correct: 0, total: 0 },
    Reading: { correct: 0, total: 0 },
    Science: { correct: 0, total: 0 }
  };

  attempts.forEach(attempt => {
    const passage = passages.find(p => p.id === attempt.passageId);
    if (passage && subjectScores[passage.subject]) {
      subjectScores[passage.subject].correct += attempt.score;
      subjectScores[passage.subject].total += attempt.totalQuestions;
    }
  });

  return calculateACTScores(
    subjectScores.English.correct,
    subjectScores.Math.correct,
    subjectScores.Reading.correct,
    subjectScores.Science.correct,
    subjectScores.English.total || 75,
    subjectScores.Math.total || 60,
    subjectScores.Reading.total || 40,
    subjectScores.Science.total || 40
  );
}

/**
 * Get score interpretation message
 */
export function getScoreInterpretation(compositeScore: number): {
  message: string;
  color: string;
  level: string;
} {
  if (compositeScore >= 34) {
    return {
      message: "Outstanding! You're in the top 1% of test takers. Excellent work!",
      color: "text-green-600",
      level: "Excellent"
    };
  } else if (compositeScore >= 30) {
    return {
      message: "Excellent! You're in the top 10% of test takers. Great job!",
      color: "text-green-500",
      level: "Very Good"
    };
  } else if (compositeScore >= 26) {
    return {
      message: "Good work! You're above average. Keep practicing to improve further.",
      color: "text-blue-600",
      level: "Good"
    };
  } else if (compositeScore >= 22) {
    return {
      message: "Average performance. Focus on your weak areas to improve.",
      color: "text-yellow-600",
      level: "Average"
    };
  } else if (compositeScore >= 18) {
    return {
      message: "Below average. Consider additional study and practice.",
      color: "text-orange-600",
      level: "Below Average"
    };
  } else {
    return {
      message: "Needs improvement. Focus on fundamental concepts and practice regularly.",
      color: "text-red-600",
      level: "Needs Improvement"
    };
  }
}

/**
 * Format score for display
 */
export function formatACTScore(score: number): string {
  return score.toString();
}

/**
 * Get section name for display
 */
export function getSectionDisplayName(section: keyof ACTRawScores): string {
  const names = {
    english: "English",
    math: "Mathematics",
    reading: "Reading",
    science: "Science"
  };
  return names[section];
}
