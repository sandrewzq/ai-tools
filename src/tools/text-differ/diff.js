// LCS-based 行级 diff 算法

/**
 * diffLines 返回两个文本的行级差异
 * 返回数组，每项 { type: 'equal'|'added'|'removed', text: string, lineA?: number, lineB?: number }
 */
export function diffLines(textA, textB) {
  const linesA = textA.split("\n");
  const linesB = textB.split("\n");

  const lcs = computeLCS(linesA, linesB);
  const result = buildDiff(linesA, linesB, lcs);

  return result;
}

function computeLCS(a, b) {
  const m = a.length;
  const n = b.length;

  // 使用空间优化的 DP（只存两行）
  // 但回溯需要完整矩阵，对文本比对来说文本通常不会太大
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 回溯找出 LCS 匹配对
  const matches = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      matches.unshift({ i: i - 1, j: j - 1 });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return matches;
}

function buildDiff(linesA, linesB, lcsMatches) {
  const result = [];
  let matchIdx = 0;
  let i = 0;
  let j = 0;

  while (i < linesA.length || j < linesB.length) {
    if (matchIdx < lcsMatches.length && i === lcsMatches[matchIdx].i && j === lcsMatches[matchIdx].j) {
      result.push({ type: "equal", text: linesA[i], lineA: i + 1, lineB: j + 1 });
      i++;
      j++;
      matchIdx++;
    } else if (matchIdx < lcsMatches.length) {
      const nextMatch = lcsMatches[matchIdx];
      // linesA 中有行被删除或 linesB 中有行被添加
      while (i < linesA.length && i < nextMatch.i) {
        result.push({ type: "removed", text: linesA[i], lineA: i + 1, lineB: null });
        i++;
      }
      while (j < linesB.length && j < nextMatch.j) {
        result.push({ type: "added", text: linesB[j], lineA: null, lineB: j + 1 });
        j++;
      }
    } else {
      // 剩余行
      while (i < linesA.length) {
        result.push({ type: "removed", text: linesA[i], lineA: i + 1, lineB: null });
        i++;
      }
      while (j < linesB.length) {
        result.push({ type: "added", text: linesB[j], lineA: null, lineB: j + 1 });
        j++;
      }
    }
  }

  return result;
}

export function getDiffStats(diffResult) {
  let added = 0;
  let removed = 0;
  let equal = 0;

  for (const item of diffResult) {
    if (item.type === "added") added++;
    else if (item.type === "removed") removed++;
    else equal++;
  }

  return { added, removed, equal, total: diffResult.length };
}
