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

  const getInitialData = async () => {
    try {
      const res = await userPrivateApi.post(`/exams/${id}/start`);
      setData(res.data.next_question);
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
          <span className="active">1</span> <span>2</span> <span>3</span>{" "}
          <span>4</span> <span>5</span>
          <span>6</span> <span>7</span> <span>8</span> <span>9</span>{" "}
          <span>10</span>
          <span>11</span> <span>12</span> <span>13</span> <span>14</span>{" "}
          <span>15</span>
          <span>16</span> <span>17</span> <span>18</span> <span>19</span>{" "}
          <span>20</span>
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
          <div className="progress-bar"></div>
          <div className="exam-action-item">
            <span>42%</span>
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
