// export function formatMessageTime(date) {
//     return new Date(date).toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: false,
//     });
// }

export function formatMessageTime(date) {
  const messageDate = new Date(date);
  const now = new Date();

  // Format date as DD-MM-YYYY
  const formattedDate = messageDate.toLocaleDateString("en-GB").replace(/\//g, "-");
  // Format time as HH:mm (24-hour format)
  const formattedTime = messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
  });

  // Check if the message date is the same as the current date
  const isSameDate = messageDate.toDateString() === now.toDateString();

  return isSameDate ? formattedTime : `${formattedDate} ${formattedTime}`;
}
