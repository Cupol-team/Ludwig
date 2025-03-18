import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";
import CreateOrganization from './pages/CreateOrganization/CreateOrganization';
import WorkspaceRedirector from "./pages/Workspace/WorkspaceRedirector";
import GlobalStyle from "./styles/GlobalStyles";
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header';
import Settings from "./pages/Workspace/Settings";
import GeneralSettings from "./pages/Workspace/Settings/General";

// Новый контейнер для центрирования окна входа
const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
`;

const Login = lazy(() => import("./pages/Login"));
const OrganizationsPage = lazy(() => import("./pages/OrganizationsPage"));
const OrganizationDetailsPage = lazy(() => import("./pages/OrganizationDetailsPage"));
const CreateProject = lazy(() => import("./pages/CreateProject/CreateProject"));

const Workspace = lazy(() => import("./pages/Workspace/Workspace"));
const Board = lazy(() => import("./pages/Workspace/Board"));
const Tasks = lazy(() => import("./pages/Workspace/Tasks"));
const TaskStatuses = lazy(() => import("./pages/Workspace/TaskStatuses"));
const TaskTypes = lazy(() => import("./pages/Workspace/TaskTypes"));
const Members = lazy(() => import("./pages/Workspace/Members"));
const Roles = lazy(() => import("./pages/Workspace/Roles"));
const FileSharing = lazy(() => import('./pages/Workspace/FileSharing'));
const Calls = lazy(() => import('./pages/Workspace/Calls/CallsMain'));
const CallsRoom = lazy(() => import('./pages/Workspace/Calls/CallsRoom'));
const Register = lazy(() => import("./pages/Register"));

const App = () => {
    const location = useLocation(); // Получаем текущий путь

    return (
        <>
            <GlobalStyle />
            {location.pathname !== '/register' && location.pathname !== '/login' && <Header />} {/* Условие для отображения Header */}
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route 
                      path="/login" 
                      element={
                        <CenteredContainer>
                           <Login />
                        </CenteredContainer>
                      } 
                    />
                    <Route
                        path="/register"
                        element={
                            <CenteredContainer>
                                <Register />
                            </CenteredContainer>
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <OrganizationsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile/:userId?"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/organizations/:orgId"
                        element={
                            <ProtectedRoute>
                                <OrganizationDetailsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/organizations/:orgId/project/new"
                        element={
                            <ProtectedRoute>
                                <CreateProject />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/organizations/create" element={<CreateOrganization />} />
                    
                    <Route path="room/:roomId" element={<CallsRoom />} />

                    {/* Новый маршрут для рабочего пространства проекта */}
                    <Route 
                        path="/organizations/:orgId/project/:projectUuid/workspace/*" 
                        element={
                            <ProtectedRoute>
                                <Workspace />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<WorkspaceRedirector />} />
                        <Route path="board" element={<Board />} />
                        <Route path="tasks" element={<Tasks />} />
                        <Route path="settings/*" element={<Settings />}>
                            <Route path="roles" element={<Roles />} />
                            <Route path="task-types" element={<TaskTypes />} />
                            <Route path="task-statuses" element={<TaskStatuses />} />
                            <Route path="members" element={<Members />} />
                            <Route path="general" element={<GeneralSettings />} />
                            <Route index element={<Roles />} />
                        </Route>
                        <Route path="files" element={<FileSharing />} />
                        <Route path="calls" element={<Calls />} />
                    </Route>
                </Routes>
            </Suspense>
        </>
    );
};

export default App;
