export interface DocumentHistoryItem {
  id: string;
  documentType: string;
  signatoryName: string;
  createdAt: string;
  preview?: string;
  bodyText?: string;
  recipientName?: string;
  recipientTitle?: string;
  recipientAddress?: string;
}

const HISTORY_KEY = "documentHistory";
const MAX_HISTORY = 50;

export function saveToHistory(item: Omit<DocumentHistoryItem, "id" | "createdAt">) {
  const history = getHistory();
  const newItem: DocumentHistoryItem = {
    ...item,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  return newItem;
}

export function getHistory(): DocumentHistoryItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function removeFromHistory(id: string) {
  const history = getHistory();
  const updated = history.filter((item) => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}




