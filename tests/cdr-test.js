// CDR計算ロジックのテスト

// CDRスコアの計算関数
function calculateCDR(scores) {
  // メモリー（M）は主要カテゴリー、他は二次カテゴリー
  const memory = scores.memory;
  const secondaryScores = [
    scores.orientation,
    scores.judgment,
    scores.community,
    scores.home,
    scores.care,
  ];

  // 二次カテゴリーのスコアがメモリーと同じ、より大きい、より小さいものをカウント
  let sameAsMemory = 0;
  let greaterThanMemory = 0;
  let lessThanMemory = 0;

  secondaryScores.forEach((score) => {
    if (score === memory) sameAsMemory++;
    else if (score > memory) greaterThanMemory++;
    else lessThanMemory++;
  });

  // ルール1: メモリーと同じスコアの二次カテゴリーが3つ以上ある場合、CDR = メモリースコア
  if (sameAsMemory >= 3) {
    return memory;
  }

  // ルール2: 3つ以上の二次カテゴリーがメモリーより大きいか小さい場合
  if (greaterThanMemory >= 3) {
    // 多数派のスコアを採用
    return findMostCommonScore(
      secondaryScores.filter((score) => score > memory)
    );
  }

  if (lessThanMemory >= 3) {
    // 多数派のスコアを採用
    return findMostCommonScore(
      secondaryScores.filter((score) => score < memory)
    );
  }

  // ルール3: 3つの二次カテゴリーがメモリーの一方の側にあり、2つが他方の側にある場合、CDR = メモリースコア
  if (
    (greaterThanMemory === 3 && lessThanMemory === 2) ||
    (lessThanMemory === 3 && greaterThanMemory === 2)
  ) {
    return memory;
  }

  // ルール4: メモリー = 0.5の場合、CDRは0にはならず、0.5または1のいずれかとなる
  if (memory === 0.5) {
    // 二次カテゴリーのうち少なくとも3つ以上が1以上なら、CDR = 1
    const scoresOneOrMore = secondaryScores.filter((score) => score >= 1);
    if (scoresOneOrMore.length >= 3) {
      return 1;
    }
    // それ以外の場合はCDR = 0.5
    return 0.5;
  }

  // ルール5: メモリー = 0の場合
  if (memory === 0) {
    // 二次カテゴリーのスコアが2つ以上0.5以上なら、CDR = 0.5
    const scoresAboveZero = secondaryScores.filter((score) => score >= 0.5);
    if (scoresAboveZero.length >= 2) {
      return 0.5;
    }
    // 二次カテゴリーの障害が1つだけならCDR = 0
    return 0;
  }

  // デフォルトケース: 最も一般的なスコアを返す
  return findMostCommonScore([memory, ...secondaryScores]);
}

// 配列内で最も頻度の高いスコアを見つける関数
function findMostCommonScore(scores) {
  const frequency = {};
  let maxFreq = 0;
  let mostCommon = 0;

  scores.forEach((score) => {
    frequency[score] = (frequency[score] || 0) + 1;
    if (frequency[score] > maxFreq) {
      maxFreq = frequency[score];
      mostCommon = score;
    }
  });

  return mostCommon;
}

// 同点のスコアを見つける関数
function findTiedScores(scores) {
  const frequency = {};
  scores.forEach((score) => {
    frequency[score] = (frequency[score] || 0) + 1;
  });

  const maxFreq = Math.max(...Object.values(frequency));
  return Object.keys(frequency)
    .filter((score) => frequency[Number(score)] === maxFreq)
    .map(Number);
}

// メモリースコアに最も近いスコアを見つける関数
function findClosestToMemory(scores, memory) {
  return scores.reduce((closest, current) => {
    return Math.abs(current - memory) < Math.abs(closest - memory)
      ? current
      : closest;
  });
}

