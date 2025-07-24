import React, { useState } from 'react';
import { Clock, BookOpen, CheckCircle, Calendar as CalendarIcon, Timer, Pencil, HelpCircle, X } from 'lucide-react';
import { Calendar, type Event } from './components/Calendar';
import { StudyTimer } from './components/StudyTimer';
import { StudyRecord, type StudySession } from './components/StudyRecord';
import { calculateStudyPlan, getStudyTips, StudyPlan, allSubjects } from './utils/studyPlanCalculator';

type Tab = 'planner' | 'calendar' | 'timer' | 'record';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('planner');
  const [studyTime, setStudyTime] = useState<string>('');
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);
  const [numberOfSubjects, setNumberOfSubjects] = useState<string>('');
  const [studyPlan, setStudyPlan] = useState<StudyPlan[]>([]);
  const [showPlan, setShowPlan] = useState<boolean>(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [showRecommendation, setShowRecommendation] = useState<boolean>(false);
  const [recommendedSubjects, setRecommendedSubjects] = useState<string[]>([]);
  const [showUsageGuide, setShowUsageGuide] = useState<boolean>(false);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);

  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents([...events, newEvent]);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const handleAddStudySession = (sessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: Date.now().toString(),
    };
    setStudySessions([...studySessions, newSession]);
  };

  const handleRemoveStudySession = (id: string) => {
    setStudySessions(studySessions.filter(session => session.id !== id));
  };

  const getUpcomingSubjects = () => {
    const today = new Date();
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= threeDaysLater && event.subject;
    });

    const upcomingSubjects = upcomingEvents
      .map(event => event.subject!)
      .filter((subject, index, array) => array.indexOf(subject) === index); // 重複除去

    return upcomingSubjects.filter(subject => !preferredSubjects.includes(subject));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseInt(studyTime);
    if (minutes > 0) {
      // 3日以内の予定教科をチェック
      const upcomingSubjects = getUpcomingSubjects();
      
      if (upcomingSubjects.length > 0) {
        setRecommendedSubjects(upcomingSubjects);
        setShowRecommendation(true);
        return;
      }

      // 再提案時に異なる結果を得るためのランダムシード
      const randomSeed = Date.now() + Math.random();
      const plan = calculateStudyPlan(minutes, events, preferredSubjects, numberOfSubjects ? parseInt(numberOfSubjects) : undefined, randomSeed);
      setStudyPlan(plan);
      setShowPlan(true);
    }
  };

  const handleAcceptRecommendation = () => {
    // おすすめ教科を特にやりたい教科に追加
    const newPreferredSubjects = [...preferredSubjects, ...recommendedSubjects];
    setPreferredSubjects(newPreferredSubjects);
    
    // 教科数を自動的に増やす（現在の設定 + おすすめ教科数）
    const currentSubjectCount = numberOfSubjects ? parseInt(numberOfSubjects) : 0;
    const newSubjectCount = Math.max(currentSubjectCount, newPreferredSubjects.length);
    setNumberOfSubjects(newSubjectCount.toString());
    
    setShowRecommendation(false);
    
    // プラン作成を実行
    const minutes = parseInt(studyTime);
    const randomSeed = Date.now() + Math.random();
    const plan = calculateStudyPlan(minutes, events, newPreferredSubjects, newSubjectCount, randomSeed);
    setStudyPlan(plan);
    setShowPlan(true);
  };

  const handleDeclineRecommendation = () => {
    setShowRecommendation(false);
    
    // 通常のプラン作成を実行
    const minutes = parseInt(studyTime);
    const randomSeed = Date.now() + Math.random();
    const plan = calculateStudyPlan(minutes, events, preferredSubjects, numberOfSubjects ? parseInt(numberOfSubjects) : undefined, randomSeed);
    setStudyPlan(plan);
    setShowPlan(true);
  };
  const handleStartStudy = () => {
    setActiveTab('timer');
  };

  const handleStudyComplete = () => {
    setShowPlan(false);
    setStudyTime('');
    setPreferredSubjects([]);
    setNumberOfSubjects('');
    setActiveTab('planner');
  };

  const totalTime = studyPlan.reduce((sum, item) => sum + item.time, 0);
  const studyTips = showPlan ? getStudyTips(totalTime, studyPlan) : [];

  const tabs = [
    { id: 'planner' as Tab, label: '学習プラン', icon: Pencil },
    { id: 'calendar' as Tab, label: '予定管理', icon: CalendarIcon },
    { id: 'timer' as Tab, label: 'タイマー', icon: Timer },
    { id: 'record' as Tab, label: '勉強の記録', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowUsageGuide(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              使い方説明
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">StudyFlow</h1>
          </div>
          <p className="text-gray-600 text-lg">
            スキマ時間でも長時間でも、あなたの学習をサポートします
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* 使い方説明ダイアログ */}
          {showUsageGuide && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    StudyFlow 使い方説明
                  </h3>
                  <button
                    onClick={() => setShowUsageGuide(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      <Pencil className="w-5 h-5" />
                      1. 学習プラン作成
                    </h4>
                    <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm text-gray-700">• <strong>勉強時間</strong>：今日勉強したい時間を分単位で入力</p>
                      <p className="text-sm text-gray-700">• <strong>自由に勉強する</strong>：教科を決めずに自由学習タイマーを開始</p>
                      <p className="text-sm text-gray-700">• <strong>特にやりたい教科</strong>：優先的に学習したい教科を選択（任意）</p>
                      <p className="text-sm text-gray-700">• <strong>教科数</strong>：勉強する教科数を指定（任意、自動調整も可能）</p>
                      <p className="text-sm text-gray-700">• <strong>プラン作成</strong>：AIが最適な学習プランを提案</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      2. 予定管理
                    </h4>
                    <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm text-gray-700">• <strong>予定追加</strong>：テスト、課題、その他の予定を登録</p>
                      <p className="text-sm text-gray-700">• <strong>教科連携</strong>：予定に教科を設定すると学習プランに反映</p>
                      <p className="text-sm text-gray-700">• <strong>自動おすすめ</strong>：3日以内の予定がある教科を自動提案</p>
                      <p className="text-sm text-gray-700">• <strong>優先度調整</strong>：テストが近い教科は自動的に優先される</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <Timer className="w-5 h-5" />
                      3. 学習タイマー
                    </h4>
                    <div className="bg-green-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm text-gray-700">• <strong>タイマー機能</strong>：各教科の時間を計測して集中学習</p>
                      <p className="text-sm text-gray-700">• <strong>休憩管理</strong>：教科完了時に5分休憩を提案</p>
                      <p className="text-sm text-gray-700">• <strong>延長機能</strong>：もう少し勉強したい時は時間延長可能</p>
                      <p className="text-sm text-gray-700">• <strong>進捗表示</strong>：全体の進捗と完了状況を視覚的に確認</p>
                      <p className="text-sm text-gray-700">• <strong>フリースタディ</strong>：自由学習モードでストップウォッチ機能</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-orange-700 mb-3">
                      💡 効果的な使い方のコツ
                    </h4>
                    <div className="bg-orange-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm text-gray-700">• 予定を事前に登録しておくと、自動的に対策が学習プランに含まれます</p>
                      <p className="text-sm text-gray-700">• 短時間（30分以下）なら2-3教科、長時間なら多教科で効率的に学習</p>
                      <p className="text-sm text-gray-700">• 休憩時間を活用して次の教科の準備をしましょう</p>
                      <p className="text-sm text-gray-700">• 集中できない時はフリースタディで自分のペースで学習</p>
                      <p className="text-sm text-gray-700">• 完了後は新しいプランを作成して継続学習が可能</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowUsageGuide(false)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* タブナビゲーション */}
          <div className="bg-white rounded-2xl shadow-lg mb-8">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-8">
              {/* 学習プランタブ */}
              {activeTab === 'planner' && (
                <div>
                  {/* おすすめ教科ダイアログ */}
                  {showRecommendation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                          <div className="text-4xl mb-4">📚</div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            近日中の予定があります！
                          </h3>
                          <p className="text-gray-600 mb-4">
                            3日以内に以下の教科の予定があります。学習プランに含めることをおすすめします。
                          </p>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <h4 className="font-medium text-yellow-800 mb-2">おすすめ教科:</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {recommendedSubjects.map((subject, index) => {
                                const relatedEvents = events.filter(event => 
                                  event.subject === subject && 
                                  new Date(event.date) >= new Date() && 
                                  new Date(event.date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                                );
                                return (
                                  <li key={index} className="flex justify-between">
                                    <span>• {subject}</span>
                                    <span className="text-xs">
                                      {relatedEvents.map(event => {
                                        const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                        return daysUntil === 0 ? '今日' : daysUntil === 1 ? '明日' : `${daysUntil}日後`;
                                      }).join(', ')}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleAcceptRecommendation}
                              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              含めて作成
                            </button>
                            <button
                              onClick={handleDeclineRecommendation}
                              className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                            >
                              このまま作成
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <Clock className="w-6 h-6 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-800">今日の勉強時間</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="studyTime" className="block text-sm font-medium text-gray-700 mb-2">
                          勉強時間（分）
                        </label>
                        <input
                          type="number"
                          id="studyTime"
                          min="1"
                          max="480"
                          value={studyTime}
                          onChange={(e) => setStudyTime(e.target.value)}
                          placeholder="例：60"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          特にやりたい教科（任意）
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                          {allSubjects.map((subject) => (
                            <label key={subject.name} className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={preferredSubjects.includes(subject.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPreferredSubjects([...preferredSubjects, subject.name]);
                                  } else {
                                    setPreferredSubjects(preferredSubjects.filter(s => s !== subject.name));
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{subject.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="numberOfSubjects" className="block text-sm font-medium text-gray-700 mb-2">
                          何教科勉強したいか（任意）
                        </label>
                        <select
                          id="numberOfSubjects"
                          value={numberOfSubjects}
                          onChange={(e) => setNumberOfSubjects(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        >
                          <option value="">自動で決める</option>
                          <option value="1">1教科</option>
                          <option value="2">2教科</option>
                          <option value="3">3教科</option>
                          <option value="4">4教科</option>
                          <option value="5">5教科</option>
                          <option value="6">6教科</option>
                          <option value="7">7教科</option>
                          <option value="8">8教科</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                      >
                        <Pencil className="w-5 h-5" />
                        プラン作成
                      </button>
                    </div>
                  </form>

                  {showPlan && studyPlan.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-800">
                          おすすめ学習プラン（合計 {totalTime} 分）
                        </h2>
                      </div>

                      <div className="grid gap-4 mb-8">
                        {studyPlan.map((item, index) => (
                          <div key={index} className="relative">
                            <div className={`${item.bgColor} rounded-lg p-4 border-l-4 border-current`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`text-2xl font-bold ${item.color}`}>
                                    {item.subject}
                                  </span>
                                  <span className="text-lg text-gray-600">
                                    {item.time} 分
                                  </span>
                                  {item.reason && (
                                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                      {item.reason}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className={`text-sm font-medium ${item.color}`}>
                                    {Math.round((item.time / totalTime) * 100)}%
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 bg-white bg-opacity-50 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-1000 ${item.color.replace('text-', 'bg-')}`}
                                  style={{ width: `${(item.time / totalTime) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-4 mb-6">
                        <button
                          onClick={handleStartStudy}
                          className="flex-1 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-lg flex items-center justify-center gap-3"
                        >
                          <Timer className="w-6 h-6" />
                          学習スタート
                        </button>
                        <button
                          onClick={() => {
                            handleSubmit(new Event('click') as any);
                          }}
                          className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                        >
                          <Pencil className="w-5 h-5" />
                          再提案
                        </button>
                      </div>

                      {/* テスト予定がある場合の通知 */}
                      {(() => {
                        const today = new Date();
                        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                        const upcomingTests = events.filter(event => {
                          const eventDate = new Date(event.date);
                          return event.type === 'test' && eventDate >= today && eventDate <= nextWeek;
                        });
                        
                        if (upcomingTests.length > 0) {
                          return (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                📚 近日中のテスト対策を優先しています
                              </h4>
                              <ul className="text-sm text-red-700 space-y-1">
                                {upcomingTests.map((test, index) => {
                                  const daysUntil = Math.ceil((new Date(test.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                  return (
                                    <li key={index}>
                                      • {test.title} ({test.subject}) - 
                                      {daysUntil === 0 && <span className="font-bold"> 今日</span>}
                                      {daysUntil === 1 && <span className="font-bold"> 明日</span>}
                                      {daysUntil > 1 && <span> あと{daysUntil}日</span>}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="p-4 bg-gray-50 rounded-lg mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">💡 学習のコツ</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {studyTips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 予定管理タブ */}
              {activeTab === 'calendar' && (
                <Calendar
                  events={events}
                  onAddEvent={handleAddEvent}
                  onRemoveEvent={handleRemoveEvent}
                />
              )}

              {/* タイマータブ */}
              {activeTab === 'timer' && (
                <StudyTimer
                  studyPlan={studyPlan.length > 0 ? studyPlan : undefined}
                  onComplete={handleStudyComplete}
                />
              )}

              {/* 勉強の記録タブ */}
              {activeTab === 'record' && (
                <StudyRecord
                  sessions={studySessions}
                  onAddSession={handleAddStudySession}
                  onRemoveSession={handleRemoveStudySession}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;