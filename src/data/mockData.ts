import { Passage } from '../types/act';

export const mockPassages: Passage[] = [
      {
        id: 'passage_1',
        title: 'Moments in Motion',
        subject: 'English',
        difficulty: 'Medium',
        content: `Driving along Route 66, I felt the vibrations shift beneath my tires as the road began to hum. The melody was faint at first, then grew louder, resonating through the car like a lullaby composed by the desert itself. [1] For now, I stopped worrying about work and felt everything would be okay. The children in the back seat sat quietly, their eyes wide with wonder. [2] The children, whose eyes sparkled with delight, sat quietly in the back seat. I glanced at them and smiled, grateful for this unexpected moment of peace.

    As the final note [3] fade into the evening air, I slowed the car and pulled over. The desert stretched endlessly in every direction, its silence wrapping around us like a blanket. [4] The desert was dry and arid, with little vegetation in sight. A group of birds passed overhead, [5] gliding effortlessly in a perfect V-formation, their wings slicing through the golden sky.

    We stepped out of the car and climbed a small ridge nearby. I stood at the top, letting the silence [6] sink in. The sun dipped lower, casting long shadows across the sand. [7] I listened to the wind, watched the sun rise, and felt the sand beneath my feet. Over the years, I've learned to appreciate the desert's quiet and the [8] morning's gentle light.

    Later, we visited a small-town library to escape the heat. [9] The library was warm, quiet, and welcoming. I wandered through the aisles, pulling out a novel that was [10] tucked out of sight behind older volumes. [11] The librarian's quiet encouragement helped me discover new authors. I read the first chapter; [12] it was intriguing and mysterious. As the rain tapped the windows, I felt a sense of [13] calm settle over me.

    The next morning, I walked through a quiet urban neighborhood. [14] The buildings stood towering above me, casting long shadows. [15] The sound of footsteps and distant traffic fills the air as the city begins to wake. [16] Consequently, I felt more connected to the city than ever before. [17] As the sun rose slowly, the buildings glowed with golden light.`,
        questions: [
          {
            id: 'q1',
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
            difficulty: 'Hard',
            questionType: 'structure'
          },
          {
            id: 'q2',
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
            difficulty: 'Easy',
            questionType: 'vocabulary'
          },
          {
            id: 'q3',
            questionNumber: 3,
            text: '[3] fade into the evening air Which choice maintains consistent verb tense?',
            easyText: '[3] fade into the evening air Which choice correctly maintains consistent verb tense to match "slowed"?',
            hardText: '[3] fade into the evening air Which choice best completes the underlined portion?',
            options: {
              A: 'No Change',
              B: 'have disappeared',
              C: 'disappear',
              D: 'faded'
            },
            correctAnswer: 'D',
            explanation: '"Faded" matches the past tense of "slowed" and maintains consistency.',
            difficulty: 'Easy',
            questionType: 'structure'
          },
          {
            id: 'q4',
            questionNumber: 4,
            text: '[4] The desert was dry and arid, with little vegetation in sight. Which choice avoids redundancy?',
            easyText: '[4] The desert was dry and arid, with little vegetation in sight. Which choice eliminates redundant wording?',
            hardText: '[4] The desert was dry and arid, with little vegetation in sight. Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'dry and lacking moisture',
              C: 'arid and sparse',
              D: 'arid'
            },
            correctAnswer: 'D',
            explanation: '"Arid" already means dry, so "dry and arid" is redundant.',
            difficulty: 'Medium',
            questionType: 'detail'
          },
          {
            id: 'q5',
            questionNumber: 5,
            text: '[5] gliding effortlessly in a perfect V-formation Which choice places the modifier correctly?',
            easyText: '[5] gliding effortlessly in a perfect V-formation Which choice correctly places the modifying phrase to avoid confusion?',
            hardText: '[5] gliding effortlessly in a perfect V-formation Which choice most effectively revises the sentence?',
            options: {
              A: 'No Change',
              B: 'The birds glided effortlessly across the sky in a perfect V-formation.',
              C: 'The birds crossed the sky gliding effortlessly in a perfect V-formation.',
              D: 'Gliding effortlessly in a perfect V-formation, the birds crossed the sky.'
            },
            correctAnswer: 'D',
            explanation: 'Modifier is placed clearly and elegantly before the subject.',
            difficulty: 'Medium',
            questionType: 'structure'
          },
          {
            id: 'q6',
            questionNumber: 6,
            text: '[6] sink in. Which choice best completes the sentence with the appropriate idiom?',
            easyText: '[6] sink in. Which choice uses the correct idiomatic expression for emotionally absorbing a moment?',
            hardText: '[6] sink in. Which choice is most effective here?',
            options: {
              A: 'No Change',
              B: 'soak up',
              C: 'settle down',
              D: 'fall over'
            },
            correctAnswer: 'A',
            explanation: '"Sink in" is the correct idiom for emotionally absorbing a moment.',
            difficulty: 'Hard',
            questionType: 'vocabulary'
          },
          {
            id: 'q7',
            questionNumber: 7,
            text: '[7] I listened to the wind, watched the sun rise, and felt the sand beneath my feet. Which choice maintains parallel structure?',
            easyText: '[7] I listened to the wind, watched the sun rise, and felt the sand beneath my feet. Which choice correctly maintains parallel structure with the verbs "listened" and "watched"?',
            hardText: '[7] I listened to the wind, watched the sun rise, and felt the sand beneath my feet. Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'feeling the sand beneath my feet',
              C: 'had felt the sand beneath my feet',
              D: 'feel the sand beneath my feet'
            },
            correctAnswer: 'A',
            explanation: 'Maintains parallel structure with "listened," "watched," and "felt."',
            difficulty: 'Easy',
            questionType: 'structure'
          },
          {
            id: 'q8',
            questionNumber: 8,
            text: '[8] morning\'s Which choice correctly uses apostrophes?',
            easyText: '[8] morning\'s Which choice correctly uses an apostrophe to show possession?',
            hardText: '[8] morning\'s Which choice best completes the underlined portion?',
            options: {
              A: 'No Change',
              B: 'mornings',
              C: 'mornings\'',
              D: 'morning'
            },
            correctAnswer: 'A',
            explanation: '"Morning\'s" correctly shows possession.',
            difficulty: 'Easy',
            questionType: 'detail'
          },
          {
            id: 'q9',
            questionNumber: 9,
            text: '[9] The library was warm, quiet, and welcoming. Which choice correctly punctuates the sentence?',
            easyText: '[9] The library was warm, quiet, and welcoming. Which choice correctly uses commas in a series of three adjectives?',
            hardText: '[9] The library was warm, quiet, and welcoming. Which choice is correct?',
            options: {
              A: 'No Change',
              B: 'warm quiet and welcoming',
              C: 'warm, quiet and welcoming',
              D: 'warm quiet, and welcoming'
            },
            correctAnswer: 'A',
            explanation: 'Correct comma usage in a series of adjectives.',
            difficulty: 'Easy',
            questionType: 'detail'
          },
          {
            id: 'q10',
            questionNumber: 10,
            text: '[10] tucked out of sight Which choice best maintains clarity and avoids repetition?',
            easyText: '[10] tucked out of sight Which choice eliminates wordiness and maintains concise language?',
            hardText: '[10] tucked out of sight Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'hidden and not seen',
              C: 'concealed from view and hidden',
              D: 'hidden behind the other books and not visible'
            },
            correctAnswer: 'A',
            explanation: '"Tucked out of sight" is concise and vivid.',
            difficulty: 'Medium',
            questionType: 'detail'
          },
          {
            id: 'q11',
            questionNumber: 11,
            text: '[11] The librarian\'s quiet encouragement helped me discover new authors. Which choice correctly uses a possessive noun?',
            easyText: '[11] The librarian\'s quiet encouragement helped me discover new authors. Which choice correctly uses an apostrophe to show singular possession?',
            hardText: '[11] The librarian\'s quiet encouragement helped me discover new authors. Which choice is correct?',
            options: {
              A: 'No Change',
              B: 'librarians',
              C: 'librarians\'',
              D: 'librarian'
            },
            correctAnswer: 'A',
            explanation: '"Librarian\'s" correctly shows possession.',
            difficulty: 'Easy',
            questionType: 'detail'
          },
          {
            id: 'q12',
            questionNumber: 12,
            text: '[12] it was intriguing and mysterious. Which choice best combines the ideas in the sentence?',
            easyText: '[12] it was intriguing and mysterious. Which choice correctly uses a semicolon to join two independent clauses?',
            hardText: '[12] it was intriguing and mysterious. Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'I read the first chapter, it was intriguing and mysterious.',
              C: 'I read the first chapter; it was intriguing and mysterious.',
              D: 'I read the first chapter and it was intriguing and mysterious.'
            },
            correctAnswer: 'C',
            explanation: 'Correct use of semicolon to join two independent clauses.',
            difficulty: 'Medium',
            questionType: 'structure'
          },
          {
            id: 'q13',
            questionNumber: 13,
            text: '[13] calm Which word best matches the tone of quiet reflection?',
            easyText: '[13] calm Which word choice best maintains the peaceful, reflective tone of the passage?',
            hardText: '[13] calm Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'boredom',
              C: 'relief',
              D: 'distraction'
            },
            correctAnswer: 'A',
            explanation: '"Calm" fits the peaceful, reflective tone of the passage.',
            difficulty: 'Hard',
            questionType: 'tone'
          },
          {
            id: 'q14',
            questionNumber: 14,
            text: '[14] The buildings stood towering above me Which choice avoids redundancy?',
            easyText: '[14] The buildings stood towering above me Which choice eliminates the redundant use of "stood" and "towering"?',
            hardText: '[14] The buildings stood towering above me Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'tall and high above me',
              C: 'towering above me',
              D: 'tall above me'
            },
            correctAnswer: 'C',
            explanation: '"Towering above me" is concise and avoids redundancy.',
            difficulty: 'Medium',
            questionType: 'detail'
          },
          {
            id: 'q15',
            questionNumber: 15,
            text: '[15] The sound of footsteps and distant traffic fills the air Which choice maintains correct subject-verb agreement?',
            easyText: '[15] The sound of footsteps and distant traffic fills the air Which choice correctly matches the singular subject "sound" with the appropriate verb?',
            hardText: '[15] The sound of footsteps and distant traffic fills the air Which choice is correct?',
            options: {
              A: 'No Change',
              B: 'fill',
              C: 'has filled',
              D: 'are filling'
            },
            correctAnswer: 'A',
            explanation: '"Sound" is singular, so "fills" is correct.',
            difficulty: 'Easy',
            questionType: 'structure'
          },
          {
            id: 'q16',
            questionNumber: 16,
            text: '[16] Consequently, I felt more connected to the city than ever before. Which transition best connects the narrator\'s thoughts?',
            easyText: '[16] Consequently, I felt more connected to the city than ever before. Which transitional word correctly shows a cause-and-effect relationship?',
            hardText: '[16] Consequently, I felt more connected to the city than ever before. Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'As a result',
              C: 'Nevertheless',
              D: 'In contrast'
            },
            correctAnswer: 'A',
            explanation: '"Consequently" clearly shows cause and effect.',
            difficulty: 'Hard',
            questionType: 'structure'
          }
        ]
      },
      {
        id: 'passage_2',
        title: 'The Art of Stillness',
        subject: 'English',
        difficulty: 'Medium',
        content: `[1] Despite of the city's constant motion, I've always found moments of stillness tucked between its rhythms. Early mornings offer a rare hush, broken only by the occasional hum of a delivery truck or the distant bark of a dog. [2] The streets, usually bustling, was nearly empty, and the air carried the scent of rain evaporating from the pavement.

    I walked past shuttered cafés and newspaper stands, their metal grates pulled down like eyelids. [3] Turning the corner, the sun had begun to rise, casting long shadows that stretched across the sidewalk like spilled ink. A cyclist passed me, his tires slicing through puddles, leaving behind a trail of ripples that shimmered briefly before vanishing.

    [4] The library, which I had visited often as a child, stood quietly at the end of the block. Its stone façade was streaked with water, and the steps glistened in the morning light. I paused, remembering the hours I'd spent inside, tracing my fingers along the spines of books whose titles I couldn't yet pronounce.

    Inside, the silence was deeper. [5] Books lined the shelves in neat rows, their covers faded and pages worn from years of use. A librarian nodded at me from behind the desk, her expression familiar and unreadable. [6] I sat at a table near the window, opening a novel, and began to read.

    The story unfolded slowly, its language deliberate and rich. [7] Each sentence was crafted with care, the author's voice both lyrical and precise. I lost track of time, the outside world dissolving into the margins of the page. [8] Eventually, I closed the book, stepped outside, and the city had awakened.

    [9] Cars honked, people rushed past, and the sidewalks filled with chatter. Yet something lingered—a quiet awareness, a residue of stillness that clung to me like dew. [10] It was in these moments, fleeting and often unnoticed, where I felt most alive.`,
        questions: [
          {
            id: 'q17',
            questionNumber: 1,
            text: '[1] Despite of the city\'s constant motion Which choice corrects the error in the underlined portion?',
            easyText: '[1] Despite of the city\'s constant motion Which choice correctly uses the preposition "despite" without adding "of"?',
            hardText: '[1] Despite of the city\'s constant motion Which choice is correct?',
            options: {
              A: 'No Change',
              B: 'Despite the city\'s constant motion',
              C: 'Although of the city\'s constant motion',
              D: 'Even though the city\'s constant motion'
            },
            correctAnswer: 'B',
            explanation: '"Despite of" is incorrect; "Despite" is the correct preposition.',
            difficulty: 'Easy',
            questionType: 'detail'
          },
          {
            id: 'q18',
            questionNumber: 2,
            text: '[2] The streets, usually bustling, was nearly empty Which choice maintains subject-verb agreement?',
            easyText: '[2] The streets, usually bustling, was nearly empty Which choice correctly matches the plural subject "streets" with the appropriate verb?',
            hardText: '[2] The streets, usually bustling, was nearly empty Which choice is correct?',
            options: {
              A: 'No Change',
              B: 'were nearly empty',
              C: 'had nearly emptied',
              D: 'was almost empty'
            },
            correctAnswer: 'B',
            explanation: '"Streets" is plural, so the verb must be "were."',
            difficulty: 'Easy',
            questionType: 'structure'
          },
          {
            id: 'q19',
            questionNumber: 3,
            text: '[3] Turning the corner, the sun had begun to rise Which choice avoids a misplaced modifier?',
            easyText: '[3] Turning the corner, the sun had begun to rise Which choice correctly places the modifier so it clearly refers to "I" rather than "the sun"?',
            hardText: '[3] Turning the corner, the sun had begun to rise Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'As I turned the corner, the sun had begun to rise',
              C: 'Turning the corner, the rising sun appeared',
              D: 'The sun had begun to rise as I turned the corner'
            },
            correctAnswer: 'B',
            explanation: 'The modifier "Turning the corner" must refer to the narrator, not the sun.',
            difficulty: 'Medium',
            questionType: 'structure'
          },
          {
            id: 'q20',
            questionNumber: 4,
            text: '[4] The library, which I had visited often as a child, stood quietly at the end of the block. Which choice best maintains sentence clarity and flow?',
            easyText: '[4] The library, which I had visited often as a child, stood quietly at the end of the block. Which choice correctly positions the relative clause to avoid ambiguity?',
            hardText: '[4] The library, which I had visited often as a child, stood quietly at the end of the block. Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'The library stood quietly at the end of the block, which I had visited often as a child.',
              C: 'The library stood quietly, which I had visited often as a child, at the end of the block.',
              D: 'The library, visited often as a child by me, stood quietly at the end of the block.'
            },
            correctAnswer: 'A',
            explanation: 'Option A is the clearest and most natural phrasing.',
            difficulty: 'Hard',
            questionType: 'structure'
          },
          {
            id: 'q21',
            questionNumber: 5,
            text: '[5] Books lined the shelves in neat rows, their covers faded and pages worn from years of use. Which choice best maintains parallel structure?',
            easyText: '[5] Books lined the shelves in neat rows, their covers faded and pages worn from years of use. Which choice correctly maintains parallel structure by repeating "their" before both elements?',
            hardText: '[5] Books lined the shelves in neat rows, their covers faded and pages worn from years of use. Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'their covers fading and pages worn',
              C: 'their covers faded and their pages worn',
              D: 'their covers faded and pages wearing'
            },
            correctAnswer: 'C',
            explanation: '"Their covers faded and their pages worn" maintains parallel structure.',
            difficulty: 'Easy',
            questionType: 'structure'
          },
          {
            id: 'q22',
            questionNumber: 6,
            text: '[6] I sat at a table near the window, opening a novel, and began to read. Which choice corrects the awkward phrasing?',
            easyText: '[6] I sat at a table near the window, opening a novel, and began to read. Which choice maintains parallel verb forms with "sat" and "began"?',
            hardText: '[6] I sat at a table near the window, opening a novel, and began to read. Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'I sat at a table near the window, opened a novel, and began to read.',
              C: 'I sat at a table near the window, and opening a novel, began to read.',
              D: 'I sat at a table near the window, opening a novel and beginning to read.'
            },
            correctAnswer: 'B',
            explanation: '"Opened" and "began" are parallel past-tense verbs.',
            difficulty: 'Medium',
            questionType: 'structure'
          },
          {
            id: 'q23',
            questionNumber: 7,
            text: '[7] Each sentence was crafted with care, the author\'s voice both lyrical and precise. Which choice best combines the ideas into one clear sentence?',
            easyText: '[7] Each sentence was crafted with care, the author\'s voice both lyrical and precise. Which choice eliminates the comma splice by properly combining the two clauses?',
            hardText: '[7] Each sentence was crafted with care, the author\'s voice both lyrical and precise. Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'Each sentence was crafted with care; the author\'s voice was lyrical and precise.',
              C: 'Each sentence was crafted with care, and the author\'s voice was lyrical and precise.',
              D: 'Each sentence, crafted with care, reflected the author\'s lyrical and precise voice.'
            },
            correctAnswer: 'D',
            explanation: 'Option D combines the ideas smoothly and avoids repetition.',
            difficulty: 'Hard',
            questionType: 'structure'
          },
          {
            id: 'q24',
            questionNumber: 8,
            text: '[8] Eventually, I closed the book, stepped outside, and the city had awakened. Which choice maintains logical verb tense?',
            easyText: '[8] Eventually, I closed the book, stepped outside, and the city had awakened. Which choice correctly uses the past progressive tense to show ongoing action?',
            hardText: '[8] Eventually, I closed the book, stepped outside, and the city had awakened. Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'stepped outside, and the city awakens',
              C: 'stepped outside, and the city was awakening',
              D: 'stepped outside, and the city had been awakened'
            },
            correctAnswer: 'C',
            explanation: '"Was awakening" matches the ongoing action and avoids tense confusion.',
            difficulty: 'Medium',
            questionType: 'structure'
          },
          {
            id: 'q25',
            questionNumber: 9,
            text: '[9] Cars honked, people rushed past, and the sidewalks filled with chatter. Which choice best maintains parallel structure?',
            easyText: '[9] Cars honked, people rushed past, and the sidewalks filled with chatter. Which choice maintains parallel structure with three active past-tense verbs?',
            hardText: '[9] Cars honked, people rushed past, and the sidewalks filled with chatter. Which choice is most effective?',
            options: {
              A: 'No Change',
              B: 'Cars honked, people rushing past, and chatter filled the sidewalks.',
              C: 'Cars honking, people rushing past, and sidewalks filled with chatter.',
              D: 'Cars honked, people rushed past, and chatter filled the sidewalks.'
            },
            correctAnswer: 'D',
            explanation: 'All verbs are active and parallel: "honked," "rushed," "filled."',
            difficulty: 'Easy',
            questionType: 'structure'
          },
          {
            id: 'q26',
            questionNumber: 10,
            text: '[10] It was in these moments, fleeting and often unnoticed, where I felt most alive. Which choice corrects the idiomatic error?',
            easyText: '[10] It was in these moments, fleeting and often unnoticed, where I felt most alive. Which choice correctly uses "in which" instead of "where" after "moments"?',
            hardText: '[10] It was in these moments, fleeting and often unnoticed, where I felt most alive. Which choice is correct?',
            options: {
              A: 'No Change',
              B: 'in which I felt most alive',
              C: 'that I felt most alive',
              D: 'when I felt most alive'
            },
            correctAnswer: 'B',
            explanation: '"In which" is the correct idiomatic construction after "moments."',
            difficulty: 'Medium',
            questionType: 'vocabulary'
          },
          {
            id: 'q27',
            questionNumber: 11,
            text: 'Which sentence would best conclude the paragraph and reinforce the narrator\'s emotional shift?',
            easyText: 'Which sentence best concludes the paragraph by connecting the reading experience to the narrator\'s lasting emotional impact?',
            hardText: 'Which sentence is the most effective conclusion?',
            options: {
              A: 'I checked my watch and realized I was late.',
              B: 'The quiet had vanished, replaced by the city\'s familiar rhythm.',
              C: 'I hurried to catch the bus, dodging puddles along the way.',
              D: 'The book\'s final sentence echoed in my mind as I walked.'
            },
            correctAnswer: 'D',
            explanation: 'Option D ties the reading experience to the narrator\'s emotional state.',
            difficulty: 'Hard',
            questionType: 'author-purpose'
          },
          {
            id: 'q28',
            questionNumber: 12,
            text: 'Which revision improves clarity and avoids wordiness? Original: "I paused, remembering the hours I\'d spent inside, tracing my fingers along the spines of books whose titles I couldn\'t yet pronounce."',
            easyText: 'Which revision eliminates unnecessary words while preserving the original meaning about tracing book spines with unfamiliar titles?',
            hardText: 'Which revision is most effective?',
            options: {
              A: 'I paused, remembering hours spent tracing book spines I couldn\'t pronounce.',
              B: 'I paused, remembering hours spent inside, touching books with unreadable titles.',
              C: 'I paused, remembering how I used to trace the spines of books with unfamiliar titles.',
              D: 'I paused, remembering the hours I\'d spent inside, tracing the spines of books with titles I couldn\'t pronounce.'
            },
            correctAnswer: 'D',
            explanation: 'Option D preserves the original meaning while improving clarity.',
            difficulty: 'Medium',
            questionType: 'detail'
          },
          {
            id: 'q29',
            questionNumber: 13,
            text: 'Which choice best maintains tone and style? Original: "Her expression familiar and unreadable."',
            easyText: 'Which choice best maintains the literary tone by using sophisticated vocabulary that mirrors "familiar"?',
            hardText: 'Which choice is most effective?',
            options: {
              A: 'Her face looked blank.',
              B: 'Her expression was hard to read.',
              C: 'Her expression, both known and unknowable.',
              D: 'Her expression familiar yet inscrutable.'
            },
            correctAnswer: 'D',
            explanation: '"Inscrutable" matches the elevated tone and mirrors "familiar."',
            difficulty: 'Hard',
            questionType: 'tone'
          }
        ]
      }
    ];
