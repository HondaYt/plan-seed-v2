export type ProjectState = {
	genre: string;
	keywords: string[];
	concept: string;
	target: {
		ageMin: string;
		ageMax: string;
		gender: string;
		occupation: string;
		personality: string;
	};
	scene: {
		when: string;
		where: string;
	};
	features: string[];
	mainFeatureIndex: number;
};

export type ProjectStatus = {
	currentStep: string;
	completedSteps: string[];
	lastUpdated: Date;
};

export interface Project {
	id: string;
	name: string;
	createdAt: Date;
	userId: string;
	sharedWith: string[];
	deletedAt?: Date | null;
	state?: ProjectState;
	status: ProjectStatus;
}
