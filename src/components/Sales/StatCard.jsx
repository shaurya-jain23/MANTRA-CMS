function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center space-x-4">
      <div className="bg-indigo-100 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default StatCard;