// テストケースを実行する関数
function runTests() {
  const possibleScores = [0, 0.5, 1, 2, 3];
  const possibleCareScores = [0, 1, 2, 3]; // 介護状況は0.5がない
  const results = [];
  let totalCases = 0;

  // CDRスコアの分布を追跡
  const distribution = {
    0: 0,
    0.5: 0,
    1: 0,
    2: 0,
    3: 0,
  };

  // ルール適用の分布を追跡
  const ruleDistribution = {
    ルール1: 0,
    "ルール2-大きい": 0,
    "ルール2-小さい": 0,
    ルール3: 0,
    ルール4: 0,
    ルール5: 0,
    デフォルト: 0,
  };

  // すべての可能な組み合わせをテスト
  for (const memory of possibleScores) {
    for (const orientation of possibleScores) {
      for (const judgment of possibleScores) {
        for (const community of possibleScores) {
          for (const home of possibleScores) {
            for (const care of possibleCareScores) {
              // 介護状況は0.5がない
              totalCases++;
              const scores = {
                memory,
                orientation,
                judgment,
                community,
                home,
                care,
              };

              const cdrScore = calculateCDR(scores);
              distribution[cdrScore]++;

              // どのルールが適用されたかを判定
              const ruleApplied = determineAppliedRule(scores, cdrScore);
              ruleDistribution[ruleApplied]++;

              // 特定のケースを詳細に分析
              const isInteresting = analyzeInterestingCase(scores, cdrScore);

              if (isInteresting) {
                results.push({
                  scores,
                  cdrScore,
                  explanation: getExplanation(scores, cdrScore),
                });
              }
            }
          }
        }
      }
    }
  }

  console.log(`テスト完了: ${totalCases}ケースをテストしました`);
  console.log(`興味深いケース: ${results.length}件`);

  // CDRスコアの分布を表示
  console.log("\n=== CDRスコアの分布 ===");
  for (const score in distribution) {
    console.log(
      `CDR ${score}: ${distribution[score]}ケース (${((distribution[score] / totalCases) * 100).toFixed(2)}%)`
    );
  }

  // ルール適用の分布を表示
  console.log("\n=== ルール適用の分布 ===");
  for (const rule in ruleDistribution) {
    if (ruleDistribution[rule] > 0) {
      console.log(
        `${rule}: ${ruleDistribution[rule]}ケース (${((ruleDistribution[rule] / totalCases) * 100).toFixed(2)}%)`
      );
    }
  }

  // 興味深いケースの一部を表示
  if (results.length > 0) {
    console.log("\n=== 興味深いケースの例 ===");
    const samplesToShow = Math.min(10, results.length);
    for (let i = 0; i < samplesToShow; i++) {
      const result = results[i];
      console.log(`ケース ${i + 1}:`);
      console.log(
        `入力: メモリー: ${result.scores.memory}, 見当識: ${result.scores.orientation}, 判断力: ${result.scores.judgment}, 社会適応: ${result.scores.community}, 家庭: ${result.scores.home}, 介護: ${result.scores.care}`
      );
      console.log(`結果: CDR = ${result.cdrScore}`);
      console.log(`説明: ${result.explanation}`);
      console.log("-------------------");
    }
  }

  return { distribution, ruleDistribution, results };
}

// どのルールが適用されたかを判定する関数
function determineAppliedRule(scores, cdrScore) {
  const memory = scores.memory;
  const secondaryScores = [
    scores.orientation,
    scores.judgment,
    scores.community,
    scores.home,
    scores.care,
  ];

  // 二次カテゴリーのスコアがメモリーと同じ、より大きい、より小さいものをカウント
  let sameAsMemory = 0;
  let greaterThanMemory = 0;
  let lessThanMemory = 0;

  secondaryScores.forEach((score) => {
    if (score === memory) sameAsMemory++;
    else if (score > memory) greaterThanMemory++;
    else lessThanMemory++;
  });

  // ルール1: メモリーと同じスコアの二次カテゴリーが3つ以上ある場合
  if (sameAsMemory >= 3) {
    return "ルール1";
  }

  // ルール2: 3つ以上の二次カテゴリーがメモリーより大きいか小さい場合
  if (greaterThanMemory >= 3) {
    return "ルール2-大きい";
  }

  if (lessThanMemory >= 3) {
    return "ルール2-小さい";
  }

  // ルール3: 3つの二次カテゴリーがメモリーの一方の側にあり、2つが他方の側にある場合
  if (
    (greaterThanMemory === 3 && lessThanMemory === 2) ||
    (lessThanMemory === 3 && greaterThanMemory === 2)
  ) {
    return "ルール3";
  }

  // ルール4: メモリー = 0.5の場合
  if (memory === 0.5) {
    return "ルール4";
  }

  // ルール5: メモリー = 0の場合
  if (memory === 0) {
    return "ルール5";
  }

  // デフォルトケース
  return "デフォルト";
}

// 特定の興味深いケースを分析する関数
function analyzeInterestingCase(scores, cdrScore) {
  // 以下のような特定のケースを「興味深い」と判断
  // 1. メモリースコアとCDRスコアが異なる場合で、特定の条件を満たすもの
  if (scores.memory !== cdrScore) {
    // 特定の条件を追加して、興味深いケースを減らす
    if (
      scores.memory === 0.5 ||
      scores.memory === 0 ||
      (scores.memory >= 1 && cdrScore === 0.5)
    ) {
      return true;
    }
    // ランダムに一部のケースのみを選択（約1%）
    return Math.random() < 0.01;
  }

  // 2. メモリー = 0.5の特別ルールが適用された場合（一部のみ）
  if (scores.memory === 0.5 && Math.random() < 0.1) {
    return true;
  }

  // 3. メモリー = 0の特別ルールが適用された場合（一部のみ）
  if (scores.memory === 0 && cdrScore !== 0 && Math.random() < 0.1) {
    return true;
  }

  // 4. 二次カテゴリーのスコアが極端に分かれている場合（ごく一部のみ）
  const secondaryScores = [
    scores.orientation,
    scores.judgment,
    scores.community,
    scores.home,
    scores.care,
  ];

  const uniqueScores = new Set(secondaryScores);
  if (uniqueScores.size >= 4 && Math.random() < 0.01) {
    return true;
  }

  // デフォルトでは興味深くないと判断
  return false;
}

