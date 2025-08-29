import { useNavigate } from "react-router-dom";
import { Button } from "../components";

function Errors({status_code= 404, title="Page Not Found",message}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-bold text-red-500 mb-4">{status_code}</h1>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        {message || "You do not have permission to view this page. Please contact your administrator if you think this is a mistake."}
      </p>
      <div>
        <Button
          onClick={() => navigate("/")}
          className="hover:bg-blue-700">
         Go back to Home
        </Button>
      </div>
      
    </div>
  );
}

export default Errors;
