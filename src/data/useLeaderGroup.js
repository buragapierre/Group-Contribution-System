import { useSearchParams } from 'react-router-dom';
import { groups } from './mockData';

export function getLeaderGroup(currentUser, groupId) {
  const leaderGroups = currentUser?.leaderGroups || groups.filter(group => group.leaderId === currentUser?.id);
  return leaderGroups.find(group => group.id === groupId) || leaderGroups[0] || groups[0];
}

export function useLeaderGroup(currentUser) {
  const [searchParams] = useSearchParams();
  return getLeaderGroup(currentUser, Number(searchParams.get('group')));
}
