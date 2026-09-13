import React, { useState } from "react";
import { useApp } from "../../state/AppState.jsx";
import { buildPool } from "../../lib/pool.js";
import { buildExam } from "../../lib/examQuestions.js";
import ExamPicker from "./ExamPicker.jsx";
import ExamRunner from "./ExamRunner.jsx";
import ExamReview from "./ExamReview.jsx";

export const MOCK_EXAMS = [
  {
    id: "mock-1",
    name: "11+ Mock Exam — Spelling & Verbal Reasoning",
    count: 25,
    minutes: 20,
    blurb: "Full exam-hall conditions: a countdown timer, question flagging, and free navigation between questions, just like the real thing.",
  },
];

export default function MockExamFlow({ onExit }) {
  const { family, currentChildId, onRecord, patchChild } = useApp();
  const [phase, setPhase] = useState("pick"); // pick | running | review
  const [questions, setQuestions] = useState(null);
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState(null);

  function start(examConfig) {
    const pool = buildPool(family);
    const child = family.children[currentChildId];
    const qs = buildExam(pool, child.stats, { count: examConfig.count, tierMax: 3 });
    setExam(examConfig);
    setQuestions(qs);
    setResults(null);
    setPhase("running");
  }

  function handleFinish(perQuestion) {
    const total = perQuestion.length;
    const correctCount = perQuestion.filter((r) => r.correct).length;
    perQuestion.forEach((r) => onRecord(r.q.statsKey, r.q.targetWord, r.correct, "exam"));
    patchChild(currentChildId, (c) => ({
      ...c,
      examAttempts: [...(c.examAttempts || []), { date: new Date().toISOString().slice(0, 10), examId: exam.id, score: correctCount, total }].slice(-20),
    }));
    setResults({ perQuestion, correct: correctCount, total });
    setPhase("review");
  }

  if (phase === "running" && questions) {
    return <ExamRunner exam={exam} questions={questions} onFinish={handleFinish} onExit={onExit} />;
  }
  if (phase === "review" && results) {
    return <ExamReview exam={exam} results={results} onDone={() => setPhase("pick")} onRetake={() => start(exam)} />;
  }
  return <ExamPicker exams={MOCK_EXAMS} onStart={start} onExit={onExit} />;
}
