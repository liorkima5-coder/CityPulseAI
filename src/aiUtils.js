// src/aiUtils.js

export const analyzeText = (text) => {
  if (!text) return { priority: 'רגיל', sentiment: 'ניטרלי' };
  
  const lowerText = text.toLowerCase();
  
  // מילים שמצביעות על דחיפות
  const urgentWords = ['סכנה', 'דחוף', 'דם', 'פצוע', 'בור', 'חשמל', 'שריפה', 'ליפול', 'ילדים', 'מיידי'];
  const mediumWords = ['מפריע', 'רעש', 'חוסם', 'לכלוך', 'תקוע'];
  
  // מילים שמצביעות על כעס/רגש
  const negativeWords = ['בושה', 'נמאס', 'חוצפה', 'מסוכן', 'כועס', 'ביזיון', 'תתביישו', 'סיוט'];
  const positiveWords = ['תודה', 'כל הכבוד', 'מצוין', 'יישר כוח', 'עזרתם'];

  let priority = 'רגיל';
  let sentiment = 'ניטרלי';

  // בדיקת דחיפות
  if (urgentWords.some(word => lowerText.includes(word))) {
    priority = 'קריטי';
  } else if (mediumWords.some(word => lowerText.includes(word))) {
    priority = 'דחוף';
  }

  // בדיקת סנטימנט
  if (negativeWords.some(word => lowerText.includes(word))) {
    sentiment = 'שלילי'; // התושב כועס
  } else if (positiveWords.some(word => lowerText.includes(word))) {
    sentiment = 'חיובי';
  }

  return { priority, sentiment };
};