import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/auth/Login';
import SignUp from '../pages/auth/SignUp';
import OTPVerification from '../pages/auth/OTPVerification';

import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Users from '../pages/admin/Users';
import UserDetails from '../pages/admin/UserDetails';
import ProfessorVerification from '../pages/admin/ProfessorVerification';

import ProfessorLayout from '../layouts/ProfessorLayout';
import ProfessorDashboard from '../pages/professor/ProfessorDashboard';
import Projects from '../pages/professor/Projects';
import CreateProject from '../pages/professor/CreateProject';
import ProjectDetails from '../pages/professor/ProjectDetails';
import Groups from '../pages/professor/Groups';
import ContributionMonitoring from '../pages/professor/ContributionMonitoring';
import Reports from '../pages/professor/Reports';

import StudentLayout from '../layouts/StudentLayout';
import StudentDashboard from '../pages/student/StudentDashboard';
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
        <Route path="/otp-verification" element={<OTPVerification />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="professor-verification" element={<ProfessorVerification />} />
        </Route>

        <Route path="/professor" element={<ProfessorLayout />}>
          <Route index element={<ProfessorDashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="groups" element={<Groups />} />
          <Route path="contribution" element={<ContributionMonitoring />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
