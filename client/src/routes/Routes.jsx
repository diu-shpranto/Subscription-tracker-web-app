import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import SingleEmailPage from "../pages/SingleEmailPage";
import FamilyEmailPage from "../pages/FamilyEmailPage";
import ImportExportPage from "../pages/ImportExportPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/single-email",
        element: <SingleEmailPage />,
      },
      {
        path: "/family-email",
        element: <FamilyEmailPage />,
      },
      {
        path: "/import-export",
        element: <ImportExportPage />,
      },
    ],
  },
]);

export default router;