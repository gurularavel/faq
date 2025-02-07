import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid2,
} from "@mui/material";
import SearchIcon from "@assets/icons/search.svg";
import FAQItem from "@components/faq-item/FAQItem";
import { useTranslate } from "@src/utils/translations/useTranslate";

const faqItems = [
  {
    id: 1,
    question: "Poliqrafiya nədir və niyə əhəmiyyətlidir?",
    answer:
      "Poliqrafiya çap məhsullarının istehsalı ilə məşğul olan bir sahədir və reklam, nəşriyyat və sənaye sektorlarında geniş istifadə olunur.",
  },
  {
    id: 2,
    question: "Veb sayt yaratmaq üçün hansı əsas texnologiyalar lazımdır?",
    answer:
      "Veb sayt yaratmaq üçün HTML, CSS və JavaScript əsas texnologiyalardır. Daha inkişaf etmiş layihələr üçün React, Angular və ya Vue.js kimi çərçivələr də istifadə edilə bilər.",
  },
  {
    id: 3,
    question: "SEO nədir və niyə vacibdir?",
    answer:
      "SEO (Axtarış Motoru Optimallaşdırması) veb saytların Google və digər axtarış sistemlərində daha yaxşı sıralanmasını təmin edən texnikalar toplusudur.",
  },
  {
    id: 4,
    question:
      "Mobil tətbiq inkişaf etdirmək üçün hansı proqramlaşdırma dilləri istifadə olunur?",
    answer:
      "Android üçün Java və Kotlin, iOS üçün Swift və Objective-C, hər iki platforma üçün isə React Native və Flutter istifadə olunur.",
  },
  {
    id: 5,
    question: "React Native nədir?",
    answer:
      "React Native, Facebook tərəfindən hazırlanmış, mobil tətbiqlər yaratmaq üçün istifadə olunan JavaScript çərçivəsidir.",
  },
  {
    id: 6,
    question: "Figma nə üçündür?",
    answer:
      "Figma, istifadəçilərə dizayn yaratmaq və komanda daxilində əməkdaşlıq etmək üçün imkan verən veb əsaslı dizayn alətidir.",
  },
  {
    id: 7,
    question: "Zustand nədir və nə üçün istifadə olunur?",
    answer:
      "Zustand, React tətbiqlərində vəziyyət idarə etmək üçün sadə və yüngül bir vəziyyət idarəetmə kitabxanasıdır.",
  },
  {
    id: 8,
    question: "Material-UI nədir?",
    answer:
      "Material-UI, React üçün hazırlanmış, Google-un Material Design prinsiplərinə əsaslanan UI komponent kitabxanasıdır.",
  },
  {
    id: 9,
    question: "AsyncStorage nədir və React Native-də necə işləyir?",
    answer:
      "AsyncStorage, React Native tətbiqlərində yerli məlumatların saxlanılması üçün istifadə olunan asinxron açar-dəyər saxlama sistemidir.",
  },
  {
    id: 10,
    question: "Bootstrap nə üçündür?",
    answer:
      "Bootstrap, veb inkişaf üçün hazır UI komponentləri və CSS sinifləri təqdim edən populyar açıq mənbə çərçivəsidir.",
  },
  {
    id: 11,
    question: "TypeScript nədir və JavaScript-dən fərqi nədir?",
    answer:
      "TypeScript, JavaScript-in genişləndirilmiş versiyasıdır və statik tiplər əlavə edərək daha etibarlı kod yazmağa kömək edir.",
  },
  {
    id: 12,
    question: "Redux nə üçün istifadə olunur?",
    answer:
      "Redux, React və digər kitabxanalarla istifadə olunan vəziyyət idarəetmə vasitəsidir və kompleks tətbiqlərdə məlumat axınını asanlaşdırır.",
  },
  {
    id: 13,
    question: "API nədir və necə işləyir?",
    answer:
      "API (Tətbiq Proqramlaşdırma İnterfeysi) müxtəlif sistemlər arasında məlumat mübadiləsinə imkan verən interfeysdir.",
  },
  {
    id: 14,
    question: "REST və GraphQL arasındakı fərqlər nələrdir?",
    answer:
      "REST, ənənəvi API-lər üçün standart yanaşmadır, GraphQL isə istifadəçilərə lazım olan məlumatları seçmək imkanı verir və daha çevikdir.",
  },
  {
    id: 15,
    question: "Git və GitHub nədir?",
    answer:
      "Git, versiya idarəetmə sistemidir, GitHub isə Git-lə inteqrasiya olunan və kod paylaşılan bulud platformasıdır.",
  },
  {
    id: 16,
    question: "Domen və hosting nədir?",
    answer:
      "Domen veb saytın internetdəki ünvanıdır, hosting isə bu saytın fayllarının saxlandığı serverdir.",
  },
  {
    id: 17,
    question: "WordPress nədir?",
    answer:
      "WordPress, veb saytlar yaratmaq üçün istifadə olunan açıq mənbə məzmun idarəetmə sistemidir (CMS).",
  },
  {
    id: 18,
    question: "React Hook Form nə üçündür?",
    answer:
      "React Hook Form, React-də form məlumatlarını idarə etmək üçün yüngül və performanslı kitabxanadır.",
  },
  {
    id: 19,
    question: "Figma pluginləri necə yaradılır?",
    answer:
      "Figma pluginləri TypeScript və ya JavaScript istifadə edərək yazılır və Figma API-dən istifadə edərək tətbiq edilir.",
  },
  {
    id: 20,
    question: "Niyə veb saytım yavaş işləyir?",
    answer:
      "Veb saytın yavaş işləməsinin səbəbləri arasında optimallaşdırılmamış şəkillər, çox sayda HTTP sorğusu və zəif server performansı ola bilər.",
  },
  {
    id: 21,
    question: "E-ticarət saytı qurmaq üçün hansı platformalar uyğundur?",
    answer:
      "WooCommerce, Shopify, Magento və OpenCart e-ticarət saytları üçün məşhur platformalardır.",
  },
  {
    id: 22,
    question: "Şəxsi məlumatları necə qorumaq olar?",
    answer:
      "Güclü şifrələr istifadə etmək, iki faktorlu identifikasiya aktivləşdirmək və etibarlı proqramlardan istifadə etmək məsləhətdir.",
  },
  {
    id: 23,
    question: "Veb saytın HTTPS olması niyə vacibdir?",
    answer:
      "HTTPS məlumatların şifrələnməsini təmin edir və istifadəçilərin təhlükəsizliyini artırır.",
  },
  {
    id: 24,
    question: "Mobil tətbiqlərin ölçüsü necə azaldıla bilər?",
    answer:
      "Gereksiz aktivlərdən qaçınmaq, kod optimallaşdırmaq və şəkilləri sıxışdırmaq mobil tətbiqlərin ölçüsünü azalda bilər.",
  },
  {
    id: 25,
    question: "Niyə SEO strategiyası qurmaq vacibdir?",
    answer:
      "SEO strategiyası veb saytınızın axtarış nəticələrində daha yaxşı mövqe tutmasına kömək edir və istifadəçi trafiki artırır.",
  },
  {
    id: 26,
    question: "Nə üçün JavaScript bu qədər populyardır?",
    answer:
      "JavaScript, brauzer əsaslı tətbiqlər üçün əsas proqramlaşdırma dilidir və geniş ekosistemə sahibdir.",
  },
  {
    id: 27,
    question: "Flutter nədir və React Native-dən nə ilə fərqlənir?",
    answer:
      "Flutter Google tərəfindən hazırlanmış bir çərçivədir və öz vizual mühərriki var, React Native isə JavaScript istifadə edir.",
  },
  {
    id: 28,
    question: "Mobil tətbiq hazırlamaq üçün ən yaxşı üsul hansıdır?",
    answer:
      "Native və ya cross-platform yanaşması seçilə bilər. React Native və Flutter cross-platform üçün uyğundur.",
  },
  {
    id: 29,
    question: "Dark mode nədir və necə tətbiq edilir?",
    answer:
      "Dark mode, istifadəçi interfeysini qaranlıq mövzuya keçirmək üçün istifadə olunan dizayn seçimidir və CSS-də media query-lərlə tətbiq edilə bilər.",
  },
  {
    id: 30,
    question: "Təhlükəsiz şifrə yaratmaq üçün nə etməliyəm?",
    answer:
      "Güclü şifrə yaratmaq üçün böyük və kiçik hərflər, rəqəmlər və xüsusi simvollar istifadə edilməlidir.",
  },
];
const DashBoard = () => {
  const t = useTranslate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqItems;
    }

    return faqItems.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.question.toLowerCase().includes(searchLower) ||
        item.answer.toLowerCase().includes(searchLower)
      );
    });
  }, [searchQuery, faqItems]);
  return (
    <Box className="search-container">
      <Box>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t("search_with_text_or_tag")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <img src={SearchIcon} alt="search" />
              </InputAdornment>
            ),
          }}
          className="search-input"
        />

        <Typography variant="h6" component="h2" className="faq-title">
          {searchQuery.length > 0 ? t("result") : t("mostly_searched_faq")}
        </Typography>

        <Box className="faq-list">
          <Grid2 container spacing={2}>
            {filteredFaqItems.map((item) => (
              <Grid2 key={item.id} size={{ xs: 12, md: 6 }}>
                <FAQItem
                  question={item.question}
                  answer={item.answer}
                  searchQuery={searchQuery}
                />
              </Grid2>
            ))}
          </Grid2>
        </Box>
      </Box>
    </Box>
  );
};

export default DashBoard;
