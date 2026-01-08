"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SpellError {
  word: string;
  index: number;
  suggestions: string[];
}

interface SpellCheckResult {
  errors: SpellError[];
  errorCount: number;
}

// Common misspellings dictionary
const COMMON_MISSPELLINGS: Record<string, string[]> = {
  "teh": ["the"],
  "recieve": ["receive"],
  "occured": ["occurred"],
  "seperate": ["separate"],
  "definately": ["definitely"],
  "accomodate": ["accommodate"],
  "occurence": ["occurrence"],
  "succesful": ["successful"],
  "neccessary": ["necessary"],
  "untill": ["until"],
  "wierd": ["weird"],
  "beleive": ["believe"],
  "freind": ["friend"],
  "begining": ["beginning"],
  "goverment": ["government"],
  "enviroment": ["environment"],
  "independant": ["independent"],
  "privelege": ["privilege"],
  "refered": ["referred"],
  "apparant": ["apparent"],
  "arguement": ["argument"],
  "calender": ["calendar"],
  "commitee": ["committee"],
  "concious": ["conscious"],
  "existance": ["existence"],
  "grammer": ["grammar"],
  "harrass": ["harass"],
  "immediatly": ["immediately"],
  "judgement": ["judgment", "judgement"],
  "liason": ["liaison"],
  "maintainance": ["maintenance"],
  "millenium": ["millennium"],
  "mispell": ["misspell"],
  "noticable": ["noticeable"],
  "paralell": ["parallel"],
  "persue": ["pursue"],
  "posession": ["possession"],
  "recomend": ["recommend"],
  "rythm": ["rhythm"],
  "sieze": ["seize"],
  "tendancy": ["tendency"],
  "thier": ["their"],
  "tommorow": ["tomorrow"],
  "truely": ["truly"],
  "vaccuum": ["vacuum"],
  "wether": ["whether", "weather"],
  "writting": ["writing"],
  "youre": ["you're", "your"],
  "alot": ["a lot"],
  "thankyou": ["thank you"],
  "aswell": ["as well"],
  "incase": ["in case"],
  "infact": ["in fact"],
};

// Business/formal writing suggestions
const INFORMAL_WORDS: Record<string, string[]> = {
  "gonna": ["going to"],
  "wanna": ["want to"],
  "gotta": ["got to", "have to"],
  "kinda": ["kind of", "somewhat"],
  "sorta": ["sort of"],
  "dunno": ["don't know"],
  "yeah": ["yes"],
  "nope": ["no"],
  "ok": ["okay", "acceptable"],
  "stuff": ["items", "materials", "content"],
  "things": ["items", "matters", "aspects"],
  "guy": ["person", "individual"],
  "guys": ["people", "everyone", "team"],
  "kids": ["children"],
  "cool": ["excellent", "acceptable", "impressive"],
  "awesome": ["excellent", "outstanding", "impressive"],
  "pretty": ["quite", "fairly", "rather"],
  "really": ["very", "truly", "certainly"],
  "basically": ["essentially", "fundamentally"],
  "actually": ["in fact", "indeed"],
  "literally": ["exactly", "precisely"],
  "obviously": ["clearly", "evidently"],
  "huge": ["significant", "substantial", "considerable"],
  "big": ["large", "significant", "major"],
  "good": ["excellent", "satisfactory", "beneficial"],
  "bad": ["poor", "unsatisfactory", "negative"],
  "nice": ["pleasant", "satisfactory", "appropriate"],
  "get": ["obtain", "receive", "acquire"],
  "got": ["received", "obtained", "acquired"],
  "a lot": ["many", "numerous", "significantly"],
};

