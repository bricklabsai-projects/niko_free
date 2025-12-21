import { UserPlus, Users, Shield, Trash2, Mail, Phone, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function AssignRoles() {
  const [users] = useState([
    {
      id: 1,
      name: 'Alice Wanjiru',
      email: 'alice@example.com',
      phone: '+254712345678',
      role: 'Manager',
      permissions: ['Edit Events', 'Manage Tickets', 'View Analytics'],
      addedDate: '2024-05-15'
    },
    {
      id: 2,
      name: 'Bob Kimani',
      email: 'bob@example.com',
      phone: '+254723456789',
      role: 'Staff',
      permissions: ['View Events', 'Scan Tickets'],
      addedDate: '2024-06-01'
    }
  ]);

  const [agents] = useState([
    {
      id: 1,
      name: 'Carol Muthoni',
      email: 'carol@example.com',
      phone: '+254734567890',
      eventsPromoted: 5,
      ticketsSold: 123,
      commission: 15000,
      status: 'Active'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assign Roles</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage team members and promotional agents
        </p>
      </div>

      {/* Team Members Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-[#27aae2]" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Members
            </h3>
          </div>
          <button className="flex items-center space-x-2 bg-[#27aae2] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1e8bc3] transition-all">
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>

        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h4>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                      {user.role}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {user.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotional Agents Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-[#27aae2]" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Promotional Agents
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Maximum 3 agents allowed
              </p>
            </div>
          </div>
          <button
            disabled={agents.length >= 3}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              agents.length >= 3
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-[#27aae2] text-white hover:bg-[#1e8bc3]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Agent</span>
          </button>
        </div>

        <div className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {agent.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      agent.status === 'Active'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {agent.status}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{agent.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{agent.phone}</span>
                    </div>
                  </div>
                </div>

                <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Events Promoted</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {agent.eventsPromoted}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tickets Sold</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {agent.ticketsSold}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Commission Earned</p>
                  <p className="text-lg font-semibold text-[#27aae2]">
                    Ksh {agent.commission.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No promotional agents yet. Add up to 3 agents to help promote your events.
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              About Roles & Permissions
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Team members can help manage your events with assigned permissions. 
              Promotional agents earn commission on ticket sales and can promote up to your events.
              You can have up to 3 promotional agents at a time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
