import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, X, AlertTriangle, BookOpen } from 'lucide-react';

export interface Event {
  id: string;
  title: string;
  date: string;
  type: 'test' | 'assignment' | 'other';
  subject?: string;
}

interface CalendarProps {
  events: Event[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onRemoveEvent: (id: string) => void;
}

const eventTypeColors = {
  test: 'bg-red-100 text-red-800 border-red-200',
  assignment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  other: 'bg-blue-100 text-blue-800 border-blue-200',
};

const eventTypeLabels = {
  test: 'テスト',
  assignment: '課題',
  other: 'その他',
};

export function Calendar({ events, onAddEvent, onRemoveEvent }: CalendarProps) {
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    type: '' as any,
    subject: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date && newEvent.type) {
      onAddEvent(newEvent);
      setNewEvent({ title: '', date: '', type: '' as any, subject: '' });
      setShowForm(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events
    .filter(event => event.date >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const getEventPriority = (event: Event) => {
    const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (event.type === 'test' && daysUntil <= 3) return 'urgent';
    if (event.type === 'test' && daysUntil <= 7) return 'important';
    return 'normal';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-800">予定管理</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          予定追加
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                予定名
              </label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="例：数学テスト"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                日付
              </label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                種類
              </label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">種類を選択してください</option>
                <option value="test">テスト</option>
                <option value="assignment">課題</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                教科（任意）
              </label>
              <select
                value={newEvent.subject}
                onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">教科を選択（任意）</option>
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
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              追加
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          今後の予定
        </h3>
        {upcomingEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">予定がありません</p>
        ) : (
          upcomingEvents.map((event) => {
            const priority = getEventPriority(event);
            const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div
                key={event.id}
                className={`p-3 rounded-lg border ${eventTypeColors[event.type]} ${
                  priority === 'urgent' ? 'ring-2 ring-red-300' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {priority === 'urgent' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      <span className="font-medium">{event.title}</span>
                      <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                        {eventTypeLabels[event.type]}
                      </span>
                    </div>
                    <div className="text-sm mt-1">
                      {new Date(event.date).toLocaleDateString('ja-JP')}
                      {daysUntil === 0 && <span className="text-red-600 font-medium ml-2">今日</span>}
                      {daysUntil === 1 && <span className="text-orange-600 font-medium ml-2">明日</span>}
                      {daysUntil > 1 && <span className="text-gray-600 ml-2">あと{daysUntil}日</span>}
                      {event.subject && <span className="text-gray-600 ml-2">({event.subject})</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveEvent(event.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}