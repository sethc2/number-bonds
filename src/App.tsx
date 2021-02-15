import React, { useCallback, useMemo, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

export interface NumberGroup {
  first: number;
  second: number;
  total: number;
}

export interface Problem {
  group: NumberGroup;
  blank: keyof NumberGroup;
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

function createNewProblem(max: number): Problem {
  const total = getRandomInt(max - 1) + 2;
  const first = getRandomInt(total - 1) + 1;
  const second = total - first;
  const randomGuess = getRandomInt(3);
  const blank: keyof NumberGroup =
    randomGuess === 0 ? "total" : randomGuess === 1 ? "first" : "second";
  return {
    group: { total, first, second },
    blank,
  };
}

function getAnswer(problem: Problem) {
  return problem.group[problem.blank];
}

function getGuesses(problem: Problem) {
  const answer = getAnswer(problem);
  const answers = new Set<number>();
  answers.add(answer);
  let giveUp = 100;
  while (answers.size < 4 || giveUp <= 0) {
    const nextAnswer = answer + (getRandomInt(8) - 4);
    if (nextAnswer > 0) {
      answers.add(nextAnswer);
    }
    giveUp--;
  }
  return Array.from(answers).sort((a, b) => a - b);
}

function App() {
  const [problemsCorrect, setProblemsCorrect] = useState<Problem[]>([]);
  const [problemsWrong, setProblemsWrong] = useState<Problem[]>([]);

  const [max, setMax] = useState(15);

  const [running, setRunning] = useState(false);

  const [currentProblem, setCurrentProblem] = useState<Problem | null>();
  const currentProblemAnswer = useMemo(
    () => (currentProblem ? getAnswer(currentProblem) : null),
    [currentProblem]
  );
  const [lastAnswer, setLastAnswer] = useState<number | null>(null);

  const guesses = useMemo<number[] | null>(() => {
    if (!currentProblem) {
      return null;
    }
    return getGuesses(currentProblem);
  }, [currentProblem]);

  const begin = useCallback(() => {
    setProblemsCorrect([]);
    setProblemsWrong([]);
    setCurrentProblem(createNewProblem(max));
    setRunning(true);
  }, [max]);

  const getNextProblemSoon = useCallback(() => {
    if (running) {
      window.setTimeout(() => {
        setLastAnswer(null);
        setCurrentProblem(createNewProblem(max));
      }, 2000);
    }
  }, [running]);

  const answerProblem = useCallback(
    (answer: number) => {
      if (!currentProblem) {
        throw new Error("Current problem must not be null");
      }
      // if (lastAnswer === getAnswer(currentProblem)) {
      //   throw new Error("already answered");
      // }
      if (answer === currentProblemAnswer) {
        if (!lastAnswer) {
          setProblemsCorrect([...problemsCorrect, currentProblem]);
        }
        getNextProblemSoon();
      } else {
        if (!lastAnswer) {
          setProblemsWrong([...problemsWrong, currentProblem]);
        }
      }
      setLastAnswer(answer);
    },
    [problemsCorrect, problemsWrong, currentProblem, currentProblemAnswer]
  );

  const answerColor =
    lastAnswer === null
      ? "black"
      : lastAnswer === currentProblemAnswer
      ? "green"
      : "red";

  const problems: number[] = useMemo(() => {
    let total: number[] = [];
    for (let index = 8; index < 30; index++) {
      total.push(index);
    }
    return total;
  }, []);

  return (
    <div className="App">
      {false && <button onClick={() => setMax(15)}></button>}
      {!currentProblem && (
        <>
          <div style={{ flex: 1, margin: 30 }}>
            <div>Pick max number</div>
            {problems.map((x) => (
              <>
                <button
                  style={{
                    border: x === max ? "2px solid black" : "1px solid gray",
                  }}
                  onClick={() => setMax(x)}
                >
                  {x}
                </button>
              </>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <button onClick={begin}>Begin</button>
          </div>
        </>
      )}
      {currentProblem && (
        <div
          style={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: currentProblem.blank === "total" ? answerColor : "black",
              fontWeight:
                currentProblem.blank === "total" ? "bolder" : "normal",
              fontSize: 36,
              border: "1px solid black",
              margin: 10,
              padding: 10,
            }}
          >
            <span>
              {currentProblem.blank === "total"
                ? lastAnswer !== null
                  ? lastAnswer
                  : "?"
                : currentProblem.group.total}
            </span>
          </div>
          <div
            style={{
              margin: 10,
              padding: 10,
            }}
          >
            <span
              style={{
                color: currentProblem.blank === "first" ? answerColor : "black",
                fontWeight:
                  currentProblem.blank === "first" ? "bolder" : "normal",
                fontSize: 36,
                border: "1px solid black",
                minWidth: "15%",
                margin: 10,
                padding: 10,
              }}
            >
              {currentProblem.blank === "first"
                ? lastAnswer !== null
                  ? lastAnswer
                  : "?"
                : currentProblem.group.first}
            </span>
            <span
              style={{
                color:
                  currentProblem.blank === "second" ? answerColor : "black",
                fontWeight:
                  currentProblem.blank === "second" ? "bolder" : "normal",
                fontSize: 36,
                border: "1px solid black",
                minWidth: "15%",
                margin: 10,
                padding: 10,
              }}
            >
              {currentProblem.blank === "second"
                ? lastAnswer !== null
                  ? lastAnswer
                  : "?"
                : currentProblem.group.second}
            </span>
          </div>
        </div>
      )}
      {guesses && currentProblem && (
        <div
          style={{ flex: 2, display: "grid", gridTemplateColumns: "1fr 1fr" }}
        >
          {guesses.map((guess) => (
            <button
              style={{
                fontSize: 24,
                // background:
                //   lastAnswer === guess && lastAnswer === currentProblemAnswer
                //     ? "green"
                //     : lastAnswer === guess
                //     ? "red"
                //     : "grey",
              }}
              onClick={() => answerProblem(guess)}
            >
              {guess}
            </button>
          ))}
        </div>
      )}
      {running && (
        <div style={{ flex: 1 }}>
          <div>Number correct: {problemsCorrect.length}</div>
          <div>Number wrong: {problemsWrong.length}</div>
        </div>
      )}
    </div>
  );
}

export default App;
