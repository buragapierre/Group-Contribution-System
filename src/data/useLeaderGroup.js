import { useSearchParams } from 'react-router-dom';

export function getLeaderGroup(currentUser, groupId) {
  const leaderGroups = currentUser?.leaderGroups || [];
  return leaderGroups.find(group => group.id === groupId) || leaderGroups[0] || null;
}

export function useLeaderGroup(currentUser) {
  const [searchParams] = useSearchParams();
  return getLeaderGroup(currentUser, Number(searchParams.get('group')));
}
