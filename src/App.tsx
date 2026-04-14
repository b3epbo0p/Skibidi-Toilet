/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { User, Task, Subject, UserData } from './types';
import { getCurrentUser, logout, updateUserData, getDemoData } from './lib/storage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userData, setUserData] = useState<UserData>(getDemoData());
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setUserData(currentUser.data);
      setIsDemo(false);
    } else {
      setUserData(getDemoData());
      setIsDemo(false);
    }
    setIsAuthReady(true);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setUserData(loggedInUser.data);
    setIsDemo(false);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setUserData(getDemoData());
    setIsDemo(false);
  };

  const handleUpdateData = (newData: UserData) => {
    setUserData(newData);
    if (user && !isDemo) {
      updateUserData(user.username, newData);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <AnimatePresence mode="wait">
        {!user && isDemo ? (
          <motion.div
            key="auth-or-demo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative">
              {/* Demo Banner */}
              <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm font-medium">
                You are viewing the demo. <button onClick={() => setIsDemo(false)} className="underline font-bold hover:text-blue-100 transition-colors">Sign in</button> to save your progress.
              </div>
              
              {!isDemo ? (
                <Auth onLogin={handleLogin} onBackToDemo={() => setIsDemo(true)} />
              ) : (
                <Dashboard 
                  userData={userData} 
                  onUpdateData={handleUpdateData} 
                  isDemo={true}
                  onLoginClick={() => setIsDemo(false)}
                />
              )}
            </div>
          </motion.div>
        ) : user ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard 
              userData={userData} 
              onUpdateData={handleUpdateData} 
              isDemo={false}
              user={user}
              onLogout={handleLogout}
            />
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Auth onLogin={handleLogin} onBackToDemo={() => setIsDemo(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

