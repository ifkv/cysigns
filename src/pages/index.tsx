import { Button } from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';

import questions from '../data.json';

interface Question {
  id: string;
  text: string;
  image_link: string;
  image_alt: string;
  image_title: string;
  answers: Answer[];
}

interface Answer {
  text: string;
  right: boolean;
}

const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

const Index = () => {
  const [selectedQuestionQuantity, setSelectedQuestionQuantity] =
    useState<number>(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<Answer[]>([]);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);

  useEffect(() => {
    // Create a deep copy of the questions and shuffle them
    const copiedQuestions = deepCopy(questions);
    setShuffledQuestions(_.shuffle(copiedQuestions));
  }, []);

  useEffect(() => {
    // Reset the state when the component mounts
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setShowScore(false);
    setShowPause(false);
    setScore(0);
    setStartTime(null);
    setIsAnswerSelected(false);
  }, []);

  useEffect(() => {
    // Shuffle the answers when a new question is displayed
    if (currentQuestionIndex < selectedQuestionQuantity) {
      const copiedAnswers = deepCopy(
        shuffledQuestions[currentQuestionIndex].answers
      );
      setShuffledAnswers(_.shuffle(copiedAnswers));
      setIsAnswerSelected(false); // Reset the isAnswerSelected state for the new question
    }
  }, [currentQuestionIndex, selectedQuestionQuantity, shuffledQuestions]);

  const startQuiz = (quantity: number) => {
    setSelectedQuestionQuantity(quantity);
    setQuizStarted(true);
    setStartTime(new Date());
  };

  const handleNext = () => {
    setShowPause(false);
    if (currentQuestionIndex + 1 < selectedQuestionQuantity) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowScore(true);
    }
  };

  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    // Reset the selected answer index when moving to the next question
    setSelectedAnswerIndex(null);
  }, [currentQuestionIndex]);

  const handleAnswerOptionClick = (isCorrect: boolean, index: number) => {
    if (!isAnswerSelected) {
      setShowPause(true);
      setIsAnswerSelected(true); // Disable answer buttons after an answer is selected

      if (isCorrect) {
        setScore(score + 1);
      } else {
        setSelectedAnswerIndex(index); // Keep track of the selected answer index for highlighting
      }
    }
  };

  const calculateElapsedTime = () => {
    if (startTime) {
      const currentTime = new Date();
      const elapsedTimeInSeconds = Math.floor(
        (currentTime.getTime() - startTime.getTime()) / 1000
      );
      return elapsedTimeInSeconds;
    }
    return 0;
  };

  const quizSuccess = (score / selectedQuestionQuantity) * 100 >= 70;

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setShowScore(false);
    setShowPause(false);
    setScore(0);
    setStartTime(null);
    setIsAnswerSelected(false);
    setSelectedQuestionQuantity(0); // Reset the selected question quantity
    setShuffledQuestions(_.shuffle(deepCopy(questions))); // Reshuffle the questions
  };

  return (
    <Main
      meta={
        <Meta
          title="Next.js Boilerplate Presentation"
          description="Next js Boilerplate is the perfect starter code for your project. Build your React application with the Next.js framework."
        />
      }
    >
      {!quizStarted && !showScore && (
        <>
          <Button
            className="m-3 w-full rounded bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-700"
            onClick={() => startQuiz(15)}
          >
            15 Questions
          </Button>
          <Button
            className="m-3 w-full rounded bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-700"
            onClick={() => startQuiz(50)}
          >
            50 Questions
          </Button>
          <Button
            className="m-3 w-full rounded bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-700"
            onClick={() => startQuiz(questions.length)}
          >
            All Questions
          </Button>
        </>
      )}

      {showScore ? (
        <div>
          <div>
            You scored {score} out of {selectedQuestionQuantity}
          </div>
          <div>
            {quizSuccess
              ? 'Congratulations! You passed the test.'
              : 'Sorry, you did not pass the test.'}
          </div>
          <div>Elapsed time: {calculateElapsedTime()} seconds</div>
          <Button
            className="m-3 w-full rounded bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-700"
            onClick={resetQuiz}
          >
            Retry Test
          </Button>
        </div>
      ) : null}

      {quizStarted && !showScore && selectedQuestionQuantity !== 0 && (
        <>
          {currentQuestionIndex < selectedQuestionQuantity && (
            <>
              <div>
                <div className="m-3 font-bold">
                  <span>Question {currentQuestionIndex + 1}/</span>
                  {selectedQuestionQuantity}
                </div>
                <div className="mx-3">
                  <p>{shuffledQuestions[currentQuestionIndex].text}</p>
                  {shuffledQuestions[currentQuestionIndex].image_link && (
                    <img
                      src={shuffledQuestions[currentQuestionIndex].image_link}
                      alt={shuffledQuestions[currentQuestionIndex].image_alt}
                      title={
                        shuffledQuestions[currentQuestionIndex].image_title
                      }
                      className="mt-4 max-w-full"
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                {shuffledAnswers.map((answerOption, index) => (
                  <Button
                    key={index}
                    height="80px"
                    colorScheme={
                      showPause
                        ? answerOption.right
                          ? 'green'
                          : index === selectedAnswerIndex
                          ? 'red'
                          : 'blue'
                        : 'blue'
                    }
                    className="m-3"
                    disabled={showPause || isAnswerSelected}
                    style={{
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                    }}
                    onClick={() =>
                      handleAnswerOptionClick(answerOption.right, index)
                    }
                  >
                    {answerOption.text}
                  </Button>
                ))}
              </div>
              <Button
                className="m-3 w-full rounded bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-700"
                onClick={handleNext}
                disabled={showPause || isAnswerSelected}
              >
                Next Question
              </Button>
              <div>
                You scored {score} out of {selectedQuestionQuantity}
              </div>
            </>
          )}
        </>
      )}
    </Main>
  );
};

export default Index;
