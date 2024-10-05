export function getDateWithOffset(offsetInSeconds: number): Date {
  const currentDate = new Date(); // Get the current date and time
  const offsetMilliseconds = offsetInSeconds * 1000; // Convert seconds to milliseconds
  const newDate = new Date(currentDate.getTime() + offsetMilliseconds); // Add the offset
  return newDate;
}

export function GenerateRandomCode(length: number) {
  const characters = "0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}
