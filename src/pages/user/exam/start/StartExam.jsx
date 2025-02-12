import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { useNavigate, useParams } from "react-router-dom";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";

import Question from "./Question";
import CountdownTimer from "./CountdownTimer";

export default function StartExam() {
  const t = useTranslate();
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [canRefreshPage, setCanRefreshPage] = useState(false);
  const [data, setData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionsCount, setQuestionsCount] = useState(1);
  const [activeQuestion, setActiveQuestion] = useState(1);
  const [percent, setPercent] = useState(0);

  const getInitialData = async () => {
    try {
      const res = await userPrivateApi.post(`/exams/${id}/start`);
      setData(res.data.next_question);
      setQuestionsCount(res.data.questions_count);
      setPercent(res.data.percent);
    } catch (error) {
      setCanRefreshPage(true);
      nav("/user/exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInitialData();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!canRefreshPage) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [canRefreshPage]);

  const [reset, setReset] = useState(false);

  const handleTimeEnd = () => {
    handleAnswer();
  };

  const handleReset = () => {
    setReset((prev) => !prev);
  };

  const handleAnswer = async () => {
    setPending(true);
    try {
      const res = await userPrivateApi.post(`/exams/${id}/choose-answer`, {
        question: data.uuid,
        answer: selectedAnswer,
      });
      if (!res.data.is_finish) {
        setData(res.data.next_question);
        setPercent(res.data.percent);
        setActiveQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setCanRefreshPage(true);
        setTimeout(() => {
          nav(`/user/exams/${id}/finished`);
        }, 20);
      }
    } catch (error) {
    } finally {
      setPending(false);
      handleReset();
    }
  };

  if (loading) {
    return (
      <Box
        width={"100%"}
        height={"80vh"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <CircularProgress color="error" />
      </Box>
    );
  }
  return (
    <div className="exam-container">
      <div className="numbers-list">
        <div className="numbers-list-wrapper">
          {Array.from({ length: questionsCount })
            .fill(null)
            .map((_, i) => (
              <span className={activeQuestion == i + 1 ? "active" : ""}>
                {i + 1}
              </span>
            ))}
        </div>
      </div>

      <div className="exam-body">
        <div className="exam-question">
          <Question
            data={data}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
          />
          <div className="submit">
            <Button
              variant="contained"
              color="error"
              onClick={handleAnswer}
              disabled={pending}
            >
              {t("continue")}
              {pending && (
                <CircularProgress size={14} sx={{ ml: 1 }} color="error" />
              )}
            </Button>
          </div>
        </div>

        <div className="exam-action">
          <div className="progress-bar" style={{ width: `${percent}%` }}></div>
          <div className="exam-action-item">
            <span>{Math.round(percent)}%</span>
            <span>{t("progress")}</span>
          </div>
          <div className="exam-action-item">
            <CountdownTimer
              startTimeInSeconds={data?.timer_seconds ?? 180}
              onTimeEnd={handleTimeEnd}
              resetFlag={reset}
            />
            <span>{t("timer")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
