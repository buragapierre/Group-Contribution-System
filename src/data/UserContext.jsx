import { createContext, useContext, useState } from 'react';
import { groups, classes, studentProfiles } from './mockData';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedLeaderGroupId, setSelectedLeaderGroupId] = useState(null);

  const login = (user) => {
    const profile = user.role === 'student'
      ? studentProfiles.find(p => p.userId === user.id)
      : null;

    const leaderGroups = groups.filter(g => g.leaderId === user.id);
    const leaderGroup = leaderGroups[0] || null;
    const memberGroups = groups.filter(g => g.members.includes(user.id));
    const primaryGroup = memberGroups[0] || null;

    const userClasses = user.role === 'professor'
      ? classes.filter(c => c.professorId === user.id)
      : classes.filter(c => c.studentIds.includes(user.id));

    setCurrentUser({
      ...user,
      profile,
      isLeader: !!leaderGroup,
      leaderGroups,
      leaderGroupId: leaderGroup?.id || null,
      leaderGroup: leaderGroup || null,
      groupId: primaryGroup?.id || null,
      group: primaryGroup || null,
      classes: userClasses,
    });
    setSelectedLeaderGroupId(leaderGroup?.id || null);
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedClassId(null);
    setSelectedLeaderGroupId(null);
  };

  const getSelectedClass = () => {
    if (!selectedClassId) return null;
    return classes.find(c => c.id === selectedClassId) || null;
  };

  const getStudentClassIds = () => {
    if (!currentUser || currentUser.role !== 'student') return [];
    return classes.filter(c => c.studentIds.includes(currentUser.id)).map(c => c.id);
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      login,
      logout,
      selectedClassId,
      setSelectedClassId,
      selectedLeaderGroupId,
      setSelectedLeaderGroupId,
      getSelectedClass,
      getStudentClassIds,
    }}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
