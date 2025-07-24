import type { Event } from '../components/Calendar';

export interface Subject {
  name: string;
  priority: number;
  color: string;
  bgColor: string;
  minTime: number;
  maxRatio: number;
  isOptional?: boolean; // 芸術・保健・サイエンス情報用
}

export interface StudyPlan {
  subject: string;
  time: number;
  color: string;
  bgColor: string;
  reason?: string;
}

export const coreSubjects: Subject[] = [
  { name: '現代の国語', priority: 1, color: 'text-blue-700', bgColor: 'bg-blue-100', minTime: 10, maxRatio: 0.25 },
  { name: '言語文化', priority: 2, color: 'text-indigo-700', bgColor: 'bg-indigo-100', minTime: 10, maxRatio: 0.25 },
  { name: '数学Ⅰα', priority: 3, color: 'text-purple-700', bgColor: 'bg-purple-100', minTime: 15, maxRatio: 0.3 },
  { name: '数学Ⅰβ', priority: 4, color: 'text-violet-700', bgColor: 'bg-violet-100', minTime: 15, maxRatio: 0.3 },
  { name: '数学A', priority: 5, color: 'text-pink-700', bgColor: 'bg-pink-100', minTime: 15, maxRatio: 0.25 },
  { name: 'ECⅠ', priority: 6, color: 'text-green-700', bgColor: 'bg-green-100', minTime: 10, maxRatio: 0.25 },
  { name: '論理表現Ⅰ', priority: 7, color: 'text-emerald-700', bgColor: 'bg-emerald-100', minTime: 10, maxRatio: 0.2 },
  { name: '化学基礎', priority: 8, color: 'text-orange-700', bgColor: 'bg-orange-100', minTime: 10, maxRatio: 0.25 },
  { name: '物理基礎', priority: 9, color: 'text-amber-700', bgColor: 'bg-amber-100', minTime: 10, maxRatio: 0.25 },
  { name: '生物基礎', priority: 10, color: 'text-lime-700', bgColor: 'bg-lime-100', minTime: 10, maxRatio: 0.25 },
  { name: '歴史総合', priority: 11, color: 'text-red-700', bgColor: 'bg-red-100', minTime: 10, maxRatio: 0.2 },
];

export const optionalSubjects: Subject[] = [
  { name: '音楽', priority: 12, color: 'text-cyan-700', bgColor: 'bg-cyan-100', minTime: 5, maxRatio: 0.15, isOptional: true },
  { name: '書道', priority: 12, color: 'text-slate-700', bgColor: 'bg-slate-100', minTime: 5, maxRatio: 0.15, isOptional: true },
  { name: '美術', priority: 12, color: 'text-rose-700', bgColor: 'bg-rose-100', minTime: 5, maxRatio: 0.15, isOptional: true },
  { name: '保健', priority: 13, color: 'text-teal-700', bgColor: 'bg-teal-100', minTime: 5, maxRatio: 0.1, isOptional: true },
  { name: 'サイエンス情報', priority: 14, color: 'text-sky-700', bgColor: 'bg-sky-100', minTime: 5, maxRatio: 0.15, isOptional: true },
];

export const allSubjects = [...coreSubjects, ...optionalSubjects];

// 自由に勉強用の特別な教科
export const freeStudySubject: Subject = {
  name: '自由に勉強',
  priority: 0,
  color: 'text-purple-700',
  bgColor: 'bg-purple-100',
  minTime: 1,
  maxRatio: 1.0,
};

function getRelevantOptionalSubjects(events: Event[]): Subject[] {
  const today = new Date();
  const oneMonthLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate <= oneMonthLater;
  });

  const relevantOptionalSubjects: Subject[] = [];
  
  upcomingEvents.forEach(event => {
    if (event.subject) {
      const matchingOptional = optionalSubjects.find(subject => 
        subject.name.toLowerCase().includes(event.subject!.toLowerCase()) ||
        event.subject!.toLowerCase().includes(subject.name.toLowerCase()) ||
        (event.subject!.includes('芸術') && ['音楽', '書道', '美術'].includes(subject.name))
      );
      
      if (matchingOptional && !relevantOptionalSubjects.some(s => s.name === matchingOptional.name)) {
        relevantOptionalSubjects.push(matchingOptional);
      }
    }
  });

  return relevantOptionalSubjects;
}