export function useSpellCheck(text: string, enabled: boolean = true) {
  const [result, setResult] = useState<SpellCheckResult>({ errors: [], errorCount: 0 });
  const [isChecking, setIsChecking] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const checkSpelling = useCallback((inputText: string) => {
    if (!enabled || !inputText.trim()) {
      setResult({ errors: [], errorCount: 0 });
      return;
    }

    setIsChecking(true);

    // Extract words from text
    const words = inputText.match(/\b[a-zA-Z']+\b/g) || [];
    const errors: SpellError[] = [];
    const seenWords = new Set<string>();

    words.forEach((word) => {
      const lowerWord = word.toLowerCase();
      
      // Skip if already checked this word
      if (seenWords.has(lowerWord)) return;
      seenWords.add(lowerWord);

      // Check common misspellings
      if (COMMON_MISSPELLINGS[lowerWord]) {
        const index = inputText.toLowerCase().indexOf(lowerWord);
        if (index !== -1) {
          errors.push({
            word,
            index,
            suggestions: COMMON_MISSPELLINGS[lowerWord],
          });
        }
      }
    });

    setResult({ errors, errorCount: errors.length });
    setIsChecking(false);
  }, [enabled]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      checkSpelling(text);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [text, checkSpelling]);

  return { result, isChecking };
}

export function useToneCheck(text: string, enabled: boolean = true) {
  const [informalWords, setInformalWords] = useState<{ word: string; suggestions: string[] }[]>([]);

  useEffect(() => {
    if (!enabled || !text.trim()) {
      setInformalWords([]);
      return;
    }

    const words = text.match(/\b[a-zA-Z']+\b/g) || [];
    const found: { word: string; suggestions: string[] }[] = [];
    const seenWords = new Set<string>();

    words.forEach((word) => {
      const lowerWord = word.toLowerCase();
      if (seenWords.has(lowerWord)) return;
      seenWords.add(lowerWord);

      if (INFORMAL_WORDS[lowerWord]) {
        found.push({
          word,
          suggestions: INFORMAL_WORDS[lowerWord],
        });
      }
    });

    setInformalWords(found);
  }, [text, enabled]);

  return { informalWords };
}

interface SpellCheckPanelProps {
  text: string;
  enabled: boolean;
  onReplaceWord: (oldWord: string, newWord: string) => void;
  compact?: boolean;
}

export default function SpellCheckPanel({ text, enabled, onReplaceWord, compact = false }: SpellCheckPanelProps) {
  const { result, isChecking } = useSpellCheck(text, enabled);
  const { informalWords } = useToneCheck(text, enabled);
  const [showToneCheck, setShowToneCheck] = useState(true);

  if (!enabled) return null;

  const totalIssues = result.errorCount + (showToneCheck ? informalWords.length : 0);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
        totalIssues > 0 
          ? "bg-[#f0b866]/20 border border-[#f0b866]/30" 
          : "bg-[#4ade80]/20 border border-[#4ade80]/30"
      }`}>
        {isChecking ? (
          <span className="text-[#a0a0a0] text-sm">Checking...</span>
        ) : totalIssues > 0 ? (
          <>
            <span className="text-[#f0b866]">⚠️</span>
            <span className="text-[#f0b866] text-sm">{totalIssues} issue{totalIssues !== 1 ? "s" : ""}</span>
          </>
        ) : (
          <>
            <span className="text-[#4ade80]">✓</span>
            <span className="text-[#4ade80] text-sm">No issues</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[#12121a] border border-[#2a2a3a]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">Writing Check</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowToneCheck(!showToneCheck)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              showToneCheck 
                ? "bg-[#a78bfa] text-white" 
                : "bg-[#2a2a3a] text-[#a0a0a0]"
            }`}
          >
            Tone
          </button>
        </div>
      </div>

      {isChecking ? (
        <div className="text-center py-4 text-[#666680]">
          <div className="inline-block w-4 h-4 border-2 border-[#a78bfa] border-t-transparent rounded-full animate-spin mr-2" />
          Checking...
        </div>
      ) : totalIssues === 0 ? (
        <div className="text-center py-4">
          <span className="text-[#4ade80] text-2xl">✓</span>
          <p className="text-[#4ade80] mt-1">No issues found</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-auto">
          {/* Spelling Errors */}
          {result.errors.map((error, index) => (
            <div key={`spell-${index}`} className="p-3 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#f87171]">🔤</span>
                <span className="text-white">Spelling: <span className="text-[#f87171] line-through">{error.word}</span></span>
              </div>
              <div className="flex flex-wrap gap-1">
                {error.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => onReplaceWord(error.word, suggestion)}
                    className="px-2 py-1 text-xs rounded bg-[#4ade80]/20 text-[#4ade80] hover:bg-[#4ade80]/30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Informal Words */}
          {showToneCheck && informalWords.map((item, index) => (
            <div key={`tone-${index}`} className="p-3 rounded-lg bg-[#f0b866]/10 border border-[#f0b866]/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#f0b866]">💼</span>
                <span className="text-white">Informal: <span className="text-[#f0b866]">{item.word}</span></span>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => onReplaceWord(item.word, suggestion)}
                    className="px-2 py-1 text-xs rounded bg-[#4ecdc4]/20 text-[#4ecdc4] hover:bg-[#4ecdc4]/30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Readability score calculator
export function calculateReadability(text: string): { score: number; grade: string; description: string } {
  if (!text.trim()) {
    return { score: 0, grade: "-", description: "No text" };
  }

  // Count sentences, words, syllables
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
  const words = text.match(/\b\w+\b/g) || [];
  const wordCount = words.length || 1;
  
  // Estimate syllables (simple approximation)
  const syllableCount = words.reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);

  // Flesch Reading Ease formula
  const avgSentenceLength = wordCount / sentences;
  const avgSyllablesPerWord = syllableCount / wordCount;
  const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  const score = Math.max(0, Math.min(100, Math.round(fleschScore)));

  // Convert to grade level
  let grade: string;
  let description: string;
  
  if (score >= 90) { grade = "5th"; description = "Very Easy"; }
  else if (score >= 80) { grade = "6th"; description = "Easy"; }
  else if (score >= 70) { grade = "7th"; description = "Fairly Easy"; }
  else if (score >= 60) { grade = "8-9th"; description = "Standard"; }
  else if (score >= 50) { grade = "10-12th"; description = "Fairly Difficult"; }
  else if (score >= 30) { grade = "College"; description = "Difficult"; }
  else { grade = "Graduate"; description = "Very Difficult"; }

  return { score, grade, description };
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

interface ReadabilityIndicatorProps {
  text: string;
}

export function ReadabilityIndicator({ text }: ReadabilityIndicatorProps) {
  const [readability, setReadability] = useState({ score: 0, grade: "-", description: "No text" });

  useEffect(() => {
    const result = calculateReadability(text);
    setReadability(result);
  }, [text]);

  const getColor = () => {
    if (readability.score >= 70) return "#4ade80";
    if (readability.score >= 50) return "#f0b866";
    return "#f87171";
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ backgroundColor: `${getColor()}20`, color: getColor() }}
      >
        {readability.score}
      </div>
      <div>
        <div className="text-white text-sm">{readability.description}</div>
        <div className="text-[#666680] text-xs">{readability.grade} grade level</div>
      </div>
    </div>
  );
}

