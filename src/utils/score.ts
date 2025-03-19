export const formatName = (name: string) => {
    return name
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const getScoreColor = (score:number) => {
    if (score >= 8) return '#4caf50'; // green
    if (score >= 6) return '#2196f3'; // blue
    if (score >= 4) return '#ff9800'; // orange/yellow
    return '#f44336'; // red
  };

export const calculateStrokeDasharray = (score:number) => {
    // Circumference of the circle (2πr where r=40)
    const circumference = 2 * Math.PI * 40;
    // Calculate the filled portion of the circle
    const filledPortion = (score / 10) * circumference;
    return `${filledPortion} ${circumference}`;
};