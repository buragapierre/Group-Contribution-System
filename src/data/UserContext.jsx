import { createContext, useContext, useState } from 'react';
import { groups } from './mockData';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (user) => {
    const leaderGroup = groups.find(g => g.leaderId === user.id);
    const memberGroups = groups.filter(g => g.members.includes(user.id));
    const primaryGroup = memberGroups[0] || null;

    setCurrentUser({
      ...user,
      isLeader: !!leaderGroup,
      leaderGroupId: leaderGroup?.id || null,
      leaderGroup: leaderGroup || null,
      groupId: primaryGroup?.id || null,
      group: primaryGroup || null,
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout }}>
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
