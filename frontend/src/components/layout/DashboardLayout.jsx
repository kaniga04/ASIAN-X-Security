import Sidebar from "../Sidebar";
import Topbar from "../Topbar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* Top Navigation */}
        <Topbar />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;