// 説明を生成する関数
function getExplanation(scores, cdr) {
  const memory = scores.memory;
  const secondaryScores = [
    scores.orientation,
    scores.judgment,
    scores.community,
    scores.home,
    scores.care,
  ];

  // 二次カテゴリーのスコアがメモリーと同じ、より大きい、より小さいものをカウント
  let sameAsMemory = 0;
  let greaterThanMemory = 0;
  let lessThanMemory = 0;

  secondaryScores.forEach((score) => {
    if (score === memory) sameAsMemory++;
    else if (score > memory) greaterThanMemory++;
    else lessThanMemory++;
  });

  // ルール1: メモリーと同じスコアの二次カテゴリーが3つ以上ある場合
  if (sameAsMemory >= 3) {
    return `ルール1: メモリーと同じスコア(${memory})の二次カテゴリーが${sameAsMemory}個あるため、CDR = ${memory}`;
  }

  // ルール2: 3つ以上の二次カテゴリーがメモリーより大きいか小さい場合
  if (greaterThanMemory >= 3) {
    const mostCommonHigherScore = findMostCommonScore(
      secondaryScores.filter((score) => score > memory)
    );
    return `ルール2: メモリー(${memory})より大きいスコアの二次カテゴリーが${greaterThanMemory}個あるため、多数派のスコアを採用`;
  }

  if (lessThanMemory >= 3) {
    const mostCommonLowerScore = findMostCommonScore(
      secondaryScores.filter((score) => score < memory)
    );
    return `ルール2: メモリー(${memory})より小さいスコアの二次カテゴリーが${lessThanMemory}個あるため、多数派のスコアを採用`;
  }

  // ルール3: 3つの二次カテゴリーがメモリーの一方の側にあり、2つが他方の側にある場合
  if (
    (greaterThanMemory === 3 && lessThanMemory === 2) ||
    (lessThanMemory === 3 && greaterThanMemory === 2)
  ) {
    return `ルール3: 3つの二次カテゴリーがメモリー(${memory})の一方の側にあり、2つが他方の側にあるため、CDR = ${memory}`;
  }

  // ルール4: メモリー = 0.5の場合
  if (memory === 0.5) {
    // 二次カテゴリーのうち少なくとも3つ以上が1以上なら、CDR = 1
    const scoresOneOrMore = secondaryScores.filter((score) => score >= 1);
    if (scoresOneOrMore.length >= 3) {
      return `ルール4: メモリー = 0.5で、二次カテゴリーのうち${scoresOneOrMore.length}個が1以上のため、CDR = 1`;
    }
    // それ以外の場合はCDR = 0.5
    return `ルール4: メモリー = 0.5で、二次カテゴリーのうち1以上のスコアが3個未満のため、CDR = 0.5`;
  }

  // ルール5: メモリー = 0の場合
  if (memory === 0) {
    // 二次カテゴリーのスコアが2つ以上0.5以上なら、CDR = 0.5
    const scoresAboveZero = secondaryScores.filter((score) => score >= 0.5);
    if (scoresAboveZero.length >= 2) {
      return `ルール5: メモリー = 0で、二次カテゴリーのうち${scoresAboveZero.length}個が0.5以上のため、CDR = 0.5`;
    }
    // 二次カテゴリーの障害が1つだけならCDR = 0
    return `ルール5: メモリー = 0で、二次カテゴリーのうち0.5以上のスコアが1個以下のため、CDR = 0`;
  }

  // デフォルトケース
  return `デフォルト: 特定のルールに該当しないため、最も一般的なスコア(${cdr})を採用`;
}

// 結果を表示する関数
function displayResults(results) {
  console.log("\n=== 興味深いケースの詳細 ===\n");

  // 最初の10件だけ表示
  const displayCount = Math.min(10, results.length);

  for (let i = 0; i < displayCount; i++) {
    const result = results[i];
    const { scores, cdrScore, explanation } = result;
    console.log(`ケース ${i + 1}:`);
    console.log(
      `メモリー: ${scores.memory}, 見当識: ${scores.orientation}, 判断力: ${scores.judgment}, 社会適応: ${scores.community}, 家庭: ${scores.home}, 介護: ${scores.care}`
    );
    console.log(`CDRスコア: ${cdrScore}`);
    console.log(`説明: ${explanation}`);
    console.log("-------------------");
  }

  if (results.length > displayCount) {
    console.log(
      `... 他 ${results.length - displayCount} 件のケースは省略されました`
    );
  }
}

