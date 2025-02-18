import { createContext, useContext } from "react";
import type { ProjectState } from "@/types/project";

interface PlanningContextType {
	state: ProjectState;
	setState: (
		value: ProjectState | ((prev: ProjectState) => ProjectState),
	) => void;
}

export const PlanningContext = createContext<PlanningContextType | undefined>(
	undefined,
);

export const usePlanning = () => {
	const context = useContext(PlanningContext);
	if (!context) {
		throw new Error("usePlanning must be used within a PlanningProvider");
	}
	return context;
};
