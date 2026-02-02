
import {
    createProjectService, listProjectsService, activateProjectVersionService,
    getProjectLiveUrlService,
<<<<<<< HEAD
    listProjectVersionsService, getProjectByIdService, getProjectInfoService
} from "../services/project.service.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
=======
    listProjectVersionsService, getProjectByIdService
} from "../services/project.service.js";
import ApiError from "../utils/apiError.js";
>>>>>>> 3b56d4c (optimization and roadmap creation changes)

import { validateRoadmapTimelines, validateRoadmapItemsTimeline } from "../validators/roadmap.validator.js";

export const projectController = {
<<<<<<< HEAD
    list: asyncHandler(async (req, res) => {
        const projects = await listProjectsService(req.user);
        res.json(projects);
    }),

    // GET /api/projects/:projectId
    getById: asyncHandler(async (req, res) => {
=======
    list: async (req, res) => {
        const projects = await listProjectsService(req.user);
        res.json(projects);
    },

    // GET /api/projects/:projectId
    getById: async (req, res) => {
>>>>>>> 3b56d4c (optimization and roadmap creation changes)
        const projectId = Number(req.params.projectId);

        const project = await getProjectByIdService(projectId, req.user);

        if (!project) {
            res.status(404);
            throw new ApiError(404, 'Project not found');
        }

        res.json(project);
<<<<<<< HEAD
    }),

    create: asyncHandler(async (req, res) => {
=======
    },

    create: async (req, res) => {
>>>>>>> 3b56d4c (optimization and roadmap creation changes)
        const { roadmaps } = req.body;
        if (!Array.isArray(roadmaps) || roadmaps.length === 0) {
            throw new ApiError(400, "roadmap is required");
        }
        /**
         * roadmap-level validations
         * (basic required/enums already handled by middleware)
         */
        const validatedRoadmaps = validateRoadmapTimelines(roadmaps);

        validatedRoadmaps.forEach((roadmap) => {
            validateRoadmapItemsTimeline(roadmap);
        });

        const project = await createProjectService({
            userId: req.user.id,
            body: req.body,
        });

        res.status(201).json(project);
    }),
    activateVersion: asyncHandler(async (req, res) => {
        const projectId = Number(req.params.id);
        const versionId = Number(req.params.versionId);

        await activateProjectVersionService({
            projectId,
            versionId,
            user: req.user,
        });

        res.json({ message: "Version activated successfully" });
    }),
    getLiveUrl: asyncHandler(async (req, res) => {
        const data = await getProjectLiveUrlService({
            projectId: Number(req.params.id),
            user: req.user,
        });

        res.json({
            liveUrl: data.buildUrl,
            version: data.version,
        });
    }),

    listVersions: asyncHandler(async (req, res) => {
        const versions = await listProjectVersionsService({
            projectId: Number(req.params.id),
            user: req.user,
        });

        res.json(versions);
    }),

    info: asyncHandler(async (req, res) => {
        const projectId = Number(req.params.id);
        const data = await getProjectInfoService(projectId);
        res.json(data);
    }),
};
