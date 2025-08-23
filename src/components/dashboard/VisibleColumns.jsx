import React from "react";
import ToggleBtn from "../ToggleBtn"; // import the ToggleBtn we built

function VisibleColumns({ visibleColumns, onColumnChange, availableColumns }) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {availableColumns.map((col) => (
          <ToggleBtn
            key={col.key}
            label={col.header}
            defaultActive={visibleColumns.includes(col.key)}
            onToggle={() => onColumnChange(col.key)}
          />
        ))}
      </div>
    </div>
  );
}

export default VisibleColumns;
