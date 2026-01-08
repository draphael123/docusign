"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type Language = "en" | "es" | "fr" | "de" | "pt" | "zh" | "ja";

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
];

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    "app.title": "Document Generator",
    "nav.templates": "Templates",
    "nav.history": "History",
    "nav.settings": "Settings",
    "form.documentType": "Document Type",
    "form.recipient": "Recipient",
    "form.body": "Document Body",
    "form.signatory": "Signatory",
    "action.generate": "Generate PDF",
    "action.preview": "Preview",
    "action.save": "Save Draft",
    "status.saved": "Saved",
    "status.generating": "Generating...",
  },
  es: {
    "app.title": "Generador de Documentos",
    "nav.templates": "Plantillas",
    "nav.history": "Historial",
    "nav.settings": "Configuración",
    "form.documentType": "Tipo de Documento",
    "form.recipient": "Destinatario",
    "form.body": "Cuerpo del Documento",
    "form.signatory": "Firmante",
    "action.generate": "Generar PDF",
    "action.preview": "Vista Previa",
    "action.save": "Guardar Borrador",
    "status.saved": "Guardado",
    "status.generating": "Generando...",
  },
  fr: {
    "app.title": "Générateur de Documents",
    "nav.templates": "Modèles",
    "nav.history": "Historique",
    "nav.settings": "Paramètres",
    "form.documentType": "Type de Document",
    "form.recipient": "Destinataire",
    "form.body": "Corps du Document",
    "form.signatory": "Signataire",
    "action.generate": "Générer PDF",
    "action.preview": "Aperçu",
    "action.save": "Enregistrer le brouillon",
    "status.saved": "Enregistré",
    "status.generating": "Génération...",
  },
  de: {
    "app.title": "Dokumentengenerator",
    "nav.templates": "Vorlagen",
    "nav.history": "Verlauf",
    "nav.settings": "Einstellungen",
    "form.documentType": "Dokumenttyp",
    "form.recipient": "Empfänger",
    "form.body": "Dokumentinhalt",
    "form.signatory": "Unterzeichner",
    "action.generate": "PDF Erstellen",
    "action.preview": "Vorschau",
    "action.save": "Entwurf Speichern",
    "status.saved": "Gespeichert",
    "status.generating": "Wird generiert...",
  },
  pt: {
    "app.title": "Gerador de Documentos",
    "nav.templates": "Modelos",
    "nav.history": "Histórico",
    "nav.settings": "Configurações",
    "form.documentType": "Tipo de Documento",
    "form.recipient": "Destinatário",
    "form.body": "Corpo do Documento",
    "form.signatory": "Signatário",
    "action.generate": "Gerar PDF",
    "action.preview": "Visualizar",
    "action.save": "Salvar Rascunho",
    "status.saved": "Salvo",
    "status.generating": "Gerando...",
  },
  zh: {
    "app.title": "文档生成器",
    "nav.templates": "模板",
    "nav.history": "历史",
    "nav.settings": "设置",
    "form.documentType": "文档类型",
    "form.recipient": "收件人",
    "form.body": "文档正文",
    "form.signatory": "签署人",
    "action.generate": "生成PDF",
    "action.preview": "预览",
    "action.save": "保存草稿",
    "status.saved": "已保存",
    "status.generating": "生成中...",
  },
  ja: {
    "app.title": "文書ジェネレーター",
    "nav.templates": "テンプレート",
    "nav.history": "履歴",
    "nav.settings": "設定",
    "form.documentType": "文書タイプ",
    "form.recipient": "受信者",
    "form.body": "文書本文",
    "form.signatory": "署名者",
    "action.generate": "PDF生成",
    "action.preview": "プレビュー",
    "action.save": "下書き保存",
    "status.saved": "保存済み",
    "status.generating": "生成中...",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("language") as Language | null;
    if (saved && LANGUAGES.some(l => l.code === saved)) {
      setLanguageState(saved);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split("-")[0] as Language;
      if (LANGUAGES.some(l => l.code === browserLang)) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  if (!mounted) return <>{children}</>;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: (key: string) => key,
    };
  }
  return context;
}

interface LanguageSelectorProps {
  compact?: boolean;
}

export default function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white hover:border-[#a78bfa] transition-colors"
        >
          {currentLang.flag}
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#12121a] border border-[#2a2a3a] rounded-lg shadow-xl z-50 overflow-hidden">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-[#1a1a24] transition-colors ${
                    language === lang.code ? "bg-[#a78bfa]/10 text-[#a78bfa]" : "text-white"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm text-[#a0a0a0]">Language</label>
      <div className="grid grid-cols-2 gap-2">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`p-3 rounded-lg text-left flex items-center gap-3 transition-colors ${
              language === lang.code
                ? "bg-[#a78bfa]/20 border border-[#a78bfa] text-white"
                : "bg-[#1a1a24] border border-[#2a2a3a] text-[#a0a0a0] hover:border-[#3a3a4a]"
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <div>
              <div className="font-medium">{lang.nativeName}</div>
              <div className="text-xs opacity-60">{lang.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { LANGUAGES };

