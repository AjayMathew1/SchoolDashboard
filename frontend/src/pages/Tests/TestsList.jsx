import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/common/Modal';
import { testsAPI, subjectsAPI } from '../../services/api';

export default function TestsList() {
    const [tests, setTests] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    const [formData, setFormData] = useState({
        subjectId: '',
        testName: '',
        testType: 'Quiz',
        testDate: '',
        duration: '',
        maxMarks: '',
        marksObtained: '',
        weightagePercentage: '',
        syllabusCovered: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [testsRes, subjectsRes] = await Promise.all([
                testsAPI.getAll(),
                subjectsAPI.getAll()
            ]);
            setTests(testsRes.data);
            setSubjects(subjectsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTest) {
                await testsAPI.update(editingTest.test_id, formData);
            } else {
                await testsAPI.create(formData);
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving test:', error);
            alert('Failed to save test');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this test?')) return;

        try {
            await testsAPI.delete(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting test:', error);
            alert('Failed to delete test');
        }
    };

    const handleEdit = (test) => {
        setEditingTest(test);
        setFormData({
            subjectId: test.subject_id,
            testName: test.test_name,
            testType: test.test_type,
            testDate: test.test_date,
            duration: test.duration || '',
            maxMarks: test.max_marks,
            marksObtained: test.marks_obtained || '',
            weightagePercentage: test.weightage_percentage || '',
            syllabusCovered: test.syllabus_covered || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTest(null);
        setFormData({
            subjectId: '',
            testName: '',
            testType: 'Quiz',
            testDate: '',
            duration: '',
            maxMarks: '',
            marksObtained: '',
            weightagePercentage: '',
            syllabusCovered: ''
        });
    };

    const getGradeColor = (percentage) => {
        if (percentage >= 90) return 'text-green-600 bg-green-100';
        if (percentage >= 80) return 'text-blue-600 bg-blue-100';
        if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
        if (percentage >= 60) return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
    };

    const calculateAverage = () => {
        const testsWithMarks = tests.filter(t => t.percentage !== null);
        if (testsWithMarks.length === 0) return 0;
        const sum = testsWithMarks.reduce((acc, t) => acc + t.percentage, 0);
        return (sum / testsWithMarks.length).toFixed(1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const average = calculateAverage();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tests & Performance</h1>
                    {tests.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                            Overall Average: <span className="font-semibold text-blue-600">{average}%</span>
                        </p>
                    )}
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    Add Test Result
                </button>
            </div>

            <div className="card">
                {tests.length === 0 ? (
                    <p className="text-gray-600 text-center py-12">No test results yet. Add your first test!</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Test
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Score
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Grade
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tests.map((test) => (
                                    <tr key={test.test_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {test.test_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {test.test_type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {test.color_code && (
                                                    <div
                                                        className="w-3 h-3 rounded-full mr-2"
                                                        style={{ backgroundColor: test.color_code }}
                                                    />
                                                )}
                                                <span className="text-sm text-gray-900">{test.subject_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(test.test_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {test.marks_obtained !== null
                                                ? `${test.marks_obtained}/${test.max_marks}`
                                                : `0/${test.max_marks}`
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {test.percentage !== null ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(test.percentage)}`}>
                                                        {test.grade}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {test.percentage}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Not graded</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(test)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(test.test_id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingTest ? 'Edit Test Result' : 'Add Test Result'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject *
                        </label>
                        <select
                            required
                            value={formData.subjectId}
                            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a subject</option>
                            {subjects.map(subject => (
                                <option key={subject.subject_id} value={subject.subject_id}>
                                    {subject.subject_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Test Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.testName}
                            onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Chapter 3 Quiz, Mid-term Exam"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Test Type *
                            </label>
                            <select
                                required
                                value={formData.testType}
                                onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Quiz">Quiz</option>
                                <option value="Unit_Test">Unit Test</option>
                                <option value="Mid_Term">Mid Term</option>
                                <option value="Final_Exam">Final Exam</option>
                                <option value="Practice_Test">Practice Test</option>
                                <option value="Mock_Exam">Mock Exam</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Test Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.testDate}
                                onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Marks *
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.maxMarks}
                                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Marks Obtained
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                value={formData.marksObtained}
                                onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="85"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="60"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Weightage %
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.weightagePercentage}
                                onChange={(e) => setFormData({ ...formData, weightagePercentage: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Syllabus Covered
                        </label>
                        <textarea
                            rows="2"
                            value={formData.syllabusCovered}
                            onChange={(e) => setFormData({ ...formData, syllabusCovered: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Chapters 1-3, Units 4-5"
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
                            {editingTest ? 'Update' : 'Add'} Test
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
