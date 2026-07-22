"use client";

import { useEffect } from "react";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { OrderAssignmentService } from "@admin/@services/apis/OrdersService/OrderAssignment.service";
import {
  startAssignPresenceSession,
  stopAssignPresenceSession,
} from "@admin/@config/assignPresence.session";

const ASSIGN_VIEW_PERMISSION = "order_assignment_view";

/**
 * Resumes assign presence after refresh if the agent is already online.
 * Keeps the session alive across routes (Assign Order → order view, etc.).
 */
const AssignPresenceKeeper = () => {
  const { permissionList, loadingUser, token } = useGlobalContext();
  const canAssign = permissionList?.includes(ASSIGN_VIEW_PERMISSION);

  useEffect(() => {
    if (loadingUser) return;

    // Logout / no token → release presence
    if (!token || !canAssign) {
      stopAssignPresenceSession();
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await OrderAssignmentService.getMe();
        if (cancelled) return;
        const status = res?.data?.status;
        if (status === "available" || status === "busy") {
          startAssignPresenceSession();
        }
      } catch {
        // Ignore — agent may lack access or be offline
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadingUser, token, canAssign]);

  return null;
};

export default AssignPresenceKeeper;
