import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HomeIcon, BookOpenIcon, DocumentTextIcon, AcademicCapIcon,
    CalendarIcon, CurrencyDollarIcon, TrophyIcon, SparklesIcon,
    ClipboardDocumentListIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Subjects', href: '/subjects', icon: BookOpenIcon },
    { name: 'Assignments', href: '/assignments', icon: DocumentTextIcon },
    { name: 'Tests', href: '/tests', icon: AcademicCapIcon },
    { name: 'Attendance', href: '/attendance', icon: CalendarIcon },
    { name: 'Fees', href: '/fees', icon: CurrencyDollarIcon },
    { name: 'Events', href: '/events', icon: SparklesIcon },
    { name: 'Awards', href: '/awards', icon: TrophyIcon },
    { name: 'Activities', href: '/activities', icon: ClipboardDocumentListIcon },
    { name: 'Notes', href: '/notes', icon: ChatBubbleLeftRightIcon },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 bg-blue-600">
                        <h1 className="text-xl font-bold text-white">Academic Dashboard</h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-blue-50 text-blue-600 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User profile */}
                    <div className="border-t p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold">
                                        {user?.fullName?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="text-gray-400 hover:text-gray-600"
                                title="Logout"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="pl-64">
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
