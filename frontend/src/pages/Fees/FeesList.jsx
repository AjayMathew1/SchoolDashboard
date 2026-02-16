import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/common/Modal';
import { feesAPI } from '../../services/api';

export default function FeesList() {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [formData, setFormData] = useState({
        feeType: 'Tuition',
        description: '',
        amount: '',
        dueDate: '',
        isPaid: false,
        paidDate: '',
        paidAmount: '',
        paymentMethod: ''
    });

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const response = await feesAPI.getAll();
            setFees(response.data);
        } catch (error) {
            console.error('Error fetching fees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFee) {
                await feesAPI.update(editingFee.fee_id, formData);
            } else {
                await feesAPI.create(formData);
            }
            fetchFees();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving fee:', error);
            alert('Failed to save fee');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this fee record?')) return;

        try {
            await feesAPI.delete(id);
            fetchFees();
        } catch (error) {
            console.error('Error deleting fee:', error);
            alert('Failed to delete fee');
        }
    };

    const handleEdit = (fee) => {
        setEditingFee(fee);
        setFormData({
            feeType: fee.fee_type,
            description: fee.description || '',
            amount: fee.amount,
            dueDate: fee.due_date,
            isPaid: fee.is_paid === 1,
            paidDate: fee.paid_date || '',
            paidAmount: fee.paid_amount || '',
            paymentMethod: fee.payment_method || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFee(null);
        setFormData({
            feeType: 'Tuition',
            description: '',
            amount: '',
            dueDate: '',
            isPaid: false,
            paidDate: '',
            paidAmount: '',
            paymentMethod: ''
        });
    };

    const calculateTotals = () => {
        const total = fees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
        const paid = fees.reduce((sum, fee) => sum + parseFloat(fee.paid_amount || 0), 0);
        const outstanding = total - paid;

        return { total, paid, outstanding };
    };

    const isOverdue = (dueDate, isPaid) => {
        if (isPaid) return false;
        return new Date(dueDate) < new Date();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const totals = calculateTotals();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Fee Tracker</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    Add Fee
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="card">
                    <p className="text-sm text-gray-600">Total Fees</p>
                    <p className="text-2xl font-bold text-gray-900">${totals.total.toFixed(2)}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-2xl font-bold text-green-600">${totals.paid.toFixed(2)}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">Outstanding</p>
                    <p className="text-2xl font-bold text-red-600">${totals.outstanding.toFixed(2)}</p>
                </div>
            </div>

            <div className="card">
                {fees.length === 0 ? (
                    <p className="text-gray-600 text-center py-12">No fee records yet. Add your first fee!</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fee Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {fees.map((fee) => {
                                    const overdue = isOverdue(fee.due_date, fee.is_paid);

                                    return (
                                        <tr key={fee.fee_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {fee.fee_type}
                                                </div>
                                                {fee.description && (
                                                    <div className="text-sm text-gray-500">
                                                        {fee.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ${parseFloat(fee.amount).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(fee.due_date).toLocaleDateString()}
                                                </div>
                                                {overdue && (
                                                    <div className="flex items-center text-xs text-red-600 mt-1">
                                                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                                                        Overdue
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {fee.is_paid ? (
                                                    <span className="flex items-center text-sm text-green-600">
                                                        <CheckCircleIcon className="w-5 h-5 mr-1" />
                                                        Paid
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {fee.is_paid ? (
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            ${parseFloat(fee.paid_amount).toFixed(2)}
                                                        </div>
                                                        <div className="text-xs">
                                                            {new Date(fee.paid_date).toLocaleDateString()}
                                                        </div>
                                                        {fee.payment_method && (
                                                            <div className="text-xs text-gray-500">
                                                                {fee.payment_method}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(fee)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(fee.fee_id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingFee ? 'Edit Fee' : 'Add Fee'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fee Type *
                        </label>
                        <select
                            required
                            value={formData.feeType}
                            onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Tuition">Tuition</option>
                            <option value="Books">Books</option>
                            <option value="Exam_Fee">Exam Fee</option>
                            <option value="Activity_Fee">Activity Fee</option>
                            <option value="Lab_Fee">Lab Fee</option>
                            <option value="Library_Fee">Library Fee</option>
                            <option value="Transportation">Transportation</option>
                            <option value="Uniform">Uniform</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Spring Semester 2024"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <label className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                checked={formData.isPaid}
                                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Mark as paid</span>
                        </label>

                        {formData.isPaid && (
                            <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Paid Amount *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required={formData.isPaid}
                                            value={formData.paidAmount}
                                            onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Paid Date *
                                        </label>
                                        <input
                                            type="date"
                                            required={formData.isPaid}
                                            value={formData.paidDate}
                                            onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select method</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Check">Check</option>
                                        <option value="Credit_Card">Credit Card</option>
                                        <option value="Debit_Card">Debit Card</option>
                                        <option value="Bank_Transfer">Bank Transfer</option>
                                        <option value="Online_Payment">Online Payment</option>
                                    </select>
                                </div>
                            </div>
                        )}
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
                            {editingFee ? 'Update' : 'Add'} Fee
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
