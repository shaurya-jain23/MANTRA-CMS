import { PI_STATUS } from '../../assets/utils';

const PIStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case PI_STATUS.DRAFT:
        return { color: 'bg-yellow-100 text-yellow-800', label: 'DRAFT' };
      case PI_STATUS.SUBMITTED:
        return { color: 'bg-blue-100 text-blue-800', label: 'SUBMITTED' };
      case PI_STATUS.APPROVED_BY_SALES_MANAGER:
        return { color: 'bg-indigo-100 text-indigo-800', label: 'APPROVED BY SM' };
      case PI_STATUS.APPROVED_BY_ADMIN:
        return { color: 'bg-purple-100 text-purple-800', label: 'APPROVED BY ADMIN' };
      case PI_STATUS.FINAL:
        return { color: 'bg-green-100 text-green-800', label: 'FINAL' };
      case PI_STATUS.REJECTED:
        return { color: 'bg-red-100 text-red-800', label: 'REJECTED' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status?.toUpperCase() || 'UNKNOWN' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${config.color}`}>
      <div className="w-2 h-2 rounded-full bg-current opacity-70"></div>
      {config.label}
    </div>
  );
};

export default PIStatusBadge;