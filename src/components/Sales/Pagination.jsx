import {Button} from '../index'

function Pagination({ currentPage, totalEntries, entriesPerPage, onPageChange }) {
  if (totalEntries <= entriesPerPage) return null;

  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);

  return (
    <div className="flex flex-col w-full sm:flex-row justify-between items-center mt-6 text-sm text-gray-600">
      <p className="mb-2 sm:mb-0">
        Showing <span className="font-semibold">{startEntry}</span> to <span className="font-semibold">{endEntry}</span> of <span className="font-semibold">{totalEntries}</span> entries
      </p>
      <div className="flex items-center space-x-1">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          variant='secondary'
          disabled={currentPage === 1}
          >
                    Previous
        </Button>
        <span className="px-3 py-1 text-base">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          variant='secondary'
          disabled={currentPage === totalPages}
          >
                    Next
        </Button>
      </div>
    </div>
  );
}

export default Pagination;

