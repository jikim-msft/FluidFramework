/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import fs from "fs";
import { ICreateTreeParams, ITree, ITreeEntry } from "@fluidframework/gitresources";
import { Router } from "express";
import * as git from "isomorphic-git";
import nconf from "nconf";
import * as utils from "../utils";

export async function createTree(
	store: nconf.Provider,
	tenantId: string,
	authorization: string,
	params: ICreateTreeParams,
): Promise<ITree> {
	const entries: git.TreeEntry[] = params.tree.map((tree) => {
		const entry: git.TreeEntry = {
			mode: tree.mode,
			oid: tree.sha,
			path: tree.path,
			type: "tree",
		};

		return entry;
	});

	const sha = await git.writeTree({
		fs,
		dir: utils.getGitDir(store, tenantId),
		tree: entries,
	});

	return getTree(store, tenantId, authorization, sha, false, true);
}

export async function getTree(
	store: nconf.Provider,
	tenantId: string,
	authorization: string,
	sha: string,
	recursive: boolean,
	useCache: boolean,
): Promise<ITree> {
	let returnEntries;

	if (recursive) {
		returnEntries = await git.walk({
			fs,
			dir: utils.getGitDir(store, tenantId),
			map: (async (path, [head]) => {
				if (path === ".") {
					return;
				}

				return {
					path,
					mode: (await head.mode()).toString(8),
					sha: await head.oid(),
					size: 0,
					type: await head.type(),
					url: "",
				};
			}) as any,
			trees: [git.TREE({ ref: sha } as any)],
		});
	} else {
		const treeObject = await git.readTree({
			fs,
			dir: utils.getGitDir(store, tenantId),
			oid: sha,
		});
		const description = treeObject.tree;

		returnEntries = description.map((tree) => {
			const returnEntry: ITreeEntry = {
				path: tree.path,
				mode: tree.mode,
				sha: tree.oid,
				size: 0,
				type: tree.type,
				url: "",
			};

			return returnEntry;
		});
	}

	return {
		sha,
		tree: returnEntries,
		url: "",
	};
}

// async function createSummary(
// 	tenantId: string,
// 	authorization: string,
// 	params: IWholeSummaryPayload,
// 	initial?: boolean,
// 	storageName?: string,
// ): Promise<IWriteSummaryResponse> {
// 	const service = await utils.createGitService({
// 		config,
// 		tenantId,
// 		authorization,
// 		tenantService,
// 		storageNameRetriever,
// 		documentManager,
// 		cache,
// 		asyncLocalStorage,
// 		initialUpload: initial,
// 		storageName,
// 		isEphemeralContainer,
// 		denyList,
// 	});
// 	return service.createSummary(params, initial);
// }

export function create(store: nconf.Provider): Router {
	const router: Router = Router();

	router.post("/repos/:ignored?/:tenantId/git/trees", (request, response) => {
		const treeP = createTree(
			store,
			request.params.tenantId,
			request.get("Authorization"),
			request.body,
		);

		utils.handleResponse(treeP, response, false, 201);
	});

	router.post("/repos/:ignored?/:tenantId/git/summaries", (request, response, next) => {
		// request.query type is { [string]: string } but it's actually { [string]: any }
		// Account for possibilities of undefined, boolean, or string types. A number will be false.
		// const initial: boolean | undefined =
		// 	typeof request.query.initial === "undefined"
		// 		? undefined
		// 		: typeof request.query.initial === "boolean"
		// 		? request.query.initial
		// 		: request.query.initial === "true";

		// // const lumberjackProperties = {
		// // 	[BaseTelemetryProperties.tenantId]: request.params.tenantId,
		// // 	[Constants.IsEphemeralContainer]: isEphemeralContainer,
		// // 	[Constants.isInitialSummary]: initial,
		// // };
		// // Lumberjack.info(`Calling createSummary`, lumberjackProperties);

		// const summaryP = createSummary(
		// 	request.params.tenantId,
		// 	request.get("Authorization"),
		// 	request.body,
		// 	initial,
		// 	request.get("StorageName"),
		// );

		// utils.handleResponse(summaryP, response, false, undefined, 201);
		throw new Error("ERRORS in trees.ts");
	});

	router.get("/repos/:ignored?/:tenantId/git/trees/:sha", (request, response) => {
		const useCache = !("disableCache" in request.query);
		const treeP = getTree(
			store,
			request.params.tenantId,
			request.get("Authorization"),
			request.params.sha,
			request.query.recursive === "1",
			useCache,
		);

		utils.handleResponse(treeP, response, useCache);
	});

	return router;
}
