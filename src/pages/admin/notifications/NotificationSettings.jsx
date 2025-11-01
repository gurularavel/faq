import  { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Switch,
  Skeleton,
  Paper,
  Divider,
} from "@mui/material";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { useTranslate } from "@src/utils/translations/useTranslate";
import MainCard from "@components/card/MainCard";

const REQUIRED_SETTINGS = [
  {
    key: "notification_exam_enable",
    defaultValue: "true",
    label: "exam_notifications",
    description: "enable_disable_exam_notifications",
  },
  {
    key: "notification_faq_new_enable",
    defaultValue: "true",
    label: "new_faq_notifications",
    description: "enable_disable_new_faq_notifications",
  },
  {
    key: "notification_faq_update_enable",
    defaultValue: "true",
    label: "faq_update_notifications",
    description: "enable_disable_faq_update_notifications",
  },
];

export default function NotificationSettings() {
  const t = useTranslate();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState([]);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await controlPrivateApi.get("/settings/load?limit=100");
      const loadedSettings = res.data.data;

      // Check if all required settings exist
      const missingSettings = REQUIRED_SETTINGS.filter(
        (required) =>
          !loadedSettings.some((setting) => setting.key === required.key)
      );

      if (missingSettings.length > 0) {
        await seedMissingSettings(missingSettings);
        // Reload settings after seeding
        const reloadRes = await controlPrivateApi.get("/settings/load?limit=100");
        setSettings(reloadRes.data.data);
      } else {
        setSettings(loadedSettings);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Error loading settings",
          "error"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const seedMissingSettings = async (missingSettings) => {
    setIsSeeding(true);
    try {
      const promises = missingSettings.map((setting) =>
        controlPrivateApi.post("/settings/add", {
          key: setting.key,
          value: setting.defaultValue,
        })
      );

      await Promise.all(promises);
      notify("Missing settings have been initialized", "success");
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Error seeding settings",
          "error"
        );
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const toggleSetting = async (key, currentValue) => {
    const newValue = currentValue === "true" ? "false" : "true";

    try {
      const res = await controlPrivateApi.post(`/settings/update/${key}`, {
        value: newValue,
      });

      setSettings((prevSettings) =>
        prevSettings.map((setting) =>
          setting.key === key ? { ...setting, value: newValue } : setting
        )
      );

      notify(res.data.message || "Setting updated successfully", "success");
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Failed to update setting",
          "error"
        );
      }
    }
  };

  const getSettingConfig = (key) => {
    return REQUIRED_SETTINGS.find((s) => s.key === key) || {};
  };

  const LoadingSkeleton = () => (
    <Stack spacing={3}>
      {[...Array(3)].map((_, index) => (
        <Box key={index}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
          <Box
            sx={{ mt: 2 }}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Skeleton variant="rectangular" width={60} height={30} />
          </Box>
          {index < 2 && <Divider sx={{ mt: 3 }} />}
        </Box>
      ))}
    </Stack>
  );

  const notificationSettings = settings.filter((setting) =>
    REQUIRED_SETTINGS.some((req) => req.key === setting.key)
  );

  return (
    <MainCard title={t("notification_settings")}>
      <Box className="main-card-body">
        <Box className="main-card-body-inner" py={3}>
          {isLoading || isSeeding ? (
            <LoadingSkeleton />
          ) : notificationSettings.length > 0 ? (
            <Stack spacing={3}>
              {notificationSettings.map((setting, index) => {
                const config = getSettingConfig(setting.key);
                return (
                  <Box key={setting.key}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: "1px solid #E6E9ED",
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight={600} mb={0.5}>
                            {t(config.label) || setting.key}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ maxWidth: "80%" }}
                          >
                            {t(config.description) ||
                              "Toggle this notification setting"}
                          </Typography>
                        </Box>
                        <Switch
                          checked={setting.value === "true"}
                          onChange={() =>
                            toggleSetting(setting.key, setting.value)
                          }
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    </Paper>
                    {index < notificationSettings.length - 1 && (
                      <Divider sx={{ mt: 3 }} />
                    )}
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={8}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t("no_notification_settings_found")}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </MainCard>
  );
}

