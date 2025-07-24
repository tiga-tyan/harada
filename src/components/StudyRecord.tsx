import React, { useState } from 'react';
import { BookOpen, Clock, Calendar, TrendingUp, Award, Target, Plus, X, PieChart } from 'lucide-react';

export interface StudySession {
  id: string;
  subject: string;
  duration: number; // 分
  date: string;
  type: 'planned' | 'free' | 'extended';
  notes?: string;
}

interface StudyRecordProps {
  sessions: StudySession[];
  onAddSession: (session: Omit<StudySession, 'id'>) => void;
  onRemoveSession: (id: string) => void;
}

export function StudyRecord({ sessions, onAddSession, onRemoveSession }: StudyRecordProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSession, setNewSession] = useState({
    subject: '',
    duration: '',
    date: new Date().toISOString().split('T')[0],
    type: 'free' as const,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSession.subject && newSession.duration) {
      onAddSession({
        ...newSession,
        duration: parseInt(newSession.duration),
      });
      setNewSession({
        subject: '',
        duration: '',
        date: new Date().toISOString().split('T')[0],
        type: 'free',
        notes: '',
      });
      setShowAddForm(false);
    }
  };

  // 統計計算
  const today = new Date().toISOString().split('T')[0];
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisWeekStartStr = thisWeekStart.toISOString().split('T')[0];

  const todaySessions = sessions.filter(s => s.date === today);
  const thisWeekSessions = sessions.filter(s => s.date >= thisWeekStartStr);
  
  const todayTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const thisWeekTotal = thisWeekSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration, 0);

  // 教科別統計
  const subjectStats = sessions.reduce((acc, session) => {
    acc[session.subject] = (acc[session.subject] || 0) + session.duration;
    return acc;
  }, {} as Record<string, number>);

  const topSubjects = Object.entries(subjectStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // 最近の学習記録（最新10件）
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'planned': return 'プラン学習';
      case 'free': return '自由学習';
      case 'extended': return '延長学習';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-purple-100 text-purple-800';
      case 'extended': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 円グラフ用のデータ準備
  const pieChartData = Object.entries(subjectStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8); // 上位8教科まで表示

  const totalForPie = pieChartData.reduce((sum, [, minutes]) => sum + minutes, 0);
  
  // 円グラフの色配列
  const pieColors = [
    '#3B82F6', // blue-500
    '#EF4444', // red-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#F97316', // orange-500
    '#84CC16', // lime-500
  ];

  // SVG円グラフの作成
  const createPieChart = () => {
    if (pieChartData.length === 0) return null;

    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    let currentAngle = 0;

    const paths = pieChartData.map(([subject, minutes], index) => {
      const percentage = minutes / totalForPie;
      const angle = percentage * 2 * Math.PI;
      
      const startX = centerX + radius * Math.cos(currentAngle);
      const startY = centerY + radius * Math.sin(currentAngle);
      
      const endX = centerX + radius * Math.cos(currentAngle + angle);
      const endY = centerY + radius * Math.sin(currentAngle + angle);
      
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        'Z'
      ].join(' ');
      
      currentAngle += angle;
      
      return (
        <path
          key={subject}
          d={pathData}
          fill={pieColors[index % pieColors.length]}
          stroke="white"
          strokeWidth="2"
        />
      );
    });

    return (
      <svg width="200" height="200" className="mx-auto">
        {paths}
      </svg>
    );
  };
  return (
    <div className="space-y-6">
      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-blue-800">今日の学習時間</h3>
          </div>
          <div className="text-3xl font-bold text-blue-900 mb-1">
            {formatTime(todayTotal)}
          </div>
          <div className="text-sm text-blue-700">
            {todaySessions.length}セッション
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-green-800">今週の学習時間</h3>
          </div>
          <div className="text-3xl font-bold text-green-900 mb-1">
            {formatTime(thisWeekTotal)}
          </div>
          <div className="text-sm text-green-700">
            {thisWeekSessions.length}セッション
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-purple-800">総学習時間</h3>
          </div>
          <div className="text-3xl font-bold text-purple-900 mb-1">
            {formatTime(totalStudyTime)}
          </div>
          <div className="text-sm text-purple-700">
            {sessions.length}セッション
          </div>
        </div>
      </div>

      {/* 教科別統計 */}
      {topSubjects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 円グラフ */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">教科別学習時間</h3>
            </div>
            {pieChartData.length > 0 ? (
              <div className="flex flex-col items-center">
                {createPieChart()}
                <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                  {pieChartData.map(([subject, minutes], index) => (
                    <div key={subject} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: pieColors[index % pieColors.length] }}
                      />
                      <span className="truncate">{subject}</span>
                      <span className="text-gray-500 ml-auto">{formatTime(minutes)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">学習記録がありません</p>
              </div>
            )}
          </div>

          {/* ランキング表示 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-800">学習時間ランキング</h3>
            </div>
            <div className="space-y-3">
              {topSubjects.map(([subject, minutes], index) => (
                <div key={subject} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800 truncate">{subject}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(minutes / Math.max(...Object.values(subjectStats))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 min-w-0">
                      {formatTime(minutes)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 学習記録追加 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">学習記録を追加</h3>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            記録追加
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  教科
                </label>
                <select
                  value={newSession.subject}
                  onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">教科を選択してください</option>
                  <option value="現代の国語">現代の国語</option>
                  <option value="言語文化">言語文化</option>
                  <option value="数学Ⅰα">数学Ⅰα</option>
                  <option value="数学Ⅰβ">数学Ⅰβ</option>
                  <option value="数学A">数学A</option>
                  <option value="ECⅠ">ECⅠ</option>
                  <option value="論理表現Ⅰ">論理表現Ⅰ</option>
                  <option value="化学基礎">化学基礎</option>
                  <option value="物理基礎">物理基礎</option>
                  <option value="生物基礎">生物基礎</option>
                  <option value="歴史総合">歴史総合</option>
                  <option value="音楽">音楽</option>
                  <option value="書道">書道</option>
                  <option value="美術">美術</option>
                  <option value="保健">保健</option>
                  <option value="サイエンス情報">サイエンス情報</option>
                  <option value="自由学習">自由学習</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  学習時間（分）
                </label>
                <input
                  type="number"
                  min="1"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                  placeholder="例：30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日付
                </label>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  学習タイプ
                </label>
                <select
                  value={newSession.type}
                  onChange={(e) => setNewSession({ ...newSession, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="free">自由学習</option>
                  <option value="planned">プラン学習</option>
                  <option value="extended">延長学習</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メモ（任意）
              </label>
              <textarea
                value={newSession.notes}
                onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                placeholder="学習内容や感想など..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                追加
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 最近の学習記録 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-800">最近の学習記録</h3>
        </div>
        {recentSessions.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">まだ学習記録がありません</p>
            <p className="text-sm text-gray-400 mt-1">学習を開始して記録を蓄積しましょう！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-gray-800">{session.subject}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(session.type)}`}>
                      {getTypeLabel(session.type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(session.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(session.date).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{session.notes}"</p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveSession(session.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}