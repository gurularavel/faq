export const levenshtein = (str1, str2) => {
  if (!str1.length) return str2.length;
  if (!str2.length) return str1.length;
  if (str1 === str2) return 0;

  const m = str1.length;
  const n = str2.length;

  if (Math.abs(m - n) > 3) return Infinity;

  let prev = Array(n + 1).fill(0);
  let curr = Array(n + 1).fill(0);

  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] =
        str1[i - 1] === str2[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
};
