import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { fetchStudentClasses, fetchClasses } from '../services/classes';
import { fetchLeaderGroups, fetchMemberGroups } from '../services/groups';
import { verifySessionViaApi } from '../lib/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedLeaderGroupId, setSelectedLeaderGroupId] = useState(null);

  const enrichAndSetUser = async (profile) => {
    try {
      let userClasses = [];
      let leaderGroups = [];
      let memberGroups = [];

      if (profile.role === 'professor') {
        userClasses = await fetchClasses(profile.id);
      } else if (profile.role === 'student') {
        userClasses = await fetchStudentClasses(profile.id);
        leaderGroups = await fetchLeaderGroups(profile.id);
        memberGroups = await fetchMemberGroups(profile.id);
      }

      const leaderGroup = leaderGroups[0] || null;
      const primaryGroup = memberGroups[0] || null;

      setCurrentUser({
        ...profile,
        isLeader: !!leaderGroup,
        leaderGroups,
        leaderGroupId: leaderGroup?.id || null,
        leaderGroup: leaderGroup || null,
        groupId: primaryGroup?.id || null,
        group: primaryGroup || null,
        classes: userClasses,
      });
      setSelectedLeaderGroupId(leaderGroup?.id || null);
    } catch {
      setCurrentUser({
        ...profile,
        isLeader: false,
        leaderGroups: [],
        leaderGroupId: null,
        leaderGroup: null,
        groupId: null,
        group: null,
        classes: [],
      });
    }
    setLoading(false);
  };

  const fetchAndEnrichUser = async (authUser) => {
    try {
      // Verify the session with the backend when it is reachable.
      // A 401 means the token is invalid -> sign out.
      // A network failure means the backend is down -> fall back to Supabase.
      try {
        const { profile: verified } = await verifySessionViaApi();
        if (verified) {
          await enrichAndSetUser(verified);
          return;
        }
      } catch (verifyErr) {
        if (verifyErr.status === 401 || verifyErr.status === 403) {
          await supabase.auth.signOut();
          setCurrentUser(null);
          setLoading(false);
          return;
        }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profile) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      await enrichAndSetUser(profile);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAndEnrichUser(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchAndEnrichUser(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (authUser) => {
    try {
      const { profile: verified } = await verifySessionViaApi();
      if (verified) {
        await enrichAndSetUser(verified);
        return;
      }
    } catch (verifyErr) {
      if (verifyErr.status === 401 || verifyErr.status === 403) {
        await supabase.auth.signOut();
        setCurrentUser(null);
        return;
      }
      // Backend unreachable — fall back to direct profile fetch below
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!profile) return;

    await enrichAndSetUser(profile);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSelectedClassId(null);
    setSelectedLeaderGroupId(null);
  };

  useEffect(() => {
    if (!currentUser) return;

    let timeout;
    const TIMEOUT_DURATION = 30 * 60 * 1000; 

    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        logout();
      }, TIMEOUT_DURATION);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimeout));
    resetTimeout();

    return () => {
      clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, resetTimeout));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const getSelectedClass = () => {
    if (!selectedClassId || !currentUser) return null;
    return currentUser.classes?.find(c => c.id === selectedClassId) || null;
  };

  const getStudentClassIds = () => {
    if (!currentUser || currentUser.role !== 'student') return [];
    return (currentUser.classes || []).map(c => c.id);
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      loading,
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
