import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/auth/Login';
import SignUp from '../pages/auth/SignUp';
import NotFound from '../pages/auth/NotFound';

import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Users from '../pages/admin/Users';
import UserDetails from '../pages/admin/UserDetails';

import ProfessorLayout from '../layouts/ProfessorLayout';
import ProfessorDashboard from '../pages/professor/ProfessorDashboard';
import ProfessorClasses from '../pages/professor/ProfessorClasses';
import ProfessorClassDetail from '../pages/professor/ProfessorClassDetail';
import CreateClass from '../pages/professor/CreateClass';
import Projects from '../pages/professor/Projects';
import CreateProject from '../pages/professor/CreateProject';
import ProjectDetails from '../pages/professor/ProjectDetails';
import CreateGroup from '../pages/professor/CreateGroup';
import Groups from '../pages/professor/Groups';
import ContributionMonitoring from '../pages/professor/ContributionMonitoring';
import Reports from '../pages/professor/Reports';

import StudentLayout from '../layouts/StudentLayout';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfile from '../pages/student/StudentProfile';
import StudentMyClasses from '../pages/student/StudentMyClasses';
import StudentClassDetail from '../pages/student/StudentClassDetail';
import MyTasks from '../pages/student/MyTasks';
import TaskDetails from '../pages/student/TaskDetails';
import SubmitTask from '../pages/student/SubmitTask';
import ActivityHistory from '../pages/student/ActivityHistory';
import PeerEvaluation from '../pages/student/PeerEvaluation';
import MyContribution from '../pages/student/MyContribution';

import GroupWorkspace from '../pages/leader/GroupWorkspace';
import Members from '../pages/leader/Members';
import LeaderTasks from '../pages/leader/LeaderTasks';
import CreateTask from '../pages/leader/CreateTask';
import SubmissionReview from '../pages/leader/SubmissionReview';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetails />} />
        </Route>

        <Route path="/professor" element={<ProfessorLayout />}>
          <Route index element={<ProfessorDashboard />} />
          <Route path="classes" element={<ProfessorClasses />} />
          <Route path="classes/create" element={<CreateClass />} />
          <Route path="classes/:id" element={<ProfessorClassDetail />} />
          <Route path="classes/:classId/projects/create" element={<CreateProject />} />
          <Route path="classes/:classId/groups/create" element={<CreateGroup />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="groups" element={<Groups />} />
          <Route path="contribution" element={<ContributionMonitoring />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="classes" element={<StudentMyClasses />} />
          <Route path="classes/:id" element={<StudentClassDetail />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="tasks/:id" element={<TaskDetails />} />
          <Route path="tasks/:id/submit" element={<SubmitTask />} />
          <Route path="activity" element={<ActivityHistory />} />
          <Route path="peer-evaluation" element={<PeerEvaluation />} />
          <Route path="contribution" element={<MyContribution />} />
        </Route>

        <Route path="/leader" element={<StudentLayout />}>
          <Route index element={<GroupWorkspace />} />
          <Route path="members" element={<Members />} />
          <Route path="tasks" element={<LeaderTasks />} />
          <Route path="tasks/create" element={<CreateTask />} />
          <Route path="tasks/:id" element={<TaskDetails />} />
          <Route path="submissions" element={<SubmissionReview />} />
          <Route path="contribution" element={<MyContribution />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
