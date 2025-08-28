import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Coffee, X, Plus, Timer } from 'lucide-react';
import { StudyPlan } from '../utils/studyPlanCalculator';

interface StudyTimerProps {
  studyPlan?: StudyPlan[];
  onComplete: () => void;
}

export function StudyTimer({ studyPlan, onComplete }: StudyTimerProps) {
  // formatTime関数を最初に定義
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSubjects, setCompletedSubjects] = useState<number[]>([]);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [extensionTime, setExtensionTime] = useState('');
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);
  const [isExtending, setIsExtending] = useState(false);
  const [isFreeStudy, setIsFreeStudy] = useState(false);
  const [showFreeStudyDialog, setShowFreeStudyDialog] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [pomodoroPhase, setPomodoroPhase] = useState<'study' | 'break'>('study');
  const [pomodoroSession, setPomodoroSession] = useState(1);
  const [totalPomodoroDuration, setTotalPomodoroDuration] = useState(0);
  const [freeStudyDuration, setFreeStudyDuration] = useState('');

  // イベントハンドラー関数を最初に定義
  const handleStartFreeStudy = () => {
    setShowFreeStudyDialog(true);
  };

  const handleConfirmFreeStudy = () => {
    if (selectedDuration > 0) {
      setIsFreeStudy(true);
      setTotalPomodoroDuration(selectedDuration);
      
      if (selectedDuration === 60) {
        // 60分の場合はポモドーロモード
        setIsPomodoro(true);
        setPomodoroPhase('study');
        setPomodoroSession(1);
        setTimeRemaining(25 * 60); // 最初の25分
      } else {
        // その他の時間は通常モード
        setIsPomodoro(false);
        setTimeRemaining(selectedDuration * 60);
      }
      
      setShowFreeStudyDialog(false);
      setSelectedDuration(0);
      // 状態更新後にタイマーを開始
      setTimeout(() => {
        setIsRunning(true);
      }, 100);
    }
    
    if (freeStudyDuration && parseInt(freeStudyDuration) > 0) {
      const duration = parseInt(freeStudyDuration);
      setIsFreeStudy(true);
      setTimeRemaining(duration * 60);
      setShowFreeStudyDialog(false);
      setFreeStudyDuration('');
      // 状態更新後にタイマーを開始
      setTimeout(() => {
        setIsRunning(true);
      }, 100);
    }
  };

  const handleCancelFreeStudy = () => {
    setShowFreeStudyDialog(false);
    setSelectedDuration(0);
    setFreeStudyDuration('');
  };

  const moveToNextSubject = () => {
    if (studyPlan && currentSubjectIndex < studyPlan.length - 1) {
      setCurrentSubjectIndex(currentSubjectIndex + 1);
      setTimeRemaining(studyPlan[currentSubjectIndex + 1].time * 60);
    }
  };

  const handleTakeBreak = () => {
    setShowBreakDialog(false);
    setIsOnBreak(true);
    setBreakTimeRemaining(5 * 60); // 5分
  };

  const handleSkipBreak = () => {
    setShowBreakDialog(false);
    moveToNextSubject();
  };

  const handleExtendSubject = () => {
    setShowBreakDialog(false);
    setShowExtensionDialog(true);
  };

  const handleConfirmExtension = () => {
    const additionalMinutes = parseInt(extensionTime);
    if (additionalMinutes > 0) {
      setTimeRemaining(additionalMinutes * 60);
      setExtensionTime('');
      setShowExtensionDialog(false);
      setIsRunning(true); // 自動的にタイマーを開始
    }
  };

  const handleCancelExtension = () => {
    setExtensionTime('');
    setShowExtensionDialog(false);
    setShowBreakDialog(true); // 元の休憩ダイアログに戻る
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setIsOnBreak(false);
    setShowBreakDialog(false);
    setShowExtensionDialog(false);
    setCurrentSubjectIndex(0);
    if (studyPlan && studyPlan.length > 0) {
      setTimeRemaining(studyPlan[0].time * 60);
    }
    setCompletedSubjects([]);
    setBreakTimeRemaining(0);
    setExtensionTime('');
    setIsFreeStudy(false);
  };

  const handleSkipToNext = () => {
    if (studyPlan && currentSubjectIndex < studyPlan.length - 1) {
      const newCompleted = [...completedSubjects, currentSubjectIndex];
      setCompletedSubjects(newCompleted);
      setCurrentSubjectIndex(currentSubjectIndex + 1);
      setTimeRemaining(studyPlan[currentSubjectIndex + 1].time * 60);
    }
  };

  const handleEndBreak = () => {
    setIsOnBreak(false);
    setBreakTimeRemaining(0);
    moveToNextSubject();
  };

  const handleCompleteAllStudy = () => {
    onComplete();
  };

  const handleQuitStudy = () => {
    // タイマー状態を完全にリセット
    setIsRunning(false);
    setIsOnBreak(false);
    setShowBreakDialog(false);
    setShowExtensionDialog(false);
    setCurrentSubjectIndex(0);
    setCompletedSubjects([]);
    setBreakTimeRemaining(0);
    setExtensionTime('');
    setIsFreeStudy(false);
    setIsPomodoro(false);
    setPomodoroPhase('study');
    setPomodoroSession(1);
    setTotalPomodoroDuration(0);
    setTimeRemaining(0);
    
    // 学習プラン作成画面に戻る
    onComplete();
  };

  // 初期化処理
  useEffect(() => {
    if (studyPlan && studyPlan.length > 0) {
      setTimeRemaining(studyPlan[0].time * 60);
    }
  }, [studyPlan]);

  // 学習プランがない場合の表示
  if (!studyPlan || studyPlan.length === 0) {
    const timeOptions = [
      { value: 5, label: '5分' },
      { value: 15, label: '15分' },
      { value: 30, label: '30分' },
      { value: 60, label: '60分（ポモドーロ）' },
    ];

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* フリースタディ時間設定ダイアログ */}
        {showFreeStudyDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <Timer className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  フリースタディ
                </h3>
                <p className="text-gray-600 mb-4">
                  学習時間を選択してください
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {timeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedDuration(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedDuration === option.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="text-lg font-semibold">{option.label}</div>
                      {option.value === 60 && (
                        <div className="text-xs text-gray-500 mt-1">
                          25分勉強 + 5分休憩 × 2
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmFreeStudy}
                    disabled={selectedDuration === 0}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    開始
                  </button>
                  <button
                    onClick={handleCancelFreeStudy}
                    className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フリースタディモード */}
        {isFreeStudy ? (
          <div className="text-center mb-8">
            {/* 学習をやめるボタン */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleQuitStudy}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2 text-sm"
              >
                <X className="w-4 h-4" />
                学習をやめる
              </button>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">フリースタディ</h2>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-purple-800 mb-2">
                自由学習中
              </h3>
              <div className="text-6xl font-mono font-bold text-gray-800 mb-4">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-purple-700">
                残り時間: {Math.floor(timeRemaining / 60)}分
              </p>
            </div>
            <div className="flex justify-center gap-4 mb-6">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  開始
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  一時停止
                </button>
              )}
              
              <button
                onClick={() => {
                  setIsFreeStudy(false);
                  setIsRunning(false);
                  setTimeRemaining(0);
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                終了
              </button>
            </div>
          </div>
        ) : (
          /* 初期画面 */
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">学習タイマー</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">学習プラン</h3>
                <p className="text-sm text-blue-600 mb-4">
                  効率的な学習計画を立てて、集中して勉強しましょう
                </p>
                <button
                  onClick={onComplete}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  学習プランを作成
                </button>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="text-4xl mb-4">⏱️</div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">フリースタディ</h3>
                <p className="text-sm text-purple-600 mb-4">
                  自由な時間で好きなペースで学習できます
                </p>
                <button
                  onClick={handleStartFreeStudy}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  フリースタディ開始
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">💡 タイマー機能について</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 学習プラン: 教科ごとに時間を設定して効率的に学習</li>
                <li>• フリースタディ: 5分〜60分の時間設定でマイペースに学習</li>
                <li>• ポモドーロ: 60分選択時は25分勉強+5分休憩を2セット</li>
                <li>• 進捗管理: 学習の進み具合を視覚的に確認</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentSubject = studyPlan?.[currentSubjectIndex];
  const totalTime = studyPlan.reduce((sum, item) => sum + item.time, 0) * 60;
  const elapsedTime = studyPlan.slice(0, currentSubjectIndex).reduce((sum, item) => sum + item.time, 0) * 60 + 
                     (currentSubject ? (currentSubject.time * 60 - timeRemaining) : 0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && studyPlan) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // 現在の教科完了
            const newCompleted = [...completedSubjects, currentSubjectIndex];
            setCompletedSubjects(newCompleted);
            setIsRunning(false);
            setIsExtending(false); // 延長状態もリセット
            
            if (currentSubjectIndex < studyPlan.length - 1) {
              // 休憩確認ダイアログを表示
              setShowBreakDialog(true);
              return 0;
            } else {
              // 全て完了
              onComplete();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, studyPlan, currentSubjectIndex, completedSubjects, onComplete]);

  // 休憩タイマー
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOnBreak) {
      interval = setInterval(() => {
        setBreakTimeRemaining((prev) => {
          if (prev <= 1) {
            // 休憩終了
            setIsOnBreak(false);
            moveToNextSubject();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isOnBreak, breakTimeRemaining]);

  // フリースタディのストップウォッチ
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && (isFreeStudy || isPomodoro)) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (isPomodoro) {
              // ポモドーロモードの場合
              if (pomodoroPhase === 'study' && pomodoroSession === 1) {
                // 最初の25分完了 → 5分休憩
                setPomodoroPhase('break');
                setTimeRemaining(5 * 60);
                return 5 * 60;
              } else if (pomodoroPhase === 'break' && pomodoroSession === 1) {
                // 最初の休憩完了 → 2回目の25分
                setPomodoroPhase('study');
                setPomodoroSession(2);
                setTimeRemaining(25 * 60);
                return 25 * 60;
              } else if (pomodoroPhase === 'study' && pomodoroSession === 2) {
                // 2回目の25分完了 → 5分休憩
                setPomodoroPhase('break');
                setPomodoroSession(2);
                setTimeRemaining(5 * 60);
                return 5 * 60;
              } else {
                // 全て完了
                setIsRunning(false);
                setIsFreeStudy(false);
                setIsPomodoro(false);
                setPomodoroPhase('study');
                setPomodoroSession(1);
                return 0;
              }
            } else {
              // 通常のフリースタディ完了
              setIsRunning(false);
              setIsFreeStudy(false);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isFreeStudy, isPomodoro, pomodoroPhase, pomodoroSession]);

  // 初期化処理
  useEffect(() => {
    if (studyPlan && studyPlan.length > 0) {
      setTimeRemaining(studyPlan[0].time * 60);
    }
  }, [studyPlan]);

  // フリースタディのストップウォッチ
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && isFreeStudy) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFreeStudy(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isFreeStudy]);

  const progressPercentage = (elapsedTime / totalTime) * 100;

  // 全教科完了時の表示
  if (currentSubjectIndex >= studyPlan.length) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-lg p-12 text-center">
        <div className="text-8xl mb-6">🎉</div>
        <div className="text-6xl mb-4">🙌</div>
        <h2 className="text-4xl font-bold text-green-800 mb-4">
          お疲れさまでした！
        </h2>
        <div className="text-2xl mb-6">✨ 🎊 ✨</div>
        <p className="text-xl text-green-700 mb-6">
          今日の学習プランを完了しました！
        </p>
        <div className="bg-white bg-opacity-70 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">学習成果</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span>完了した教科数:</span>
              <span className="font-bold">{studyPlan.length}教科</span>
            </div>
            <div className="flex justify-between">
              <span>総学習時間:</span>
              <span className="font-bold">{studyPlan.reduce((sum, item) => sum + item.time, 0)}分</span>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            {studyPlan.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {item.subject}
                </span>
                <span>{item.time}分</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleCompleteAllStudy}
          className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-semibold text-lg shadow-lg"
        >
          新しい学習プランを作成
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* 学習をやめるボタン（学習プランがある場合のみ表示） */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleQuitStudy}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2 text-sm"
        >
          <X className="w-4 h-4" />
          学習をやめる
        </button>
      </div>

      {/* 休憩確認ダイアログ */}
      {showBreakDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <Coffee className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {studyPlan[currentSubjectIndex].subject} 完了！
              </h3>
              <p className="text-gray-600 mb-6">
                5分間の休憩を取りますか？
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleExtendSubject}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  延長して続ける
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleTakeBreak}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Coffee className="w-4 h-4" />
                    5分休憩
                  </button>
                  <button
                    onClick={handleSkipBreak}
                    className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    次の教科へ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 延長時間設定ダイアログ */}
      {showExtensionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <Plus className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {studyPlan[currentSubjectIndex].subject} を延長
              </h3>
              <p className="text-gray-600 mb-4">
                何分延長しますか？
              </p>
              <div className="mb-6">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={extensionTime}
                  onChange={(e) => setExtensionTime(e.target.value)}
                  placeholder="例：15"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg text-center"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">1〜60分で入力してください</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmExtension}
                  disabled={!extensionTime || parseInt(extensionTime) <= 0}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  開始
                </button>
                <button
                  onClick={handleCancelExtension}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 休憩中の表示 */}
      {isOnBreak && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-center">
          <Coffee className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-blue-800 mb-2">休憩中</h3>
          <div className="text-4xl font-mono font-bold text-blue-600 mb-4">
            {formatTime(breakTimeRemaining)}
          </div>
          <p className="text-sm text-blue-700 mb-4">
            リラックスして、次の教科に備えましょう
          </p>
          <button
            onClick={handleEndBreak}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
          >
            <X className="w-4 h-4" />
            休憩を終了
          </button>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">学習タイマー</h2>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">
          全体の進捗: {Math.round(progressPercentage)}% ({currentSubjectIndex + 1}/{studyPlan.length})
        </p>
      </div>

      {!isOnBreak && (
        <div className={`${currentSubject.bgColor} rounded-xl p-6 mb-6 text-center`}>
          {currentSubject.subject === '自由に勉強' ? (
            <>
              <h3 className={`text-2xl font-bold ${currentSubject.color} mb-2`}>
                自由学習タイム
              </h3>
              <div className="text-6xl font-mono font-bold text-gray-800 mb-4">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-600">
                好きなペースで学習しましょう
              </p>
            </>
          ) : (
            <>
              <h3 className={`text-2xl font-bold ${currentSubject.color} mb-2`}>
                {currentSubject.subject}
              </h3>
              {currentSubject.reason && (
                <p className="text-sm text-red-700 mb-4">{currentSubject.reason}</p>
              )}
              <div className="text-6xl font-mono font-bold text-gray-800 mb-4">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-600">
                予定時間: {currentSubject.time}分
              </p>
            </>
          )}
        </div>
      )}

      {!isOnBreak && (
        <div className="flex justify-center gap-4 mb-6">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              開始
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Pause className="w-5 h-5" />
              一時停止
            </button>
          )}
          
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            リセット
          </button>

          {currentSubjectIndex < studyPlan.length - 1 && (
            <button
              onClick={handleSkipToNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              次の教科へ
            </button>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-medium text-gray-800">学習予定</h4>
        {studyPlan[0].subject === '自由に勉強' ? (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <p className="text-purple-700 font-medium">自由学習モード</p>
            <p className="text-sm text-purple-600 mt-1">
              設定した時間内で自由に学習してください
            </p>
          </div>
        ) : (
          studyPlan.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === currentSubjectIndex
                  ? 'bg-blue-100 border-2 border-blue-300'
                  : completedSubjects.includes(index)
                  ? 'bg-green-100 border border-green-300'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {completedSubjects.includes(index) && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <span className={`font-medium ${
                  index === currentSubjectIndex ? 'text-blue-800' :
                  completedSubjects.includes(index) ? 'text-green-800' : 'text-gray-700'
                }`}>
                  {item.subject}
                </span>
                {item.reason && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                    {item.reason}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">{item.time}分</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}