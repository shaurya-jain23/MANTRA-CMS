import React, { useState } from 'react';
import {
  RolePermissionMatrix,
  DepartmentManager,
  RoleManager,
  OfficeManager,
  Container,
  Tabs
} from '../components';

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('Role Permissions');
  const tabs = [
    {  name: 'Role Permissions', component: <RolePermissionMatrix /> },
    { name: 'Departments', component: <DepartmentManager /> },
    { name: 'Roles', component: <RoleManager /> },
    { name: 'Offices', component: <OfficeManager /> },
  ];
  const TabsOptions = [{name: 'ALL'}, ...tabs.map(tab => ({name: tab.id}))]

  return (
    <Container>
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
        <div className="w-full flex flex-col justify-between mb-10">
          <h1 className="text-3xl font-bold text-gray-800">System Administration</h1>
          <p className="text-gray-600 mt-1">Manage offices, departments, roles, and permissions</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white p-2 border-b-gray-100 mb-6">
            <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
        </div>
        {/* Active Tab Content */}
        <div>
          {tabs.find((tab) => tab.name === activeTab)?.component}</div>
        </div>
    </Container>
  );
}

export default AdminDashboardPage;
