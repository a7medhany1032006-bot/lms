import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public LMS Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WaitingApproval from './pages/WaitingApproval';
import GradesPage from './pages/lms/GradesPage';
import CoursesPage from './pages/lms/CoursesPage';
import LessonsPage from './pages/lms/LessonsPage';
import LessonView from './pages/lms/LessonView';
import ExamPage from './pages/lms/ExamPage';
import TakeExam from './pages/lms/TakeExam';
import NotFound from './pages/NotFound';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ManageGrades from './pages/admin/ManageGrades';
import ManageCourses from './pages/admin/ManageCourses';
import ManageLessons from './pages/admin/ManageLessons';
import ManageExams from './pages/admin/ManageExams';
import ManageQuestions from './pages/admin/ManageQuestions';
import ViewSubmissions from './pages/admin/ViewSubmissions';
import ManageEssays from './pages/admin/ManageEssays';
import EssayReview from './pages/admin/EssayReview';
import ManageStudents from './pages/admin/ManageStudents';
import PendingStudents from './pages/admin/PendingStudents';
import StudentDetails from './pages/admin/StudentDetails';

// Student Dashboard Pages
import DashboardHome from './pages/student/DashboardHome';
import MyCourses from './pages/student/MyCourses';
import ExamHistory from './pages/student/ExamHistory';
import StudentProfile from './pages/student/StudentProfile';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontFamily: 'Tajawal, sans-serif',
            direction: 'rtl',
          },
          success: { iconTheme: { primary: '#3B82F6', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public Routes without LMS Layout if desired, but here we can wrap them or leave them outside. 
            Actually, let's keep them outside so they have a clean look, or wrap Landing inside Layout so it has the Navbar.
            I'll put Landing and Login outside the Layout to give them full screen control, but wait, Landing might want the Navbar.
            Let's put Landing and Login inside a generic route, but for now outside Layout. */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Auth routes that don't require approval */}
        <Route element={<ProtectedRoute requireApproved={false} />}>
          <Route path="/waiting-approval" element={<WaitingApproval />} />
        </Route>

        {/* Public LMS Routes */}
        <Route element={<ProtectedRoute requireAdmin={false} requireApproved={true} />}>
          <Route element={<Layout />}>
            <Route path="/grades" element={<GradesPage />} />
            <Route path="/grades/:gradeId/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId/lessons" element={<LessonsPage />} />
            <Route path="/courses/:courseId/exam" element={<ExamPage />} />
            <Route path="/exams/:examId" element={<TakeExam />} />
            <Route path="/lessons/:lessonId" element={<LessonView />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="grades" element={<ManageGrades />} />
            <Route path="courses" element={<ManageCourses />} />
            <Route path="lessons" element={<ManageLessons />} />
            <Route path="exams" element={<ManageExams />} />
            <Route path="exams/:examId/questions" element={<ManageQuestions />} />
            <Route path="exams/:examId/submissions" element={<ViewSubmissions />} />
            <Route path="essay-grading" element={<ManageEssays />} />
            <Route path="essay-grading/:submissionId" element={<EssayReview />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="students/pending" element={<PendingStudents />} />
            <Route path="students/:id" element={<StudentDetails />} />
          </Route>
        </Route>

        {/* Student Dashboard Routes */}
        <Route element={<ProtectedRoute requireAdmin={false} />}>
          <Route path="/dashboard" element={<StudentLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="courses" element={<MyCourses />} />
            <Route path="exams" element={<ExamHistory />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
