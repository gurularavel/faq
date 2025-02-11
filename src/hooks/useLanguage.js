import { useEffect, useRef } from "react";
import { userApi } from "@utils/axios/userApi";
import { useDispatch, useSelector } from "react-redux";
import { setLangs, setStaticWords } from "@src/store/lang";
import { controlApi } from "@utils/axios/controlApi";

const useLanguage = (type) => {
  const api = type == "app" ? userApi : controlApi;
  const dispatch = useDispatch();
  const { lang_version, lang_type } = useSelector((state) => state.lang);
  const mountedRef = useRef(false);

  const getStaticWords = async (lang) => {
    try {
      const res = await api.get(`/local-translations/${lang}`);
      dispatch(setStaticWords(res.data.data));
      localStorage.setItem("lang_type", type);
    } catch (error) {
      console.error("Error fetching static words:", error);
    }
  };

  const getLangs = async () => {
    try {
      const res = await api.get("/local-translations/languages/list");
      dispatch(setLangs(res.data.data));

      const storedLang = JSON.parse(localStorage.getItem("lang"))?.key;
      const defaultLang = res.data.versions.default_lang;

      if (
        res.data.versions.lang_version != lang_version ||
        res.data.versions.default_lang != storedLang ||
        type != lang_type
      ) {
        getStaticWords(storedLang ?? defaultLang);
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    getLangs();

    return () => {
      mountedRef.current = false;
    };
  }, []);
};

export default useLanguage;
