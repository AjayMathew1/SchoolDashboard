import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [deadlines, setDeadlines] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsRes, deadlinesRes, alertsRes] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getDeadlines(),
                dashboardAPI.getAlerts(),
            ]);

            setStats(statsRes.data);
            setDeadlines(deadlinesRes.data);
            setAlerts(alertsRes.data);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's your academic overview.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Attendance</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {stats?.attendancePercentage?.toFixed(1) || 0}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Grade</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {stats?.avgPercentage?.toFixed(1) || 0}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.pendingAssignments || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">Assignments</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Upcoming</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.upcomingTests || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">Tests (2 weeks)</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Deadlines */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines (7 days)</h2>
                    {deadlines.length > 0 ? (
                        <div className="space-y-3">
                            {deadlines.map((item) => (
                                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.color_code || '#6B7280' }}
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-600">{item.subject_name || item.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No upcoming deadlines</p>
                    )}
                    <Link to="/assignments" className="block mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View all assignments →
                    </Link>
                </div>

                {/* Alerts & Reminders */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Reminders</h2>
                    {alerts.length > 0 ? (
                        <div className="space-y-3">
                            {alerts.map((alert, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border ${alert.priority === 'high'
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-yellow-50 border-yellow-200'
                                        }`}
                                >
                                    <div className="flex items-start">
                                        <svg
                                            className={`w-5 h-5 mr-2 ${alert.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                            />
                                        </svg>
                                        <p className="text-sm text-gray-800">{alert.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No alerts at this time</p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/assignments" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                        <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Add Assignment</span>
                    </Link>

                    <Link to="/tests" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                        <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Log Test Result</span>
                    </Link>

                    <Link to="/attendance" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                        <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Mark Attendance</span>
                    </Link>

                    <Link to="/notes" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                        <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Add Note</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
