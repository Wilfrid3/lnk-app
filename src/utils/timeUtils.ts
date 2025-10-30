/**
 * Formats a time string or date to a human-readable time ago format
 * For example: "il y a 2 minutes", "il y a 3 heures", "il y a 5 jours"
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return dateString; // Return original string if invalid date
  }

  // Less than a minute
  if (diffInSeconds < 60) {
    return `il y a ${diffInSeconds} secondes`;
  }
  
  // Less than an hour
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'}`;
  }
  
  // Less than a day
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `il y a ${diffInHours} ${diffInHours === 1 ? 'heure' : 'heures'}`;
  }
  
  // Less than 30 days
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `il y a ${diffInDays} ${diffInDays === 1 ? 'jour' : 'jours'}`;
  }
  
  // Less than a year
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `il y a ${diffInMonths} ${diffInMonths === 1 ? 'mois' : 'mois'}`;
  }
  
  // More than a year
  const diffInYears = Math.floor(diffInMonths / 12);
  return `il y a ${diffInYears} ${diffInYears === 1 ? 'an' : 'ans'}`;
}

/**
 * Takes a string like "45 min" or "2 h" and converts it to a concise format matching the UI
 * For example: "45 min" becomes "il y a 45 minutes"
 */
export function improveTimeDisplay(timeString: string): string {
  if (!timeString) return '';
  
  // If it already starts with "il y a", just return it
  if (timeString.startsWith('il y a')) {
    return timeString;
  }
  
  // Extract number and unit
  const match = timeString.match(/(\d+)\s*([a-zA-Z]+)/);
  if (!match) return timeString;
  
  const [, valueStr, unit] = match;
  const value = parseInt(valueStr, 10);
  
  if (isNaN(value)) return timeString;
  
  // Format it in a more concise way like shown in the screenshot
  if (unit === 'min') {
    return `il y a ${value} ${value === 1 ? 'minute' : 'minutes'}`;
  } else if (unit === 'h') {
    return `il y a ${value} ${value === 1 ? 'heure' : 'heures'}`;
  } else if (unit === 'j') {
    return `il y a ${value} ${value === 1 ? 'jour' : 'jours'}`;
  }
  
  return timeString;
}