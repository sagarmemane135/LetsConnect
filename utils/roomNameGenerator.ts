const adjectives = [
  'quick', 'lazy', 'sleepy', 'noisy', 'hungry', 'brave', 'clever', 'silly',
  'happy', 'grumpy', 'funny', 'gentle', 'calm', 'proud', 'wise', 'witty',
  'bright', 'shiny', 'dusty', 'fuzzy', 'smooth', 'rough', 'tiny', 'giant'
];

const nouns = [
  'fox', 'dog', 'cat', 'mouse', 'lion', 'tiger', 'bear', 'frog', 'panda',
  'koala', 'lemur', 'hippo', 'rhino', 'zebra', 'horse', 'eagle', 'hawk',
  'whale', 'shark', 'dolphin', 'squid', 'robot', 'dragon', 'wizard', 'ninja'
];

export const generateRoomName = (): string => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}-${noun}-${num}`;
};