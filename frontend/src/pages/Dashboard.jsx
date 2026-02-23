import React, { useState, useEffect } from 'react';
import { Trash2, Edit, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API from '../services/api';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [formData, setFormData] = useState({ title: '', amount: '', category: '' });
    const [error, setError] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterMonth, setFilterMonth] = useState('All');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [searchQuery, setSearchQuery] = useState('');
    const [quickFilter, setQuickFilter] = useState('All');
    const [editingExpense, setEditingExpense] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Fetch expenses on mount or when filter changes
    useEffect(() => {
        setPage(1);
        fetchExpenses(1);
    }, [filterCategory, filterMonth, filterYear]);

    const fetchExpenses = async (pageNumber = page) => {
        try {
            const params = new URLSearchParams();
            if (filterCategory !== 'All') params.append('category', filterCategory);
            if (filterMonth !== 'All') params.append('month', filterMonth);
            if (filterYear !== 'All') params.append('year', filterYear);
            params.append('page', pageNumber);
            params.append('limit', 10);

            const { data } = await API.get(`/expenses?${params.toString()}`);

            if (pageNumber === 1) {
                setExpenses(data);
            } else {
                setExpenses((prev) => [...prev, ...data]);
            }

            setHasMore(data.length === 10);
        } catch (err) {
            setError('Failed to fetch expenses.');
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchExpenses(nextPage);
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const { data } = await API.post('/expenses', formData);
            setExpenses([data, ...expenses]);
            setFormData({ title: '', amount: '', category: '' }); // Reset form
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add expense.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/expenses/${id}`);
            setExpenses(expenses.filter((expense) => expense._id !== id));
        } catch (err) {
            setError('Failed to delete expense.');
        }
    };

    const handleEditClick = (expense) => {
        setEditingExpense({ ...expense });
    };

    const handleEditChange = (e) => {
        setEditingExpense((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdateExpense = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const { data } = await API.put(`/expenses/${editingExpense._id}`, editingExpense);

            // Update the expenses array with the new data from server
            setExpenses(expenses.map(exp => exp._id === data._id ? data : exp));
            setEditingExpense(null); // Close modal
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update expense.');
        }
    };

    const exportToCSV = () => {
        if (filteredExpenses.length === 0) return;

        const csvRows = ['Title,Category,Amount,Date'];
        filteredExpenses.forEach((exp) => {
            const title = `"${exp.title.replace(/"/g, '""')}"`;
            const date = new Date(exp.date).toLocaleDateString();
            csvRows.push(`${title},${exp.category},${exp.amount},${date}`);
        });

        const csvData = csvRows.join('\n');
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'expenses.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Filter expenses by search query and quick date filter
    const now = new Date();
    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
        let matchesQuickFilter = true;

        if (quickFilter === 'This Week') {
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            matchesQuickFilter = new Date(exp.date) >= sevenDaysAgo;
        }

        return matchesSearch && matchesQuickFilter;
    });

    const applyQuickFilter = (type) => {
        setQuickFilter(type);
        if (type === 'This Month') {
            setFilterMonth((now.getMonth() + 1).toString());
            setFilterYear(now.getFullYear().toString());
        } else if (type === 'This Year') {
            setFilterMonth('All');
            setFilterYear(now.getFullYear().toString());
        } else if (type === 'This Week' || type === 'All') {
            setFilterMonth('All');
            setFilterYear('All');
        }
    };

    // Calculate generic summary
    const totalExpenses = filteredExpenses.reduce((acc, current) => acc + Number(current.amount), 0);

    // Group expenses by category for PieChart
    const categoryData = filteredExpenses.reduce((acc, curr) => {
        const existing = acc.find((item) => item.name === curr.category);
        if (existing) {
            existing.value += Number(curr.amount);
        } else {
            acc.push({ name: curr.category, value: Number(curr.amount) });
        }
        return acc;
    }, []);

    const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#2dd4bf'];
    const CATEGORY_COLORS = {
        Food: 'bg-green-100 text-green-800 border border-green-200',
        Transport: 'bg-blue-100 text-blue-800 border border-blue-200',
        Entertainment: 'bg-purple-100 text-purple-800 border border-purple-200',
        Utilities: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        Shopping: 'bg-pink-100 text-pink-800 border border-pink-200',
        Bills: 'bg-red-100 text-red-800 border border-red-200',
        Other: 'bg-gray-100 text-gray-800 border border-gray-200'
    };

    return (
        <div className="relative min-h-screen bg-gray-50 font-sans selection:bg-blue-500/30 pb-20">
            {/* Animated Ambient Background Blobs (Light Theme) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[40rem] h-[40rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="container mx-auto p-4 pt-28 max-w-6xl relative z-10 text-gray-900">

                {/* Header & Quick Filters */}
                <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-10 gap-8">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 drop-shadow-sm flex items-center gap-3">
                            <span className="text-blue-600">✦</span> Dashboard
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            {['All', 'This Week', 'This Month', 'This Year'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => applyQuickFilter(filter)}
                                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 backdrop-blur-md border ${quickFilter === filter
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-white/60 border-white/50 text-gray-600 hover:bg-white hover:text-gray-900 shadow-sm'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center bg-white/70 backdrop-blur-xl border border-white/40 p-3 rounded-[1.5rem] shadow-xl shadow-gray-200/40">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/50 border border-gray-200/60 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none w-full md:w-48 transition-all placeholder-gray-400 font-medium"
                        />
                        <select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="bg-white/50 border border-gray-200/60 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all font-medium"
                        >
                            <option value="All">All Months</option>
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>

                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="bg-white/50 border border-gray-200/60 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all font-medium"
                        >
                            <option value="All">All Years</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                        </select>

                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-white/50 border border-gray-200/60 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all min-w-[150px] font-medium"
                        >
                            <option value="All">All Categories</option>
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Bills">Bills</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {error && <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl mb-8 shadow-sm flex items-center gap-3"><span className="font-bold">Error:</span> {error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left Side: Add Expense Form */}
                    <div className="col-span-1">
                        <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-8 rounded-[2rem] shadow-xl shadow-gray-200/40 sticky top-28">
                            <h2 className="text-2xl font-extrabold mb-8 text-gray-900 flex items-center gap-2">
                                <span className="text-blue-600">✦</span> Add Expense
                            </h2>
                            <form onSubmit={handleAddExpense} className="flex flex-col gap-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g., Groceries"
                                        className="w-full bg-white/50 border border-gray-200/60 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 p-4 transition-all placeholder-gray-400 font-medium"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-[1.1rem] text-gray-400 font-medium">$</span>
                                        <input
                                            type="number"
                                            name="amount"
                                            min="0"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="w-full bg-white/50 border border-gray-200/60 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 p-4 pl-10 transition-all placeholder-gray-400 font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-white/50 border border-gray-200/60 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 p-4 transition-all font-medium"
                                        required
                                    >
                                        <option value="" disabled className="text-gray-400">Select Category</option>
                                        <option value="Food">Food</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Utilities">Utilities</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Bills">Bills</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold rounded-2xl px-5 py-4 mt-4 shadow-lg shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300">
                                    Add Expense
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Side: Expense List & Summary */}
                    <div className="col-span-1 lg:col-span-2 flex flex-col gap-10">

                        {/* Summary & Chart Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Summary Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] shadow-xl shadow-blue-500/20 flex flex-col justify-center relative overflow-hidden group min-h-[220px]">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-white/20 transition-all duration-700"></div>
                                <div className="z-10 bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                                    <span className="text-2xl text-white font-black">$</span>
                                </div>
                                <span className="text-sm font-semibold text-blue-100 uppercase tracking-widest mb-2 z-10">Total Expenses</span>
                                <span className="text-4xl lg:text-5xl font-medium text-white z-10 truncate drop-shadow-sm">{totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            </div>

                            {/* Chart Card - FIXED HEIGHT */}
                            {filteredExpenses.length > 0 ? (
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 flex flex-col justify-center items-center h-[340px]">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest w-full text-left mb-2">Spending Breakdown</h3>
                                    <div className="w-full flex-grow relative min-h-[250px]">
                                        <div className="absolute inset-0 pb-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={categoryData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={65}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {categoryData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value) => `$${Number(value).toFixed(2)}`}
                                                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '16px', color: '#111827', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                                                        itemStyle={{ color: '#1f2937', fontWeight: '700', fontSize: '1.1rem' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-xl shadow-gray-200/40 flex flex-col items-center justify-center h-[300px] md:h-auto min-h-[300px] text-center p-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">📊</div>
                                    <span className="text-gray-500 text-sm font-semibold">Tracked categories will appear here</span>
                                </div>
                            )}
                        </div>

                        {/* List Card */}
                        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-xl shadow-gray-200/40 overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center p-8 border-b border-gray-100/50 bg-white/40">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Recent Transactions</h2>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">Your latest financial activity</p>
                                </div>
                                {filteredExpenses.length > 0 && (
                                    <button
                                        onClick={exportToCSV}
                                        className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-5 py-2.5 rounded-xl transition-all shadow-sm"
                                    >
                                        Export CSV
                                    </button>
                                )}
                            </div>

                            {filteredExpenses.length === 0 ? (
                                <div className="p-16 text-center flex flex-col items-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-blue-300 text-2xl">✦</div>
                                    <h3 className="text-xl font-bold text-gray-700 mb-2">No expenses found</h3>
                                    <p className="text-gray-500 font-medium max-w-sm text-center">We couldn't find any transactions matching your current filters. Try changing your search or date range.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100/60 overflow-y-auto max-h-[550px] custom-scrollbar">
                                    {filteredExpenses.map((exp) => (
                                        <li key={exp._id} className="p-6 flex justify-between items-center hover:bg-blue-50/30 transition-all duration-300 group">
                                            <div className="flex items-center gap-5">
                                                <div className={`hidden sm:flex w-12 h-12 rounded-2xl flex-shrink-0 items-center justify-center text-lg font-black shadow-sm ${CATEGORY_COLORS[exp.category] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                                    {exp.title.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{exp.title}</h3>
                                                    <div className="text-xs text-gray-500 flex items-center gap-3 mt-1.5">
                                                        <span className={`${CATEGORY_COLORS[exp.category] || 'bg-gray-100 text-gray-600 border border-gray-200'} px-3 py-1 rounded-full font-medium shadow-sm`}>
                                                            {exp.category}
                                                        </span>
                                                        <span className="font-medium">{new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="font-bold text-gray-900 text-lg">-${Number(exp.amount).toFixed(2)}</span>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(exp)}
                                                        className="text-gray-400 hover:text-blue-600 p-2.5 hover:bg-white shadow-sm rounded-xl transition-all border border-transparent hover:border-gray-100"
                                                        title="Edit expense"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(exp._id)}
                                                        className="text-gray-400 hover:text-red-600 p-2.5 hover:bg-white shadow-sm rounded-xl transition-all border border-transparent hover:border-gray-100"
                                                        title="Delete expense"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {hasMore && filteredExpenses.length > 0 && (
                                <div className="p-6 border-t border-gray-100/50 flex justify-center bg-white/20">
                                    <button
                                        onClick={handleLoadMore}
                                        className="text-sm text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 px-8 py-3 rounded-full font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                    >
                                        Load More Data
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Edit Modal - Light Glassmorphic */}
                {editingExpense && (
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                        <div className="bg-white/90 backdrop-blur-xl border border-white/50 p-10 rounded-[2rem] shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-300">
                            <button
                                onClick={() => setEditingExpense(null)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-all"
                            >
                                <X size={22} />
                            </button>
                            <h2 className="text-2xl font-extrabold mb-8 text-gray-900 tracking-tight flex items-center gap-2">
                                <span className="text-blue-600">✦</span> Edit Transaction
                            </h2>
                            <form onSubmit={handleUpdateExpense} className="flex flex-col gap-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={editingExpense.title}
                                        onChange={handleEditChange}
                                        placeholder="Title"
                                        className="w-full bg-white/50 border border-gray-200/60 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 p-4 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-[1.1rem] text-gray-400 font-medium">$</span>
                                        <input
                                            type="number"
                                            name="amount"
                                            min="0"
                                            step="0.01"
                                            value={editingExpense.amount}
                                            onChange={handleEditChange}
                                            placeholder="Amount"
                                            className="w-full bg-white/50 border border-gray-200/60 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 p-4 pl-10 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Category</label>
                                    <select
                                        name="category"
                                        value={editingExpense.category}
                                        onChange={handleEditChange}
                                        className="w-full bg-white/50 border border-gray-200/60 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 p-4 transition-all font-medium"
                                        required
                                    >
                                        <option value="" disabled className="text-gray-400">Select Category</option>
                                        <option value="Food">Food</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Utilities">Utilities</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Bills">Bills</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold rounded-2xl px-5 py-4 mt-4 shadow-lg shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300">
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.5);
                }
            `}} />
        </div>
    );
};

export default Dashboard;