// 特定のケースをテストする関数
function testSpecificCases() {
  console.log("=== 特定のケースのテスト ===\n");

  const testCases = [
    {
      name: "ケース1: メモリー = 0.5の特別ルール",
      scores: {
        memory: 0.5,
        orientation: 1,
        judgment: 1,
        community: 1,
        home: 0,
        care: 0,
      },
    },
    {
      name: "ケース2: メモリー = 0の特別ルール",
      scores: {
        memory: 0,
        orientation: 0.5,
        judgment: 0.5,
        community: 0,
        home: 0,
        care: 0,
      },
    },
    {
      name: "ケース3: ルール1 - メモリーと同じスコアの二次カテゴリーが3つ以上",
      scores: {
        memory: 2,
        orientation: 2,
        judgment: 2,
        community: 2,
        home: 1,
        care: 0,
      },
    },
    {
      name: "ケース4: ルール2 - 3つ以上の二次カテゴリーがメモリーより大きい",
      scores: {
        memory: 1,
        orientation: 2,
        judgment: 2,
        community: 2,
        home: 0,
        care: 0,
      },
    },
    {
      name: "ケース5: ルール2 - 3つ以上の二次カテゴリーがメモリーより小さい",
      scores: {
        memory: 2,
        orientation: 1,
        judgment: 1,
        community: 1,
        home: 3,
        care: 3,
      },
    },
    {
      name: "ケース6: ルール3 - 3つの二次カテゴリーがメモリーより大きく、2つがメモリーより小さい",
      scores: {
        memory: 2,
        orientation: 3,
        judgment: 3,
        community: 3,
        home: 1,
        care: 1,
      },
    },
    {
      name: "ケース6-2: ルール3 - 3つの二次カテゴリーがメモリーより大きく、2つがメモリーと同じ",
      scores: {
        memory: 1,
        orientation: 2,
        judgment: 2,
        community: 2,
        home: 1,
        care: 1,
      },
    },
    {
      name: "ケース6-3: ルール3 - 3つの二次カテゴリーがメモリーより小さく、2つがメモリーと同じ",
      scores: {
        memory: 2,
        orientation: 1,
        judgment: 1,
        community: 1,
        home: 2,
        care: 2,
      },
    },
    {
      name: "ケース6-4: ルール3 - 3つの二次カテゴリーがメモリーより大きく、2つがメモリーより小さい（ルール3が適用される）",
      scores: {
        memory: 2,
        orientation: 3,
        judgment: 3,
        community: 3,
        home: 1,
        care: 0,
      },
    },
    {
      name: "ケース6-5: ルール3 - 3つの二次カテゴリーがメモリーより小さく、2つがメモリーより大きい（ルール3が適用される）",
      scores: {
        memory: 2,
        orientation: 1,
        judgment: 1,
        community: 1,
        home: 3,
        care: 3,
      },
    },
    {
      name: "ケース7: メモリー = 1で二次カテゴリーがすべて0の場合",
      scores: {
        memory: 1,
        orientation: 0,
        judgment: 0,
        community: 0,
        home: 0,
        care: 0,
      },
    },
    {
      name: "ケース8: メモリーと4つの二次カテゴリーが0.5、1つが0の場合",
      scores: {
        memory: 0.5,
        orientation: 0.5,
        judgment: 0.5,
        community: 0.5,
        home: 0.5,
        care: 0,
      },
    },
    {
      name: "ケース9: メモリーと4つの二次カテゴリーが0.5、介護が1の場合",
      scores: {
        memory: 0.5,
        orientation: 0.5,
        judgment: 0.5,
        community: 0.5,
        home: 0.5,
        care: 1,
      },
    },
  ];

  testCases.forEach((testCase) => {
    console.log(`${testCase.name}:`);
    console.log(
      `入力: メモリー: ${testCase.scores.memory}, 見当識: ${testCase.scores.orientation}, 判断力: ${testCase.scores.judgment}, 社会適応: ${testCase.scores.community}, 家庭: ${testCase.scores.home}, 介護: ${testCase.scores.care}`
    );
    const cdrScore = calculateCDR(testCase.scores);
    console.log(`結果: CDR = ${cdrScore}`);

    // どのルールが適用されたかを判定
    const ruleApplied = determineAppliedRule(testCase.scores, cdrScore);
    console.log(`適用されたルール: ${ruleApplied}`);

    console.log(`説明: ${getExplanation(testCase.scores, cdrScore)}`);
    console.log("-------------------");
  });
}

// メイン実行
testSpecificCases();
console.log("\n=== すべての組み合わせのテスト ===\n");
runTests();
