'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useStore from "@/store/useStore";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function TeacherDashboard() {
  const { getStatistics, periods } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const [stats, setStats] = useState({
    totalTeachersCount: 0,
    activeTeachersCount: 0,
    inactiveTeachersCount: 0,
    teachersCountDistributionByRank: [],
    absencesCountDistributionByMonth: [],
    nextHoliday: null,
    totalAmount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const from = dateRange[0]?.toISOString().split('T')[0] || '';
        const to = dateRange[1]?.toISOString().split('T')[0] || '';
        const data = await getStatistics(from, to);
        setStats(data);
        console.log(data);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, getStatistics]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setDateRange([new Date(period.from), new Date(period.to)]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error Loading Data</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const absenceData = stats.absencesCountDistributionByMonth.map(item => ({
    month: new Date(2000, item.month - 1, 1).toLocaleString('default', { month: 'short' }),
    absences: item.absences_count
  }));

  console.log(absenceData);
  

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Management Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Period</label>
            <select
              value={selectedPeriod?.period_id || ''}
              onChange={(e) => {
                const period = periods.find(p => p.period_id == e.target.value);
                if (period) handlePeriodChange(period);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a period</option>
              {periods.map((period) => (
                <option key={period.period_id} value={period.period_id}>
                  {new Date(period.from).toLocaleDateString()} - {new Date(period.to).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Teachers</h2>
          <div className="text-3xl font-bold text-gray-900">{stats.totalTeachersCount}</div>
          <div className="flex justify-between mt-4">
            <span className="text-green-600 font-medium">Active: {stats.activeTeachersCount ||"0"}</span>
            <span className="text-red-600 font-medium">Inactive: {stats.inactiveTeachersCount ||"0"}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Total Amount (Period)</h2>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalAmount}DA
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {dateRange[0] && dateRange[1] ? (
              `${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`
            ) : (
              'All time'
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Next Holiday</h2>
          {stats.nextHoliday ? (
            <>
              <div className="font-bold text-gray-900">{stats.nextHoliday.description}</div>
              <div className="text-gray-600">{stats.nextHoliday.from}</div>
            </>
          ) : (
            <div className="text-gray-500">No upcoming holidays</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Teacher Distribution by Rank</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.teachersCountDistributionByRank.map(item => ({
                    name: item.rank,
                    value: item.teachers_count
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.teachersCountDistributionByRank.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Absences per Month (period)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={absenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="absences" fill="#8884d8" name="Number of Absences" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}