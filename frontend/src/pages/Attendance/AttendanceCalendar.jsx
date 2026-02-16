import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/common/Modal';
import { attendanceAPI } from '../../services/api';

export default function AttendanceCalendar() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttendance, setEditingAttendance] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [formData, setFormData] = useState({
        attendanceDate: new Date().toISOString().split('T')[0],
        status: 'Present',
        reason: ''
    });

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await attendanceAPI.getAll();
            setAttendance(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAttendance) {
                await attendanceAPI.update(editingAttendance.attendance_id, formData);
            } else {
                await attendanceAPI.create(formData);
            }
            fetchAttendance();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Failed to save attendance');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this attendance record?')) return;

        try {
            await attendanceAPI.delete(id);
            fetchAttendance();
        } catch (error) {
            console.error('Error deleting attendance:', error);
            alert('Failed to delete attendance');
        }
    };

    const handleEdit = (record) => {
        setEditingAttendance(record);
        setFormData({
            attendanceDate: record.attendance_date,
            status: record.status,
            reason: record.reason || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAttendance(null);
        setFormData({
            attendanceDate: new Date().toISOString().split('T')[0],
            status: 'Present',
            reason: ''
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'Present': 'bg-green-500',
            'Absent': 'bg-red-500',
            'Late': 'bg-yellow-500',
            'Excused': 'bg-blue-500',
            'Half_Day': 'bg-orange-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const getStatusBadgeColor = (status) => {
        const colors = {
            'Present': 'bg-green-100 text-green-800',
            'Absent': 'bg-red-100 text-red-800',
            'Late': 'bg-yellow-100 text-yellow-800',
            'Excused': 'bg-blue-100 text-blue-800',
            'Half_Day': 'bg-orange-100 text-orange-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const calculateStats = () => {
        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'Present').length;
        const absent = attendance.filter(a => a.status === 'Absent').length;
        const late = attendance.filter(a => a.status === 'Late').length;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        return { total, present, absent, late, percentage };
    };

    // Generate calendar for selected month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const getAttendanceForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return attendance.find(a => a.attendance_date === dateStr);
    };

    const previousMonth = () => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const stats = calculateStats();
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(selectedMonth);
    const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Overall: <span className="font-semibold text-blue-600">{stats.percentage}%</span>
                        {' '}({stats.present}/{stats.total} days)
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    Mark Attendance
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">Percentage</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.percentage}%</p>
                </div>
            </div>

            {/* Calendar */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={previousMonth}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <h2 className="text-xl font-semibold text-gray-900">{monthName}</h2>
                    <button
                        onClick={nextMonth}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                            {day}
                        </div>
                    ))}

                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(year, month, day);
                        const attendanceRecord = getAttendanceForDate(date);
                        const isToday = date.toDateString() === new Date().toDateString();

                        return (
                            <div
                                key={day}
                                className={`aspect-square border rounded-lg p-2 relative ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'
                                    } ${attendanceRecord ? 'cursor-pointer hover:shadow-md' : ''}`}
                                onClick={() => attendanceRecord && handleEdit(attendanceRecord)}
                            >
                                <div className="text-sm font-medium text-gray-700">{day}</div>
                                {attendanceRecord && (
                                    <div className="absolute bottom-1 right-1">
                                        <div
                                            className={`w-3 h-3 rounded-full ${getStatusColor(attendanceRecord.status)}`}
                                            title={attendanceRecord.status}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span>Late</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>Excused</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span>Half Day</span>
                    </div>
                </div>
            </div>

            {/* Recent Records List */}
            {attendance.length > 0 && (
                <div className="card mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Records</h3>
                    <div className="space-y-2">
                        {attendance.slice(0, 10).map((record) => (
                            <div key={record.attendance_id} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600">
                                        {new Date(record.attendance_date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                                        {record.status.replace('_', ' ')}
                                    </span>
                                    {record.reason && (
                                        <span className="text-sm text-gray-500">{record.reason}</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(record)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(record.attendance_id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingAttendance ? 'Edit Attendance' : 'Mark Attendance'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.attendanceDate}
                            onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status *
                        </label>
                        <select
                            required
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                            <option value="Excused">Excused</option>
                            <option value="Half_Day">Half Day</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason/Notes
                        </label>
                        <textarea
                            rows="3"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Doctor's appointment, Family emergency"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            {editingAttendance ? 'Update' : 'Mark'} Attendance
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
