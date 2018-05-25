/******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var chunk = require("./" + "" + chunkId + "." + hotCurrentHash + ".hot-update.js");
/******/ 		hotAddUpdateChunk(chunk.id, chunk.modules);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest() { // eslint-disable-line no-unused-vars
/******/ 		try {
/******/ 			var update = require("./" + "" + hotCurrentHash + ".hot-update.json");
/******/ 		} catch(e) {
/******/ 			return Promise.resolve();
/******/ 		}
/******/ 		return Promise.resolve(update);
/******/ 	}
/******/ 	
/******/ 	function hotDisposeChunk(chunkId) { //eslint-disable-line no-unused-vars
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/
/******/ 	
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "3d58b995ebbd83d30ba0"; // eslint-disable-line no-unused-vars
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if(me.children.indexOf(request) < 0)
/******/ 					me.children.push(request);
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name) && name !== "e") {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/ 	
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if(hotStatus === "prepare") {
/******/ 					if(!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 0;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if(!deferred) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve().then(function() {
/******/ 				return hotApply(hotApplyOnUpdate);
/******/ 			}).then(
/******/ 				function(result) {
/******/ 					deferred.resolve(result);
/******/ 				},
/******/ 				function(err) {
/******/ 					deferred.reject(err);
/******/ 				}
/******/ 			);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/ 	
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/ 	
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice().map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while(queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if(module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(!parent) continue;
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 	
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn("[HMR] unexpected require(" + result.moduleId + ") to disposed module");
/******/ 		};
/******/ 	
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				var result;
/******/ 				if(hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if(result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch(result.type) {
/******/ 					case "self-declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of self decline: " + result.moduleId + chainInfo);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of declined dependency: " + result.moduleId + " in " + result.parentId + chainInfo);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if(options.onUnaccepted)
/******/ 							options.onUnaccepted(result);
/******/ 						if(!options.ignoreUnaccepted)
/******/ 							abortError = new Error("Aborted because " + moduleId + " is not accepted" + chainInfo);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if(options.onAccepted)
/******/ 							options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if(options.onDisposed)
/******/ 							options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if(abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if(doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for(moduleId in result.outdatedDependencies) {
/******/ 						if(Object.prototype.hasOwnProperty.call(result.outdatedDependencies, moduleId)) {
/******/ 							if(!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(outdatedDependencies[moduleId], result.outdatedDependencies[moduleId]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if(doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if(hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/ 	
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for(j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if(idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for(i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if(cb) {
/******/ 							if(callbacks.indexOf(cb) >= 0) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for(i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch(err) {
/******/ 							if(options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if(!options.ignoreErrored) {
/******/ 								if(!error)
/******/ 									error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err2) {
/******/ 						if(options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								orginalError: err, // TODO remove in webpack 4
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if(!options.ignoreErrored) {
/******/ 							if(!error)
/******/ 								error = err2;
/******/ 						}
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if(options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if(!options.ignoreErrored) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(11)(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require('path');

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const path = __webpack_require__(0);
const DATA_PATH = path.join(__dirname, '../data');
exports.DATA_PATH = DATA_PATH;
const ANALYTICS_PATH = path.join(__dirname, '../../src');
exports.ANALYTICS_PATH = ANALYTICS_PATH;
const ANOMALIES_PATH = path.join(ANALYTICS_PATH, 'anomalies');
exports.ANOMALIES_PATH = ANOMALIES_PATH;
const SEGMENTS_PATH = path.join(ANALYTICS_PATH, 'segments');
exports.SEGMENTS_PATH = SEGMENTS_PATH;
const METRICS_PATH = path.join(ANALYTICS_PATH, 'metrics');
exports.METRICS_PATH = METRICS_PATH;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const path = __webpack_require__(0);
const json_1 = __webpack_require__(3);
const config_1 = __webpack_require__(1);
const fs = __webpack_require__(5);
const crypto = __webpack_require__(8);
let anomaliesNameToIdMap = {};
function loadAnomaliesMap() {
    let filename = path.join(config_1.ANOMALIES_PATH, `all_anomalies.json`);
    anomaliesNameToIdMap = json_1.getJsonDataSync(filename);
}
function saveAnomaliesMap() {
    let filename = path.join(config_1.ANOMALIES_PATH, `all_anomalies.json`);
    json_1.writeJsonDataSync(filename, anomaliesNameToIdMap);
}
function getAnomalyIdByName(anomalyName) {
    loadAnomaliesMap();
    anomalyName = anomalyName.toLowerCase();
    if (anomalyName in anomaliesNameToIdMap) {
        return anomaliesNameToIdMap[anomalyName];
    }
    return anomalyName;
}
exports.getAnomalyIdByName = getAnomalyIdByName;
function insertAnomaly(anomaly) {
    const hashString = anomaly.name + (new Date()).toString();
    const anomalyId = crypto.createHash('md5').update(hashString).digest('hex');
    anomaliesNameToIdMap[anomaly.name] = anomalyId;
    saveAnomaliesMap();
    // return anomalyId
    // const anomalyId:AnomalyId = anomaly.name;
    let filename = path.join(config_1.ANOMALIES_PATH, `${anomalyId}.json`);
    if (fs.existsSync(filename)) {
        return null;
    }
    saveAnomaly(anomalyId, anomaly);
    return anomalyId;
}
exports.insertAnomaly = insertAnomaly;
function removeAnomaly(anomalyId) {
    let filename = path.join(config_1.ANOMALIES_PATH, `${anomalyId}.json`);
    fs.unlinkSync(filename);
}
exports.removeAnomaly = removeAnomaly;
function saveAnomaly(anomalyId, anomaly) {
    let filename = path.join(config_1.ANOMALIES_PATH, `${anomalyId}.json`);
    return json_1.writeJsonDataSync(filename, anomaly);
}
exports.saveAnomaly = saveAnomaly;
function loadAnomalyById(anomalyId) {
    let filename = path.join(config_1.ANOMALIES_PATH, `${anomalyId}.json`);
    if (!fs.existsSync(filename)) {
        return null;
    }
    return json_1.getJsonDataSync(filename);
}
exports.loadAnomalyById = loadAnomalyById;
function loadAnomalyByName(anomalyName) {
    let anomalyId = getAnomalyIdByName(anomalyName);
    return loadAnomalyById(anomalyId);
}
exports.loadAnomalyByName = loadAnomalyByName;
function saveAnomalyTypeInfo(info) {
    console.log('Saving');
    let filename = path.join(config_1.ANOMALIES_PATH, `${info.name}.json`);
    if (info.next_id === undefined) {
        info.next_id = 0;
    }
    if (info.last_prediction_time === undefined) {
        info.last_prediction_time = 0;
    }
    return json_1.writeJsonDataSync(filename, info);
}
exports.saveAnomalyTypeInfo = saveAnomalyTypeInfo;
function getAnomalyTypeInfo(name) {
    return json_1.getJsonDataSync(path.join(config_1.ANOMALIES_PATH, `${name}.json`));
}
exports.getAnomalyTypeInfo = getAnomalyTypeInfo;
function setAnomalyStatus(anomalyId, status, error) {
    let info = loadAnomalyById(anomalyId);
    info.status = status;
    if (error !== undefined) {
        info.error = error;
    }
    else {
        info.error = '';
    }
    saveAnomaly(anomalyId, info);
}
exports.setAnomalyStatus = setAnomalyStatus;
function setAnomalyPredictionTime(anomalyId, lastPredictionTime) {
    let info = loadAnomalyById(anomalyId);
    info.last_prediction_time = lastPredictionTime;
    saveAnomaly(anomalyId, info);
}
exports.setAnomalyPredictionTime = setAnomalyPredictionTime;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __webpack_require__(5);
function getJsonData(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield new Promise((resolve, reject) => {
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    reject('Can`t read file');
                }
                else {
                    resolve(data);
                }
            });
        });
        try {
            return JSON.parse(data);
        }
        catch (e) {
            console.error(e);
            throw new Error('Wrong file format');
        }
    });
}
exports.getJsonData = getJsonData;
function writeJsonData(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, JSON.stringify(data), 'utf8', (err) => {
            if (err) {
                console.error(err);
                reject('Cat`t write file');
            }
            else {
                resolve();
            }
        });
    });
}
exports.writeJsonData = writeJsonData;
function getJsonDataSync(filename) {
    let data = fs.readFileSync(filename, 'utf8');
    try {
        return JSON.parse(data);
    }
    catch (e) {
        console.error(e);
        throw new Error('Wrong file format');
    }
}
exports.getJsonDataSync = getJsonDataSync;
function writeJsonDataSync(filename, data) {
    fs.writeFileSync(filename, JSON.stringify(data));
}
exports.writeJsonDataSync = writeJsonDataSync;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require('express');

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require('fs');

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __webpack_require__(14);
const config_1 = __webpack_require__(1);
const anomalyType_1 = __webpack_require__(2);
const metrics_1 = __webpack_require__(9);
const segments_1 = __webpack_require__(7);
const event_stream_1 = __webpack_require__(15);
const learnWorker = child_process_1.spawn('python3', ['worker.py'], { cwd: config_1.ANALYTICS_PATH });
learnWorker.stdout.pipe(event_stream_1.split())
    .pipe(event_stream_1.mapSync(function (line) {
    onMessage(line);
}));
learnWorker.stderr.on('data', data => console.error(`worker stderr: ${data}`));
const taskMap = {};
let nextTaskId = 0;
function onMessage(data) {
    console.log(`worker stdout: ${data}`);
    let response = JSON.parse(data);
    let taskId = response.__task_id;
    // let anomalyName = response.anomaly_name;
    // let task = response.task;
    let status = response.status;
    if (status === 'success' || status === 'failed') {
        if (taskId in taskMap) {
            let resolver = taskMap[taskId];
            resolver(response);
            delete taskMap[taskId];
        }
    }
}
function runTask(task) {
    let anomaly = anomalyType_1.loadAnomalyById(task.anomaly_id);
    task.metric = {
        datasource: anomaly.metric.datasource,
        targets: anomaly.metric.targets.map(t => metrics_1.getTarget(t))
    };
    task.__task_id = nextTaskId++;
    let command = JSON.stringify(task);
    learnWorker.stdin.write(`${command}\n`);
    return new Promise((resolve, reject) => {
        taskMap[task.__task_id] = resolve;
    });
}
function runLearning(anomalyId) {
    return __awaiter(this, void 0, void 0, function* () {
        let segments = segments_1.getLabeledSegments(anomalyId);
        anomalyType_1.setAnomalyStatus(anomalyId, 'learning');
        let anomaly = anomalyType_1.loadAnomalyById(anomalyId);
        let analyticsType = "anomalies";
        let preset = undefined;
        if (anomaly.name.includes("jumps")) {
            analyticsType = "patterns";
            preset = "steps";
        }
        if (anomaly.name.includes("cliffs") || anomaly.name.includes("drops")) {
            analyticsType = "patterns";
            preset = "cliffs";
        }
        if (anomaly.name.includes("peaks")) {
            analyticsType = "patterns";
            preset = "peaks";
        }
        let task = {
            type: 'learn',
            anomaly_id: anomalyId,
            analytics_type: analyticsType,
            preset,
            segments: segments
        };
        let result = yield runTask(task);
        if (result.status === 'success') {
            anomalyType_1.setAnomalyStatus(anomalyId, 'ready');
            segments_1.insertSegments(anomalyId, result.segments, false);
            anomalyType_1.setAnomalyPredictionTime(anomalyId, result.last_prediction_time);
        }
        else {
            anomalyType_1.setAnomalyStatus(anomalyId, 'failed', result.error);
        }
    });
}
exports.runLearning = runLearning;
function runPredict(anomalyId) {
    return __awaiter(this, void 0, void 0, function* () {
        let anomaly = anomalyType_1.loadAnomalyById(anomalyId);
        let analyticsType = "anomalies";
        let preset = undefined;
        if (anomaly.name.includes("jump")) {
            analyticsType = "patterns";
            preset = "steps";
        }
        if (anomaly.name.includes("cliffs") || anomaly.name.includes("drops")) {
            analyticsType = "patterns";
            preset = "cliffs";
        }
        if (anomaly.name.includes("peaks")) {
            analyticsType = "patterns";
            preset = "peaks";
        }
        let task = {
            type: 'predict',
            anomaly_id: anomalyId,
            analytics_type: analyticsType,
            preset,
            last_prediction_time: anomaly.last_prediction_time
        };
        let result = yield runTask(task);
        if (result.status === 'failed') {
            return [];
        }
        // Merging segments
        let segments = segments_1.getLabeledSegments(anomalyId);
        if (segments.length > 0 && result.segments.length > 0) {
            let lastOldSegment = segments[segments.length - 1];
            let firstNewSegment = result.segments[0];
            if (firstNewSegment.start <= lastOldSegment.finish) {
                result.segments[0].start = lastOldSegment.start;
                segments_1.removeSegments(anomalyId, [lastOldSegment.id]);
            }
        }
        segments_1.insertSegments(anomalyId, result.segments, false);
        anomalyType_1.setAnomalyPredictionTime(anomalyId, result.last_prediction_time);
        return result.segments;
    });
}
exports.runPredict = runPredict;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const path = __webpack_require__(0);
const json_1 = __webpack_require__(3);
const config_1 = __webpack_require__(1);
const anomalyType_1 = __webpack_require__(2);
function getLabeledSegments(anomalyId) {
    let filename = path.join(config_1.SEGMENTS_PATH, `${anomalyId}_labeled.json`);
    let segments = [];
    try {
        segments = json_1.getJsonDataSync(filename);
        for (let segment of segments) {
            if (segment.labeled === undefined) {
                segment.labeled = false;
            }
        }
    }
    catch (e) {
        console.error(e.message);
    }
    return segments;
}
exports.getLabeledSegments = getLabeledSegments;
function getPredictedSegments(anomalyId) {
    let filename = path.join(config_1.SEGMENTS_PATH, `${anomalyId}_segments.json`);
    let jsonData;
    try {
        jsonData = json_1.getJsonDataSync(filename);
    }
    catch (e) {
        console.error(e.message);
        jsonData = [];
    }
    return jsonData;
}
exports.getPredictedSegments = getPredictedSegments;
function saveSegments(anomalyId, segments) {
    let filename = path.join(config_1.SEGMENTS_PATH, `${anomalyId}_labeled.json`);
    try {
        return json_1.writeJsonDataSync(filename, segments);
    }
    catch (e) {
        console.error(e.message);
        throw new Error('Can`t write to db');
    }
}
exports.saveSegments = saveSegments;
function insertSegments(anomalyId, addedSegments, labeled) {
    // Set status
    let info = anomalyType_1.loadAnomalyById(anomalyId);
    let segments = getLabeledSegments(anomalyId);
    let nextId = info.next_id;
    let addedIds = [];
    for (let segment of addedSegments) {
        segment.id = nextId;
        segment.labeled = labeled;
        addedIds.push(nextId);
        nextId++;
        segments.push(segment);
    }
    info.next_id = nextId;
    saveSegments(anomalyId, segments);
    anomalyType_1.saveAnomaly(anomalyId, info);
    return addedIds;
}
exports.insertSegments = insertSegments;
function removeSegments(anomalyId, removedSegments) {
    let segments = getLabeledSegments(anomalyId);
    for (let segmentId of removedSegments) {
        segments = segments.filter(el => el.id !== segmentId);
    }
    saveSegments(anomalyId, segments);
}
exports.removeSegments = removeSegments;


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require('crypto');

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const path = __webpack_require__(0);
const json_1 = __webpack_require__(3);
const config_1 = __webpack_require__(1);
const crypto = __webpack_require__(8);
function saveTargets(targets) {
    let metrics = [];
    for (let target of targets) {
        metrics.push(saveTarget(target));
    }
    return metrics;
}
exports.saveTargets = saveTargets;
function saveTarget(target) {
    //const md5 = crypto.createHash('md5')
    const targetId = crypto.createHash('md5').update(JSON.stringify(target)).digest('hex');
    let filename = path.join(config_1.METRICS_PATH, `${targetId}.json`);
    json_1.writeJsonDataSync(filename, target);
    return targetId;
}
function getTarget(targetId) {
    let filename = path.join(config_1.METRICS_PATH, `${targetId}.json`);
    return json_1.getJsonDataSync(filename);
}
exports.getTarget = getTarget;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//import * as Telegraf from 'telegraf'
const path = __webpack_require__(0);
const config_1 = __webpack_require__(1);
const json_1 = __webpack_require__(3);
function sendNotification(anomalyName, active) {
    console.log('Notification ' + anomalyName);
    if (anomalyName in botConfig.subscriptions) {
        let notificationMessage;
        if (active) {
            notificationMessage = 'Alert! Anomaly type ' + anomalyName;
        }
        else {
            notificationMessage = 'Ok! Anomaly type ' + anomalyName;
        }
        for (let SubscriberId of botConfig.subscriptions[anomalyName]) {
            bot.telegram.sendMessage(SubscriberId, notificationMessage);
        }
    }
}
exports.sendNotification = sendNotification;
function loadBotConfig() {
    let filename = path.join(config_1.DATA_PATH, `bot_config.json`);
    let jsonData;
    try {
        jsonData = json_1.getJsonDataSync(filename);
    }
    catch (e) {
        console.error(e.message);
        jsonData = [];
    }
    return jsonData;
}
function saveBotConfig(botConfig) {
    let filename = path.join(config_1.DATA_PATH, `bot_config.json`);
    try {
        json_1.writeJsonDataSync(filename, botConfig);
    }
    catch (e) {
        console.error(e.message);
    }
}
const commandArgs = (ctx, next) => {
    try {
        if (ctx.updateType === 'message') {
            const text = ctx.update.message.text;
            if (text !== undefined && text.startsWith('/')) {
                const match = text.match(/^\/([^\s]+)\s?(.+)?/);
                let args = [];
                let command;
                if (match !== null) {
                    if (match[1]) {
                        command = match[1];
                    }
                    if (match[2]) {
                        args = match[2].split(' ');
                    }
                }
                ctx.state.command = {
                    raw: text,
                    command,
                    args,
                };
            }
        }
        return next(ctx);
    }
    catch (e) {
    }
};
function addNotification(ctx) {
    console.log('addNotification');
    let command = ctx.state.command;
    let chatId = ctx.chat.id;
    if (command.args.length > 0) {
        for (let anomalyName of command.args) {
            if (!(anomalyName in botConfig.subscriptions)) {
                botConfig.subscriptions[anomalyName] = [];
            }
            if (botConfig.subscriptions[anomalyName].includes(chatId)) {
                return ctx.reply('You are already subscribed on alerts from anomaly ' + command.args);
            }
            else {
                botConfig.subscriptions[anomalyName].push(chatId);
                saveBotConfig(botConfig);
            }
        }
        return ctx.reply('You have been successfully subscribed on alerts from anomaly ' + command.args);
    }
    else {
        return ctx.reply('You should use syntax: \/addNotification <anomaly_name>');
    }
}
function removeNotification(ctx) {
    let command = ctx.state.command;
    let chatId = ctx.chat.id;
    if (command.args.length > 0) {
        for (let anomalyName of command.args) {
            if (anomalyName in botConfig.subscriptions) {
                botConfig.subscriptions[anomalyName] = botConfig.subscriptions[anomalyName].filter(el => el !== chatId);
                saveBotConfig(botConfig);
            }
        }
        return ctx.reply('You have been successfully unsubscribed from alerts from ' + command.args);
    }
    else {
        return ctx.reply('You should use syntax: \/removeNotification <anomaly_name>');
    }
}
const Telegraf = __webpack_require__(19);
let botConfig;
let bot;
function tgBotInit() {
    try {
        botConfig = loadBotConfig();
        bot = new Telegraf(botConfig.token);
        bot.use(commandArgs);
        bot.command('addNotification', addNotification);
        bot.command('removeNotification', removeNotification);
        bot.startPolling();
    }
    catch (e) {
        // TODO: handle exception
    }
}
exports.tgBotInit = tgBotInit;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const express = __webpack_require__(4);
const bodyParser = __webpack_require__(12);
const anomalies_1 = __webpack_require__(13);
const segments_1 = __webpack_require__(16);
const alerts_1 = __webpack_require__(17);
const notification_1 = __webpack_require__(10);
const app = express();
const PORT = process.env.HASTIC_PORT || 8000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use('/anomalies', anomalies_1.router);
app.use('/segments', segments_1.router);
app.use('/alerts', alerts_1.router);
app.use('/', (req, res) => res.send({ status: 'OK' }));
app.listen(PORT, () => {
    console.log(`Server is running on :${PORT}`);
});
notification_1.tgBotInit();


/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require('body-parser');

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __webpack_require__(4);
const anomalyType_1 = __webpack_require__(2);
const analytics_1 = __webpack_require__(6);
const metrics_1 = __webpack_require__(9);
function sendAnomalyTypeStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = req.query.id;
        let name = req.query.name;
        try {
            let anomaly;
            if (id !== undefined) {
                anomaly = anomalyType_1.loadAnomalyById(id);
            }
            else {
                anomaly = anomalyType_1.loadAnomalyByName(name);
            }
            if (anomaly === null) {
                res.status(404).send({
                    code: 404,
                    message: 'Not found'
                });
                return;
            }
            if (anomaly.status === undefined) {
                throw new Error('No status for ' + name);
            }
            res.status(200).send({ status: anomaly.status, errorMessage: anomaly.error });
        }
        catch (e) {
            console.error(e);
            // TODO: better send 404 when we know than isn`t found
            res.status(500).send({ error: 'Can`t return anything' });
        }
    });
}
function getAnomaly(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let id = req.query.id;
            let name = req.query.name;
            let anomaly;
            if (id !== undefined) {
                anomaly = anomalyType_1.loadAnomalyById(id);
            }
            else {
                anomaly = anomalyType_1.loadAnomalyByName(name.toLowerCase());
            }
            if (anomaly === null) {
                res.status(404).send({
                    code: 404,
                    message: 'Not found'
                });
                return;
            }
            let payload = JSON.stringify({
                name: anomaly.name,
                metric: anomaly.metric,
                status: anomaly.status
            });
            res.status(200).send(payload);
        }
        catch (e) {
            console.error(e);
            // TODO: better send 404 when we know than isn`t found
            res.status(500).send('Can`t get anything');
        }
    });
}
function createAnomaly(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const metric = {
                datasource: req.body.metric.datasource,
                targets: metrics_1.saveTargets(req.body.metric.targets)
            };
            const anomaly = {
                name: req.body.name,
                panelUrl: req.body.panelUrl,
                metric: metric,
                datasource: req.body.datasource,
                status: 'learning',
                last_prediction_time: 0,
                next_id: 0
            };
            let anomalyId = anomalyType_1.insertAnomaly(anomaly);
            if (anomalyId === null) {
                res.status(403).send({
                    code: 403,
                    message: 'Already exists'
                });
            }
            let payload = JSON.stringify({ anomaly_id: anomalyId });
            res.status(200).send(payload);
            analytics_1.runLearning(anomalyId);
        }
        catch (e) {
            res.status(500).send({
                code: 500,
                message: 'Internal error'
            });
        }
    });
}
function deleteAnomaly(req, res) {
    try {
        let id = req.query.id;
        let name = req.query.name;
        if (id !== undefined) {
            anomalyType_1.removeAnomaly(id);
        }
        else {
            anomalyType_1.removeAnomaly(name.toLowerCase());
        }
        res.status(200).send({
            code: 200,
            message: 'Success'
        });
    }
    catch (e) {
        res.status(500).send({
            code: 500,
            message: 'Internal error'
        });
    }
}
exports.router = express.Router();
exports.router.get('/status', sendAnomalyTypeStatus);
exports.router.get('/', getAnomaly);
exports.router.post('/', createAnomaly);
exports.router.delete('/', deleteAnomaly);


/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require('child_process');

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require('event-stream');

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __webpack_require__(4);
const segments_1 = __webpack_require__(7);
const analytics_1 = __webpack_require__(6);
const anomalyType_1 = __webpack_require__(2);
function sendSegments(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let anomalyId = req.query.anomaly_id;
            let anomaly = anomalyType_1.loadAnomalyById(anomalyId);
            if (anomaly === null) {
                anomalyId = anomalyType_1.getAnomalyIdByName(anomalyId);
            }
            let lastSegmentId = req.query.last_segment;
            let timeFrom = req.query.from;
            let timeTo = req.query.to;
            let segments = segments_1.getLabeledSegments(anomalyId);
            // Id filtering
            if (lastSegmentId !== undefined) {
                segments = segments.filter(el => el.id > lastSegmentId);
            }
            // Time filtering
            if (timeFrom !== undefined) {
                segments = segments.filter(el => el.finish > timeFrom);
            }
            if (timeTo !== undefined) {
                segments = segments.filter(el => el.start < timeTo);
            }
            let payload = JSON.stringify({
                segments
            });
            res.status(200).send(payload);
        }
        catch (e) {
            res.status(500).send({
                code: 500,
                message: 'Internal error'
            });
        }
    });
}
function updateSegments(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let segmentsUpdate = req.body;
            let anomalyId = segmentsUpdate.anomaly_id;
            let anomalyName = segmentsUpdate.name;
            if (anomalyId === undefined) {
                anomalyId = anomalyType_1.getAnomalyIdByName(anomalyName.toLowerCase());
            }
            let addedIds = segments_1.insertSegments(anomalyId, segmentsUpdate.added_segments, true);
            segments_1.removeSegments(anomalyId, segmentsUpdate.removed_segments);
            let payload = JSON.stringify({ added_ids: addedIds });
            res.status(200).send(payload);
            analytics_1.runLearning(anomalyId);
        }
        catch (e) {
            res.status(500).send({
                code: 500,
                message: 'Internal error'
            });
        }
    });
}
exports.router = express.Router();
exports.router.get('/', sendSegments);
exports.router.patch('/', updateSegments);


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const express = __webpack_require__(4);
const anomalyType_1 = __webpack_require__(2);
const alerts_1 = __webpack_require__(18);
function getAlert(req, res) {
    try {
        let anomalyId = req.query.anomaly_id;
        let anomaly = anomalyType_1.loadAnomalyById(anomalyId);
        if (anomaly == null) {
            anomalyId = anomalyType_1.getAnomalyIdByName(anomalyId.toLowerCase());
        }
        let alertsAnomalies = alerts_1.getAlertsAnomalies();
        let pos = alertsAnomalies.indexOf(anomalyId);
        let enable = (pos !== -1);
        res.status(200).send({
            enable
        });
    }
    catch (e) {
        res.status(500).send({
            code: 500,
            message: 'Internal error'
        });
    }
}
function changeAlert(req, res) {
    try {
        let anomalyId = req.body.anomaly_id;
        let enable = req.body.enable;
        let anomaly = anomalyType_1.loadAnomalyById(anomalyId);
        if (anomaly == null) {
            anomalyId = anomalyType_1.getAnomalyIdByName(anomalyId.toLowerCase());
        }
        let alertsAnomalies = alerts_1.getAlertsAnomalies();
        let pos = alertsAnomalies.indexOf(anomalyId);
        if (enable && pos == -1) {
            alertsAnomalies.push(anomalyId);
            alerts_1.saveAlertsAnomalies(alertsAnomalies);
        }
        else if (!enable && pos > -1) {
            alertsAnomalies.splice(pos, 1);
            alerts_1.saveAlertsAnomalies(alertsAnomalies);
        }
        res.status(200).send({
            status: 'Ok'
        });
    }
    catch (e) {
        res.status(500).send({
            code: 500,
            message: 'Internal error'
        });
    }
}
exports.router = express.Router();
exports.router.get('/', getAlert);
exports.router.post('/', changeAlert);


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_1 = __webpack_require__(3);
const path = __webpack_require__(0);
const fs = __webpack_require__(5);
const config_1 = __webpack_require__(1);
const analytics_1 = __webpack_require__(6);
const notification_1 = __webpack_require__(10);
const segments_1 = __webpack_require__(7);
function getAlertsAnomalies() {
    let filename = path.join(config_1.ANOMALIES_PATH, `alerts_anomalies.json`);
    if (!fs.existsSync(filename)) {
        saveAlertsAnomalies([]);
    }
    return json_1.getJsonDataSync(path.join(config_1.ANOMALIES_PATH, `alerts_anomalies.json`));
}
exports.getAlertsAnomalies = getAlertsAnomalies;
function saveAlertsAnomalies(anomalies) {
    return json_1.writeJsonDataSync(path.join(config_1.ANOMALIES_PATH, `alerts_anomalies.json`), anomalies);
}
exports.saveAlertsAnomalies = saveAlertsAnomalies;
function processAlerts(anomalyId) {
    let segments = segments_1.getLabeledSegments(anomalyId);
    const currentTime = new Date().getTime();
    const activeAlert = activeAlerts.has(anomalyId);
    let newActiveAlert = false;
    if (segments.length > 0) {
        let lastSegment = segments[segments.length - 1];
        if (lastSegment.finish >= currentTime - alertTimeout) {
            newActiveAlert = true;
        }
    }
    if (!activeAlert && newActiveAlert) {
        activeAlerts.add(anomalyId);
        notification_1.sendNotification(anomalyId, true);
    }
    else if (activeAlert && !newActiveAlert) {
        activeAlerts.delete(anomalyId);
        notification_1.sendNotification(anomalyId, false);
    }
}
function alertsTick() {
    return __awaiter(this, void 0, void 0, function* () {
        let alertsAnomalies = getAlertsAnomalies();
        for (let anomalyId of alertsAnomalies) {
            try {
                yield analytics_1.runPredict(anomalyId);
                processAlerts(anomalyId);
            }
            catch (e) {
                console.error(e);
            }
        }
        setTimeout(alertsTick, 5000);
    });
}
const alertTimeout = 60000; // ms
const activeAlerts = new Set();
setTimeout(alertsTick, 5000);


/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require('telegraf');

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgM2Q1OGI5OTVlYmJkODNkMzBiYTAiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgncGF0aCcpXCIiLCJ3ZWJwYWNrOi8vLy4vY29uZmlnLnRzIiwid2VicGFjazovLy8uL3NlcnZpY2VzL2Fub21hbHlUeXBlLnRzIiwid2VicGFjazovLy8uL3NlcnZpY2VzL2pzb24udHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgnZXhwcmVzcycpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgnZnMnKVwiIiwid2VicGFjazovLy8uL3NlcnZpY2VzL2FuYWx5dGljcy50cyIsIndlYnBhY2s6Ly8vLi9zZXJ2aWNlcy9zZWdtZW50cy50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdjcnlwdG8nKVwiIiwid2VicGFjazovLy8uL3NlcnZpY2VzL21ldHJpY3MudHMiLCJ3ZWJwYWNrOi8vLy4vc2VydmljZXMvbm90aWZpY2F0aW9uLnRzIiwid2VicGFjazovLy8uL2luZGV4LnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2JvZHktcGFyc2VyJylcIiIsIndlYnBhY2s6Ly8vLi9yb3V0ZXMvYW5vbWFsaWVzLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2V2ZW50LXN0cmVhbScpXCIiLCJ3ZWJwYWNrOi8vLy4vcm91dGVzL3NlZ21lbnRzLnRzIiwid2VicGFjazovLy8uL3JvdXRlcy9hbGVydHMudHMiLCJ3ZWJwYWNrOi8vLy4vc2VydmljZXMvYWxlcnRzLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ3RlbGVncmFmJylcIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsb0RBQTRDO0FBQzVDO0FBQ0E7QUFDQTs7QUFFQSwwQ0FBa0M7QUFDbEM7QUFDQTtBQUNBLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2Q0FBcUM7QUFDckM7QUFDQTs7OztBQUlBO0FBQ0Esc0RBQThDO0FBQzlDO0FBQ0E7QUFDQSxvQ0FBNEI7QUFDNUIscUNBQTZCO0FBQzdCLHlDQUFpQzs7QUFFakMsK0NBQXVDO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDhDQUFzQztBQUN0QztBQUNBO0FBQ0EscUNBQTZCO0FBQzdCLHFDQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQW9CLGdCQUFnQjtBQUNwQztBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBb0IsZ0JBQWdCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsYUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxhQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5QkFBaUIsOEJBQThCO0FBQy9DO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQUk7QUFDSjs7QUFFQSw0REFBb0Q7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGNBQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQW1CLDJCQUEyQjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFB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OztRQUNFLElBQUksZUFBZSxHQUFHLGtCQUFrQixFQUFFLENBQUM7UUFDM0MsS0FBSyxJQUFJLFNBQVMsSUFBSSxlQUFlLEVBQUU7WUFDckMsSUFBSTtnQkFDRixNQUFNLHNCQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzVCLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUMxQjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEI7U0FDRjtRQUNELFVBQVUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztDQUFBO0FBRUQsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsS0FBSztBQUNqQyxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0FBQ3ZDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7Ozs7Ozs7QUMzRDdCLHFDIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdGZ1bmN0aW9uIGhvdERvd25sb2FkVXBkYXRlQ2h1bmsoY2h1bmtJZCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0dmFyIGNodW5rID0gcmVxdWlyZShcIi4vXCIgKyBcIlwiICsgY2h1bmtJZCArIFwiLlwiICsgaG90Q3VycmVudEhhc2ggKyBcIi5ob3QtdXBkYXRlLmpzXCIpO1xyXG4gXHRcdGhvdEFkZFVwZGF0ZUNodW5rKGNodW5rLmlkLCBjaHVuay5tb2R1bGVzKTtcclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90RG93bmxvYWRNYW5pZmVzdCgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdHRyeSB7XHJcbiBcdFx0XHR2YXIgdXBkYXRlID0gcmVxdWlyZShcIi4vXCIgKyBcIlwiICsgaG90Q3VycmVudEhhc2ggKyBcIi5ob3QtdXBkYXRlLmpzb25cIik7XHJcbiBcdFx0fSBjYXRjaChlKSB7XHJcbiBcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiBcdFx0fVxyXG4gXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodXBkYXRlKTtcclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90RGlzcG9zZUNodW5rKGNodW5rSWQpIHsgLy9lc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0ZGVsZXRlIGluc3RhbGxlZENodW5rc1tjaHVua0lkXTtcclxuIFx0fVxyXG5cbiBcdFxyXG4gXHRcclxuIFx0dmFyIGhvdEFwcGx5T25VcGRhdGUgPSB0cnVlO1xyXG4gXHR2YXIgaG90Q3VycmVudEhhc2ggPSBcIjNkNThiOTk1ZWJiZDgzZDMwYmEwXCI7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0dmFyIGhvdFJlcXVlc3RUaW1lb3V0ID0gMTAwMDA7XHJcbiBcdHZhciBob3RDdXJyZW50TW9kdWxlRGF0YSA9IHt9O1xyXG4gXHR2YXIgaG90Q3VycmVudENoaWxkTW9kdWxlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdHZhciBob3RDdXJyZW50UGFyZW50cyA9IFtdOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdHZhciBob3RDdXJyZW50UGFyZW50c1RlbXAgPSBbXTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90Q3JlYXRlUmVxdWlyZShtb2R1bGVJZCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0dmFyIG1lID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0aWYoIW1lKSByZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXztcclxuIFx0XHR2YXIgZm4gPSBmdW5jdGlvbihyZXF1ZXN0KSB7XHJcbiBcdFx0XHRpZihtZS5ob3QuYWN0aXZlKSB7XHJcbiBcdFx0XHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbcmVxdWVzdF0pIHtcclxuIFx0XHRcdFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW3JlcXVlc3RdLnBhcmVudHMuaW5kZXhPZihtb2R1bGVJZCkgPCAwKVxyXG4gXHRcdFx0XHRcdFx0aW5zdGFsbGVkTW9kdWxlc1tyZXF1ZXN0XS5wYXJlbnRzLnB1c2gobW9kdWxlSWQpO1xyXG4gXHRcdFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0XHRcdGhvdEN1cnJlbnRQYXJlbnRzID0gW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0XHRob3RDdXJyZW50Q2hpbGRNb2R1bGUgPSByZXF1ZXN0O1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGlmKG1lLmNoaWxkcmVuLmluZGV4T2YocmVxdWVzdCkgPCAwKVxyXG4gXHRcdFx0XHRcdG1lLmNoaWxkcmVuLnB1c2gocmVxdWVzdCk7XHJcbiBcdFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0XHRjb25zb2xlLndhcm4oXCJbSE1SXSB1bmV4cGVjdGVkIHJlcXVpcmUoXCIgKyByZXF1ZXN0ICsgXCIpIGZyb20gZGlzcG9zZWQgbW9kdWxlIFwiICsgbW9kdWxlSWQpO1xyXG4gXHRcdFx0XHRob3RDdXJyZW50UGFyZW50cyA9IFtdO1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18ocmVxdWVzdCk7XHJcbiBcdFx0fTtcclxuIFx0XHR2YXIgT2JqZWN0RmFjdG9yeSA9IGZ1bmN0aW9uIE9iamVjdEZhY3RvcnkobmFtZSkge1xyXG4gXHRcdFx0cmV0dXJuIHtcclxuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxyXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxyXG4gXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gXHRcdFx0XHRcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fW25hbWVdO1xyXG4gXHRcdFx0XHR9LFxyXG4gXHRcdFx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiBcdFx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfX1tuYW1lXSA9IHZhbHVlO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9O1xyXG4gXHRcdH07XHJcbiBcdFx0Zm9yKHZhciBuYW1lIGluIF9fd2VicGFja19yZXF1aXJlX18pIHtcclxuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChfX3dlYnBhY2tfcmVxdWlyZV9fLCBuYW1lKSAmJiBuYW1lICE9PSBcImVcIikge1xyXG4gXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIG5hbWUsIE9iamVjdEZhY3RvcnkobmFtZSkpO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHRmbi5lID0gZnVuY3Rpb24oY2h1bmtJZCkge1xyXG4gXHRcdFx0aWYoaG90U3RhdHVzID09PSBcInJlYWR5XCIpXHJcbiBcdFx0XHRcdGhvdFNldFN0YXR1cyhcInByZXBhcmVcIik7XHJcbiBcdFx0XHRob3RDaHVua3NMb2FkaW5nKys7XHJcbiBcdFx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5lKGNodW5rSWQpLnRoZW4oZmluaXNoQ2h1bmtMb2FkaW5nLCBmdW5jdGlvbihlcnIpIHtcclxuIFx0XHRcdFx0ZmluaXNoQ2h1bmtMb2FkaW5nKCk7XHJcbiBcdFx0XHRcdHRocm93IGVycjtcclxuIFx0XHRcdH0pO1xyXG4gXHRcclxuIFx0XHRcdGZ1bmN0aW9uIGZpbmlzaENodW5rTG9hZGluZygpIHtcclxuIFx0XHRcdFx0aG90Q2h1bmtzTG9hZGluZy0tO1xyXG4gXHRcdFx0XHRpZihob3RTdGF0dXMgPT09IFwicHJlcGFyZVwiKSB7XHJcbiBcdFx0XHRcdFx0aWYoIWhvdFdhaXRpbmdGaWxlc01hcFtjaHVua0lkXSkge1xyXG4gXHRcdFx0XHRcdFx0aG90RW5zdXJlVXBkYXRlQ2h1bmsoY2h1bmtJZCk7XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdGlmKGhvdENodW5rc0xvYWRpbmcgPT09IDAgJiYgaG90V2FpdGluZ0ZpbGVzID09PSAwKSB7XHJcbiBcdFx0XHRcdFx0XHRob3RVcGRhdGVEb3dubG9hZGVkKCk7XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFx0fTtcclxuIFx0XHRyZXR1cm4gZm47XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdENyZWF0ZU1vZHVsZShtb2R1bGVJZCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0dmFyIGhvdCA9IHtcclxuIFx0XHRcdC8vIHByaXZhdGUgc3R1ZmZcclxuIFx0XHRcdF9hY2NlcHRlZERlcGVuZGVuY2llczoge30sXHJcbiBcdFx0XHRfZGVjbGluZWREZXBlbmRlbmNpZXM6IHt9LFxyXG4gXHRcdFx0X3NlbGZBY2NlcHRlZDogZmFsc2UsXHJcbiBcdFx0XHRfc2VsZkRlY2xpbmVkOiBmYWxzZSxcclxuIFx0XHRcdF9kaXNwb3NlSGFuZGxlcnM6IFtdLFxyXG4gXHRcdFx0X21haW46IGhvdEN1cnJlbnRDaGlsZE1vZHVsZSAhPT0gbW9kdWxlSWQsXHJcbiBcdFxyXG4gXHRcdFx0Ly8gTW9kdWxlIEFQSVxyXG4gXHRcdFx0YWN0aXZlOiB0cnVlLFxyXG4gXHRcdFx0YWNjZXB0OiBmdW5jdGlvbihkZXAsIGNhbGxiYWNrKSB7XHJcbiBcdFx0XHRcdGlmKHR5cGVvZiBkZXAgPT09IFwidW5kZWZpbmVkXCIpXHJcbiBcdFx0XHRcdFx0aG90Ll9zZWxmQWNjZXB0ZWQgPSB0cnVlO1xyXG4gXHRcdFx0XHRlbHNlIGlmKHR5cGVvZiBkZXAgPT09IFwiZnVuY3Rpb25cIilcclxuIFx0XHRcdFx0XHRob3QuX3NlbGZBY2NlcHRlZCA9IGRlcDtcclxuIFx0XHRcdFx0ZWxzZSBpZih0eXBlb2YgZGVwID09PSBcIm9iamVjdFwiKVxyXG4gXHRcdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBkZXAubGVuZ3RoOyBpKyspXHJcbiBcdFx0XHRcdFx0XHRob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcFtpXV0gPSBjYWxsYmFjayB8fCBmdW5jdGlvbigpIHt9O1xyXG4gXHRcdFx0XHRlbHNlXHJcbiBcdFx0XHRcdFx0aG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1tkZXBdID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oKSB7fTtcclxuIFx0XHRcdH0sXHJcbiBcdFx0XHRkZWNsaW5lOiBmdW5jdGlvbihkZXApIHtcclxuIFx0XHRcdFx0aWYodHlwZW9mIGRlcCA9PT0gXCJ1bmRlZmluZWRcIilcclxuIFx0XHRcdFx0XHRob3QuX3NlbGZEZWNsaW5lZCA9IHRydWU7XHJcbiBcdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIilcclxuIFx0XHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgZGVwLmxlbmd0aDsgaSsrKVxyXG4gXHRcdFx0XHRcdFx0aG90Ll9kZWNsaW5lZERlcGVuZGVuY2llc1tkZXBbaV1dID0gdHJ1ZTtcclxuIFx0XHRcdFx0ZWxzZVxyXG4gXHRcdFx0XHRcdGhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbZGVwXSA9IHRydWU7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0ZGlzcG9zZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuIFx0XHRcdFx0aG90Ll9kaXNwb3NlSGFuZGxlcnMucHVzaChjYWxsYmFjayk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0YWRkRGlzcG9zZUhhbmRsZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiBcdFx0XHRcdGhvdC5fZGlzcG9zZUhhbmRsZXJzLnB1c2goY2FsbGJhY2spO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdHJlbW92ZURpc3Bvc2VIYW5kbGVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gXHRcdFx0XHR2YXIgaWR4ID0gaG90Ll9kaXNwb3NlSGFuZGxlcnMuaW5kZXhPZihjYWxsYmFjayk7XHJcbiBcdFx0XHRcdGlmKGlkeCA+PSAwKSBob3QuX2Rpc3Bvc2VIYW5kbGVycy5zcGxpY2UoaWR4LCAxKTtcclxuIFx0XHRcdH0sXHJcbiBcdFxyXG4gXHRcdFx0Ly8gTWFuYWdlbWVudCBBUElcclxuIFx0XHRcdGNoZWNrOiBob3RDaGVjayxcclxuIFx0XHRcdGFwcGx5OiBob3RBcHBseSxcclxuIFx0XHRcdHN0YXR1czogZnVuY3Rpb24obCkge1xyXG4gXHRcdFx0XHRpZighbCkgcmV0dXJuIGhvdFN0YXR1cztcclxuIFx0XHRcdFx0aG90U3RhdHVzSGFuZGxlcnMucHVzaChsKTtcclxuIFx0XHRcdH0sXHJcbiBcdFx0XHRhZGRTdGF0dXNIYW5kbGVyOiBmdW5jdGlvbihsKSB7XHJcbiBcdFx0XHRcdGhvdFN0YXR1c0hhbmRsZXJzLnB1c2gobCk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0cmVtb3ZlU3RhdHVzSGFuZGxlcjogZnVuY3Rpb24obCkge1xyXG4gXHRcdFx0XHR2YXIgaWR4ID0gaG90U3RhdHVzSGFuZGxlcnMuaW5kZXhPZihsKTtcclxuIFx0XHRcdFx0aWYoaWR4ID49IDApIGhvdFN0YXR1c0hhbmRsZXJzLnNwbGljZShpZHgsIDEpO1xyXG4gXHRcdFx0fSxcclxuIFx0XHJcbiBcdFx0XHQvL2luaGVyaXQgZnJvbSBwcmV2aW91cyBkaXNwb3NlIGNhbGxcclxuIFx0XHRcdGRhdGE6IGhvdEN1cnJlbnRNb2R1bGVEYXRhW21vZHVsZUlkXVxyXG4gXHRcdH07XHJcbiBcdFx0aG90Q3VycmVudENoaWxkTW9kdWxlID0gdW5kZWZpbmVkO1xyXG4gXHRcdHJldHVybiBob3Q7XHJcbiBcdH1cclxuIFx0XHJcbiBcdHZhciBob3RTdGF0dXNIYW5kbGVycyA9IFtdO1xyXG4gXHR2YXIgaG90U3RhdHVzID0gXCJpZGxlXCI7XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RTZXRTdGF0dXMobmV3U3RhdHVzKSB7XHJcbiBcdFx0aG90U3RhdHVzID0gbmV3U3RhdHVzO1xyXG4gXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBob3RTdGF0dXNIYW5kbGVycy5sZW5ndGg7IGkrKylcclxuIFx0XHRcdGhvdFN0YXR1c0hhbmRsZXJzW2ldLmNhbGwobnVsbCwgbmV3U3RhdHVzKTtcclxuIFx0fVxyXG4gXHRcclxuIFx0Ly8gd2hpbGUgZG93bmxvYWRpbmdcclxuIFx0dmFyIGhvdFdhaXRpbmdGaWxlcyA9IDA7XHJcbiBcdHZhciBob3RDaHVua3NMb2FkaW5nID0gMDtcclxuIFx0dmFyIGhvdFdhaXRpbmdGaWxlc01hcCA9IHt9O1xyXG4gXHR2YXIgaG90UmVxdWVzdGVkRmlsZXNNYXAgPSB7fTtcclxuIFx0dmFyIGhvdEF2YWlsYWJsZUZpbGVzTWFwID0ge307XHJcbiBcdHZhciBob3REZWZlcnJlZDtcclxuIFx0XHJcbiBcdC8vIFRoZSB1cGRhdGUgaW5mb1xyXG4gXHR2YXIgaG90VXBkYXRlLCBob3RVcGRhdGVOZXdIYXNoO1xyXG4gXHRcclxuIFx0ZnVuY3Rpb24gdG9Nb2R1bGVJZChpZCkge1xyXG4gXHRcdHZhciBpc051bWJlciA9ICgraWQpICsgXCJcIiA9PT0gaWQ7XHJcbiBcdFx0cmV0dXJuIGlzTnVtYmVyID8gK2lkIDogaWQ7XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdENoZWNrKGFwcGx5KSB7XHJcbiBcdFx0aWYoaG90U3RhdHVzICE9PSBcImlkbGVcIikgdGhyb3cgbmV3IEVycm9yKFwiY2hlY2soKSBpcyBvbmx5IGFsbG93ZWQgaW4gaWRsZSBzdGF0dXNcIik7XHJcbiBcdFx0aG90QXBwbHlPblVwZGF0ZSA9IGFwcGx5O1xyXG4gXHRcdGhvdFNldFN0YXR1cyhcImNoZWNrXCIpO1xyXG4gXHRcdHJldHVybiBob3REb3dubG9hZE1hbmlmZXN0KGhvdFJlcXVlc3RUaW1lb3V0KS50aGVuKGZ1bmN0aW9uKHVwZGF0ZSkge1xyXG4gXHRcdFx0aWYoIXVwZGF0ZSkge1xyXG4gXHRcdFx0XHRob3RTZXRTdGF0dXMoXCJpZGxlXCIpO1xyXG4gXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuIFx0XHRcdH1cclxuIFx0XHRcdGhvdFJlcXVlc3RlZEZpbGVzTWFwID0ge307XHJcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXNNYXAgPSB7fTtcclxuIFx0XHRcdGhvdEF2YWlsYWJsZUZpbGVzTWFwID0gdXBkYXRlLmM7XHJcbiBcdFx0XHRob3RVcGRhdGVOZXdIYXNoID0gdXBkYXRlLmg7XHJcbiBcdFxyXG4gXHRcdFx0aG90U2V0U3RhdHVzKFwicHJlcGFyZVwiKTtcclxuIFx0XHRcdHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiBcdFx0XHRcdGhvdERlZmVycmVkID0ge1xyXG4gXHRcdFx0XHRcdHJlc29sdmU6IHJlc29sdmUsXHJcbiBcdFx0XHRcdFx0cmVqZWN0OiByZWplY3RcclxuIFx0XHRcdFx0fTtcclxuIFx0XHRcdH0pO1xyXG4gXHRcdFx0aG90VXBkYXRlID0ge307XHJcbiBcdFx0XHR2YXIgY2h1bmtJZCA9IDA7XHJcbiBcdFx0XHR7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbG9uZS1ibG9ja3NcclxuIFx0XHRcdFx0LypnbG9iYWxzIGNodW5rSWQgKi9cclxuIFx0XHRcdFx0aG90RW5zdXJlVXBkYXRlQ2h1bmsoY2h1bmtJZCk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRpZihob3RTdGF0dXMgPT09IFwicHJlcGFyZVwiICYmIGhvdENodW5rc0xvYWRpbmcgPT09IDAgJiYgaG90V2FpdGluZ0ZpbGVzID09PSAwKSB7XHJcbiBcdFx0XHRcdGhvdFVwZGF0ZURvd25sb2FkZWQoKTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdHJldHVybiBwcm9taXNlO1xyXG4gXHRcdH0pO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RBZGRVcGRhdGVDaHVuayhjaHVua0lkLCBtb3JlTW9kdWxlcykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0aWYoIWhvdEF2YWlsYWJsZUZpbGVzTWFwW2NodW5rSWRdIHx8ICFob3RSZXF1ZXN0ZWRGaWxlc01hcFtjaHVua0lkXSlcclxuIFx0XHRcdHJldHVybjtcclxuIFx0XHRob3RSZXF1ZXN0ZWRGaWxlc01hcFtjaHVua0lkXSA9IGZhbHNlO1xyXG4gXHRcdGZvcih2YXIgbW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcclxuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XHJcbiBcdFx0XHRcdGhvdFVwZGF0ZVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcdGlmKC0taG90V2FpdGluZ0ZpbGVzID09PSAwICYmIGhvdENodW5rc0xvYWRpbmcgPT09IDApIHtcclxuIFx0XHRcdGhvdFVwZGF0ZURvd25sb2FkZWQoKTtcclxuIFx0XHR9XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdEVuc3VyZVVwZGF0ZUNodW5rKGNodW5rSWQpIHtcclxuIFx0XHRpZighaG90QXZhaWxhYmxlRmlsZXNNYXBbY2h1bmtJZF0pIHtcclxuIFx0XHRcdGhvdFdhaXRpbmdGaWxlc01hcFtjaHVua0lkXSA9IHRydWU7XHJcbiBcdFx0fSBlbHNlIHtcclxuIFx0XHRcdGhvdFJlcXVlc3RlZEZpbGVzTWFwW2NodW5rSWRdID0gdHJ1ZTtcclxuIFx0XHRcdGhvdFdhaXRpbmdGaWxlcysrO1xyXG4gXHRcdFx0aG90RG93bmxvYWRVcGRhdGVDaHVuayhjaHVua0lkKTtcclxuIFx0XHR9XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdFVwZGF0ZURvd25sb2FkZWQoKSB7XHJcbiBcdFx0aG90U2V0U3RhdHVzKFwicmVhZHlcIik7XHJcbiBcdFx0dmFyIGRlZmVycmVkID0gaG90RGVmZXJyZWQ7XHJcbiBcdFx0aG90RGVmZXJyZWQgPSBudWxsO1xyXG4gXHRcdGlmKCFkZWZlcnJlZCkgcmV0dXJuO1xyXG4gXHRcdGlmKGhvdEFwcGx5T25VcGRhdGUpIHtcclxuIFx0XHRcdC8vIFdyYXAgZGVmZXJyZWQgb2JqZWN0IGluIFByb21pc2UgdG8gbWFyayBpdCBhcyBhIHdlbGwtaGFuZGxlZCBQcm9taXNlIHRvXHJcbiBcdFx0XHQvLyBhdm9pZCB0cmlnZ2VyaW5nIHVuY2F1Z2h0IGV4Y2VwdGlvbiB3YXJuaW5nIGluIENocm9tZS5cclxuIFx0XHRcdC8vIFNlZSBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD00NjU2NjZcclxuIFx0XHRcdFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiBcdFx0XHRcdHJldHVybiBob3RBcHBseShob3RBcHBseU9uVXBkYXRlKTtcclxuIFx0XHRcdH0pLnRoZW4oXHJcbiBcdFx0XHRcdGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gXHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuIFx0XHRcdFx0fSxcclxuIFx0XHRcdFx0ZnVuY3Rpb24oZXJyKSB7XHJcbiBcdFx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycik7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdCk7XHJcbiBcdFx0fSBlbHNlIHtcclxuIFx0XHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbXTtcclxuIFx0XHRcdGZvcih2YXIgaWQgaW4gaG90VXBkYXRlKSB7XHJcbiBcdFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChob3RVcGRhdGUsIGlkKSkge1xyXG4gXHRcdFx0XHRcdG91dGRhdGVkTW9kdWxlcy5wdXNoKHRvTW9kdWxlSWQoaWQpKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShvdXRkYXRlZE1vZHVsZXMpO1xyXG4gXHRcdH1cclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90QXBwbHkob3B0aW9ucykge1xyXG4gXHRcdGlmKGhvdFN0YXR1cyAhPT0gXCJyZWFkeVwiKSB0aHJvdyBuZXcgRXJyb3IoXCJhcHBseSgpIGlzIG9ubHkgYWxsb3dlZCBpbiByZWFkeSBzdGF0dXNcIik7XHJcbiBcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiBcdFxyXG4gXHRcdHZhciBjYjtcclxuIFx0XHR2YXIgaTtcclxuIFx0XHR2YXIgajtcclxuIFx0XHR2YXIgbW9kdWxlO1xyXG4gXHRcdHZhciBtb2R1bGVJZDtcclxuIFx0XHJcbiBcdFx0ZnVuY3Rpb24gZ2V0QWZmZWN0ZWRTdHVmZih1cGRhdGVNb2R1bGVJZCkge1xyXG4gXHRcdFx0dmFyIG91dGRhdGVkTW9kdWxlcyA9IFt1cGRhdGVNb2R1bGVJZF07XHJcbiBcdFx0XHR2YXIgb3V0ZGF0ZWREZXBlbmRlbmNpZXMgPSB7fTtcclxuIFx0XHJcbiBcdFx0XHR2YXIgcXVldWUgPSBvdXRkYXRlZE1vZHVsZXMuc2xpY2UoKS5tYXAoZnVuY3Rpb24oaWQpIHtcclxuIFx0XHRcdFx0cmV0dXJuIHtcclxuIFx0XHRcdFx0XHRjaGFpbjogW2lkXSxcclxuIFx0XHRcdFx0XHRpZDogaWRcclxuIFx0XHRcdFx0fTtcclxuIFx0XHRcdH0pO1xyXG4gXHRcdFx0d2hpbGUocXVldWUubGVuZ3RoID4gMCkge1xyXG4gXHRcdFx0XHR2YXIgcXVldWVJdGVtID0gcXVldWUucG9wKCk7XHJcbiBcdFx0XHRcdHZhciBtb2R1bGVJZCA9IHF1ZXVlSXRlbS5pZDtcclxuIFx0XHRcdFx0dmFyIGNoYWluID0gcXVldWVJdGVtLmNoYWluO1xyXG4gXHRcdFx0XHRtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0aWYoIW1vZHVsZSB8fCBtb2R1bGUuaG90Ll9zZWxmQWNjZXB0ZWQpXHJcbiBcdFx0XHRcdFx0Y29udGludWU7XHJcbiBcdFx0XHRcdGlmKG1vZHVsZS5ob3QuX3NlbGZEZWNsaW5lZCkge1xyXG4gXHRcdFx0XHRcdHJldHVybiB7XHJcbiBcdFx0XHRcdFx0XHR0eXBlOiBcInNlbGYtZGVjbGluZWRcIixcclxuIFx0XHRcdFx0XHRcdGNoYWluOiBjaGFpbixcclxuIFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZFxyXG4gXHRcdFx0XHRcdH07XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0aWYobW9kdWxlLmhvdC5fbWFpbikge1xyXG4gXHRcdFx0XHRcdHJldHVybiB7XHJcbiBcdFx0XHRcdFx0XHR0eXBlOiBcInVuYWNjZXB0ZWRcIixcclxuIFx0XHRcdFx0XHRcdGNoYWluOiBjaGFpbixcclxuIFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZFxyXG4gXHRcdFx0XHRcdH07XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG1vZHVsZS5wYXJlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHRcdFx0dmFyIHBhcmVudElkID0gbW9kdWxlLnBhcmVudHNbaV07XHJcbiBcdFx0XHRcdFx0dmFyIHBhcmVudCA9IGluc3RhbGxlZE1vZHVsZXNbcGFyZW50SWRdO1xyXG4gXHRcdFx0XHRcdGlmKCFwYXJlbnQpIGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRcdGlmKHBhcmVudC5ob3QuX2RlY2xpbmVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSkge1xyXG4gXHRcdFx0XHRcdFx0cmV0dXJuIHtcclxuIFx0XHRcdFx0XHRcdFx0dHlwZTogXCJkZWNsaW5lZFwiLFxyXG4gXHRcdFx0XHRcdFx0XHRjaGFpbjogY2hhaW4uY29uY2F0KFtwYXJlbnRJZF0pLFxyXG4gXHRcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWQsXHJcbiBcdFx0XHRcdFx0XHRcdHBhcmVudElkOiBwYXJlbnRJZFxyXG4gXHRcdFx0XHRcdFx0fTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0aWYob3V0ZGF0ZWRNb2R1bGVzLmluZGV4T2YocGFyZW50SWQpID49IDApIGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRcdGlmKHBhcmVudC5ob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSkge1xyXG4gXHRcdFx0XHRcdFx0aWYoIW91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSlcclxuIFx0XHRcdFx0XHRcdFx0b3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdID0gW107XHJcbiBcdFx0XHRcdFx0XHRhZGRBbGxUb1NldChvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF0sIFttb2R1bGVJZF0pO1xyXG4gXHRcdFx0XHRcdFx0Y29udGludWU7XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdGRlbGV0ZSBvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF07XHJcbiBcdFx0XHRcdFx0b3V0ZGF0ZWRNb2R1bGVzLnB1c2gocGFyZW50SWQpO1xyXG4gXHRcdFx0XHRcdHF1ZXVlLnB1c2goe1xyXG4gXHRcdFx0XHRcdFx0Y2hhaW46IGNoYWluLmNvbmNhdChbcGFyZW50SWRdKSxcclxuIFx0XHRcdFx0XHRcdGlkOiBwYXJlbnRJZFxyXG4gXHRcdFx0XHRcdH0pO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFxyXG4gXHRcdFx0cmV0dXJuIHtcclxuIFx0XHRcdFx0dHlwZTogXCJhY2NlcHRlZFwiLFxyXG4gXHRcdFx0XHRtb2R1bGVJZDogdXBkYXRlTW9kdWxlSWQsXHJcbiBcdFx0XHRcdG91dGRhdGVkTW9kdWxlczogb3V0ZGF0ZWRNb2R1bGVzLFxyXG4gXHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llczogb3V0ZGF0ZWREZXBlbmRlbmNpZXNcclxuIFx0XHRcdH07XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHRmdW5jdGlvbiBhZGRBbGxUb1NldChhLCBiKSB7XHJcbiBcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgYi5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0XHR2YXIgaXRlbSA9IGJbaV07XHJcbiBcdFx0XHRcdGlmKGEuaW5kZXhPZihpdGVtKSA8IDApXHJcbiBcdFx0XHRcdFx0YS5wdXNoKGl0ZW0pO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gYXQgYmVnaW4gYWxsIHVwZGF0ZXMgbW9kdWxlcyBhcmUgb3V0ZGF0ZWRcclxuIFx0XHQvLyB0aGUgXCJvdXRkYXRlZFwiIHN0YXR1cyBjYW4gcHJvcGFnYXRlIHRvIHBhcmVudHMgaWYgdGhleSBkb24ndCBhY2NlcHQgdGhlIGNoaWxkcmVuXHJcbiBcdFx0dmFyIG91dGRhdGVkRGVwZW5kZW5jaWVzID0ge307XHJcbiBcdFx0dmFyIG91dGRhdGVkTW9kdWxlcyA9IFtdO1xyXG4gXHRcdHZhciBhcHBsaWVkVXBkYXRlID0ge307XHJcbiBcdFxyXG4gXHRcdHZhciB3YXJuVW5leHBlY3RlZFJlcXVpcmUgPSBmdW5jdGlvbiB3YXJuVW5leHBlY3RlZFJlcXVpcmUoKSB7XHJcbiBcdFx0XHRjb25zb2xlLndhcm4oXCJbSE1SXSB1bmV4cGVjdGVkIHJlcXVpcmUoXCIgKyByZXN1bHQubW9kdWxlSWQgKyBcIikgdG8gZGlzcG9zZWQgbW9kdWxlXCIpO1xyXG4gXHRcdH07XHJcbiBcdFxyXG4gXHRcdGZvcih2YXIgaWQgaW4gaG90VXBkYXRlKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaG90VXBkYXRlLCBpZCkpIHtcclxuIFx0XHRcdFx0bW9kdWxlSWQgPSB0b01vZHVsZUlkKGlkKTtcclxuIFx0XHRcdFx0dmFyIHJlc3VsdDtcclxuIFx0XHRcdFx0aWYoaG90VXBkYXRlW2lkXSkge1xyXG4gXHRcdFx0XHRcdHJlc3VsdCA9IGdldEFmZmVjdGVkU3R1ZmYobW9kdWxlSWQpO1xyXG4gXHRcdFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0XHRcdHJlc3VsdCA9IHtcclxuIFx0XHRcdFx0XHRcdHR5cGU6IFwiZGlzcG9zZWRcIixcclxuIFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBpZFxyXG4gXHRcdFx0XHRcdH07XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0dmFyIGFib3J0RXJyb3IgPSBmYWxzZTtcclxuIFx0XHRcdFx0dmFyIGRvQXBwbHkgPSBmYWxzZTtcclxuIFx0XHRcdFx0dmFyIGRvRGlzcG9zZSA9IGZhbHNlO1xyXG4gXHRcdFx0XHR2YXIgY2hhaW5JbmZvID0gXCJcIjtcclxuIFx0XHRcdFx0aWYocmVzdWx0LmNoYWluKSB7XHJcbiBcdFx0XHRcdFx0Y2hhaW5JbmZvID0gXCJcXG5VcGRhdGUgcHJvcGFnYXRpb246IFwiICsgcmVzdWx0LmNoYWluLmpvaW4oXCIgLT4gXCIpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdHN3aXRjaChyZXN1bHQudHlwZSkge1xyXG4gXHRcdFx0XHRcdGNhc2UgXCJzZWxmLWRlY2xpbmVkXCI6XHJcbiBcdFx0XHRcdFx0XHRpZihvcHRpb25zLm9uRGVjbGluZWQpXHJcbiBcdFx0XHRcdFx0XHRcdG9wdGlvbnMub25EZWNsaW5lZChyZXN1bHQpO1xyXG4gXHRcdFx0XHRcdFx0aWYoIW9wdGlvbnMuaWdub3JlRGVjbGluZWQpXHJcbiBcdFx0XHRcdFx0XHRcdGFib3J0RXJyb3IgPSBuZXcgRXJyb3IoXCJBYm9ydGVkIGJlY2F1c2Ugb2Ygc2VsZiBkZWNsaW5lOiBcIiArIHJlc3VsdC5tb2R1bGVJZCArIGNoYWluSW5mbyk7XHJcbiBcdFx0XHRcdFx0XHRicmVhaztcclxuIFx0XHRcdFx0XHRjYXNlIFwiZGVjbGluZWRcIjpcclxuIFx0XHRcdFx0XHRcdGlmKG9wdGlvbnMub25EZWNsaW5lZClcclxuIFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5vbkRlY2xpbmVkKHJlc3VsdCk7XHJcbiBcdFx0XHRcdFx0XHRpZighb3B0aW9ucy5pZ25vcmVEZWNsaW5lZClcclxuIFx0XHRcdFx0XHRcdFx0YWJvcnRFcnJvciA9IG5ldyBFcnJvcihcIkFib3J0ZWQgYmVjYXVzZSBvZiBkZWNsaW5lZCBkZXBlbmRlbmN5OiBcIiArIHJlc3VsdC5tb2R1bGVJZCArIFwiIGluIFwiICsgcmVzdWx0LnBhcmVudElkICsgY2hhaW5JbmZvKTtcclxuIFx0XHRcdFx0XHRcdGJyZWFrO1xyXG4gXHRcdFx0XHRcdGNhc2UgXCJ1bmFjY2VwdGVkXCI6XHJcbiBcdFx0XHRcdFx0XHRpZihvcHRpb25zLm9uVW5hY2NlcHRlZClcclxuIFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5vblVuYWNjZXB0ZWQocmVzdWx0KTtcclxuIFx0XHRcdFx0XHRcdGlmKCFvcHRpb25zLmlnbm9yZVVuYWNjZXB0ZWQpXHJcbiBcdFx0XHRcdFx0XHRcdGFib3J0RXJyb3IgPSBuZXcgRXJyb3IoXCJBYm9ydGVkIGJlY2F1c2UgXCIgKyBtb2R1bGVJZCArIFwiIGlzIG5vdCBhY2NlcHRlZFwiICsgY2hhaW5JbmZvKTtcclxuIFx0XHRcdFx0XHRcdGJyZWFrO1xyXG4gXHRcdFx0XHRcdGNhc2UgXCJhY2NlcHRlZFwiOlxyXG4gXHRcdFx0XHRcdFx0aWYob3B0aW9ucy5vbkFjY2VwdGVkKVxyXG4gXHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uQWNjZXB0ZWQocmVzdWx0KTtcclxuIFx0XHRcdFx0XHRcdGRvQXBwbHkgPSB0cnVlO1xyXG4gXHRcdFx0XHRcdFx0YnJlYWs7XHJcbiBcdFx0XHRcdFx0Y2FzZSBcImRpc3Bvc2VkXCI6XHJcbiBcdFx0XHRcdFx0XHRpZihvcHRpb25zLm9uRGlzcG9zZWQpXHJcbiBcdFx0XHRcdFx0XHRcdG9wdGlvbnMub25EaXNwb3NlZChyZXN1bHQpO1xyXG4gXHRcdFx0XHRcdFx0ZG9EaXNwb3NlID0gdHJ1ZTtcclxuIFx0XHRcdFx0XHRcdGJyZWFrO1xyXG4gXHRcdFx0XHRcdGRlZmF1bHQ6XHJcbiBcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4Y2VwdGlvbiB0eXBlIFwiICsgcmVzdWx0LnR5cGUpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGlmKGFib3J0RXJyb3IpIHtcclxuIFx0XHRcdFx0XHRob3RTZXRTdGF0dXMoXCJhYm9ydFwiKTtcclxuIFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoYWJvcnRFcnJvcik7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0aWYoZG9BcHBseSkge1xyXG4gXHRcdFx0XHRcdGFwcGxpZWRVcGRhdGVbbW9kdWxlSWRdID0gaG90VXBkYXRlW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0XHRhZGRBbGxUb1NldChvdXRkYXRlZE1vZHVsZXMsIHJlc3VsdC5vdXRkYXRlZE1vZHVsZXMpO1xyXG4gXHRcdFx0XHRcdGZvcihtb2R1bGVJZCBpbiByZXN1bHQub3V0ZGF0ZWREZXBlbmRlbmNpZXMpIHtcclxuIFx0XHRcdFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyZXN1bHQub3V0ZGF0ZWREZXBlbmRlbmNpZXMsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHRcdFx0XHRpZighb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdKVxyXG4gXHRcdFx0XHRcdFx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSA9IFtdO1xyXG4gXHRcdFx0XHRcdFx0XHRhZGRBbGxUb1NldChvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0sIHJlc3VsdC5vdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pO1xyXG4gXHRcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRpZihkb0Rpc3Bvc2UpIHtcclxuIFx0XHRcdFx0XHRhZGRBbGxUb1NldChvdXRkYXRlZE1vZHVsZXMsIFtyZXN1bHQubW9kdWxlSWRdKTtcclxuIFx0XHRcdFx0XHRhcHBsaWVkVXBkYXRlW21vZHVsZUlkXSA9IHdhcm5VbmV4cGVjdGVkUmVxdWlyZTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gU3RvcmUgc2VsZiBhY2NlcHRlZCBvdXRkYXRlZCBtb2R1bGVzIHRvIHJlcXVpcmUgdGhlbSBsYXRlciBieSB0aGUgbW9kdWxlIHN5c3RlbVxyXG4gXHRcdHZhciBvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMgPSBbXTtcclxuIFx0XHRmb3IoaSA9IDA7IGkgPCBvdXRkYXRlZE1vZHVsZXMubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdG1vZHVsZUlkID0gb3V0ZGF0ZWRNb2R1bGVzW2ldO1xyXG4gXHRcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gJiYgaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uaG90Ll9zZWxmQWNjZXB0ZWQpXHJcbiBcdFx0XHRcdG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlcy5wdXNoKHtcclxuIFx0XHRcdFx0XHRtb2R1bGU6IG1vZHVsZUlkLFxyXG4gXHRcdFx0XHRcdGVycm9ySGFuZGxlcjogaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uaG90Ll9zZWxmQWNjZXB0ZWRcclxuIFx0XHRcdFx0fSk7XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBOb3cgaW4gXCJkaXNwb3NlXCIgcGhhc2VcclxuIFx0XHRob3RTZXRTdGF0dXMoXCJkaXNwb3NlXCIpO1xyXG4gXHRcdE9iamVjdC5rZXlzKGhvdEF2YWlsYWJsZUZpbGVzTWFwKS5mb3JFYWNoKGZ1bmN0aW9uKGNodW5rSWQpIHtcclxuIFx0XHRcdGlmKGhvdEF2YWlsYWJsZUZpbGVzTWFwW2NodW5rSWRdID09PSBmYWxzZSkge1xyXG4gXHRcdFx0XHRob3REaXNwb3NlQ2h1bmsoY2h1bmtJZCk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fSk7XHJcbiBcdFxyXG4gXHRcdHZhciBpZHg7XHJcbiBcdFx0dmFyIHF1ZXVlID0gb3V0ZGF0ZWRNb2R1bGVzLnNsaWNlKCk7XHJcbiBcdFx0d2hpbGUocXVldWUubGVuZ3RoID4gMCkge1xyXG4gXHRcdFx0bW9kdWxlSWQgPSBxdWV1ZS5wb3AoKTtcclxuIFx0XHRcdG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0aWYoIW1vZHVsZSkgY29udGludWU7XHJcbiBcdFxyXG4gXHRcdFx0dmFyIGRhdGEgPSB7fTtcclxuIFx0XHJcbiBcdFx0XHQvLyBDYWxsIGRpc3Bvc2UgaGFuZGxlcnNcclxuIFx0XHRcdHZhciBkaXNwb3NlSGFuZGxlcnMgPSBtb2R1bGUuaG90Ll9kaXNwb3NlSGFuZGxlcnM7XHJcbiBcdFx0XHRmb3IoaiA9IDA7IGogPCBkaXNwb3NlSGFuZGxlcnMubGVuZ3RoOyBqKyspIHtcclxuIFx0XHRcdFx0Y2IgPSBkaXNwb3NlSGFuZGxlcnNbal07XHJcbiBcdFx0XHRcdGNiKGRhdGEpO1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0aG90Q3VycmVudE1vZHVsZURhdGFbbW9kdWxlSWRdID0gZGF0YTtcclxuIFx0XHJcbiBcdFx0XHQvLyBkaXNhYmxlIG1vZHVsZSAodGhpcyBkaXNhYmxlcyByZXF1aXJlcyBmcm9tIHRoaXMgbW9kdWxlKVxyXG4gXHRcdFx0bW9kdWxlLmhvdC5hY3RpdmUgPSBmYWxzZTtcclxuIFx0XHJcbiBcdFx0XHQvLyByZW1vdmUgbW9kdWxlIGZyb20gY2FjaGVcclxuIFx0XHRcdGRlbGV0ZSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHJcbiBcdFx0XHQvLyB3aGVuIGRpc3Bvc2luZyB0aGVyZSBpcyBubyBuZWVkIHRvIGNhbGwgZGlzcG9zZSBoYW5kbGVyXHJcbiBcdFx0XHRkZWxldGUgb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdO1xyXG4gXHRcclxuIFx0XHRcdC8vIHJlbW92ZSBcInBhcmVudHNcIiByZWZlcmVuY2VzIGZyb20gYWxsIGNoaWxkcmVuXHJcbiBcdFx0XHRmb3IoaiA9IDA7IGogPCBtb2R1bGUuY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcclxuIFx0XHRcdFx0dmFyIGNoaWxkID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGUuY2hpbGRyZW5bal1dO1xyXG4gXHRcdFx0XHRpZighY2hpbGQpIGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRpZHggPSBjaGlsZC5wYXJlbnRzLmluZGV4T2YobW9kdWxlSWQpO1xyXG4gXHRcdFx0XHRpZihpZHggPj0gMCkge1xyXG4gXHRcdFx0XHRcdGNoaWxkLnBhcmVudHMuc3BsaWNlKGlkeCwgMSk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIHJlbW92ZSBvdXRkYXRlZCBkZXBlbmRlbmN5IGZyb20gbW9kdWxlIGNoaWxkcmVuXHJcbiBcdFx0dmFyIGRlcGVuZGVuY3k7XHJcbiBcdFx0dmFyIG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzO1xyXG4gXHRcdGZvcihtb2R1bGVJZCBpbiBvdXRkYXRlZERlcGVuZGVuY2llcykge1xyXG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG91dGRhdGVkRGVwZW5kZW5jaWVzLCBtb2R1bGVJZCkpIHtcclxuIFx0XHRcdFx0bW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRcdGlmKG1vZHVsZSkge1xyXG4gXHRcdFx0XHRcdG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzID0gb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0XHRcdGZvcihqID0gMDsgaiA8IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzLmxlbmd0aDsgaisrKSB7XHJcbiBcdFx0XHRcdFx0XHRkZXBlbmRlbmN5ID0gbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXNbal07XHJcbiBcdFx0XHRcdFx0XHRpZHggPSBtb2R1bGUuY2hpbGRyZW4uaW5kZXhPZihkZXBlbmRlbmN5KTtcclxuIFx0XHRcdFx0XHRcdGlmKGlkeCA+PSAwKSBtb2R1bGUuY2hpbGRyZW4uc3BsaWNlKGlkeCwgMSk7XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBOb3QgaW4gXCJhcHBseVwiIHBoYXNlXHJcbiBcdFx0aG90U2V0U3RhdHVzKFwiYXBwbHlcIik7XHJcbiBcdFxyXG4gXHRcdGhvdEN1cnJlbnRIYXNoID0gaG90VXBkYXRlTmV3SGFzaDtcclxuIFx0XHJcbiBcdFx0Ly8gaW5zZXJ0IG5ldyBjb2RlXHJcbiBcdFx0Zm9yKG1vZHVsZUlkIGluIGFwcGxpZWRVcGRhdGUpIHtcclxuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhcHBsaWVkVXBkYXRlLCBtb2R1bGVJZCkpIHtcclxuIFx0XHRcdFx0bW9kdWxlc1ttb2R1bGVJZF0gPSBhcHBsaWVkVXBkYXRlW21vZHVsZUlkXTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIGNhbGwgYWNjZXB0IGhhbmRsZXJzXHJcbiBcdFx0dmFyIGVycm9yID0gbnVsbDtcclxuIFx0XHRmb3IobW9kdWxlSWQgaW4gb3V0ZGF0ZWREZXBlbmRlbmNpZXMpIHtcclxuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvdXRkYXRlZERlcGVuZGVuY2llcywgbW9kdWxlSWQpKSB7XHJcbiBcdFx0XHRcdG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0XHRpZihtb2R1bGUpIHtcclxuIFx0XHRcdFx0XHRtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcyA9IG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0XHR2YXIgY2FsbGJhY2tzID0gW107XHJcbiBcdFx0XHRcdFx0Zm9yKGkgPSAwOyBpIDwgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdFx0XHRcdGRlcGVuZGVuY3kgPSBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llc1tpXTtcclxuIFx0XHRcdFx0XHRcdGNiID0gbW9kdWxlLmhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbZGVwZW5kZW5jeV07XHJcbiBcdFx0XHRcdFx0XHRpZihjYikge1xyXG4gXHRcdFx0XHRcdFx0XHRpZihjYWxsYmFja3MuaW5kZXhPZihjYikgPj0gMCkgY29udGludWU7XHJcbiBcdFx0XHRcdFx0XHRcdGNhbGxiYWNrcy5wdXNoKGNiKTtcclxuIFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0Zm9yKGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHRcdFx0XHRjYiA9IGNhbGxiYWNrc1tpXTtcclxuIFx0XHRcdFx0XHRcdHRyeSB7XHJcbiBcdFx0XHRcdFx0XHRcdGNiKG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzKTtcclxuIFx0XHRcdFx0XHRcdH0gY2F0Y2goZXJyKSB7XHJcbiBcdFx0XHRcdFx0XHRcdGlmKG9wdGlvbnMub25FcnJvcmVkKSB7XHJcbiBcdFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5vbkVycm9yZWQoe1xyXG4gXHRcdFx0XHRcdFx0XHRcdFx0dHlwZTogXCJhY2NlcHQtZXJyb3JlZFwiLFxyXG4gXHRcdFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkLFxyXG4gXHRcdFx0XHRcdFx0XHRcdFx0ZGVwZW5kZW5jeUlkOiBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llc1tpXSxcclxuIFx0XHRcdFx0XHRcdFx0XHRcdGVycm9yOiBlcnJcclxuIFx0XHRcdFx0XHRcdFx0XHR9KTtcclxuIFx0XHRcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdFx0XHRpZighb3B0aW9ucy5pZ25vcmVFcnJvcmVkKSB7XHJcbiBcdFx0XHRcdFx0XHRcdFx0aWYoIWVycm9yKVxyXG4gXHRcdFx0XHRcdFx0XHRcdFx0ZXJyb3IgPSBlcnI7XHJcbiBcdFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIExvYWQgc2VsZiBhY2NlcHRlZCBtb2R1bGVzXHJcbiBcdFx0Zm9yKGkgPSAwOyBpIDwgb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHR2YXIgaXRlbSA9IG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlc1tpXTtcclxuIFx0XHRcdG1vZHVsZUlkID0gaXRlbS5tb2R1bGU7XHJcbiBcdFx0XHRob3RDdXJyZW50UGFyZW50cyA9IFttb2R1bGVJZF07XHJcbiBcdFx0XHR0cnkge1xyXG4gXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKTtcclxuIFx0XHRcdH0gY2F0Y2goZXJyKSB7XHJcbiBcdFx0XHRcdGlmKHR5cGVvZiBpdGVtLmVycm9ySGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiBcdFx0XHRcdFx0dHJ5IHtcclxuIFx0XHRcdFx0XHRcdGl0ZW0uZXJyb3JIYW5kbGVyKGVycik7XHJcbiBcdFx0XHRcdFx0fSBjYXRjaChlcnIyKSB7XHJcbiBcdFx0XHRcdFx0XHRpZihvcHRpb25zLm9uRXJyb3JlZCkge1xyXG4gXHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uRXJyb3JlZCh7XHJcbiBcdFx0XHRcdFx0XHRcdFx0dHlwZTogXCJzZWxmLWFjY2VwdC1lcnJvci1oYW5kbGVyLWVycm9yZWRcIixcclxuIFx0XHRcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWQsXHJcbiBcdFx0XHRcdFx0XHRcdFx0ZXJyb3I6IGVycjIsXHJcbiBcdFx0XHRcdFx0XHRcdFx0b3JnaW5hbEVycm9yOiBlcnIsIC8vIFRPRE8gcmVtb3ZlIGluIHdlYnBhY2sgNFxyXG4gXHRcdFx0XHRcdFx0XHRcdG9yaWdpbmFsRXJyb3I6IGVyclxyXG4gXHRcdFx0XHRcdFx0XHR9KTtcclxuIFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRcdGlmKCFvcHRpb25zLmlnbm9yZUVycm9yZWQpIHtcclxuIFx0XHRcdFx0XHRcdFx0aWYoIWVycm9yKVxyXG4gXHRcdFx0XHRcdFx0XHRcdGVycm9yID0gZXJyMjtcclxuIFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRcdGlmKCFlcnJvcilcclxuIFx0XHRcdFx0XHRcdFx0ZXJyb3IgPSBlcnI7XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0XHRcdGlmKG9wdGlvbnMub25FcnJvcmVkKSB7XHJcbiBcdFx0XHRcdFx0XHRvcHRpb25zLm9uRXJyb3JlZCh7XHJcbiBcdFx0XHRcdFx0XHRcdHR5cGU6IFwic2VsZi1hY2NlcHQtZXJyb3JlZFwiLFxyXG4gXHRcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWQsXHJcbiBcdFx0XHRcdFx0XHRcdGVycm9yOiBlcnJcclxuIFx0XHRcdFx0XHRcdH0pO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRpZighb3B0aW9ucy5pZ25vcmVFcnJvcmVkKSB7XHJcbiBcdFx0XHRcdFx0XHRpZighZXJyb3IpXHJcbiBcdFx0XHRcdFx0XHRcdGVycm9yID0gZXJyO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gaGFuZGxlIGVycm9ycyBpbiBhY2NlcHQgaGFuZGxlcnMgYW5kIHNlbGYgYWNjZXB0ZWQgbW9kdWxlIGxvYWRcclxuIFx0XHRpZihlcnJvcikge1xyXG4gXHRcdFx0aG90U2V0U3RhdHVzKFwiZmFpbFwiKTtcclxuIFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHRob3RTZXRTdGF0dXMoXCJpZGxlXCIpO1xyXG4gXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XHJcbiBcdFx0XHRyZXNvbHZlKG91dGRhdGVkTW9kdWxlcyk7XHJcbiBcdFx0fSk7XHJcbiBcdH1cclxuXG4gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRob3Q6IGhvdENyZWF0ZU1vZHVsZShtb2R1bGVJZCksXG4gXHRcdFx0cGFyZW50czogKGhvdEN1cnJlbnRQYXJlbnRzVGVtcCA9IGhvdEN1cnJlbnRQYXJlbnRzLCBob3RDdXJyZW50UGFyZW50cyA9IFtdLCBob3RDdXJyZW50UGFyZW50c1RlbXApLFxuIFx0XHRcdGNoaWxkcmVuOiBbXVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBob3RDcmVhdGVSZXF1aXJlKG1vZHVsZUlkKSk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIF9fd2VicGFja19oYXNoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18uaCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaG90Q3VycmVudEhhc2g7IH07XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIGhvdENyZWF0ZVJlcXVpcmUoMTEpKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDExKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAzZDU4Yjk5NWViYmQ4M2QzMGJhMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgncGF0aCcpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgncGF0aCcpXCJcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgREFUQV9QQVRIID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2RhdGEnKTtcbmNvbnN0IEFOQUxZVElDU19QQVRIID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL3NyYycpO1xuY29uc3QgQU5PTUFMSUVTX1BBVEggPSBwYXRoLmpvaW4oQU5BTFlUSUNTX1BBVEgsICdhbm9tYWxpZXMnKTtcbmNvbnN0IFNFR01FTlRTX1BBVEggPSBwYXRoLmpvaW4oQU5BTFlUSUNTX1BBVEgsICdzZWdtZW50cycpO1xuY29uc3QgTUVUUklDU19QQVRIID0gcGF0aC5qb2luKEFOQUxZVElDU19QQVRILCAnbWV0cmljcycpO1xuXG5leHBvcnQgeyBEQVRBX1BBVEgsIEFOQUxZVElDU19QQVRILCBBTk9NQUxJRVNfUEFUSCwgU0VHTUVOVFNfUEFUSCwgTUVUUklDU19QQVRIIH1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2NvbmZpZy50cyIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IGdldEpzb25EYXRhU3luYywgd3JpdGVKc29uRGF0YVN5bmMgfSBmcm9tICcuL2pzb24nXG5pbXBvcnQgeyBBTk9NQUxJRVNfUEFUSCB9IGZyb20gJy4uL2NvbmZpZydcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJ1xuaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5cbmV4cG9ydCB0eXBlIERhdGFzb3VyY2UgPSB7XG4gIG1ldGhvZDogc3RyaW5nLFxuICBkYXRhOiBPYmplY3QsXG4gIHBhcmFtczogT2JqZWN0LFxuICB0eXBlOiBzdHJpbmcsXG4gIHVybDogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIE1ldHJpYyA9IHtcbiAgZGF0YXNvdXJjZTogc3RyaW5nLFxuICB0YXJnZXRzOiBzdHJpbmdbXVxufVxuXG5leHBvcnQgdHlwZSBBbm9tYWx5ID0ge1xuICBuYW1lOiBzdHJpbmcsXG5cbiAgcGFuZWxVcmw6IHN0cmluZyxcblxuICBtZXRyaWM6IE1ldHJpYyxcbiAgZGF0YXNvdXJjZTogRGF0YXNvdXJjZVxuICBzdGF0dXM6IHN0cmluZyxcbiAgZXJyb3I/OiBzdHJpbmcsXG5cbiAgbGFzdF9wcmVkaWN0aW9uX3RpbWU6IG51bWJlcixcbiAgbmV4dF9pZDogbnVtYmVyXG59XG5cbmV4cG9ydCB0eXBlIEFub21hbHlJZCA9IHN0cmluZztcblxubGV0IGFub21hbGllc05hbWVUb0lkTWFwID0ge307XG5cbmZ1bmN0aW9uIGxvYWRBbm9tYWxpZXNNYXAoKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYGFsbF9hbm9tYWxpZXMuanNvbmApO1xuICBhbm9tYWxpZXNOYW1lVG9JZE1hcCA9IGdldEpzb25EYXRhU3luYyhmaWxlbmFtZSk7XG59XG5cbmZ1bmN0aW9uIHNhdmVBbm9tYWxpZXNNYXAoKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYGFsbF9hbm9tYWxpZXMuanNvbmApO1xuICB3cml0ZUpzb25EYXRhU3luYyhmaWxlbmFtZSwgYW5vbWFsaWVzTmFtZVRvSWRNYXApO1xufVxuXG5mdW5jdGlvbiBnZXRBbm9tYWx5SWRCeU5hbWUoYW5vbWFseU5hbWU6c3RyaW5nKSA6IEFub21hbHlJZCB7XG4gIGxvYWRBbm9tYWxpZXNNYXAoKTtcbiAgYW5vbWFseU5hbWUgPSBhbm9tYWx5TmFtZS50b0xvd2VyQ2FzZSgpO1xuICBpZihhbm9tYWx5TmFtZSBpbiBhbm9tYWxpZXNOYW1lVG9JZE1hcCkge1xuICAgIHJldHVybiBhbm9tYWxpZXNOYW1lVG9JZE1hcFthbm9tYWx5TmFtZV07XG4gIH1cbiAgcmV0dXJuIGFub21hbHlOYW1lO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRBbm9tYWx5KGFub21hbHk6IEFub21hbHkpIDogQW5vbWFseUlkIHtcbiAgY29uc3QgaGFzaFN0cmluZyA9IGFub21hbHkubmFtZSArIChuZXcgRGF0ZSgpKS50b1N0cmluZygpO1xuICBjb25zdCBhbm9tYWx5SWQ6QW5vbWFseUlkID0gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShoYXNoU3RyaW5nKS5kaWdlc3QoJ2hleCcpO1xuICBhbm9tYWxpZXNOYW1lVG9JZE1hcFthbm9tYWx5Lm5hbWVdID0gYW5vbWFseUlkO1xuICBzYXZlQW5vbWFsaWVzTWFwKCk7XG4gIC8vIHJldHVybiBhbm9tYWx5SWRcbiAgLy8gY29uc3QgYW5vbWFseUlkOkFub21hbHlJZCA9IGFub21hbHkubmFtZTtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKEFOT01BTElFU19QQVRILCBgJHthbm9tYWx5SWR9Lmpzb25gKTtcbiAgaWYoZnMuZXhpc3RzU3luYyhmaWxlbmFtZSkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBzYXZlQW5vbWFseShhbm9tYWx5SWQsIGFub21hbHkpO1xuICByZXR1cm4gYW5vbWFseUlkO1xufVxuXG5mdW5jdGlvbiByZW1vdmVBbm9tYWx5KGFub21hbHlJZDpBbm9tYWx5SWQpIHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKEFOT01BTElFU19QQVRILCBgJHthbm9tYWx5SWR9Lmpzb25gKTtcbiAgZnMudW5saW5rU3luYyhmaWxlbmFtZSk7XG59XG5cbmZ1bmN0aW9uIHNhdmVBbm9tYWx5KGFub21hbHlJZDogQW5vbWFseUlkLCBhbm9tYWx5OiBBbm9tYWx5KSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYCR7YW5vbWFseUlkfS5qc29uYCk7XG4gIHJldHVybiB3cml0ZUpzb25EYXRhU3luYyhmaWxlbmFtZSwgYW5vbWFseSk7XG59XG5cbmZ1bmN0aW9uIGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQ6IEFub21hbHlJZCkgOiBBbm9tYWx5IHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKEFOT01BTElFU19QQVRILCBgJHthbm9tYWx5SWR9Lmpzb25gKTtcbiAgaWYoIWZzLmV4aXN0c1N5bmMoZmlsZW5hbWUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIGdldEpzb25EYXRhU3luYyhmaWxlbmFtZSk7XG59XG5cbmZ1bmN0aW9uIGxvYWRBbm9tYWx5QnlOYW1lKGFub21hbHlOYW1lOiBzdHJpbmcpIDogQW5vbWFseSB7XG4gIGxldCBhbm9tYWx5SWQgPSBnZXRBbm9tYWx5SWRCeU5hbWUoYW5vbWFseU5hbWUpO1xuICByZXR1cm4gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZCk7XG59XG5cbmZ1bmN0aW9uIHNhdmVBbm9tYWx5VHlwZUluZm8oaW5mbykge1xuICBjb25zb2xlLmxvZygnU2F2aW5nJyk7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYCR7aW5mby5uYW1lfS5qc29uYCk7XG4gIGlmKGluZm8ubmV4dF9pZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgaW5mby5uZXh0X2lkID0gMDtcbiAgfVxuICBpZihpbmZvLmxhc3RfcHJlZGljdGlvbl90aW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGluZm8ubGFzdF9wcmVkaWN0aW9uX3RpbWUgPSAwO1xuICB9XG5cbiAgcmV0dXJuIHdyaXRlSnNvbkRhdGFTeW5jKGZpbGVuYW1lLCBpbmZvKTtcbn1cblxuZnVuY3Rpb24gZ2V0QW5vbWFseVR5cGVJbmZvKG5hbWUpIHtcbiAgcmV0dXJuIGdldEpzb25EYXRhU3luYyhwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGAke25hbWV9Lmpzb25gKSk7XG59XG5cbmZ1bmN0aW9uIHNldEFub21hbHlTdGF0dXMoYW5vbWFseUlkOkFub21hbHlJZCwgc3RhdHVzOnN0cmluZywgZXJyb3I/OnN0cmluZykge1xuICBsZXQgaW5mbyA9IGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQpO1xuICBpbmZvLnN0YXR1cyA9IHN0YXR1cztcbiAgaWYoZXJyb3IgIT09IHVuZGVmaW5lZCkge1xuICAgIGluZm8uZXJyb3IgPSBlcnJvcjtcbiAgfSBlbHNlIHtcbiAgICBpbmZvLmVycm9yID0gJyc7XG4gIH1cbiAgc2F2ZUFub21hbHkoYW5vbWFseUlkLCBpbmZvKTtcbn1cblxuZnVuY3Rpb24gc2V0QW5vbWFseVByZWRpY3Rpb25UaW1lKGFub21hbHlJZDpBbm9tYWx5SWQsIGxhc3RQcmVkaWN0aW9uVGltZTpudW1iZXIpIHtcbiAgbGV0IGluZm8gPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgaW5mby5sYXN0X3ByZWRpY3Rpb25fdGltZSA9IGxhc3RQcmVkaWN0aW9uVGltZTtcbiAgc2F2ZUFub21hbHkoYW5vbWFseUlkLCBpbmZvKTtcbn1cblxuZXhwb3J0IHtcbiAgc2F2ZUFub21hbHksIGxvYWRBbm9tYWx5QnlJZCwgbG9hZEFub21hbHlCeU5hbWUsIGluc2VydEFub21hbHksIHJlbW92ZUFub21hbHksIHNhdmVBbm9tYWx5VHlwZUluZm8sXG4gIGdldEFub21hbHlUeXBlSW5mbywgZ2V0QW5vbWFseUlkQnlOYW1lLCBzZXRBbm9tYWx5U3RhdHVzLCBzZXRBbm9tYWx5UHJlZGljdGlvblRpbWVcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NlcnZpY2VzL2Fub21hbHlUeXBlLnRzIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRKc29uRGF0YShmaWxlbmFtZTogc3RyaW5nKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgdmFyIGRhdGEgPSBhd2FpdCBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmcy5yZWFkRmlsZShmaWxlbmFtZSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICBpZihlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICByZWplY3QoJ0NhbmB0IHJlYWQgZmlsZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1dyb25nIGZpbGUgZm9ybWF0Jyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JpdGVKc29uRGF0YShmaWxlbmFtZTogc3RyaW5nLCBkYXRhOiBPYmplY3QpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmcy53cml0ZUZpbGUoZmlsZW5hbWUsIEpTT04uc3RyaW5naWZ5KGRhdGEpLCAndXRmOCcsIChlcnIpID0+IHtcbiAgICAgIGlmKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIHJlamVjdCgnQ2F0YHQgd3JpdGUgZmlsZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KVxufVxuXG5mdW5jdGlvbiBnZXRKc29uRGF0YVN5bmMoZmlsZW5hbWU6IHN0cmluZykge1xuICBsZXQgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKTtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1dyb25nIGZpbGUgZm9ybWF0Jyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWU6IHN0cmluZywgZGF0YTogT2JqZWN0KSB7XG4gIGZzLndyaXRlRmlsZVN5bmMoZmlsZW5hbWUsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbn1cblxuZXhwb3J0IHtcbiAgZ2V0SnNvbkRhdGEsXG4gIHdyaXRlSnNvbkRhdGEsXG4gIGdldEpzb25EYXRhU3luYyxcbiAgd3JpdGVKc29uRGF0YVN5bmNcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NlcnZpY2VzL2pzb24udHMiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2V4cHJlc3MnKVwiXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnZnMnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2ZzJylcIlxuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgeyBBTkFMWVRJQ1NfUEFUSCB9IGZyb20gJy4uL2NvbmZpZydcbmltcG9ydCB7XG4gIEFub21hbHksXG4gIEFub21hbHlJZCwgZ2V0QW5vbWFseVR5cGVJbmZvLFxuICBsb2FkQW5vbWFseUJ5SWQsXG4gIHNldEFub21hbHlQcmVkaWN0aW9uVGltZSxcbiAgc2V0QW5vbWFseVN0YXR1c1xufSBmcm9tICcuL2Fub21hbHlUeXBlJ1xuaW1wb3J0IHsgZ2V0VGFyZ2V0IH0gZnJvbSAnLi9tZXRyaWNzJztcbmltcG9ydCB7IGdldExhYmVsZWRTZWdtZW50cywgaW5zZXJ0U2VnbWVudHMsIHJlbW92ZVNlZ21lbnRzIH0gZnJvbSAnLi9zZWdtZW50cyc7XG5pbXBvcnQgeyBzcGxpdCwgbWFwLCBtYXBTeW5jIH0gZnJvbSAnZXZlbnQtc3RyZWFtJ1xuXG5jb25zdCBsZWFybldvcmtlciA9IHNwYXduKCdweXRob24zJywgWyd3b3JrZXIucHknXSwgeyBjd2Q6IEFOQUxZVElDU19QQVRIIH0pXG5sZWFybldvcmtlci5zdGRvdXQucGlwZShzcGxpdCgpKVxuICAucGlwZShcbiAgICBtYXBTeW5jKGZ1bmN0aW9uKGxpbmUpe1xuICAgICAgb25NZXNzYWdlKGxpbmUpXG4gICAgfSlcbiAgKTtcblxubGVhcm5Xb3JrZXIuc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiBjb25zb2xlLmVycm9yKGB3b3JrZXIgc3RkZXJyOiAke2RhdGF9YCkpO1xuXG5jb25zdCB0YXNrTWFwID0ge307XG5sZXQgbmV4dFRhc2tJZCA9IDA7XG5cbmZ1bmN0aW9uIG9uTWVzc2FnZShkYXRhKSB7XG4gIGNvbnNvbGUubG9nKGB3b3JrZXIgc3Rkb3V0OiAke2RhdGF9YCk7XG4gIGxldCByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gIGxldCB0YXNrSWQgPSByZXNwb25zZS5fX3Rhc2tfaWQ7XG4gIC8vIGxldCBhbm9tYWx5TmFtZSA9IHJlc3BvbnNlLmFub21hbHlfbmFtZTtcbiAgLy8gbGV0IHRhc2sgPSByZXNwb25zZS50YXNrO1xuICBsZXQgc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuXG4gIGlmKHN0YXR1cyA9PT0gJ3N1Y2Nlc3MnIHx8IHN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcbiAgICBpZih0YXNrSWQgaW4gdGFza01hcCkge1xuICAgICAgbGV0IHJlc29sdmVyID0gdGFza01hcFt0YXNrSWRdO1xuICAgICAgcmVzb2x2ZXIocmVzcG9uc2UpO1xuICAgICAgZGVsZXRlIHRhc2tNYXBbdGFza0lkXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcnVuVGFzayh0YXNrKSA6IFByb21pc2U8YW55PiB7XG4gIGxldCBhbm9tYWx5OkFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQodGFzay5hbm9tYWx5X2lkKTtcbiAgdGFzay5tZXRyaWMgPSB7XG4gICAgZGF0YXNvdXJjZTogYW5vbWFseS5tZXRyaWMuZGF0YXNvdXJjZSxcbiAgICB0YXJnZXRzOiBhbm9tYWx5Lm1ldHJpYy50YXJnZXRzLm1hcCh0ID0+IGdldFRhcmdldCh0KSlcbiAgfTtcblxuICB0YXNrLl9fdGFza19pZCA9IG5leHRUYXNrSWQrKztcbiAgbGV0IGNvbW1hbmQgPSBKU09OLnN0cmluZ2lmeSh0YXNrKVxuICBsZWFybldvcmtlci5zdGRpbi53cml0ZShgJHtjb21tYW5kfVxcbmApO1xuICByZXR1cm4gbmV3IFByb21pc2U8T2JqZWN0PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdGFza01hcFt0YXNrLl9fdGFza19pZF0gPSByZXNvbHZlXG4gIH0pXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bkxlYXJuaW5nKGFub21hbHlJZDpBbm9tYWx5SWQpIHtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG4gIHNldEFub21hbHlTdGF0dXMoYW5vbWFseUlkLCAnbGVhcm5pbmcnKTtcbiAgbGV0IGFub21hbHk6QW5vbWFseSAgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgbGV0IGFuYWx5dGljc1R5cGUgPSBcImFub21hbGllc1wiO1xuICBsZXQgcHJlc2V0ID0gdW5kZWZpbmVkO1xuICBpZiAoYW5vbWFseS5uYW1lLmluY2x1ZGVzKFwianVtcHNcIikpIHtcbiAgICBhbmFseXRpY3NUeXBlID0gXCJwYXR0ZXJuc1wiO1xuICAgIHByZXNldCA9IFwic3RlcHNcIlxuICB9XG4gIGlmIChhbm9tYWx5Lm5hbWUuaW5jbHVkZXMoXCJjbGlmZnNcIikgfHwgYW5vbWFseS5uYW1lLmluY2x1ZGVzKFwiZHJvcHNcIikpIHtcbiAgICBhbmFseXRpY3NUeXBlID0gXCJwYXR0ZXJuc1wiO1xuICAgIHByZXNldCA9IFwiY2xpZmZzXCJcbiAgfVxuICBpZiAoYW5vbWFseS5uYW1lLmluY2x1ZGVzKFwicGVha3NcIikpIHtcbiAgICBhbmFseXRpY3NUeXBlID0gXCJwYXR0ZXJuc1wiO1xuICAgIHByZXNldCA9IFwicGVha3NcIlxuICB9XG4gIGxldCB0YXNrID0ge1xuICAgIHR5cGU6ICdsZWFybicsXG4gICAgYW5vbWFseV9pZDogYW5vbWFseUlkLFxuICAgIGFuYWx5dGljc190eXBlOiBhbmFseXRpY3NUeXBlLFxuICAgIHByZXNldCxcbiAgICBzZWdtZW50czogc2VnbWVudHNcbiAgfTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgcnVuVGFzayh0YXNrKTtcblxuICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgc2V0QW5vbWFseVN0YXR1cyhhbm9tYWx5SWQsICdyZWFkeScpO1xuICAgIGluc2VydFNlZ21lbnRzKGFub21hbHlJZCwgcmVzdWx0LnNlZ21lbnRzLCBmYWxzZSk7XG4gICAgc2V0QW5vbWFseVByZWRpY3Rpb25UaW1lKGFub21hbHlJZCwgcmVzdWx0Lmxhc3RfcHJlZGljdGlvbl90aW1lKTtcbiAgfSBlbHNlIHtcbiAgICBzZXRBbm9tYWx5U3RhdHVzKGFub21hbHlJZCwgJ2ZhaWxlZCcsIHJlc3VsdC5lcnJvcik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuUHJlZGljdChhbm9tYWx5SWQ6QW5vbWFseUlkKSB7XG4gIGxldCBhbm9tYWx5OkFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgbGV0IGFuYWx5dGljc1R5cGUgPSBcImFub21hbGllc1wiO1xuICBsZXQgcHJlc2V0ID0gdW5kZWZpbmVkO1xuICBpZiAoYW5vbWFseS5uYW1lLmluY2x1ZGVzKFwianVtcFwiKSkge1xuICAgIGFuYWx5dGljc1R5cGUgPSBcInBhdHRlcm5zXCI7XG4gICAgcHJlc2V0ID0gXCJzdGVwc1wiXG4gIH1cbiAgaWYgKGFub21hbHkubmFtZS5pbmNsdWRlcyhcImNsaWZmc1wiKSB8fCBhbm9tYWx5Lm5hbWUuaW5jbHVkZXMoXCJkcm9wc1wiKSkge1xuICAgIGFuYWx5dGljc1R5cGUgPSBcInBhdHRlcm5zXCI7XG4gICAgcHJlc2V0ID0gXCJjbGlmZnNcIlxuICB9XG4gIGlmIChhbm9tYWx5Lm5hbWUuaW5jbHVkZXMoXCJwZWFrc1wiKSkge1xuICAgIGFuYWx5dGljc1R5cGUgPSBcInBhdHRlcm5zXCI7XG4gICAgcHJlc2V0ID0gXCJwZWFrc1wiXG4gIH1cbiAgbGV0IHRhc2sgPSB7XG4gICAgdHlwZTogJ3ByZWRpY3QnLFxuICAgIGFub21hbHlfaWQ6IGFub21hbHlJZCxcbiAgICBhbmFseXRpY3NfdHlwZTogYW5hbHl0aWNzVHlwZSxcbiAgICBwcmVzZXQsXG4gICAgbGFzdF9wcmVkaWN0aW9uX3RpbWU6IGFub21hbHkubGFzdF9wcmVkaWN0aW9uX3RpbWVcbiAgfTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHJ1blRhc2sodGFzayk7XG5cbiAgaWYocmVzdWx0LnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgLy8gTWVyZ2luZyBzZWdtZW50c1xuICBsZXQgc2VnbWVudHMgPSBnZXRMYWJlbGVkU2VnbWVudHMoYW5vbWFseUlkKTtcbiAgaWYoc2VnbWVudHMubGVuZ3RoID4gMCAmJiByZXN1bHQuc2VnbWVudHMubGVuZ3RoID4gMCkge1xuICAgIGxldCBsYXN0T2xkU2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdO1xuICAgIGxldCBmaXJzdE5ld1NlZ21lbnQgPSByZXN1bHQuc2VnbWVudHNbMF07XG5cbiAgICBpZihmaXJzdE5ld1NlZ21lbnQuc3RhcnQgPD0gbGFzdE9sZFNlZ21lbnQuZmluaXNoKSB7XG4gICAgICByZXN1bHQuc2VnbWVudHNbMF0uc3RhcnQgPSBsYXN0T2xkU2VnbWVudC5zdGFydDtcbiAgICAgIHJlbW92ZVNlZ21lbnRzKGFub21hbHlJZCwgW2xhc3RPbGRTZWdtZW50LmlkXSk7XG4gICAgfVxuICB9XG5cbiAgaW5zZXJ0U2VnbWVudHMoYW5vbWFseUlkLCByZXN1bHQuc2VnbWVudHMsIGZhbHNlKTtcbiAgc2V0QW5vbWFseVByZWRpY3Rpb25UaW1lKGFub21hbHlJZCwgcmVzdWx0Lmxhc3RfcHJlZGljdGlvbl90aW1lKTtcbiAgcmV0dXJuIHJlc3VsdC5zZWdtZW50cztcbn1cblxuZXhwb3J0IHsgcnVuTGVhcm5pbmcsIHJ1blByZWRpY3QgfVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc2VydmljZXMvYW5hbHl0aWNzLnRzIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEpzb25EYXRhU3luYywgd3JpdGVKc29uRGF0YVN5bmMgfSAgZnJvbSAnLi9qc29uJztcbmltcG9ydCB7IFNFR01FTlRTX1BBVEggfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgQW5vbWFseUlkLCBsb2FkQW5vbWFseUJ5SWQsIHNhdmVBbm9tYWx5IH0gZnJvbSAnLi9hbm9tYWx5VHlwZSc7XG5cbmZ1bmN0aW9uIGdldExhYmVsZWRTZWdtZW50cyhhbm9tYWx5SWQ6IEFub21hbHlJZCkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oU0VHTUVOVFNfUEFUSCwgYCR7YW5vbWFseUlkfV9sYWJlbGVkLmpzb25gKTtcblxuICBsZXQgc2VnbWVudHMgPSBbXTtcbiAgdHJ5IHtcbiAgICBzZWdtZW50cyA9IGdldEpzb25EYXRhU3luYyhmaWxlbmFtZSk7XG4gICAgZm9yIChsZXQgc2VnbWVudCBvZiBzZWdtZW50cykge1xuICAgICAgaWYgKHNlZ21lbnQubGFiZWxlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNlZ21lbnQubGFiZWxlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcbiAgfVxuICByZXR1cm4gc2VnbWVudHM7XG59XG5cbmZ1bmN0aW9uIGdldFByZWRpY3RlZFNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihTRUdNRU5UU19QQVRILCBgJHthbm9tYWx5SWR9X3NlZ21lbnRzLmpzb25gKTtcblxuICBsZXQganNvbkRhdGE7XG4gIHRyeSB7XG4gICAganNvbkRhdGEgPSBnZXRKc29uRGF0YVN5bmMoZmlsZW5hbWUpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XG4gICAganNvbkRhdGEgPSBbXTtcbiAgfVxuICByZXR1cm4ganNvbkRhdGE7XG59XG5cbmZ1bmN0aW9uIHNhdmVTZWdtZW50cyhhbm9tYWx5SWQ6IEFub21hbHlJZCwgc2VnbWVudHMpIHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKFNFR01FTlRTX1BBVEgsIGAke2Fub21hbHlJZH1fbGFiZWxlZC5qc29uYCk7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWUsIHNlZ21lbnRzKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xuICAgIHRocm93IG5ldyBFcnJvcignQ2FuYHQgd3JpdGUgdG8gZGInKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbnNlcnRTZWdtZW50cyhhbm9tYWx5SWQ6IEFub21hbHlJZCwgYWRkZWRTZWdtZW50cywgbGFiZWxlZDpib29sZWFuKSB7XG4gIC8vIFNldCBzdGF0dXNcbiAgbGV0IGluZm8gPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG5cbiAgbGV0IG5leHRJZCA9IGluZm8ubmV4dF9pZDtcbiAgbGV0IGFkZGVkSWRzID0gW11cbiAgZm9yIChsZXQgc2VnbWVudCBvZiBhZGRlZFNlZ21lbnRzKSB7XG4gICAgc2VnbWVudC5pZCA9IG5leHRJZDtcbiAgICBzZWdtZW50LmxhYmVsZWQgPSBsYWJlbGVkO1xuICAgIGFkZGVkSWRzLnB1c2gobmV4dElkKTtcbiAgICBuZXh0SWQrKztcbiAgICBzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xuICB9XG4gIGluZm8ubmV4dF9pZCA9IG5leHRJZDtcbiAgc2F2ZVNlZ21lbnRzKGFub21hbHlJZCwgc2VnbWVudHMpO1xuICBzYXZlQW5vbWFseShhbm9tYWx5SWQsIGluZm8pO1xuICByZXR1cm4gYWRkZWRJZHM7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkLCByZW1vdmVkU2VnbWVudHMpIHtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG4gIGZvciAobGV0IHNlZ21lbnRJZCBvZiByZW1vdmVkU2VnbWVudHMpIHtcbiAgICBzZWdtZW50cyA9IHNlZ21lbnRzLmZpbHRlcihlbCA9PiBlbC5pZCAhPT0gc2VnbWVudElkKTtcbiAgfVxuICBzYXZlU2VnbWVudHMoYW5vbWFseUlkLCBzZWdtZW50cyk7XG59XG5cbmV4cG9ydCB7IGdldExhYmVsZWRTZWdtZW50cywgZ2V0UHJlZGljdGVkU2VnbWVudHMsIHNhdmVTZWdtZW50cywgaW5zZXJ0U2VnbWVudHMsIHJlbW92ZVNlZ21lbnRzIH1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NlcnZpY2VzL3NlZ21lbnRzLnRzIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdjcnlwdG8nKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2NyeXB0bycpXCJcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEpzb25EYXRhU3luYywgd3JpdGVKc29uRGF0YVN5bmMgfSAgZnJvbSAnLi9qc29uJztcbmltcG9ydCB7IE1FVFJJQ1NfUEFUSCB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSAnY3J5cHRvJztcblxuZnVuY3Rpb24gc2F2ZVRhcmdldHModGFyZ2V0cykge1xuICBsZXQgbWV0cmljcyA9IFtdO1xuICBmb3IgKGxldCB0YXJnZXQgb2YgdGFyZ2V0cykge1xuICAgIG1ldHJpY3MucHVzaChzYXZlVGFyZ2V0KHRhcmdldCkpO1xuICB9XG4gIHJldHVybiBtZXRyaWNzO1xufVxuXG5mdW5jdGlvbiBzYXZlVGFyZ2V0KHRhcmdldCkge1xuICAvL2NvbnN0IG1kNSA9IGNyeXB0by5jcmVhdGVIYXNoKCdtZDUnKVxuICBjb25zdCB0YXJnZXRJZCA9IGNyeXB0by5jcmVhdGVIYXNoKCdtZDUnKS51cGRhdGUoSlNPTi5zdHJpbmdpZnkodGFyZ2V0KSkuZGlnZXN0KCdoZXgnKTtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKE1FVFJJQ1NfUEFUSCwgYCR7dGFyZ2V0SWR9Lmpzb25gKTtcbiAgd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWUsIHRhcmdldCk7XG4gIHJldHVybiB0YXJnZXRJZDtcbn1cblxuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldElkKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihNRVRSSUNTX1BBVEgsIGAke3RhcmdldElkfS5qc29uYCk7XG4gIHJldHVybiBnZXRKc29uRGF0YVN5bmMoZmlsZW5hbWUpO1xufVxuXG5leHBvcnQgeyBzYXZlVGFyZ2V0cywgZ2V0VGFyZ2V0IH1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NlcnZpY2VzL21ldHJpY3MudHMiLCIvL2ltcG9ydCAqIGFzIFRlbGVncmFmIGZyb20gJ3RlbGVncmFmJ1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IERBVEFfUEFUSCB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgeyBnZXRKc29uRGF0YVN5bmMsIHdyaXRlSnNvbkRhdGFTeW5jIH0gZnJvbSAnLi9qc29uJztcbmltcG9ydCB7IEFub21hbHlJZCB9IGZyb20gJy4vYW5vbWFseVR5cGUnO1xuXG5cbnR5cGUgU3Vic2NyaWJlcklkID0gc3RyaW5nO1xudHlwZSBTdWJzY3JpYmVyc01hcCA9IE1hcDwgQW5vbWFseUlkLCBTdWJzY3JpYmVySWRbXSA+O1xuXG50eXBlIEJvdENvbmZpZyA9IHtcbiAgdG9rZW46IHN0cmluZyxcbiAgc3Vic2NyaXB0aW9uczogU3Vic2NyaWJlcnNNYXBcbn07XG5cbmZ1bmN0aW9uIHNlbmROb3RpZmljYXRpb24oYW5vbWFseU5hbWUsIGFjdGl2ZSkge1xuICBjb25zb2xlLmxvZygnTm90aWZpY2F0aW9uICcgKyBhbm9tYWx5TmFtZSk7XG4gIGlmKGFub21hbHlOYW1lIGluIGJvdENvbmZpZy5zdWJzY3JpcHRpb25zKSB7XG4gICAgbGV0IG5vdGlmaWNhdGlvbk1lc3NhZ2U7XG4gICAgaWYoYWN0aXZlKSB7XG4gICAgICBub3RpZmljYXRpb25NZXNzYWdlID0gJ0FsZXJ0ISBBbm9tYWx5IHR5cGUgJyArIGFub21hbHlOYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICBub3RpZmljYXRpb25NZXNzYWdlID0gJ09rISBBbm9tYWx5IHR5cGUgJyArIGFub21hbHlOYW1lO1xuICAgIH1cblxuICAgIGZvciAobGV0IFN1YnNjcmliZXJJZCBvZiBib3RDb25maWcuc3Vic2NyaXB0aW9uc1thbm9tYWx5TmFtZV0pIHtcbiAgICAgIGJvdC50ZWxlZ3JhbS5zZW5kTWVzc2FnZShTdWJzY3JpYmVySWQsIG5vdGlmaWNhdGlvbk1lc3NhZ2UpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBsb2FkQm90Q29uZmlnKCkgOiBCb3RDb25maWcge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oREFUQV9QQVRILCBgYm90X2NvbmZpZy5qc29uYCk7XG4gIGxldCBqc29uRGF0YTtcbiAgdHJ5IHtcbiAgICBqc29uRGF0YSA9IGdldEpzb25EYXRhU3luYyhmaWxlbmFtZSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcbiAgICBqc29uRGF0YSA9IFtdO1xuICB9XG4gIHJldHVybiBqc29uRGF0YTtcbn1cblxuZnVuY3Rpb24gc2F2ZUJvdENvbmZpZyhib3RDb25maWc6IEJvdENvbmZpZykge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oREFUQV9QQVRILCBgYm90X2NvbmZpZy5qc29uYCk7XG4gIHRyeSB7XG4gICAgd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWUsIGJvdENvbmZpZyk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcbiAgfVxufVxuXG5jb25zdCBjb21tYW5kQXJncyA9IChjdHgsIG5leHQpID0+IHtcbiAgdHJ5IHtcbiAgICBpZihjdHgudXBkYXRlVHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gY3R4LnVwZGF0ZS5tZXNzYWdlLnRleHQ7XG4gICAgICBpZih0ZXh0ICE9PSB1bmRlZmluZWQgJiYgdGV4dC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKC9eXFwvKFteXFxzXSspXFxzPyguKyk/Lyk7XG4gICAgICAgIGxldCBhcmdzID0gW107XG4gICAgICAgIGxldCBjb21tYW5kO1xuICAgICAgICBpZihtYXRjaCAhPT0gbnVsbCkge1xuICAgICAgICAgIGlmKG1hdGNoWzFdKSB7XG4gICAgICAgICAgICBjb21tYW5kID0gbWF0Y2hbMV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKG1hdGNoWzJdKSB7XG4gICAgICAgICAgICBhcmdzID0gbWF0Y2hbMl0uc3BsaXQoJyAnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY3R4LnN0YXRlLmNvbW1hbmQgPSB7XG4gICAgICAgICAgcmF3OiB0ZXh0LFxuICAgICAgICAgIGNvbW1hbmQsXG4gICAgICAgICAgYXJncyxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5leHQoY3R4KTtcbiAgfSBjYXRjaCAoZSkge1xuXG4gIH1cbn07XG5cbmZ1bmN0aW9uIGFkZE5vdGlmaWNhdGlvbihjdHgpIHtcbiAgY29uc29sZS5sb2coJ2FkZE5vdGlmaWNhdGlvbicpXG4gIGxldCBjb21tYW5kID0gY3R4LnN0YXRlLmNvbW1hbmQ7XG4gIGxldCBjaGF0SWQgPSBjdHguY2hhdC5pZDtcbiAgaWYoY29tbWFuZC5hcmdzLmxlbmd0aCA+IDApIHtcbiAgICBmb3IgKGxldCBhbm9tYWx5TmFtZSBvZiBjb21tYW5kLmFyZ3MpIHtcbiAgICAgIGlmKCEoYW5vbWFseU5hbWUgaW4gYm90Q29uZmlnLnN1YnNjcmlwdGlvbnMpKSB7XG4gICAgICAgIGJvdENvbmZpZy5zdWJzY3JpcHRpb25zW2Fub21hbHlOYW1lXSA9IFtdXG4gICAgICB9XG4gICAgICBpZihib3RDb25maWcuc3Vic2NyaXB0aW9uc1thbm9tYWx5TmFtZV0uaW5jbHVkZXMoY2hhdElkKSkge1xuICAgICAgICByZXR1cm4gY3R4LnJlcGx5KCdZb3UgYXJlIGFscmVhZHkgc3Vic2NyaWJlZCBvbiBhbGVydHMgZnJvbSBhbm9tYWx5ICcgKyBjb21tYW5kLmFyZ3MpXG4gICAgICB9ICBlbHNlIHtcbiAgICAgICAgYm90Q29uZmlnLnN1YnNjcmlwdGlvbnNbYW5vbWFseU5hbWVdLnB1c2goY2hhdElkKTtcbiAgICAgICAgc2F2ZUJvdENvbmZpZyhib3RDb25maWcpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3R4LnJlcGx5KCdZb3UgaGF2ZSBiZWVuIHN1Y2Nlc3NmdWxseSBzdWJzY3JpYmVkIG9uIGFsZXJ0cyBmcm9tIGFub21hbHkgJyArIGNvbW1hbmQuYXJncylcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY3R4LnJlcGx5KCdZb3Ugc2hvdWxkIHVzZSBzeW50YXg6IFxcL2FkZE5vdGlmaWNhdGlvbiA8YW5vbWFseV9uYW1lPicpXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm90aWZpY2F0aW9uKGN0eCkge1xuICBsZXQgY29tbWFuZCA9IGN0eC5zdGF0ZS5jb21tYW5kO1xuICBsZXQgY2hhdElkID0gY3R4LmNoYXQuaWQ7XG4gIGlmKGNvbW1hbmQuYXJncy5sZW5ndGggPiAwKSB7XG4gICAgZm9yIChsZXQgYW5vbWFseU5hbWUgb2YgY29tbWFuZC5hcmdzKSB7XG4gICAgICBpZihhbm9tYWx5TmFtZSBpbiBib3RDb25maWcuc3Vic2NyaXB0aW9ucykge1xuICAgICAgICBib3RDb25maWcuc3Vic2NyaXB0aW9uc1thbm9tYWx5TmFtZV0gPSBib3RDb25maWcuc3Vic2NyaXB0aW9uc1thbm9tYWx5TmFtZV0uZmlsdGVyKGVsID0+IGVsICE9PSBjaGF0SWQpO1xuICAgICAgICBzYXZlQm90Q29uZmlnKGJvdENvbmZpZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjdHgucmVwbHkoJ1lvdSBoYXZlIGJlZW4gc3VjY2Vzc2Z1bGx5IHVuc3Vic2NyaWJlZCBmcm9tIGFsZXJ0cyBmcm9tICcgKyBjb21tYW5kLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjdHgucmVwbHkoJ1lvdSBzaG91bGQgdXNlIHN5bnRheDogXFwvcmVtb3ZlTm90aWZpY2F0aW9uIDxhbm9tYWx5X25hbWU+Jyk7XG4gIH1cbn1cblxuY29uc3QgVGVsZWdyYWYgPSByZXF1aXJlKCd0ZWxlZ3JhZicpO1xubGV0IGJvdENvbmZpZzogQm90Q29uZmlnO1xubGV0IGJvdDtcblxuZnVuY3Rpb24gdGdCb3RJbml0KCkge1xuICB0cnkge1xuICAgIGJvdENvbmZpZyA9IGxvYWRCb3RDb25maWcoKTtcbiAgICBib3QgPSBuZXcgVGVsZWdyYWYoYm90Q29uZmlnLnRva2VuKTtcblxuICAgIGJvdC51c2UoY29tbWFuZEFyZ3MpO1xuXG4gICAgYm90LmNvbW1hbmQoJ2FkZE5vdGlmaWNhdGlvbicsIGFkZE5vdGlmaWNhdGlvbik7XG4gICAgYm90LmNvbW1hbmQoJ3JlbW92ZU5vdGlmaWNhdGlvbicsIHJlbW92ZU5vdGlmaWNhdGlvbik7XG5cbiAgICBib3Quc3RhcnRQb2xsaW5nKCk7XG4gIH0gY2F0Y2goZSkge1xuICAgIC8vIFRPRE86IGhhbmRsZSBleGNlcHRpb25cbiAgfVxufVxuXG5leHBvcnQgeyBzZW5kTm90aWZpY2F0aW9uLCB0Z0JvdEluaXQgfVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc2VydmljZXMvbm90aWZpY2F0aW9uLnRzIiwiaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCAqIGFzIGJvZHlQYXJzZXIgZnJvbSAnYm9keS1wYXJzZXInO1xuXG5pbXBvcnQgeyByb3V0ZXIgYXMgYW5vbWFsaWVzUm91dGVyIH0gZnJvbSAnLi9yb3V0ZXMvYW5vbWFsaWVzJztcbmltcG9ydCB7IHJvdXRlciBhcyBzZWdtZW50c1JvdXRlciB9IGZyb20gJy4vcm91dGVzL3NlZ21lbnRzJztcbmltcG9ydCB7IHJvdXRlciBhcyBhbGVydHNSb3V0ZXIgfSBmcm9tICcuL3JvdXRlcy9hbGVydHMnO1xuaW1wb3J0IHsgdGdCb3RJbml0IH0gZnJvbSAnLi9zZXJ2aWNlcy9ub3RpZmljYXRpb24nO1xuXG5jb25zdCBhcHAgPSBleHByZXNzKCk7XG5jb25zdCBQT1JUID0gcHJvY2Vzcy5lbnYuSEFTVElDX1BPUlQgfHwgODAwMDtcblxuYXBwLnVzZShib2R5UGFyc2VyLmpzb24oKSk7XG5hcHAudXNlKGJvZHlQYXJzZXIudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlIH0pKTtcblxuYXBwLnVzZShmdW5jdGlvbiAocmVxLCByZXMsIG5leHQpIHtcbiAgcmVzLmhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgcmVzLmhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICByZXMuaGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ09yaWdpbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQ29udGVudC1UeXBlLCBBY2NlcHQnKTtcbiAgbmV4dCgpO1xufSk7XG5cbmFwcC51c2UoJy9hbm9tYWxpZXMnLCBhbm9tYWxpZXNSb3V0ZXIpO1xuYXBwLnVzZSgnL3NlZ21lbnRzJywgc2VnbWVudHNSb3V0ZXIpO1xuYXBwLnVzZSgnL2FsZXJ0cycsIGFsZXJ0c1JvdXRlcik7XG5hcHAudXNlKCcvJywgKHJlcSwgcmVzKSA9PiByZXMuc2VuZCh7IHN0YXR1czogJ09LJyB9KSk7XG5cbmFwcC5saXN0ZW4oUE9SVCwgKCkgPT4ge1xuICBjb25zb2xlLmxvZyhgU2VydmVyIGlzIHJ1bm5pbmcgb24gOiR7UE9SVH1gKVxufSk7XG5cbnRnQm90SW5pdCgpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vaW5kZXgudHMiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2JvZHktcGFyc2VyJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJyZXF1aXJlKCdib2R5LXBhcnNlcicpXCJcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5cbmltcG9ydCB7XG4gIERhdGFzb3VyY2UsXG4gIE1ldHJpYyxcbiAgQW5vbWFseSxcbiAgc2F2ZUFub21hbHksXG4gIGluc2VydEFub21hbHksIHJlbW92ZUFub21hbHksIGxvYWRBbm9tYWx5QnlOYW1lLCBsb2FkQW5vbWFseUJ5SWQsIGdldEFub21hbHlJZEJ5TmFtZVxufSBmcm9tICcuLi9zZXJ2aWNlcy9hbm9tYWx5VHlwZSc7XG5pbXBvcnQgeyBydW5MZWFybmluZyB9IGZyb20gJy4uL3NlcnZpY2VzL2FuYWx5dGljcydcbmltcG9ydCB7IHNhdmVUYXJnZXRzIH0gZnJvbSAnLi4vc2VydmljZXMvbWV0cmljcyc7XG5cbmFzeW5jIGZ1bmN0aW9uIHNlbmRBbm9tYWx5VHlwZVN0YXR1cyhyZXEsIHJlcykge1xuICBsZXQgaWQgPSByZXEucXVlcnkuaWQ7XG4gIGxldCBuYW1lID0gcmVxLnF1ZXJ5Lm5hbWU7XG4gIHRyeSB7XG4gICAgbGV0IGFub21hbHk6IEFub21hbHk7XG4gICAgaWYoaWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYW5vbWFseSA9IGxvYWRBbm9tYWx5QnlJZChpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFub21hbHkgPSBsb2FkQW5vbWFseUJ5TmFtZShuYW1lKTtcbiAgICB9XG4gICAgaWYoYW5vbWFseSA9PT0gbnVsbCkge1xuICAgICAgcmVzLnN0YXR1cyg0MDQpLnNlbmQoe1xuICAgICAgICBjb2RlOiA0MDQsXG4gICAgICAgIG1lc3NhZ2U6ICdOb3QgZm91bmQnXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYoYW5vbWFseS5zdGF0dXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBzdGF0dXMgZm9yICcgKyBuYW1lKTtcbiAgICB9XG4gICAgcmVzLnN0YXR1cygyMDApLnNlbmQoeyBzdGF0dXM6IGFub21hbHkuc3RhdHVzLCBlcnJvck1lc3NhZ2U6IGFub21hbHkuZXJyb3IgfSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgLy8gVE9ETzogYmV0dGVyIHNlbmQgNDA0IHdoZW4gd2Uga25vdyB0aGFuIGlzbmB0IGZvdW5kXG4gICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoeyBlcnJvcjogJ0NhbmB0IHJldHVybiBhbnl0aGluZycgfSk7XG4gIH1cblxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRBbm9tYWx5KHJlcSwgcmVzKSB7XG4gIHRyeSB7XG4gICAgbGV0IGlkID0gcmVxLnF1ZXJ5LmlkO1xuICAgIGxldCBuYW1lID0gcmVxLnF1ZXJ5Lm5hbWU7XG5cbiAgICBsZXQgYW5vbWFseTpBbm9tYWx5O1xuICAgIGlmKGlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbm9tYWx5ID0gbG9hZEFub21hbHlCeU5hbWUobmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICB9XG4gICAgaWYoYW5vbWFseSA9PT0gbnVsbCkge1xuICAgICAgcmVzLnN0YXR1cyg0MDQpLnNlbmQoe1xuICAgICAgICBjb2RlOiA0MDQsXG4gICAgICAgIG1lc3NhZ2U6ICdOb3QgZm91bmQnXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcGF5bG9hZCA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIG5hbWU6IGFub21hbHkubmFtZSxcbiAgICAgIG1ldHJpYzogYW5vbWFseS5tZXRyaWMsXG4gICAgICBzdGF0dXM6IGFub21hbHkuc3RhdHVzXG4gICAgfSk7XG4gICAgcmVzLnN0YXR1cygyMDApLnNlbmQocGF5bG9hZClcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAvLyBUT0RPOiBiZXR0ZXIgc2VuZCA0MDQgd2hlbiB3ZSBrbm93IHRoYW4gaXNuYHQgZm91bmRcbiAgICByZXMuc3RhdHVzKDUwMCkuc2VuZCgnQ2FuYHQgZ2V0IGFueXRoaW5nJyk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlQW5vbWFseShyZXEsIHJlcykge1xuICB0cnkge1xuICAgIGNvbnN0IG1ldHJpYzpNZXRyaWMgPSB7XG4gICAgICBkYXRhc291cmNlOiByZXEuYm9keS5tZXRyaWMuZGF0YXNvdXJjZSxcbiAgICAgIHRhcmdldHM6IHNhdmVUYXJnZXRzKHJlcS5ib2R5Lm1ldHJpYy50YXJnZXRzKVxuICAgIH07XG5cbiAgICBjb25zdCBhbm9tYWx5OkFub21hbHkgPSB7XG4gICAgICBuYW1lOiByZXEuYm9keS5uYW1lLFxuICAgICAgcGFuZWxVcmw6IHJlcS5ib2R5LnBhbmVsVXJsLFxuICAgICAgbWV0cmljOiBtZXRyaWMsXG4gICAgICBkYXRhc291cmNlOiByZXEuYm9keS5kYXRhc291cmNlLFxuICAgICAgc3RhdHVzOiAnbGVhcm5pbmcnLFxuICAgICAgbGFzdF9wcmVkaWN0aW9uX3RpbWU6IDAsXG4gICAgICBuZXh0X2lkOiAwXG4gICAgfTtcbiAgICBsZXQgYW5vbWFseUlkID0gaW5zZXJ0QW5vbWFseShhbm9tYWx5KTtcbiAgICBpZihhbm9tYWx5SWQgPT09IG51bGwpIHtcbiAgICAgIHJlcy5zdGF0dXMoNDAzKS5zZW5kKHtcbiAgICAgICAgY29kZTogNDAzLFxuICAgICAgICBtZXNzYWdlOiAnQWxyZWFkeSBleGlzdHMnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBsZXQgcGF5bG9hZCA9IEpTT04uc3RyaW5naWZ5KHsgYW5vbWFseV9pZDogYW5vbWFseUlkIH0pXG4gICAgcmVzLnN0YXR1cygyMDApLnNlbmQocGF5bG9hZCk7XG5cbiAgICBydW5MZWFybmluZyhhbm9tYWx5SWQpO1xuICB9IGNhdGNoKGUpIHtcbiAgICByZXMuc3RhdHVzKDUwMCkuc2VuZCh7XG4gICAgICBjb2RlOiA1MDAsXG4gICAgICBtZXNzYWdlOiAnSW50ZXJuYWwgZXJyb3InXG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVsZXRlQW5vbWFseShyZXEsIHJlcykge1xuICB0cnkge1xuICAgIGxldCBpZCA9IHJlcS5xdWVyeS5pZDtcbiAgICBsZXQgbmFtZSA9IHJlcS5xdWVyeS5uYW1lO1xuXG4gICAgaWYoaWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVtb3ZlQW5vbWFseShpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZUFub21hbHkobmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICB9XG4gICAgXG4gICAgcmVzLnN0YXR1cygyMDApLnNlbmQoe1xuICAgICAgY29kZTogMjAwLFxuICAgICAgbWVzc2FnZTogJ1N1Y2Nlc3MnXG4gICAgfSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKHtcbiAgICAgIGNvZGU6IDUwMCxcbiAgICAgIG1lc3NhZ2U6ICdJbnRlcm5hbCBlcnJvcidcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxucm91dGVyLmdldCgnL3N0YXR1cycsIHNlbmRBbm9tYWx5VHlwZVN0YXR1cyk7XG5yb3V0ZXIuZ2V0KCcvJywgZ2V0QW5vbWFseSk7XG5yb3V0ZXIucG9zdCgnLycsIGNyZWF0ZUFub21hbHkpO1xucm91dGVyLmRlbGV0ZSgnLycsIGRlbGV0ZUFub21hbHkpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcm91dGVzL2Fub21hbGllcy50cyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpXCJcbi8vIG1vZHVsZSBpZCA9IDE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnZXZlbnQtc3RyZWFtJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJyZXF1aXJlKCdldmVudC1zdHJlYW0nKVwiXG4vLyBtb2R1bGUgaWQgPSAxNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgKiBhcyBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHtcbiAgZ2V0TGFiZWxlZFNlZ21lbnRzLFxuICBpbnNlcnRTZWdtZW50cyxcbiAgcmVtb3ZlU2VnbWVudHMsXG59IGZyb20gJy4uL3NlcnZpY2VzL3NlZ21lbnRzJztcbmltcG9ydCB7cnVuTGVhcm5pbmd9IGZyb20gJy4uL3NlcnZpY2VzL2FuYWx5dGljcyc7XG5pbXBvcnQge0Fub21hbHksIEFub21hbHlJZCwgZ2V0QW5vbWFseUlkQnlOYW1lLCBsb2FkQW5vbWFseUJ5SWR9IGZyb20gJy4uL3NlcnZpY2VzL2Fub21hbHlUeXBlJztcblxuXG5hc3luYyBmdW5jdGlvbiBzZW5kU2VnbWVudHMocmVxLCByZXMpIHtcbiAgdHJ5IHtcbiAgICBsZXQgYW5vbWFseUlkOiBBbm9tYWx5SWQgPSByZXEucXVlcnkuYW5vbWFseV9pZDtcbiAgICBsZXQgYW5vbWFseTpBbm9tYWx5ID0gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZCk7XG4gICAgaWYoYW5vbWFseSA9PT0gbnVsbCkge1xuICAgICAgYW5vbWFseUlkID0gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlJZCk7XG4gICAgfVxuXG4gICAgbGV0IGxhc3RTZWdtZW50SWQgPSByZXEucXVlcnkubGFzdF9zZWdtZW50O1xuICAgIGxldCB0aW1lRnJvbSA9IHJlcS5xdWVyeS5mcm9tO1xuICAgIGxldCB0aW1lVG8gPSByZXEucXVlcnkudG87XG5cbiAgICBsZXQgc2VnbWVudHMgPSBnZXRMYWJlbGVkU2VnbWVudHMoYW5vbWFseUlkKTtcblxuICAgIC8vIElkIGZpbHRlcmluZ1xuICAgIGlmKGxhc3RTZWdtZW50SWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc2VnbWVudHMgPSBzZWdtZW50cy5maWx0ZXIoZWwgPT4gZWwuaWQgPiBsYXN0U2VnbWVudElkKTtcbiAgICB9XG5cbiAgICAvLyBUaW1lIGZpbHRlcmluZ1xuICAgIGlmKHRpbWVGcm9tICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHNlZ21lbnRzID0gc2VnbWVudHMuZmlsdGVyKGVsID0+IGVsLmZpbmlzaCA+IHRpbWVGcm9tKTtcbiAgICB9XG5cbiAgICBpZih0aW1lVG8gIT09IHVuZGVmaW5lZCkge1xuICAgICAgc2VnbWVudHMgPSBzZWdtZW50cy5maWx0ZXIoZWwgPT4gZWwuc3RhcnQgPCB0aW1lVG8pO1xuICAgIH1cblxuICAgIGxldCBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgc2VnbWVudHNcbiAgICB9KTtcbiAgICByZXMuc3RhdHVzKDIwMCkuc2VuZChwYXlsb2FkKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoe1xuICAgICAgY29kZTogNTAwLFxuICAgICAgbWVzc2FnZTogJ0ludGVybmFsIGVycm9yJ1xuICAgIH0pO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVNlZ21lbnRzKHJlcSwgcmVzKSB7XG4gIHRyeSB7XG4gICAgbGV0IHNlZ21lbnRzVXBkYXRlID0gcmVxLmJvZHk7XG5cbiAgICBsZXQgYW5vbWFseUlkID0gc2VnbWVudHNVcGRhdGUuYW5vbWFseV9pZDtcbiAgICBsZXQgYW5vbWFseU5hbWUgPSBzZWdtZW50c1VwZGF0ZS5uYW1lO1xuXG4gICAgaWYoYW5vbWFseUlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGFub21hbHlJZCA9IGdldEFub21hbHlJZEJ5TmFtZShhbm9tYWx5TmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICB9XG5cbiAgICBsZXQgYWRkZWRJZHMgPSBpbnNlcnRTZWdtZW50cyhhbm9tYWx5SWQsIHNlZ21lbnRzVXBkYXRlLmFkZGVkX3NlZ21lbnRzLCB0cnVlKTtcbiAgICByZW1vdmVTZWdtZW50cyhhbm9tYWx5SWQsIHNlZ21lbnRzVXBkYXRlLnJlbW92ZWRfc2VnbWVudHMpO1xuXG4gICAgbGV0IHBheWxvYWQgPSBKU09OLnN0cmluZ2lmeSh7IGFkZGVkX2lkczogYWRkZWRJZHMgfSk7XG4gICAgcmVzLnN0YXR1cygyMDApLnNlbmQocGF5bG9hZCk7XG5cbiAgICBydW5MZWFybmluZyhhbm9tYWx5SWQpO1xuICB9IGNhdGNoKGUpIHtcbiAgICByZXMuc3RhdHVzKDUwMCkuc2VuZCh7XG4gICAgICBjb2RlOiA1MDAsXG4gICAgICBtZXNzYWdlOiAnSW50ZXJuYWwgZXJyb3InXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbnJvdXRlci5nZXQoJy8nLCBzZW5kU2VnbWVudHMpO1xucm91dGVyLnBhdGNoKCcvJywgdXBkYXRlU2VnbWVudHMpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcm91dGVzL3NlZ21lbnRzLnRzIiwiaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCB7QW5vbWFseUlkLCBnZXRBbm9tYWx5SWRCeU5hbWUsIGxvYWRBbm9tYWx5QnlJZH0gZnJvbSAnLi4vc2VydmljZXMvYW5vbWFseVR5cGUnO1xuaW1wb3J0IHsgZ2V0QWxlcnRzQW5vbWFsaWVzLCBzYXZlQWxlcnRzQW5vbWFsaWVzIH0gZnJvbSAnLi4vc2VydmljZXMvYWxlcnRzJztcblxuZnVuY3Rpb24gZ2V0QWxlcnQocmVxLCByZXMpIHtcbiAgdHJ5IHtcbiAgICBsZXQgYW5vbWFseUlkOiBBbm9tYWx5SWQgPSByZXEucXVlcnkuYW5vbWFseV9pZDtcbiAgICBsZXQgYW5vbWFseSA9IGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQpXG4gICAgaWYgKGFub21hbHkgPT0gbnVsbCkge1xuICAgICAgYW5vbWFseUlkID0gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlJZC50b0xvd2VyQ2FzZSgpKTtcbiAgICB9XG5cbiAgICBsZXQgYWxlcnRzQW5vbWFsaWVzID0gZ2V0QWxlcnRzQW5vbWFsaWVzKCk7XG4gICAgbGV0IHBvcyA9IGFsZXJ0c0Fub21hbGllcy5pbmRleE9mKGFub21hbHlJZCk7XG5cbiAgICBsZXQgZW5hYmxlOiBib29sZWFuID0gKHBvcyAhPT0gLTEpO1xuICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKHtcbiAgICAgIGVuYWJsZVxuICAgIH0pO1xuICB9IGNhdGNoKGUpIHtcbiAgICByZXMuc3RhdHVzKDUwMCkuc2VuZCh7XG4gICAgICBjb2RlOiA1MDAsXG4gICAgICBtZXNzYWdlOiAnSW50ZXJuYWwgZXJyb3InXG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hhbmdlQWxlcnQocmVxLCByZXMpIHtcbiAgdHJ5IHtcbiAgICBsZXQgYW5vbWFseUlkOiBBbm9tYWx5SWQgPSByZXEuYm9keS5hbm9tYWx5X2lkO1xuICAgIGxldCBlbmFibGU6IGJvb2xlYW4gPSByZXEuYm9keS5lbmFibGU7XG5cbiAgICBsZXQgYW5vbWFseSA9IGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQpXG4gICAgaWYgKGFub21hbHkgPT0gbnVsbCkge1xuICAgICAgYW5vbWFseUlkID0gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlJZC50b0xvd2VyQ2FzZSgpKTtcbiAgICB9XG5cbiAgICBsZXQgYWxlcnRzQW5vbWFsaWVzID0gZ2V0QWxlcnRzQW5vbWFsaWVzKCk7XG4gICAgbGV0IHBvczogbnVtYmVyID0gYWxlcnRzQW5vbWFsaWVzLmluZGV4T2YoYW5vbWFseUlkKTtcbiAgICBpZihlbmFibGUgJiYgcG9zID09IC0xKSB7XG4gICAgICBhbGVydHNBbm9tYWxpZXMucHVzaChhbm9tYWx5SWQpO1xuICAgICAgc2F2ZUFsZXJ0c0Fub21hbGllcyhhbGVydHNBbm9tYWxpZXMpO1xuICAgIH0gZWxzZSBpZighZW5hYmxlICYmIHBvcyA+IC0xKSB7XG4gICAgICBhbGVydHNBbm9tYWxpZXMuc3BsaWNlKHBvcywgMSk7XG4gICAgICBzYXZlQWxlcnRzQW5vbWFsaWVzKGFsZXJ0c0Fub21hbGllcyk7XG4gICAgfVxuICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKHtcbiAgICAgIHN0YXR1czogJ09rJ1xuICAgIH0pO1xuICB9IGNhdGNoKGUpIHtcbiAgICByZXMuc3RhdHVzKDUwMCkuc2VuZCh7XG4gICAgICBjb2RlOiA1MDAsXG4gICAgICBtZXNzYWdlOiAnSW50ZXJuYWwgZXJyb3InXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbnJvdXRlci5nZXQoJy8nLCBnZXRBbGVydCk7XG5yb3V0ZXIucG9zdCgnLycsIGNoYW5nZUFsZXJ0KTtcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcm91dGVzL2FsZXJ0cy50cyIsImltcG9ydCB7IGdldEpzb25EYXRhU3luYywgd3JpdGVKc29uRGF0YVN5bmMgfSBmcm9tICcuL2pzb24nO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IEFub21hbHlJZCB9IGZyb20gJy4vYW5vbWFseVR5cGUnO1xuaW1wb3J0IHsgQU5PTUFMSUVTX1BBVEggfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgcnVuUHJlZGljdCB9IGZyb20gJy4vYW5hbHl0aWNzJztcbmltcG9ydCB7IHNlbmROb3RpZmljYXRpb24gfSBmcm9tICcuL25vdGlmaWNhdGlvbic7XG5pbXBvcnQgeyBnZXRMYWJlbGVkU2VnbWVudHMgfSBmcm9tICcuL3NlZ21lbnRzJztcblxuZnVuY3Rpb24gZ2V0QWxlcnRzQW5vbWFsaWVzKCkgOiBBbm9tYWx5SWRbXSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYGFsZXJ0c19hbm9tYWxpZXMuanNvbmApO1xuICBpZighZnMuZXhpc3RzU3luYyhmaWxlbmFtZSkpIHtcbiAgICBzYXZlQWxlcnRzQW5vbWFsaWVzKFtdKTtcbiAgfVxuICByZXR1cm4gZ2V0SnNvbkRhdGFTeW5jKHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYGFsZXJ0c19hbm9tYWxpZXMuanNvbmApKTtcbn1cblxuZnVuY3Rpb24gc2F2ZUFsZXJ0c0Fub21hbGllcyhhbm9tYWxpZXM6IEFub21hbHlJZFtdKSB7XG4gIHJldHVybiB3cml0ZUpzb25EYXRhU3luYyhwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGBhbGVydHNfYW5vbWFsaWVzLmpzb25gKSwgYW5vbWFsaWVzKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0FsZXJ0cyhhbm9tYWx5SWQpIHtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG5cbiAgY29uc3QgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgY29uc3QgYWN0aXZlQWxlcnQgPSBhY3RpdmVBbGVydHMuaGFzKGFub21hbHlJZCk7XG4gIGxldCBuZXdBY3RpdmVBbGVydCA9IGZhbHNlO1xuXG4gIGlmKHNlZ21lbnRzLmxlbmd0aCA+IDApIHtcbiAgICBsZXQgbGFzdFNlZ21lbnQgPSBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXTtcbiAgICBpZihsYXN0U2VnbWVudC5maW5pc2ggPj0gY3VycmVudFRpbWUgLSBhbGVydFRpbWVvdXQpIHtcbiAgICAgIG5ld0FjdGl2ZUFsZXJ0ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZighYWN0aXZlQWxlcnQgJiYgbmV3QWN0aXZlQWxlcnQpIHtcbiAgICBhY3RpdmVBbGVydHMuYWRkKGFub21hbHlJZCk7XG4gICAgc2VuZE5vdGlmaWNhdGlvbihhbm9tYWx5SWQsIHRydWUpO1xuICB9IGVsc2UgaWYoYWN0aXZlQWxlcnQgJiYgIW5ld0FjdGl2ZUFsZXJ0KSB7XG4gICAgYWN0aXZlQWxlcnRzLmRlbGV0ZShhbm9tYWx5SWQpO1xuICAgIHNlbmROb3RpZmljYXRpb24oYW5vbWFseUlkLCBmYWxzZSk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gYWxlcnRzVGljaygpIHtcbiAgbGV0IGFsZXJ0c0Fub21hbGllcyA9IGdldEFsZXJ0c0Fub21hbGllcygpO1xuICBmb3IgKGxldCBhbm9tYWx5SWQgb2YgYWxlcnRzQW5vbWFsaWVzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJ1blByZWRpY3QoYW5vbWFseUlkKTtcbiAgICAgIHByb2Nlc3NBbGVydHMoYW5vbWFseUlkKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBzZXRUaW1lb3V0KGFsZXJ0c1RpY2ssIDUwMDApO1xufVxuXG5jb25zdCBhbGVydFRpbWVvdXQgPSA2MDAwMDsgLy8gbXNcbmNvbnN0IGFjdGl2ZUFsZXJ0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuc2V0VGltZW91dChhbGVydHNUaWNrLCA1MDAwKTtcblxuXG5leHBvcnQgeyBnZXRBbGVydHNBbm9tYWxpZXMsIHNhdmVBbGVydHNBbm9tYWxpZXMgfVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc2VydmljZXMvYWxlcnRzLnRzIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCd0ZWxlZ3JhZicpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgndGVsZWdyYWYnKVwiXG4vLyBtb2R1bGUgaWQgPSAxOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9