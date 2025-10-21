import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MagicLinkCallbackPage from './pages/MagicLinkCallbackPage';
import ProfileCompletionPage from './pages/ProfileCompletionPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import TestSelectionPage from './pages/TestSelectionPage';
import PassageSelectionPage from './pages/PassageSelectionPage';
import TestPage from './pages/TestPage';
import ResultsPage from './pages/ResultsPage';
import FinalResultsPage from './pages/FinalResultsPage';
import SessionResultsPage from './pages/SessionResultsPage';
import AdminPage from './pages/AdminPage';
import AdminMainPage from './pages/AdminMainPage';
import PassageManagementPage from './pages/PassageManagementPage';
import TestHistoryReportPage from './pages/TestHistoryReportPage';
import StudentManagementPage from './pages/StudentManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/callback" element={<MagicLinkCallbackPage />} />
        <Route path="/complete-profile" element={<ProfileCompletionPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<AnalyticsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/test-selection" element={<TestSelectionPage />} />
        <Route path="/passage-selection" element={<PassageSelectionPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/final-results" element={<FinalResultsPage />} />
        <Route path="/session-results/:sessionId" element={<SessionResultsPage />} />
        <Route path="/admin" element={<AdminMainPage />} />
        <Route path="/admin/passage-management" element={<AdminPage />} />
        <Route path="/admin/passage-list" element={<PassageManagementPage />} />
        <Route path="/admin/test-history" element={<TestHistoryReportPage />} />
        <Route path="/admin/student-management" element={<StudentManagementPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;