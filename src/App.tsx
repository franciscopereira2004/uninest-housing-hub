import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Search from "./pages/Search.tsx";
import ListingDetail from "./pages/ListingDetail.tsx";
import About from "./pages/About.tsx";
import Safety from "./pages/Safety.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminPendingListings from "./pages/admin/AdminPendingListings.tsx";
import AdminAllListings from "./pages/admin/AdminAllListings.tsx";
import AdminReports from "./pages/admin/AdminReports.tsx";
import AdminProfile from "./pages/admin/AdminProfile.tsx";
import LandlordLayout from "./pages/landlord/LandlordLayout.tsx";
import LandlordDashboard from "./pages/landlord/LandlordDashboard.tsx";
import MyListings from "./pages/landlord/MyListings.tsx";
import CreateListing from "./pages/landlord/CreateListing.tsx";
import EditListing from "./pages/landlord/EditListing.tsx";
import LandlordProfile from "./pages/landlord/LandlordProfile.tsx";
import StudentLayout from "./pages/student/StudentLayout.tsx";
import StudentDashboard from "./pages/student/StudentDashboard.tsx";
import SavedListings from "./pages/student/SavedListings.tsx";
import StudentProfile from "./pages/student/StudentProfile.tsx";
import StudentMessages from "./pages/student/StudentMessages.tsx";
import LandlordMessages from "./pages/landlord/LandlordMessages.tsx";

const queryClient = new QueryClient();

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <ScrollToTopOnRouteChange />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/search", element: <Search /> },
      { path: "/listing/:id", element: <ListingDetail /> },
      { path: "/about", element: <About /> },
      { path: "/safety", element: <Safety /> },
      {
        path: "/student",
        element: <StudentLayout />,
        children: [
          { index: true, element: <StudentDashboard /> },
          { path: "saved", element: <SavedListings /> },
          { path: "messages", element: <StudentMessages /> },
          { path: "profile", element: <StudentProfile /> },
        ],
      },
      {
        path: "/landlord",
        element: <LandlordLayout />,
        children: [
          { index: true, element: <LandlordDashboard /> },
          { path: "listings", element: <MyListings /> },
          { path: "listings/new", element: <CreateListing /> },
          { path: "listings/:id/edit", element: <EditListing /> },
          { path: "messages", element: <LandlordMessages /> },
          { path: "profile", element: <LandlordProfile /> }
        ],
      },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="listings/pending" replace /> },
          { path: "users", element: <AdminUsers /> },
          { path: "listings", element: <AdminAllListings /> },
          { path: "listings/pending", element: <AdminPendingListings /> },
          { path: "reports", element: <AdminReports /> },
          { path: "profile", element: <AdminProfile /> }
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
