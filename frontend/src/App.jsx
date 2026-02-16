import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import SubjectsList from './pages/Subjects/SubjectsList';
import SubjectDetail from './pages/Subjects/SubjectDetail';
import AssignmentsList from './pages/Assignments/AssignmentsList';
import TestsList from './pages/Tests/TestsList';
import TestAnalytics from './pages/Tests/TestAnalytics';
import AttendanceCalendar from './pages/Attendance/AttendanceCalendar';
import FeesList from './pages/Fees/FeesList';
import EventsList from './pages/Events/EventsList';
import AwardsList from './pages/Awards/AwardsList';
import ActivitiesList from './pages/Activities/ActivitiesList';
import NotesList from './pages/Notes/NotesList';
import Layout from './components/common/Layout';
import './index.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="subjects" element={<SubjectsList />} />
                        <Route path="subjects/:id" element={<SubjectDetail />} />
                        <Route path="assignments" element={<AssignmentsList />} />
                        <Route path="tests" element={<TestsList />} />
                        <Route path="tests/analytics" element={<TestAnalytics />} />
                        <Route path="attendance" element={<AttendanceCalendar />} />
                        <Route path="fees" element={<FeesList />} />
                        <Route path="events" element={<EventsList />} />
                        <Route path="awards" element={<AwardsList />} />
                        <Route path="activities" element={<ActivitiesList />} />
                        <Route path="notes" element={<NotesList />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
