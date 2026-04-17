import React, { useState, useMemo, useRef } from 'react';
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
  LayoutDashboard,
  Camera,
  PlusCircle,
  Flame,
  Award,
  Waves,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TaskForm from './TaskForm';
import SubjectForm from './SubjectForm';
import ReflectionModal from './ReflectionModal';

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
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [reflectingTask, setReflectingTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAddSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: Math.random().toString(36).substr(2, 9),
    };
    onUpdateData({
      ...userData,
      subjects: [...userData.subjects, newSubject],
    });
    setShowSubjectForm(false);
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

  const handleCompleteWithReflection = (mood: string, reflection: string, points: number) => {
    if (!reflectingTask) return;
    
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = userData.streak || 0;
    
    // Simple streak logic: if yesterday was the last completion, increment. If today, keep. Otherwise, reset if missed a day (simplified)
    if (userData.lastCompletionDate !== todayStr) {
      newStreak += 1;
    }

    const updatedTasks = userData.tasks.map(t => 
      t.id === reflectingTask.id ? { 
        ...t, 
        completed: true, 
        mood, 
        reflection, 
        pointsEarned: points 
      } : t
    );

    onUpdateData({
      ...userData,
      tasks: updatedTasks,
      points: (userData.points || 0) + points,
      streak: newStreak,
      lastCompletionDate: todayStr
    });
    
    setReflectingTask(null);
  };

  const toggleComplete = (id: string) => {
    const task = userData.tasks.find(t => t.id === id);
    if (task && !task.completed) {
      // Open reflection modal for finishing a task
      setReflectingTask(task);
    } else {
      // Toggle back to incomplete
      onUpdateData({
        ...userData,
        tasks: userData.tasks.map(t => 
          t.id === id ? { ...t, completed: false, pointsEarned: 0 } : t
        ),
      });
    }
  };

  const handleProfilePictureClick = () => {
    if (!isDemo) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateData({
          ...userData,
          profilePicture: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const isOverdue = (dueDate: string) => {
    const now = new Date().setHours(0, 0, 0, 0);
    return new Date(dueDate).getTime() < now;
  };

  const handleMoodSelect = (mood: string) => {
    onUpdateData({
      ...userData,
      currentMood: mood
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
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
            
            <div className="pt-4 pb-2 flex items-center justify-between px-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subjects</p>
              {!isDemo && (
                <button 
                  onClick={() => setShowSubjectForm(true)}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  title="Add Subject"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              )}
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

          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-xs text-slate-500">
            <p className="font-bold text-slate-700 mb-1">Today's Tip:</p>
            "Take a 5-minute break for every 25 minutes of focus to keep your energy high!"
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100 bg-white">
          {isDemo ? (
            <button
              onClick={onLoginClick}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              Log In to Save
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div 
                  onClick={handleProfilePictureClick}
                  className="relative group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold uppercase overflow-hidden border-2 border-white shadow-sm">
                    {userData.profilePicture ? (
                      <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.username[0]
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-slate-700 block truncate">{user?.username}</span>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Scholar</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-6 shadow-sm z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-2xl">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="font-black text-orange-700">{userData.streak || 0} Day Streak!</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl">
                <Award className="w-4 h-4 text-blue-500" />
                <span className="font-black text-blue-700">{userData.points || 0} XP</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                {['😊', '😐', '😫', '😴'].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleMoodSelect(m)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      userData.currentMood === m ? 'bg-white shadow-md scale-110' : 'hover:bg-white/50 grayscale'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="h-4 w-px bg-slate-200 mx-2" />
              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                NEW TASK
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Hi {user?.username || 'Guest'}! 👋
              </h2>
              <p className="text-slate-500 font-medium">
                {stats.upcoming > 0 
                  ? `Focus on your ${stats.upcoming} tasks today.` 
                  : "You've cleared your schedule! Time to relax? 🍹"}
              </p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Find a task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all w-64 font-medium"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Energy Level visualization (Waves) */}
          {stats.total > 0 && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
              <Waves className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-black">Weekly Progress</h3>
                  <p className="text-blue-100 text-sm font-medium">You've finished {Math.round((stats.completed / stats.total) * 100)}% of your tasks!</p>
                  <div className="w-64 h-3 bg-white/20 rounded-full overflow-hidden mt-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.completed / (stats.total || 1)) * 100}%` }}
                      className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 text-center min-w-[100px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Level</p>
                    <p className="text-2xl font-black">{Math.floor((userData.points || 0) / 100) + 1}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 text-center min-w-[100px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Next Reward</p>
                    <p className="text-2xl font-black">{100 - ((userData.points || 0) % 100)} XP</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setView('list')}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                  view === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                  view === 'calendar' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Calendar
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Showing</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white border border-slate-200 py-2 px-4 rounded-xl text-xs font-black text-slate-700 outline-none cursor-pointer hover:border-blue-400 transition-colors shadow-sm"
              >
                <option value="all">EVERYTHING</option>
                <option value="active">TO DO</option>
                <option value="completed">DONE</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {view === 'list' ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => {
                    const subject = userData.subjects.find(s => s.id === task.subjectId);
                    const overdue = !task.completed && isOverdue(task.dueDate);
                    
                    return (
                      <motion.div
                        layout
                        key={task.id}
                        className={`group bg-white p-5 rounded-[1.5rem] border transition-all hover:scale-[1.01] flex items-center gap-5 ${
                          task.completed ? 'border-slate-100 bg-slate-50/50 grayscale' : 'border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-50'
                        } ${overdue ? 'border-rose-200 bg-rose-50/20' : ''}`}
                      >
                        <button
                          onClick={() => toggleComplete(task.id)}
                          className={`transition-all active:scale-75 ${
                            task.completed ? 'text-emerald-500' : overdue ? 'text-rose-400' : 'text-slate-200 group-hover:text-blue-500'
                          }`}
                        >
                          {task.completed ? (
                            <div className="bg-emerald-100 p-1 rounded-lg">
                              <CheckCircle2 className="w-7 h-7" />
                            </div>
                          ) : (
                            <Circle className="w-7 h-7 stroke-[1.5]" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className={`font-black text-lg truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-blue-600 transition-colors'}`}>
                              {task.title}
                            </h3>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                              task.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' :
                              task.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' :
                              'bg-rose-50 text-rose-600'
                            }`}>
                              {task.difficulty}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg" style={{ backgroundColor: subject?.color + '15', color: subject?.color }}>
                              {subject?.name}
                            </span>
                            <span className={`flex items-center gap-1.5 text-xs font-bold ${overdue ? 'text-rose-500' : 'text-slate-400'}`}>
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              {overdue && <AlertCircle className="w-3.5 h-3.5 ml-1" />}
                            </span>
                            {task.completed && task.mood && (
                              <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                <span className="text-sm">{task.mood}</span>
                                <span className="font-bold text-slate-500">+{task.pointsEarned} XP</span>
                              </span>
                            )}
                          </div>
                          
                          {task.completed && task.reflection && (
                            <div className="mt-3 p-3 bg-white/80 rounded-xl border border-slate-100 flex items-start gap-2">
                              <MessageSquare className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                              <p className="text-xs text-slate-500 italic leading-relaxed">"{task.reflection}"</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-10 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Search className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Nothing here yet!</h3>
                    <p className="text-slate-400 font-medium">Add a task to start earning points.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm"
              >
                <div className="grid grid-cols-7 gap-6">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pb-6">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - date.getDay() + i);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dateStr = date.toISOString().split('T')[0];
                    const dayTasks = userData.tasks.filter(t => t.dueDate === dateStr);

                    return (
                      <div 
                        key={i} 
                        className={`min-h-[120px] p-3 rounded-2xl border transition-all ${
                          isToday ? 'bg-blue-50 border-blue-200 ring-4 ring-blue-50 shadow-inner' : 'bg-slate-50/50 border-transparent hover:border-slate-200'
                        }`}
                      >
                        <div className={`text-sm font-black mb-3 ${isToday ? 'text-blue-600' : 'text-slate-300'}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1.5">
                          {dayTasks.map(task => (
                            <div 
                              key={task.id}
                              className={`text-[10px] font-black px-2 py-1 rounded-lg truncate flex items-center gap-1 ${
                                task.completed ? 'bg-slate-100 text-slate-400 line-through' : 'bg-white text-slate-700 shadow-sm border border-slate-200'
                              }`}
                              title={task.title}
                            >
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: userData.subjects.find(s => s.id === task.subjectId)?.color }} />
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
        {showSubjectForm && (
          <SubjectForm 
            onClose={() => setShowSubjectForm(false)}
            onSubmit={handleAddSubject}
          />
        )}
        {reflectingTask && (
          <ReflectionModal
            task={reflectingTask}
            username={user?.username || 'Guest'}
            onClose={() => setReflectingTask(null)}
            onSubmit={handleCompleteWithReflection}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


