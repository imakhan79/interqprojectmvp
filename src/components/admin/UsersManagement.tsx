import React from 'react';

const UsersManagement = () => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">👤</span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900">Active Users</h3>
              <p className="text-blue-700 font-semibold text-2xl">47</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Platform users currently active</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">➕</span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900">Add User</h3>
              <p className="text-green-700 font-semibold text-lg">Invite</p>
            </div>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200">
            Create User Account
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-2 border-orange-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">📊</span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900">User Reports</h3>
              <p className="text-orange-700 font-semibold text-lg">Export</p>
            </div>
          </div>
          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200">
            Download CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border shadow-sm rounded-2xl p-8">
          <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
            Recent Users
          </h4>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">John Doe</p>
                <p className="text-sm text-gray-500 truncate">john.doe@company.com</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  TAP
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">Sarah Anderson</p>
                <p className="text-sm text-gray-500 truncate">sarah@hrteam.com</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  HR Manager
                </span>
              </div>
            </div>
            <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200">
              View All Users
            </button>
          </div>
        </div>

        <div className="bg-white border shadow-sm rounded-2xl p-8">
          <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
            User Stats
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Role Distribution</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">TAPs (24)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">HR (12)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Managers (11)</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Active (47)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Inactive (3)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;

