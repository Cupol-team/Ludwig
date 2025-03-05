import { useParams, Navigate } from "react-router-dom";

function WorkspaceRedirector() {
  const { orgId, projectUuid } = useParams();
  const destination = `/organizations/${orgId}/project/${projectUuid}/workspace/board`;

  return <Navigate to={destination} replace />;
}

export default WorkspaceRedirector; 