export function calculateStudyPlan(
  totalMinutes: number, 
  events: Event[], 
  preferredSubjects: string[] = [], 
  numberOfSubjects?: number,
  randomSeed?: number
): StudyPlan[] {
  // 自由に勉強が選択されている場合
  if (preferredSubjects.includes('自由に勉強')) {
    return [
      {
        subject: '自由に勉強',
        time: totalMinutes,
        color: freeStudySubject.color,
        bgColor: freeStudySubject.bgColor,
      },
    ];
  }

  if (totalMinutes < 10) {
    return [
      {
        subject: coreSubjects[0].name,
        time: totalMinutes,
        color: coreSubjects[0].color,
        bgColor: coreSubjects[0].bgColor,
      },
    ];
  }

  // 今後7日以内のテストを取得
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingTests = events.filter(event => {
    const eventDate = new Date(event.date);
    return event.type === 'test' && eventDate >= today && eventDate <= nextWeek;
  });

  // 1ヶ月以内に予定がある選択科目を取得
  const relevantOptionalSubjects = getRelevantOptionalSubjects(events);
  
  // 利用可能な教科を決定
  const availableSubjects = [...coreSubjects, ...relevantOptionalSubjects];

  // 特にやりたい教科がある場合、それらの優先度を上げる
  const adjustedSubjects = availableSubjects.map(subject => {
    const isPreferred = preferredSubjects.includes(subject.name);
    return {
      ...subject,
      priority: isPreferred ? subject.priority - 10 : subject.priority, // 優先度を大幅に上げる
    };
  });

  // テスト対象教科の優先度を上げる
  upcomingTests.forEach(test => {
    if (test.subject) {
      const subjectIndex = adjustedSubjects.findIndex(s => 
        s.name.toLowerCase().includes(test.subject!.toLowerCase()) ||
        test.subject!.toLowerCase().includes(s.name.toLowerCase()) ||
        (test.subject!.includes('数学') && s.name.includes('数学')) ||
        (test.subject!.includes('芸術') && ['音楽', '書道', '美術'].includes(s.name))
      );
      
      if (subjectIndex !== -1) {
        // テストまでの日数に応じて優先度を調整
        const daysUntil = Math.ceil((new Date(test.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const urgencyBoost = Math.max(1, 8 - daysUntil); // より強力な優先度ブースト
        adjustedSubjects[subjectIndex] = {
          ...adjustedSubjects[subjectIndex],
          priority: Math.max(1, adjustedSubjects[subjectIndex].priority - urgencyBoost * 5), // より大幅な優先度向上
          maxRatio: Math.min(0.7, adjustedSubjects[subjectIndex].maxRatio + 0.3), // より多くの時間を割り当て
        };
      }
    }
  });

  // 優先度でソート
  // ランダム性を追加して再提案時に異なる結果を生成
  const seed = randomSeed || Date.now();
  adjustedSubjects.sort((a, b) => {
    const priorityDiff = a.priority - b.priority;
    // 優先度が近い場合（差が2以下）はランダムに並び替え
    if (Math.abs(priorityDiff) <= 2) {
      return (Math.sin(seed + a.priority + b.priority) > 0) ? 1 : -1;
    }
    return priorityDiff;
  });

  const plan: StudyPlan[] = [];
  let remainingTime = totalMinutes;
  let selectedSubjects = [...adjustedSubjects];

  // 教科数の決定
  let targetSubjectCount: number;
  
  if (numberOfSubjects) {
    // ユーザーが指定した教科数
    targetSubjectCount = numberOfSubjects;
  } else {
    // 時間に応じて教科数を自動調整
    if (totalMinutes < 30) {
      targetSubjectCount = 2;
    } else if (totalMinutes < 60) {
      targetSubjectCount = 4;
    } else if (totalMinutes < 90) {
      targetSubjectCount = 6;
    } else if (totalMinutes < 120) {
      targetSubjectCount = 8;
    } else {
      targetSubjectCount = 10;
    }
  }
  
  // 特にやりたい教科がある場合、それらを優先的に含める
  if (preferredSubjects.length > 0) {
    const preferredSubjectObjects = adjustedSubjects.filter(s => preferredSubjects.includes(s.name));
    const otherSubjects = adjustedSubjects.filter(s => !preferredSubjects.includes(s.name));
    
    // 特にやりたい教科を最初に配置し、残りを優先度順で追加
    selectedSubjects = [
      ...preferredSubjectObjects,
      ...otherSubjects
    ].slice(0, targetSubjectCount);
  } else {
    selectedSubjects = adjustedSubjects.slice(0, targetSubjectCount);
  }

  // 各教科の最小時間を確保
  selectedSubjects.forEach(subject => {
    const baseMinTime = Math.min(subject.minTime, Math.floor(remainingTime / selectedSubjects.length));
    const minTime = Math.ceil(baseMinTime / 5) * 5; // 5分刻みに調整
    const originalSubject = allSubjects.find(s => s.name === subject.name)!;
    const testReason = upcomingTests.find(test => 
      test.subject && (
        subject.name.toLowerCase().includes(test.subject.toLowerCase()) ||
        test.subject.toLowerCase().includes(subject.name.toLowerCase()) ||
        (test.subject.includes('数学') && subject.name.includes('数学')) ||
        (test.subject.includes('芸術') && ['音楽', '書道', '美術'].includes(subject.name))
      )
    );
    
    plan.push({
      subject: subject.name,
      time: minTime,
      color: originalSubject.color,
      bgColor: originalSubject.bgColor,
      reason: testReason ? (testReason.type === 'test' ? 'テスト対策' : testReason.type === 'assignment' ? '課題対策' : `${testReason.title}対策`) : undefined,
    });
    remainingTime -= minTime;
  });

  // 残り時間を優先順位と最大比率に基づいて配分
  while (remainingTime > 0) {
    let allocated = false;
    
    // ランダムに開始位置を変更して配分パターンを変える
    const startIndex = Math.floor(Math.abs(Math.sin(seed)) * selectedSubjects.length);
    
    for (let j = 0; j < selectedSubjects.length; j++) {
      const i = (startIndex + j) % selectedSubjects.length;
      const subject = selectedSubjects[i];
      const currentPlan = plan.find(p => p.subject === subject.name);
      if (currentPlan) {
        const maxTime = Math.floor(totalMinutes * subject.maxRatio);
        if (currentPlan.time < maxTime && remainingTime > 0) {
          // ランダムに5分または10分を追加（条件を満たす場合）
          const baseIncrement = (Math.abs(Math.sin(seed + i)) > 0.5) ? 10 : 5;
          const increment = Math.min(baseIncrement, Math.floor(remainingTime / 5) * 5, maxTime - currentPlan.time);
          if (increment >= 5) { // 5分以上の場合のみ追加
            currentPlan.time += increment;
            remainingTime -= increment;
            allocated = true;
          }
        }
      }
    }

    if (!allocated) break;
  }

  // 残り時間がある場合は最初の教科に追加して合計を一致させる
  if (remainingTime > 0 && plan.length > 0) {
    // 残り時間を5分刻みで最初の教科に追加
    const additionalTime = Math.floor(remainingTime / 5) * 5;
    if (additionalTime > 0) {
      plan[0].time += additionalTime;
      remainingTime -= additionalTime;
    }
    // まだ残りがある場合は最後に調整
    if (remainingTime > 0) {
      plan[0].time += remainingTime;
    }
  }

  return plan.filter(p => p.time > 0).sort((a, b) => b.time - a.time);
}

export function getStudyTips(totalMinutes: number, plan: StudyPlan[]): string[] {
  const tips: string[] = [];
  
  // 時間に応じたポモドーロテクニックの提案
  if (totalMinutes >= 100) {
    tips.push('• 25分勉強→5分休憩のポモドーロテクニックがおすすめです');
  } else if (totalMinutes >= 60) {
    tips.push('• 20分勉強→5分休憩のサイクルで集中力を維持しましょう');
  } else if (totalMinutes >= 40) {
    tips.push('• 15分勉強→3分休憩のサイクルで効率よく学習しましょう');
  } else if (totalMinutes >= 25) {
    tips.push('• 10分勉強→2分休憩の短いサイクルで集中して取り組みましょう');
  } else {
    tips.push('• 短時間なので集中して一気に取り組みましょう');
  }

  // 教科数に応じたアドバイス
  if (plan.length >= 5) {
    tips.push('• 教科を切り替える際は、3-5分程度の休憩を挟むと効果的です');
  } else if (plan.length >= 3) {
    tips.push('• 苦手な教科から始めると、後半の疲れを軽減できます');
  } else if (plan.length >= 2) {
    tips.push('• 2教科の切り替え時に軽いストレッチをすると集中力が回復します');
  }

  // テスト対策がある場合
  const hasTestPrep = plan.some(p => p.reason);
  if (hasTestPrep) {
    tips.push('• テスト対策は過去問や重要ポイントの復習を中心に行いましょう');
  } else {
    tips.push('• 勉強前に今日の目標を明確にしましょう');
  }

  // 数学系教科が多い場合
  const mathSubjects = plan.filter(p => p.subject.includes('数学')).length;
  if (mathSubjects >= 2) {
    tips.push('• 数学系教科は計算ミスを防ぐため、途中で見直し時間を設けましょう');
  }

  return tips;
}