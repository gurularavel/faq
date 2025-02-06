import React, { useState, useEffect } from "react";
import {
  Box,
  Grid2,
  Typography,
  TextField,
  Autocomplete,
  CircularProgress,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  Divider,
} from "@mui/material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import MainCard from "@components/card/MainCard";
import { notify } from "@src/utils/toast/notify";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate, useParams } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const editorConfiguration = {
  toolbar: {
    items: [
      "heading",
      "|",
      "bold",
      "italic",
      "|",
      "bulletedList",
      "numberedList",
      "|",
      "undo",
      "redo",
    ],
  },
  heading: {
    options: [
      { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
      {
        model: "heading1",
        view: "h1",
        title: "Heading 1",
        class: "ck-heading_heading1",
      },
      {
        model: "heading2",
        view: "h2",
        title: "Heading 2",
        class: "ck-heading_heading2",
      },
      {
        model: "heading3",
        view: "h3",
        title: "Heading 3",
        class: "ck-heading_heading3",
      },
    ],
  },
};

export default function AddQuestion() {
  const t = useTranslate();
  const { langs } = useSelector((state) => state.lang);
  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [loading, setLoading] = useState({
    difficultyLevels: false,
    submit: false,
  });

  const { quizId } = useParams();

  const schema = yup.object({
    difficulty_level_id: yup.number().required(t("required_field")),
    translations: yup.array().of(
      yup.object({
        language_id: yup.number().required(),
        title: yup.string().required(t("required_field")),
      })
    ),
    answers: yup
      .array()
      .of(
        yup.object({
          is_correct: yup.boolean(),
          translations: yup.array().of(
            yup.object({
              language_id: yup.number().required(),
              title: yup.string().required(t("required_field")),
            })
          ),
        })
      )
      .min(2, t("minimum_two_answers")),
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      difficulty_level_id: null,
      translations: langs.map((lang) => ({
        language_id: lang.id,
        title: "",
      })),
      answers: [
        {
          is_correct: true,
          translations: langs.map((lang) => ({
            language_id: lang.id,
            title: "",
          })),
        },
        {
          is_correct: false,
          translations: langs.map((lang) => ({
            language_id: lang.id,
            title: "",
          })),
        },
      ],
    },
  });

  const {
    fields: answerFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "answers",
  });

  useEffect(() => {
    if (langs.length) {
      reset({
        difficulty_level_id: null,
        translations: langs.map((lang) => ({
          language_id: lang.id,
          title: "",
        })),
        answers: [
          {
            is_correct: true,
            translations: langs.map((lang) => ({
              language_id: lang.id,
              title: "",
            })),
          },
          {
            is_correct: false,
            translations: langs.map((lang) => ({
              language_id: lang.id,
              title: "",
            })),
          },
        ],
      });
    }
  }, [langs]);

  useEffect(() => {
    fetchDifficultyLevels();
  }, []);

  const fetchDifficultyLevels = async () => {
    setLoading((prev) => ({ ...prev, difficultyLevels: true }));
    try {
      const res = await controlPrivateApi.get("/difficulty-levels/list");
      setDifficultyLevels(res.data.data);
    } catch (error) {
      notify(
        error.response?.data?.message || "Error fetching difficulty levels",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, difficultyLevels: false }));
    }
  };

  const [pending, setPending] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (data) => {
    setPending(true);
    try {
      const res = await controlPrivateApi.post(
        `/question-groups/${quizId}/questions/add`,
        data
      );
      notify(res.data.message, "success");
      nav(-1);
    } catch (error) {
      notify(error.response?.data?.message || "Error submitting form", "error");
    } finally {
      setPending(false);
    }
  };

  const addNewAnswer = () => {
    append({
      is_correct: false,
      translations: langs.map((lang) => ({
        language_id: lang.id,
        title: "",
      })),
    });
  };

  return (
    <MainCard title={t("new_quiz_question")} hasBackBtn={true}>
      <Box className="main-card-body">
        <Box className="main-card-body-inner">
          <Box
            py={3}
            px={{ xs: 3, md: 10 }}
            component="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }}>
                <Grid2 container spacing={2} alignItems="center">
                  <Grid2 size={{ xs: 12, md: 3 }}>
                    <Typography variant="body1">
                      {t("difficulty_level")}
                    </Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 9 }}>
                    <Controller
                      name="difficulty_level_id"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          value={
                            difficultyLevels.find(
                              (level) => level.id === field.value
                            ) || null
                          }
                          onChange={(_, newValue) =>
                            field.onChange(newValue?.id)
                          }
                          options={difficultyLevels}
                          getOptionLabel={(option) => option.title}
                          loading={loading.difficultyLevels}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              error={!!errors.difficulty_level_id}
                              helperText={errors.difficulty_level_id?.message}
                              placeholder={t("select_difficulty_level")}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {loading.difficultyLevels && (
                                      <CircularProgress size={20} />
                                    )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid2>
                </Grid2>
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <Divider />
              </Grid2>
              {/* Question Translations */}
              {langs.map((lang, index) => (
                <Grid2 size={{ xs: 12 }} key={`question-${index}`}>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                      <Typography variant="body1">
                        {t("question")}
                        {langs.length > 1 && ` - ${lang.key}`}
                      </Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 9 }}>
                      <Controller
                        name={`translations.${index}.title`}
                        control={control}
                        render={({ field }) => (
                          <div
                            style={{
                              border: errors.translations?.[index]?.title
                                ? "1px solid #d32f2f"
                                : "none",
                            }}
                          >
                            <CKEditor
                              editor={ClassicEditor}
                              config={editorConfiguration}
                              data={field.value}
                              onChange={(event, editor) => {
                                try {
                                  const data = editor.getData();
                                  field.onChange(data);
                                } catch (error) {
                                  console.error("CKEditor error:", error);
                                  notify("Error updating content", "error");
                                }
                              }}
                            />
                            {errors.translations?.[index]?.title && (
                              <Typography
                                color="error"
                                variant="caption"
                                sx={{ mt: 1, display: "block" }}
                              >
                                {errors.translations?.[index]?.title?.message}
                              </Typography>
                            )}
                          </div>
                        )}
                      />
                    </Grid2>
                  </Grid2>
                </Grid2>
              ))}
              <Grid2 size={{ xs: 12 }}>
                <Divider />
              </Grid2>
              {/* Answers */}
              <Grid2 size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t("answers")}
                </Typography>
                {answerFields.map((field, answerIndex) => (
                  <Box key={field.id} sx={{ mb: 4, position: "relative" }}>
                    <Controller
                      name={`answers.${answerIndex}.is_correct`}
                      control={control}
                      render={({ field: radioField }) => (
                        <RadioGroup
                          value={radioField.value}
                          onChange={(e) => {
                            const answers = watch("answers");
                            const newAnswers = answers.map((a, idx) => ({
                              ...a,
                              is_correct: idx === answerIndex,
                            }));
                            reset({ ...watch(), answers: newAnswers });
                          }}
                        >
                          <FormControlLabel
                            value={true}
                            control={<Radio />}
                            label={t("correct_answer")}
                          />
                        </RadioGroup>
                      )}
                    />

                    {langs.map((lang, langIndex) => (
                      <Grid2
                        container
                        spacing={2}
                        key={`answer-${answerIndex}-${langIndex}`}
                      >
                        <Grid2 size={{ xs: 12, md: 3 }}>
                          <Typography variant="body1">
                            {t("answer")} {answerIndex + 1}
                            {langs.length > 1 && ` - ${lang.key}`}
                          </Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 9 }}>
                          <Controller
                            name={`answers.${answerIndex}.translations.${langIndex}.title`}
                            control={control}
                            render={({ field }) => (
                              <div
                                style={{
                                  border: errors.answers?.[answerIndex]
                                    ?.translations?.[langIndex]?.title
                                    ? "1px solid #d32f2f"
                                    : "none",
                                }}
                              >
                                <CKEditor
                                  editor={ClassicEditor}
                                  config={editorConfiguration}
                                  data={field.value}
                                  onChange={(event, editor) => {
                                    try {
                                      const data = editor.getData();
                                      field.onChange(data);
                                    } catch (error) {
                                      console.error("CKEditor error:", error);
                                      notify("Error updating content", "error");
                                    }
                                  }}
                                />
                                {errors.answers?.[answerIndex]?.translations?.[
                                  langIndex
                                ]?.title && (
                                  <Typography
                                    color="error"
                                    variant="caption"
                                    sx={{ mt: 1, display: "block" }}
                                  >
                                    {
                                      errors.answers?.[answerIndex]
                                        ?.translations?.[langIndex]?.title
                                        ?.message
                                    }
                                  </Typography>
                                )}
                              </div>
                            )}
                          />
                        </Grid2>
                      </Grid2>
                    ))}

                    {answerFields.length > 2 && (
                      <IconButton
                        onClick={() => remove(answerIndex)}
                        sx={{ position: "absolute", right: 0, top: 0 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}

                <Button
                  startIcon={<AddIcon />}
                  onClick={addNewAnswer}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  {t("add_answer")}
                </Button>
              </Grid2>

              {/* Submit Button */}
              <Grid2 size={{ xs: 12 }}>
                <Grid2 container spacing={2} alignItems="center">
                  <Grid2 size={{ xs: 12, md: 3 }} />
                  <Grid2
                    size={{ xs: 12, md: 9 }}
                    display="flex"
                    justifyContent="center"
                  >
                    <Button
                      type="submit"
                      color="error"
                      variant="contained"
                      sx={{ minWidth: "250px" }}
                      disabled={pending}
                    >
                      {t("save")}
                      {pending && (
                        <CircularProgress
                          size={14}
                          sx={{ ml: 1 }}
                          color="error"
                        />
                      )}
                    </Button>
                  </Grid2>
                </Grid2>
              </Grid2>
            </Grid2>
          </Box>
        </Box>
      </Box>
    </MainCard>
  );
}
