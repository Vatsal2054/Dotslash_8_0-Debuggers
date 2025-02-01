export function formatDate(dateString) {
    const date = new Date(dateString);

    // Get the day, month, and year components
    const day = date.getUTCDate();
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    // Function to add ordinal suffix to the day
    const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return `${day}th`; // Special case for 11th-13th
        switch (day % 10) {
            case 1: return `${day}st`;
            case 2: return `${day}nd`;
            case 3: return `${day}rd`;
            default: return `${day}th`;
        }
    };

    return `${getOrdinalSuffix(day)} ${month}, ${year}`;
}