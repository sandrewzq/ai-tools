export type DiffItem = {
  type: "equal" | "added" | "removed";
  text: string;
  lineA: number | null;
  lineB: number | null;
};

export function diffLines(textA: string, textB: string) {
  const linesA = textA.split("\n");
  const linesB = textB.split("\n");
  return buildDiff(linesA, linesB, computeLcs(linesA, linesB));
}

function computeLcs(a: string[], b: string[]) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const matches: Array<{ i: number; j: number }> = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      matches.unshift({ i: i - 1, j: j - 1 });
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i -= 1;
    } else {
      j -= 1;
    }
  }
  return matches;
}

function buildDiff(linesA: string[], linesB: string[], lcsMatches: Array<{ i: number; j: number }>) {
  const result: DiffItem[] = [];
  let matchIndex = 0;
  let i = 0;
  let j = 0;

  while (i < linesA.length || j < linesB.length) {
    if (matchIndex < lcsMatches.length && i === lcsMatches[matchIndex].i && j === lcsMatches[matchIndex].j) {
      result.push({ type: "equal", text: linesA[i], lineA: i + 1, lineB: j + 1 });
      i += 1;
      j += 1;
      matchIndex += 1;
    } else if (matchIndex < lcsMatches.length) {
      const next = lcsMatches[matchIndex];
      while (i < linesA.length && i < next.i) {
        result.push({ type: "removed", text: linesA[i], lineA: i + 1, lineB: null });
        i += 1;
      }
      while (j < linesB.length && j < next.j) {
        result.push({ type: "added", text: linesB[j], lineA: null, lineB: j + 1 });
        j += 1;
      }
    } else {
      while (i < linesA.length) {
        result.push({ type: "removed", text: linesA[i], lineA: i + 1, lineB: null });
        i += 1;
      }
      while (j < linesB.length) {
        result.push({ type: "added", text: linesB[j], lineA: null, lineB: j + 1 });
        j += 1;
      }
    }
  }
  return result;
}

export function getDiffStats(diffResult: DiffItem[]) {
  return diffResult.reduce(
    (stats, item) => {
      stats[item.type === "added" ? "added" : item.type === "removed" ? "removed" : "equal"] += 1;
      stats.total += 1;
      return stats;
    },
    { added: 0, removed: 0, equal: 0, total: 0 },
  );
}
