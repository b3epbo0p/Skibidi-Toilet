import { useState, useMemo } from 'react';
import { User, Task, Subject, UserData } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  List, 
  LogOut, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit2,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TaskForm from './TaskForm';

interface DashboardProps {
  userData: UserData;
  onUpdateData: (newData: UserData) => void;
  isDemo: boolean;
  user?: User;
  onLogout?: () => void;
  onLoginClick?: () => void;
}

export default function Dashboard({ 
  userData, 
  onUpdateData, 
  isDemo, 
  user, 
  onLogout,
  onLoginClick 
}: DashboardProps) {
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = useMemo(() => {
    return userData.tasks
      .filter(task => {
        const matchesSubject = activeSubjectId ? task.subjectId === activeSubjectId : true;
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = 
          filterStatus === 'all' ? true :
          filterStatus === 'active' ? !task.completed :
          task.completed;
        return matchesSubject && matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [userData.tasks, activeSubjectId, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const now = new Date().setHours(0, 0, 0, 0);
    return {
      total: userData.tasks.length,
      completed: userData.tasks.filter(t => t.completed).length,
      overdue: userData.tasks.filter(t => !t.completed && new Date(t.dueDate).getTime() < now).length,
      upcoming: userData.tasks.filter(t => !t.completed && new Date(t.dueDate).getTime() >= now).length,
    };
  }, [userData.tasks]);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      completed: false,
    };
    onUpdateData({
      ...userData,
      tasks: [...userData.tasks, newTask],
    });
    setShowTaskForm(false);
  };

  const handleEditTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    if (!editingTask) return;
    const updatedTasks = userData.tasks.map(t => 
      t.id === editingTask.id ? { ...t, ...taskData } : t
    );
    onUpdateData({ ...userData, tasks: updatedTasks });
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    onUpdateData({
      ...userData,
      tasks: userData.tasks.filter(t => t.id !== id),
    });
  };

  const toggleComplete = (id: string) => {
    onUpdateData({
      ...userData,
      tasks: userData.tasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    });
  };

  const isOverdue = (dueDate: string) => {
    const now = new Date().setHours(0, 0, 0, 0);
    return new Date(dueDate).getTime() < now;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">StudySync</h1>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveSubjectId(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeSubjectId === null ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <List className="w-5 h-5" />
              All Tasks
            </button>
            
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Subjects</p>
            </div>
            
            {userData.subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setActiveSubjectId(subject.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeSubjectId === subject.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                {subject.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          {isDemo ? (
            <button
              onClick={onLoginClick}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              Log In to Save
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold uppercase">
                  {user?.username[0]}
                </div>
                <span className="text-sm font-bold text-slate-700 truncate max-w-[100px]">{user?.username}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {activeSubjectId 
                  ? userData.subjects.find(s => s.id === activeSubjectId)?.name 
                  : 'Dashboard'}
              </h2>
              <p className="text-slate-500">
                You have {stats.upcoming} upcoming tasks.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all w-64"
                />
              </div>
              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-blue-600 text-sm font-bold uppercase tracking-wider mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-1">Completed</p>
              <p className="text-3xl font-bold text-emerald-900">{stats.completed}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <p className="text-amber-600 text-sm font-bold uppercase tracking-wider mb-1">Upcoming</p>
              <p className="text-3xl font-bold text-amber-900">{stats.upcoming}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <p className="text-rose-600 text-sm font-bold uppercase tracking-wider mb-1">Overdue</p>
              <p className="text-3xl font-bold text-rose-900">{stats.overdue}</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                  view === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                  view === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                Calendar
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 font-medium">Filter:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {view === 'list' ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => {
                    const subject = userData.subjects.find(s => s.id === task.subjectId);
                    const overdue = !task.completed && isOverdue(task.dueDate);
                    
                    return (
                      <motion.div
                        layout
                        key={task.id}
                        className={`group bg-white p-4 rounded-2xl border transition-all hover:shadow-md flex items-center gap-4 ${
                          task.completed ? 'border-slate-100 opacity-75' : 'border-slate-200'
                        } ${overdue ? 'border-rose-200 bg-rose-50/30' : ''}`}
                      >
                        <button
                          onClick={() => toggleComplete(task.id)}
                          className={`transition-colors ${
                            task.completed ? 'text-emerald-500' : overdue ? 'text-rose-400' : 'text-slate-300 hover:text-blue-500'
                          }`}
                        >
                          {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: subject?.color + '20', color: subject?.color }}>
                              {subject?.name}
                            </span>
                            <span className={`flex items-center gap-1 text-xs font-medium ${overdue ? 'text-rose-600' : 'text-slate-500'}`}>
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              {overdue && <span className="ml-1 font-bold">(Overdue)</span>}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No tasks found</h3>
                    <p className="text-slate-500">Try adjusting your filters or add a new task.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-3xl border border-slate-200 p-8"
              >
                <div className="grid grid-cols-7 gap-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest pb-4">
                      {day}
                    </div>
                  ))}
                  {/* Simple Calendar Logic for current month */}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - date.getDay() + i);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dateStr = date.toISOString().split('T')[0];
                    const dayTasks = userData.tasks.filter(t => t.dueDate === dateStr);

                    return (
                      <div 
                        key={i} 
                        className={`min-h-[100px] p-2 rounded-2xl border transition-all ${
                          isToday ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-slate-50/50 border-slate-100'
                        }`}
                      >
                        <div className={`text-sm font-bold mb-2 ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayTasks.map(task => (
                            <div 
                              key={task.id}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate ${
                                task.completed ? 'bg-slate-200 text-slate-500 line-through' : 'bg-white text-slate-700 shadow-sm border border-slate-100'
                              }`}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {(showTaskForm || editingTask) && (
          <TaskForm
            subjects={userData.subjects}
            onClose={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
            onSubmit={editingTask ? handleEditTask : handleAddTask}
            initialData={editingTask || undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
