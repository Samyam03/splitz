// Color palette for different users
const userColors = [
  { bg: 'bg-blue-200', text: 'text-blue-700', ring: 'ring-blue-200' },
  { bg: 'bg-purple-200', text: 'text-purple-700', ring: 'ring-purple-200' },
  { bg: 'bg-indigo-200', text: 'text-indigo-700', ring: 'ring-indigo-200' },
  { bg: 'bg-pink-200', text: 'text-pink-700', ring: 'ring-pink-200' },
  { bg: 'bg-teal-200', text: 'text-teal-700', ring: 'ring-teal-200' },
  { bg: 'bg-orange-200', text: 'text-orange-700', ring: 'ring-orange-200' },
  { bg: 'bg-cyan-200', text: 'text-cyan-700', ring: 'ring-cyan-200' },
  { bg: 'bg-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  { bg: 'bg-violet-200', text: 'text-violet-700', ring: 'ring-violet-200' },
  { bg: 'bg-rose-200', text: 'text-rose-700', ring: 'ring-rose-200' },
];

// Function to get consistent color for a user
export const getUserColor = (userId: string) => {
  // Handle undefined/null userId
  if (!userId || typeof userId !== 'string') {
    return userColors[0]; // Return default color (blue)
  }
  
  // Simple hash function to get consistent color index
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % userColors.length;
  return userColors[index];
}; 