// פונקציה שהופכת כתובת טקסט לקואורדינטות אמיתיות
export const getCoordinates = async (address) => {
  try {
    // הוספת "ירושלים" לחיפוש כדי למקד תוצאות
    const query = `${address}, Jerusalem`; 
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};