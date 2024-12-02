import { db } from "@/firebase/firebase";
import dayjs from "dayjs";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Converts a given month (numeric) to its Roman numeral equivalent.
export const convertMonthToRoman = (month: number): string => {
  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return romanNumerals[month - 1];
};

// Formats a given date string or object to the specified format.
export const formatDate = (
  dateTime?: string | Date,
  format: string = "YYYY-MM-DD",
  defaultText: string = "N/A"
): string => {
  if (!dateTime) return defaultText;
  return dayjs(dateTime).isValid() ? dayjs(dateTime).format(format) : defaultText;
};

/**
 * Generates a unique request number in the specified format:
 * PR<EntityAbbreviation><Year><Index><RomanMonth><DivisionAbbreviation>
 * 
 * Example: PRPDI202300001XIT
 * 
*/
export const generateRequestNumber = async (entityAbbr: string, division: string): Promise<string> => {
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;
  const romanMonth = convertMonthToRoman(currentMonth);

  // Reference to the Firebase Firestore document storing the request counter
  const counterDocRef = doc(db, "counters", "requestCounter");
  const counterSnapshot = await getDoc(counterDocRef);
  let currentIndex = 1;

  // If the counter document exists, increment the current index
  if (counterSnapshot.exists()) {
    currentIndex = counterSnapshot.data().currentIndex + 1;
  } else {
    // If the counter document does not exist, initialize it
    await setDoc(counterDocRef, { currentIndex: 1 });
  }

  // Update the counter value in Firebase Firestore
  await updateDoc(counterDocRef, { currentIndex });

  // Pad the current index to 5 digits (e.g., 00001)
  const requestIndex = currentIndex.toString().padStart(5, "0");

  // Generate the final request number
  return `PR${entityAbbr}${currentYear}${requestIndex}${romanMonth}${division}`;
};