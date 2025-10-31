// AI-powered passage generation service
import { Passage, Question, QuestionType } from '../types/act';

// Use environment variable - must be set in .env or Vercel environment variables
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('REACT_APP_OPENAI_API_KEY is not set. AI passage generation will not work.');
}
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface GeneratePassageOptions {
  subject: 'English' | 'Math' | 'Reading' | 'Science';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// Example passage structure for few-shot learning
const EXAMPLE_PASSAGE = `Driving along Route 66, I felt the vibrations shift beneath my tires as the road began to hum. The melody was faint at first, then grew louder, resonating through the car like a lullaby composed by the desert itself. [1] For now, I stopped worrying about work and felt everything would be okay. The children in the back seat sat quietly, their eyes wide with wonder. [2] The children, whose eyes sparkled with delight, sat quietly in the back seat. I glanced at them and smiled, grateful for this unexpected moment of peace.

As the final note [3] fade into the evening air, I slowed the car and pulled over. The desert stretched endlessly in every direction, its silence wrapping around us like a blanket. [4] The desert was dry and arid, with little vegetation in sight. A group of birds passed overhead, [5] gliding effortlessly in a perfect V-formation, their wings slicing through the golden sky.`;

const EXAMPLE_QUESTIONS = [
  {
    questionNumber: 1,
    text: '[1] For now, I stopped worrying about work and felt everything would be okay. Which transition best introduces this sentence?',
    easyText: '[1] For now, I stopped worrying about work and felt everything would be okay. Which transitional phrase correctly indicates a temporary time period?',
    hardText: '[1] For now, I stopped worrying about work and felt everything would be okay. Which choice is most effective here?',
    options: {
      A: 'No Change',
      B: 'Now and then',
      C: 'Later',
      D: 'Occasionally'
    },
    correctAnswer: 'A',
    explanation: '"For now" signals a temporary emotional shift that fits the context.',
    questionType: 'structure'
  },
  {
    questionNumber: 2,
    text: '[2] The children, whose eyes sparkled with delight, sat quietly in the back seat. Which choice correctly uses a possessive pronoun?',
    easyText: '[2] The children, whose eyes sparkled with delight, sat quietly in the back seat. Which choice correctly uses a possessive pronoun to show ownership?',
    hardText: '[2] The children, whose eyes sparkled with delight, sat quietly in the back seat. Which choice best completes the underlined portion?',
    options: {
      A: 'No Change',
      B: 'they have',
      C: 'whom have',
      D: 'who\'s'
    },
    correctAnswer: 'A',
    explanation: '"Whose" is the correct possessive pronoun to describe the children\'s eyes.',
    questionType: 'vocabulary'
  }
];

export async function generatePassageWithQuestions(
  options: GeneratePassageOptions
): Promise<Passage> {
  const { subject, difficulty } = options;

  const prompt = `You are an expert ACT English test passage creator. Generate a complete non-fiction passage with 12-15 questions following this exact structure:

PASSAGE REQUIREMENTS:
- Length: 300-500 words
- Genre: Non-fiction (informational, historical, scientific, or social science)
- Include numbered anchor references [1], [2], [3], etc. in the passage text where questions will reference specific parts
- Writing style: Similar to ACT English test passages - clear, engaging, appropriate for high school level

QUESTION REQUIREMENTS (12-15 questions total):
IMPORTANT: EVERY question MUST have BOTH easyText and hardText versions:
- easyText: Tutoring help version that explicitly names the grammar rule or concept being tested (e.g., "Which choice correctly maintains subject-verb agreement?")
- hardText: Actual test question that is broad/interpretive (e.g., "Which choice is most effective?")

Each question must have:
1. questionNumber: Sequential number starting at 1
2. text: Default question text (fallback - can be same as hardText)
3. easyText: REQUIRED - Tutoring help version that explicitly names the grammar rule or concept
4. hardText: REQUIRED - Actual test question that is broad/interpretive
5. options: Four choices A, B, C, D where A is often "No Change"
6. correctAnswer: One of A, B, C, or D
7. explanation: Clear explanation of why the answer is correct
8. questionType: One of: detail, inference, main-idea, author-purpose, vocabulary, tone, structure, comparison, cause-effect, sequence, generalization, evaluation

IMPORTANT FORMATTING:
- easyText should explicitly teach the concept (good for tutoring)
- hardText should be vague/interpretive (like real ACT questions)
- Passage text must include [1], [2], [3] markers where questions reference them
- Questions should test: grammar, punctuation, word choice, sentence structure, style, tone, clarity

EXAMPLE STRUCTURE:
Passage: "${EXAMPLE_PASSAGE.substring(0, 300)}..."

Questions:
${JSON.stringify(EXAMPLE_QUESTIONS, null, 2)}

NOW GENERATE:
- Subject: ${subject}
- Difficulty: ${difficulty}
- Topic: Choose a random engaging non-fiction topic appropriate for ACT English test

Return ONLY a valid JSON object with this structure:
{
  "title": "Descriptive title for the passage",
  "content": "Full passage text with [1], [2], etc. anchor references...",
  "questions": [
    {
      "questionNumber": 1,
      "text": "Full question text with anchor reference",
      "easyText": "Tutoring help version that names the rule/concept explicitly",
      "hardText": "Vague interpretive version",
      "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
      "correctAnswer": "A",
      "explanation": "Why this answer is correct",
      "questionType": "structure"
    },
    ...more questions (12-15 total)
  ]
}

Make sure the passage is interesting, the questions are well-written, and the difficulty matches ${difficulty} level.`;

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please set REACT_APP_OPENAI_API_KEY environment variable.');
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert ACT English test passage creator. Always return valid JSON that can be parsed directly.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }

    const generated = JSON.parse(jsonContent);

    // Validate and format the response
    if (!generated.title || !generated.content || !generated.questions || !Array.isArray(generated.questions)) {
      throw new Error('Invalid response format from AI');
    }

    // Transform questions to match our Question interface
    const formattedQuestions: Question[] = generated.questions.map((q: any, index: number) => ({
      id: `q${index + 1}`,
      questionNumber: q.questionNumber || index + 1,
      text: q.text || '',
      easyText: q.easyText,
      hardText: q.hardText || q.text,
      options: q.options || { A: '', B: '', C: '', D: '' },
      correctAnswer: (q.correctAnswer || 'A').toUpperCase() as 'A' | 'B' | 'C' | 'D',
      explanation: q.explanation || 'No explanation provided.',
      questionType: (q.questionType || 'detail') as QuestionType,
      difficulty: difficulty
    }));

    // Calculate word count
    const wordCount = generated.content.split(/\s+/).length;
    const estimatedReadingTime = Math.ceil(wordCount / 200) * 60; // Assume 200 words per minute

    // Determine passage type
    const passageType = subject === 'English' ? 'informational' : 
                       subject === 'Reading' ? 'social-science' :
                       subject === 'Science' ? 'natural-science' : 'informational';

    const passage: Passage = {
      id: `passage_${Date.now()}`,
      title: generated.title,
      content: generated.content,
      subject: subject,
      difficulty: difficulty,
      questions: formattedQuestions,
      is_active: false, // Default to inactive so admin can review
      wordCount: wordCount,
      estimatedReadingTime: estimatedReadingTime,
      passageType: passageType as any,
      topic: generated.topic || 'General'
    };

    return passage;
  } catch (error: any) {
    console.error('AI generation error:', error);
    throw new Error(`Failed to generate passage: ${error.message || 'Unknown error'}`);
  }
}
