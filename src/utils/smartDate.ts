// Smart Date Parsing - converts natural language to dates

export function parseSmartDate(input: string): Date | null {
  const today = new Date();
  const lowerInput = input.toLowerCase().trim();
  
  // Today, tomorrow, yesterday
  if (lowerInput === "today") return today;
  if (lowerInput === "tomorrow") {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }
  if (lowerInput === "yesterday") {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d;
  }
  
  // Next/last weekday
  const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const nextMatch = lowerInput.match(/^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
  if (nextMatch) {
    const targetDay = weekdays.indexOf(nextMatch[1]);
    const d = new Date(today);
    const currentDay = d.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    d.setDate(d.getDate() + daysToAdd);
    return d;
  }
  
  const lastMatch = lowerInput.match(/^last\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
  if (lastMatch) {
    const targetDay = weekdays.indexOf(lastMatch[1]);
    const d = new Date(today);
    const currentDay = d.getDay();
    let daysToSubtract = currentDay - targetDay;
    if (daysToSubtract <= 0) daysToSubtract += 7;
    d.setDate(d.getDate() - daysToSubtract);
    return d;
  }
  
  // In X days/weeks/months
  const inMatch = lowerInput.match(/^in\s+(\d+)\s+(day|days|week|weeks|month|months)$/);
  if (inMatch) {
    const amount = parseInt(inMatch[1]);
    const unit = inMatch[2];
    const d = new Date(today);
    if (unit.startsWith("day")) d.setDate(d.getDate() + amount);
    else if (unit.startsWith("week")) d.setDate(d.getDate() + amount * 7);
    else if (unit.startsWith("month")) d.setMonth(d.getMonth() + amount);
    return d;
  }
  
  // X days/weeks/months ago
  const agoMatch = lowerInput.match(/^(\d+)\s+(day|days|week|weeks|month|months)\s+ago$/);
  if (agoMatch) {
    const amount = parseInt(agoMatch[1]);
    const unit = agoMatch[2];
    const d = new Date(today);
    if (unit.startsWith("day")) d.setDate(d.getDate() - amount);
    else if (unit.startsWith("week")) d.setDate(d.getDate() - amount * 7);
    else if (unit.startsWith("month")) d.setMonth(d.getMonth() - amount);
    return d;
  }
  
  // End of month/week
  if (lowerInput === "end of month" || lowerInput === "eom") {
    const d = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return d;
  }
  if (lowerInput === "end of week" || lowerInput === "eow") {
    const d = new Date(today);
    const daysToFriday = 5 - d.getDay();
    d.setDate(d.getDate() + (daysToFriday < 0 ? daysToFriday + 7 : daysToFriday));
    return d;
  }
  
  // Beginning of month/next month
  if (lowerInput === "first of month" || lowerInput === "beginning of month") {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }
  if (lowerInput === "first of next month") {
    return new Date(today.getFullYear(), today.getMonth() + 1, 1);
  }
  
  // Try standard date parsing as fallback
  const parsed = new Date(input);
  if (!isNaN(parsed.getTime())) return parsed;
  
  return null;
}

export function formatDate(date: Date, format: "short" | "long" | "iso" = "long"): string {
  if (format === "iso") {
    return date.toISOString().split("T")[0];
  }
  if (format === "short") {
    return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" });
  }
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function getSmartDateSuggestions(): string[] {
  return [
    "today",
    "tomorrow", 
    "next monday",
    "next friday",
    "in 7 days",
    "in 2 weeks",
    "in 1 month",
    "end of month",
    "end of week",
    "first of next month",
  ];
}

