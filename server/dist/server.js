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
/******/ 	var hotCurrentHash = "c9fd12c9ae939f59622b"; // eslint-disable-line no-unused-vars
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
/******/ 	return hotCreateRequire(15)(__webpack_require__.s = 15);
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
var path = __webpack_require__(0);
var DATA_PATH = path.join(__dirname, '../data');
exports.DATA_PATH = DATA_PATH;
var ANALYTICS_PATH = path.join(__dirname, '../../src');
exports.ANALYTICS_PATH = ANALYTICS_PATH;
var ANOMALIES_PATH = path.join(ANALYTICS_PATH, 'anomalies');
exports.ANOMALIES_PATH = ANOMALIES_PATH;
var SEGMENTS_PATH = path.join(ANALYTICS_PATH, 'segments');
exports.SEGMENTS_PATH = SEGMENTS_PATH;
var METRICS_PATH = path.join(ANALYTICS_PATH, 'metrics');
exports.METRICS_PATH = METRICS_PATH;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require('babel-runtime/core-js/json/stringify');

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require('babel-runtime/regenerator');

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require('babel-runtime/core-js/promise');

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var path = __webpack_require__(0);
var json_1 = __webpack_require__(6);
var config_1 = __webpack_require__(1);
var fs = __webpack_require__(9);
var crypto = __webpack_require__(12);
var anomaliesNameToIdMap = {};
function loadAnomaliesMap() {
    var filename = path.join(config_1.ANOMALIES_PATH, "all_anomalies.json");
    anomaliesNameToIdMap = json_1.getJsonDataSync(filename);
}
function saveAnomaliesMap() {
    var filename = path.join(config_1.ANOMALIES_PATH, "all_anomalies.json");
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
    var hashString = anomaly.name + new Date().toString();
    var anomalyId = crypto.createHash('md5').update(hashString).digest('hex');
    anomaliesNameToIdMap[anomaly.name] = anomalyId;
    saveAnomaliesMap();
    // return anomalyId
    // const anomalyId:AnomalyId = anomaly.name;
    var filename = path.join(config_1.ANOMALIES_PATH, anomalyId + ".json");
    if (fs.existsSync(filename)) {
        return null;
    }
    saveAnomaly(anomalyId, anomaly);
    return anomalyId;
}
exports.insertAnomaly = insertAnomaly;
function removeAnomaly(anomalyId) {
    var filename = path.join(config_1.ANOMALIES_PATH, anomalyId + ".json");
    fs.unlinkSync(filename);
}
exports.removeAnomaly = removeAnomaly;
function saveAnomaly(anomalyId, anomaly) {
    var filename = path.join(config_1.ANOMALIES_PATH, anomalyId + ".json");
    return json_1.writeJsonDataSync(filename, anomaly);
}
exports.saveAnomaly = saveAnomaly;
function loadAnomalyById(anomalyId) {
    var filename = path.join(config_1.ANOMALIES_PATH, anomalyId + ".json");
    if (!fs.existsSync(filename)) {
        return null;
    }
    return json_1.getJsonDataSync(filename);
}
exports.loadAnomalyById = loadAnomalyById;
function loadAnomalyByName(anomalyName) {
    var anomalyId = getAnomalyIdByName(anomalyName);
    return loadAnomalyById(anomalyId);
}
exports.loadAnomalyByName = loadAnomalyByName;
function saveAnomalyTypeInfo(info) {
    console.log('Saving');
    var filename = path.join(config_1.ANOMALIES_PATH, info.name + ".json");
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
    return json_1.getJsonDataSync(path.join(config_1.ANOMALIES_PATH, name + ".json"));
}
exports.getAnomalyTypeInfo = getAnomalyTypeInfo;
function setAnomalyStatus(anomalyId, status, error) {
    var info = loadAnomalyById(anomalyId);
    info.status = status;
    if (error !== undefined) {
        info.error = error;
    } else {
        info.error = '';
    }
    saveAnomaly(anomalyId, info);
}
exports.setAnomalyStatus = setAnomalyStatus;
function setAnomalyPredictionTime(anomalyId, lastPredictionTime) {
    var info = loadAnomalyById(anomalyId);
    info.last_prediction_time = lastPredictionTime;
    saveAnomaly(anomalyId, info);
}
exports.setAnomalyPredictionTime = setAnomalyPredictionTime;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _stringify = __webpack_require__(2);

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = __webpack_require__(3);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = __webpack_require__(4);

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __webpack_require__(9);
function getJsonData(filename) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var data;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return new _promise2.default(function (resolve, reject) {
                            fs.readFile(filename, 'utf8', function (err, data) {
                                if (err) {
                                    console.error(err);
                                    reject('Can`t read file');
                                } else {
                                    resolve(data);
                                }
                            });
                        });

                    case 2:
                        data = _context.sent;
                        _context.prev = 3;
                        return _context.abrupt("return", JSON.parse(data));

                    case 7:
                        _context.prev = 7;
                        _context.t0 = _context["catch"](3);

                        console.error(_context.t0);
                        throw new Error('Wrong file format');

                    case 11:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[3, 7]]);
    }));
}
exports.getJsonData = getJsonData;
function writeJsonData(filename, data) {
    return new _promise2.default(function (resolve, reject) {
        fs.writeFile(filename, (0, _stringify2.default)(data), 'utf8', function (err) {
            if (err) {
                console.error(err);
                reject('Cat`t write file');
            } else {
                resolve();
            }
        });
    });
}
exports.writeJsonData = writeJsonData;
function getJsonDataSync(filename) {
    var data = fs.readFileSync(filename, 'utf8');
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error(e);
        throw new Error('Wrong file format');
    }
}
exports.getJsonDataSync = getJsonDataSync;
function writeJsonDataSync(filename, data) {
    fs.writeFileSync(filename, (0, _stringify2.default)(data));
}
exports.writeJsonDataSync = writeJsonDataSync;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require('express');

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require('babel-runtime/core-js/get-iterator');

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require('fs');

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(3);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = __webpack_require__(2);

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = __webpack_require__(4);

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = __webpack_require__(18);
var config_1 = __webpack_require__(1);
var anomalyType_1 = __webpack_require__(5);
var metrics_1 = __webpack_require__(13);
var segments_1 = __webpack_require__(11);
var event_stream_1 = __webpack_require__(19);
var learnWorker = child_process_1.spawn('python3', ['worker.py'], { cwd: config_1.ANALYTICS_PATH });
learnWorker.stdout.pipe(event_stream_1.split()).pipe(event_stream_1.mapSync(function (line) {
    onMessage(line);
}));
learnWorker.stderr.on('data', function (data) {
    return console.error("worker stderr: " + data);
});
var taskMap = {};
var nextTaskId = 0;
function onMessage(data) {
    console.log("worker stdout: " + data);
    var response = JSON.parse(data);
    var taskId = response.__task_id;
    // let anomalyName = response.anomaly_name;
    // let task = response.task;
    var status = response.status;
    if (status === 'success' || status === 'failed') {
        if (taskId in taskMap) {
            var resolver = taskMap[taskId];
            resolver(response);
            delete taskMap[taskId];
        }
    }
}
function runTask(task) {
    var anomaly = anomalyType_1.loadAnomalyById(task.anomaly_id);
    task.metric = {
        datasource: anomaly.metric.datasource,
        targets: anomaly.metric.targets.map(function (t) {
            return metrics_1.getTarget(t);
        })
    };
    task.__task_id = nextTaskId++;
    var command = (0, _stringify2.default)(task);
    learnWorker.stdin.write(command + "\n");
    return new _promise2.default(function (resolve, reject) {
        taskMap[task.__task_id] = resolve;
    });
}
function runLearning(anomalyId) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var segments, anomaly, analyticsType, preset, task, result;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        segments = segments_1.getLabeledSegments(anomalyId);

                        anomalyType_1.setAnomalyStatus(anomalyId, 'learning');
                        anomaly = anomalyType_1.loadAnomalyById(anomalyId);
                        analyticsType = "anomalies";
                        preset = undefined;

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
                        task = {
                            type: 'learn',
                            anomaly_id: anomalyId,
                            analytics_type: analyticsType,
                            preset: preset,
                            segments: segments
                        };
                        _context.next = 11;
                        return runTask(task);

                    case 11:
                        result = _context.sent;

                        if (result.status === 'success') {
                            anomalyType_1.setAnomalyStatus(anomalyId, 'ready');
                            segments_1.insertSegments(anomalyId, result.segments, false);
                            anomalyType_1.setAnomalyPredictionTime(anomalyId, result.last_prediction_time);
                        } else {
                            anomalyType_1.setAnomalyStatus(anomalyId, 'failed', result.error);
                        }

                    case 13:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
exports.runLearning = runLearning;
function runPredict(anomalyId) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var anomaly, analyticsType, preset, task, result, segments, lastOldSegment, firstNewSegment;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        anomaly = anomalyType_1.loadAnomalyById(anomalyId);
                        analyticsType = "anomalies";
                        preset = undefined;

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
                        task = {
                            type: 'predict',
                            anomaly_id: anomalyId,
                            analytics_type: analyticsType,
                            preset: preset,
                            last_prediction_time: anomaly.last_prediction_time
                        };
                        _context2.next = 9;
                        return runTask(task);

                    case 9:
                        result = _context2.sent;

                        if (!(result.status === 'failed')) {
                            _context2.next = 12;
                            break;
                        }

                        return _context2.abrupt("return", []);

                    case 12:
                        // Merging segments
                        segments = segments_1.getLabeledSegments(anomalyId);

                        if (segments.length > 0 && result.segments.length > 0) {
                            lastOldSegment = segments[segments.length - 1];
                            firstNewSegment = result.segments[0];

                            if (firstNewSegment.start <= lastOldSegment.finish) {
                                result.segments[0].start = lastOldSegment.start;
                                segments_1.removeSegments(anomalyId, [lastOldSegment.id]);
                            }
                        }
                        segments_1.insertSegments(anomalyId, result.segments, false);
                        anomalyType_1.setAnomalyPredictionTime(anomalyId, result.last_prediction_time);
                        return _context2.abrupt("return", result.segments);

                    case 17:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
}
exports.runPredict = runPredict;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _getIterator2 = __webpack_require__(8);

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var path = __webpack_require__(0);
var json_1 = __webpack_require__(6);
var config_1 = __webpack_require__(1);
var anomalyType_1 = __webpack_require__(5);
function getLabeledSegments(anomalyId) {
    var filename = path.join(config_1.SEGMENTS_PATH, anomalyId + "_labeled.json");
    var segments = [];
    try {
        segments = json_1.getJsonDataSync(filename);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = (0, _getIterator3.default)(segments), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var segment = _step.value;

                if (segment.labeled === undefined) {
                    segment.labeled = false;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    } catch (e) {
        console.error(e.message);
    }
    return segments;
}
exports.getLabeledSegments = getLabeledSegments;
function getPredictedSegments(anomalyId) {
    var filename = path.join(config_1.SEGMENTS_PATH, anomalyId + "_segments.json");
    var jsonData = void 0;
    try {
        jsonData = json_1.getJsonDataSync(filename);
    } catch (e) {
        console.error(e.message);
        jsonData = [];
    }
    return jsonData;
}
exports.getPredictedSegments = getPredictedSegments;
function saveSegments(anomalyId, segments) {
    var filename = path.join(config_1.SEGMENTS_PATH, anomalyId + "_labeled.json");
    try {
        return json_1.writeJsonDataSync(filename, segments);
    } catch (e) {
        console.error(e.message);
        throw new Error('Can`t write to db');
    }
}
exports.saveSegments = saveSegments;
function insertSegments(anomalyId, addedSegments, labeled) {
    // Set status
    var info = anomalyType_1.loadAnomalyById(anomalyId);
    var segments = getLabeledSegments(anomalyId);
    var nextId = info.next_id;
    var addedIds = [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = (0, _getIterator3.default)(addedSegments), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var segment = _step2.value;

            segment.id = nextId;
            segment.labeled = labeled;
            addedIds.push(nextId);
            nextId++;
            segments.push(segment);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    info.next_id = nextId;
    saveSegments(anomalyId, segments);
    anomalyType_1.saveAnomaly(anomalyId, info);
    return addedIds;
}
exports.insertSegments = insertSegments;
function removeSegments(anomalyId, removedSegments) {
    var segments = getLabeledSegments(anomalyId);
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        var _loop = function _loop() {
            var segmentId = _step3.value;

            segments = segments.filter(function (el) {
                return el.id !== segmentId;
            });
        };

        for (var _iterator3 = (0, _getIterator3.default)(removedSegments), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            _loop();
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    saveSegments(anomalyId, segments);
}
exports.removeSegments = removeSegments;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require('crypto');

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _stringify = __webpack_require__(2);

var _stringify2 = _interopRequireDefault(_stringify);

var _getIterator2 = __webpack_require__(8);

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var path = __webpack_require__(0);
var json_1 = __webpack_require__(6);
var config_1 = __webpack_require__(1);
var crypto = __webpack_require__(12);
function saveTargets(targets) {
    var metrics = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(targets), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var target = _step.value;

            metrics.push(saveTarget(target));
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return metrics;
}
exports.saveTargets = saveTargets;
function saveTarget(target) {
    //const md5 = crypto.createHash('md5')
    var targetId = crypto.createHash('md5').update((0, _stringify2.default)(target)).digest('hex');
    var filename = path.join(config_1.METRICS_PATH, targetId + ".json");
    json_1.writeJsonDataSync(filename, target);
    return targetId;
}
function getTarget(targetId) {
    var filename = path.join(config_1.METRICS_PATH, targetId + ".json");
    return json_1.getJsonDataSync(filename);
}
exports.getTarget = getTarget;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _getIterator2 = __webpack_require__(8);

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
//import * as Telegraf from 'telegraf'
var path = __webpack_require__(0);
var config_1 = __webpack_require__(1);
var json_1 = __webpack_require__(6);
function sendNotification(anomalyName, active) {
    console.log('Notification ' + anomalyName);
    if (anomalyName in botConfig.subscriptions) {
        var notificationMessage = void 0;
        if (active) {
            notificationMessage = 'Alert! Anomaly type ' + anomalyName;
        } else {
            notificationMessage = 'Ok! Anomaly type ' + anomalyName;
        }
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = (0, _getIterator3.default)(botConfig.subscriptions[anomalyName]), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var SubscriberId = _step.value;

                bot.telegram.sendMessage(SubscriberId, notificationMessage);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
}
exports.sendNotification = sendNotification;
function loadBotConfig() {
    var filename = path.join(config_1.DATA_PATH, "bot_config.json");
    var jsonData = void 0;
    try {
        jsonData = json_1.getJsonDataSync(filename);
    } catch (e) {
        console.error(e.message);
        jsonData = [];
    }
    return jsonData;
}
function saveBotConfig(botConfig) {
    var filename = path.join(config_1.DATA_PATH, "bot_config.json");
    try {
        json_1.writeJsonDataSync(filename, botConfig);
    } catch (e) {
        console.error(e.message);
    }
}
var commandArgs = function commandArgs(ctx, next) {
    try {
        if (ctx.updateType === 'message') {
            var text = ctx.update.message.text;
            if (text !== undefined && text.startsWith('/')) {
                var match = text.match(/^\/([^\s]+)\s?(.+)?/);
                var args = [];
                var command = void 0;
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
                    command: command,
                    args: args
                };
            }
        }
        return next(ctx);
    } catch (e) {}
};
function addNotification(ctx) {
    console.log('addNotification');
    var command = ctx.state.command;
    var chatId = ctx.chat.id;
    if (command.args.length > 0) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = (0, _getIterator3.default)(command.args), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var anomalyName = _step2.value;

                if (!(anomalyName in botConfig.subscriptions)) {
                    botConfig.subscriptions[anomalyName] = [];
                }
                if (botConfig.subscriptions[anomalyName].includes(chatId)) {
                    return ctx.reply('You are already subscribed on alerts from anomaly ' + command.args);
                } else {
                    botConfig.subscriptions[anomalyName].push(chatId);
                    saveBotConfig(botConfig);
                }
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        return ctx.reply('You have been successfully subscribed on alerts from anomaly ' + command.args);
    } else {
        return ctx.reply('You should use syntax: \/addNotification <anomaly_name>');
    }
}
function removeNotification(ctx) {
    var command = ctx.state.command;
    var chatId = ctx.chat.id;
    if (command.args.length > 0) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = (0, _getIterator3.default)(command.args), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var anomalyName = _step3.value;

                if (anomalyName in botConfig.subscriptions) {
                    botConfig.subscriptions[anomalyName] = botConfig.subscriptions[anomalyName].filter(function (el) {
                        return el !== chatId;
                    });
                    saveBotConfig(botConfig);
                }
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        return ctx.reply('You have been successfully unsubscribed from alerts from ' + command.args);
    } else {
        return ctx.reply('You should use syntax: \/removeNotification <anomaly_name>');
    }
}
// const Telegraf = require('telegraf');
var botConfig = void 0;
var bot = void 0;
function tgBotInit() {
    try {
        // botConfig = loadBotConfig();
        // bot = new Telegraf(botConfig.token);
        // bot.use(commandArgs);
        // bot.command('addNotification', addNotification);
        // bot.command('removeNotification', removeNotification);
        // bot.startPolling();
    } catch (e) {
        // TODO: handle exception
    }
}
exports.tgBotInit = tgBotInit;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var express = __webpack_require__(7);
var bodyParser = __webpack_require__(16);
var anomalies_1 = __webpack_require__(17);
var segments_1 = __webpack_require__(20);
var alerts_1 = __webpack_require__(21);
var notification_1 = __webpack_require__(14);
var app = express();
var PORT = process.env.HASTIC_PORT || 8000;
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
app.use('/', function (req, res) {
    return res.send({ status: 'OK' });
});
app.listen(PORT, function () {
    console.log("Server is running on :" + PORT);
});
notification_1.tgBotInit();

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require('body-parser');

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _stringify = __webpack_require__(2);

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = __webpack_require__(3);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = __webpack_require__(4);

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = __webpack_require__(7);
var anomalyType_1 = __webpack_require__(5);
var analytics_1 = __webpack_require__(10);
var metrics_1 = __webpack_require__(13);
function sendAnomalyTypeStatus(req, res) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var id, name, anomaly;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        id = req.query.id;
                        name = req.query.name;
                        _context.prev = 2;
                        anomaly = void 0;

                        if (id !== undefined) {
                            anomaly = anomalyType_1.loadAnomalyById(id);
                        } else {
                            anomaly = anomalyType_1.loadAnomalyByName(name);
                        }

                        if (!(anomaly === null)) {
                            _context.next = 8;
                            break;
                        }

                        res.status(404).send({
                            code: 404,
                            message: 'Not found'
                        });
                        return _context.abrupt("return");

                    case 8:
                        if (!(anomaly.status === undefined)) {
                            _context.next = 10;
                            break;
                        }

                        throw new Error('No status for ' + name);

                    case 10:
                        res.status(200).send({ status: anomaly.status, errorMessage: anomaly.error });
                        _context.next = 17;
                        break;

                    case 13:
                        _context.prev = 13;
                        _context.t0 = _context["catch"](2);

                        console.error(_context.t0);
                        // TODO: better send 404 when we know than isn`t found
                        res.status(500).send({ error: 'Can`t return anything' });

                    case 17:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[2, 13]]);
    }));
}
function getAnomaly(req, res) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var id, name, anomaly, payload;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        id = req.query.id;
                        name = req.query.name;
                        anomaly = void 0;

                        if (id !== undefined) {
                            anomaly = anomalyType_1.loadAnomalyById(id);
                        } else {
                            anomaly = anomalyType_1.loadAnomalyByName(name.toLowerCase());
                        }

                        if (!(anomaly === null)) {
                            _context2.next = 8;
                            break;
                        }

                        res.status(404).send({
                            code: 404,
                            message: 'Not found'
                        });
                        return _context2.abrupt("return");

                    case 8:
                        payload = (0, _stringify2.default)({
                            name: anomaly.name,
                            metric: anomaly.metric,
                            status: anomaly.status
                        });

                        res.status(200).send(payload);
                        _context2.next = 16;
                        break;

                    case 12:
                        _context2.prev = 12;
                        _context2.t0 = _context2["catch"](0);

                        console.error(_context2.t0);
                        // TODO: better send 404 when we know than isn`t found
                        res.status(500).send('Can`t get anything');

                    case 16:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 12]]);
    }));
}
function createAnomaly(req, res) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var metric, anomaly, anomalyId, payload;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        try {
                            metric = {
                                datasource: req.body.metric.datasource,
                                targets: metrics_1.saveTargets(req.body.metric.targets)
                            };
                            anomaly = {
                                name: req.body.name,
                                panelUrl: req.body.panelUrl,
                                metric: metric,
                                datasource: req.body.datasource,
                                status: 'learning',
                                last_prediction_time: 0,
                                next_id: 0
                            };
                            anomalyId = anomalyType_1.insertAnomaly(anomaly);

                            if (anomalyId === null) {
                                res.status(403).send({
                                    code: 403,
                                    message: 'Already exists'
                                });
                            }
                            payload = (0, _stringify2.default)({ anomaly_id: anomalyId });

                            res.status(200).send(payload);
                            analytics_1.runLearning(anomalyId);
                        } catch (e) {
                            res.status(500).send({
                                code: 500,
                                message: 'Internal error'
                            });
                        }

                    case 1:
                    case "end":
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));
}
function deleteAnomaly(req, res) {
    try {
        var id = req.query.id;
        var name = req.query.name;
        if (id !== undefined) {
            anomalyType_1.removeAnomaly(id);
        } else {
            anomalyType_1.removeAnomaly(name.toLowerCase());
        }
        res.status(200).send({
            code: 200,
            message: 'Success'
        });
    } catch (e) {
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
/* 18 */
/***/ (function(module, exports) {

module.exports = require('child_process');

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require('event-stream');

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(3);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = __webpack_require__(2);

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = __webpack_require__(4);

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = __webpack_require__(7);
var segments_1 = __webpack_require__(11);
var analytics_1 = __webpack_require__(10);
var anomalyType_1 = __webpack_require__(5);
function sendSegments(req, res) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var anomalyId, anomaly, lastSegmentId, timeFrom, timeTo, segments, payload;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        try {
                            anomalyId = req.query.anomaly_id;
                            anomaly = anomalyType_1.loadAnomalyById(anomalyId);

                            if (anomaly === null) {
                                anomalyId = anomalyType_1.getAnomalyIdByName(anomalyId);
                            }
                            lastSegmentId = req.query.last_segment;
                            timeFrom = req.query.from;
                            timeTo = req.query.to;
                            segments = segments_1.getLabeledSegments(anomalyId);
                            // Id filtering

                            if (lastSegmentId !== undefined) {
                                segments = segments.filter(function (el) {
                                    return el.id > lastSegmentId;
                                });
                            }
                            // Time filtering
                            if (timeFrom !== undefined) {
                                segments = segments.filter(function (el) {
                                    return el.finish > timeFrom;
                                });
                            }
                            if (timeTo !== undefined) {
                                segments = segments.filter(function (el) {
                                    return el.start < timeTo;
                                });
                            }
                            payload = (0, _stringify2.default)({
                                segments: segments
                            });

                            res.status(200).send(payload);
                        } catch (e) {
                            res.status(500).send({
                                code: 500,
                                message: 'Internal error'
                            });
                        }

                    case 1:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
function updateSegments(req, res) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var segmentsUpdate, anomalyId, anomalyName, addedIds, payload;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        try {
                            segmentsUpdate = req.body;
                            anomalyId = segmentsUpdate.anomaly_id;
                            anomalyName = segmentsUpdate.name;

                            if (anomalyId === undefined) {
                                anomalyId = anomalyType_1.getAnomalyIdByName(anomalyName.toLowerCase());
                            }
                            addedIds = segments_1.insertSegments(anomalyId, segmentsUpdate.added_segments, true);

                            segments_1.removeSegments(anomalyId, segmentsUpdate.removed_segments);
                            payload = (0, _stringify2.default)({ added_ids: addedIds });

                            res.status(200).send(payload);
                            analytics_1.runLearning(anomalyId);
                        } catch (e) {
                            res.status(500).send({
                                code: 500,
                                message: 'Internal error'
                            });
                        }

                    case 1:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
}
exports.router = express.Router();
exports.router.get('/', sendSegments);
exports.router.patch('/', updateSegments);

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var express = __webpack_require__(7);
var anomalyType_1 = __webpack_require__(5);
var alerts_1 = __webpack_require__(22);
function getAlert(req, res) {
    try {
        var anomalyId = req.query.anomaly_id;
        var anomaly = anomalyType_1.loadAnomalyById(anomalyId);
        if (anomaly == null) {
            anomalyId = anomalyType_1.getAnomalyIdByName(anomalyId.toLowerCase());
        }
        var alertsAnomalies = alerts_1.getAlertsAnomalies();
        var pos = alertsAnomalies.indexOf(anomalyId);
        var enable = pos !== -1;
        res.status(200).send({
            enable: enable
        });
    } catch (e) {
        res.status(500).send({
            code: 500,
            message: 'Internal error'
        });
    }
}
function changeAlert(req, res) {
    try {
        var anomalyId = req.body.anomaly_id;
        var enable = req.body.enable;
        var anomaly = anomalyType_1.loadAnomalyById(anomalyId);
        if (anomaly == null) {
            anomalyId = anomalyType_1.getAnomalyIdByName(anomalyId.toLowerCase());
        }
        var alertsAnomalies = alerts_1.getAlertsAnomalies();
        var pos = alertsAnomalies.indexOf(anomalyId);
        if (enable && pos == -1) {
            alertsAnomalies.push(anomalyId);
            alerts_1.saveAlertsAnomalies(alertsAnomalies);
        } else if (!enable && pos > -1) {
            alertsAnomalies.splice(pos, 1);
            alerts_1.saveAlertsAnomalies(alertsAnomalies);
        }
        res.status(200).send({
            status: 'Ok'
        });
    } catch (e) {
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
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _set = __webpack_require__(23);

var _set2 = _interopRequireDefault(_set);

var _regenerator = __webpack_require__(3);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = __webpack_require__(8);

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = __webpack_require__(4);

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var json_1 = __webpack_require__(6);
var path = __webpack_require__(0);
var fs = __webpack_require__(9);
var config_1 = __webpack_require__(1);
var analytics_1 = __webpack_require__(10);
var notification_1 = __webpack_require__(14);
var segments_1 = __webpack_require__(11);
function getAlertsAnomalies() {
    var filename = path.join(config_1.ANOMALIES_PATH, "alerts_anomalies.json");
    if (!fs.existsSync(filename)) {
        saveAlertsAnomalies([]);
    }
    return json_1.getJsonDataSync(path.join(config_1.ANOMALIES_PATH, "alerts_anomalies.json"));
}
exports.getAlertsAnomalies = getAlertsAnomalies;
function saveAlertsAnomalies(anomalies) {
    return json_1.writeJsonDataSync(path.join(config_1.ANOMALIES_PATH, "alerts_anomalies.json"), anomalies);
}
exports.saveAlertsAnomalies = saveAlertsAnomalies;
function processAlerts(anomalyId) {
    var segments = segments_1.getLabeledSegments(anomalyId);
    var currentTime = new Date().getTime();
    var activeAlert = activeAlerts.has(anomalyId);
    var newActiveAlert = false;
    if (segments.length > 0) {
        var lastSegment = segments[segments.length - 1];
        if (lastSegment.finish >= currentTime - alertTimeout) {
            newActiveAlert = true;
        }
    }
    if (!activeAlert && newActiveAlert) {
        activeAlerts.add(anomalyId);
        notification_1.sendNotification(anomalyId, true);
    } else if (activeAlert && !newActiveAlert) {
        activeAlerts.delete(anomalyId);
        notification_1.sendNotification(anomalyId, false);
    }
}
function alertsTick() {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var alertsAnomalies, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, anomalyId;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        alertsAnomalies = getAlertsAnomalies();
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context.prev = 4;
                        _iterator = (0, _getIterator3.default)(alertsAnomalies);

                    case 6:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context.next = 20;
                            break;
                        }

                        anomalyId = _step.value;
                        _context.prev = 8;
                        _context.next = 11;
                        return analytics_1.runPredict(anomalyId);

                    case 11:
                        processAlerts(anomalyId);
                        _context.next = 17;
                        break;

                    case 14:
                        _context.prev = 14;
                        _context.t0 = _context["catch"](8);

                        console.error(_context.t0);

                    case 17:
                        _iteratorNormalCompletion = true;
                        _context.next = 6;
                        break;

                    case 20:
                        _context.next = 26;
                        break;

                    case 22:
                        _context.prev = 22;
                        _context.t1 = _context["catch"](4);
                        _didIteratorError = true;
                        _iteratorError = _context.t1;

                    case 26:
                        _context.prev = 26;
                        _context.prev = 27;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 29:
                        _context.prev = 29;

                        if (!_didIteratorError) {
                            _context.next = 32;
                            break;
                        }

                        throw _iteratorError;

                    case 32:
                        return _context.finish(29);

                    case 33:
                        return _context.finish(26);

                    case 34:
                        setTimeout(alertsTick, 5000);

                    case 35:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[4, 22, 26, 34], [8, 14], [27,, 29, 33]]);
    }));
}
var alertTimeout = 60000; // ms
var activeAlerts = new _set2.default();
setTimeout(alertsTick, 5000);

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require('babel-runtime/core-js/set');

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYzlmZDEyYzlhZTkzOWY1OTYyMmIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgncGF0aCcpXCIiLCJ3ZWJwYWNrOi8vLy4vY29uZmlnLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9qc29uL3N0cmluZ2lmeScpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgnYmFiZWwtcnVudGltZS9yZWdlbmVyYXRvcicpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgnYmFiZWwtcnVudGltZS9jb3JlLWpzL3Byb21pc2UnKVwiIiwid2VicGFjazovLy8uL3NlcnZpY2VzL2Fub21hbHlUeXBlLnRzIiwid2VicGFjazovLy8uL3NlcnZpY2VzL2pzb24udHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgnZXhwcmVzcycpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgnYmFiZWwtcnVudGltZS9jb3JlLWpzL2dldC1pdGVyYXRvcicpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgnZnMnKVwiIiwid2VicGFjazovLy8uL3NlcnZpY2VzL2FuYWx5dGljcy50cyIsIndlYnBhY2s6Ly8vLi9zZXJ2aWNlcy9zZWdtZW50cy50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdjcnlwdG8nKVwiIiwid2VicGFjazovLy8uL3NlcnZpY2VzL21ldHJpY3MudHMiLCJ3ZWJwYWNrOi8vLy4vc2VydmljZXMvbm90aWZpY2F0aW9uLnRzIiwid2VicGFjazovLy8uL2luZGV4LnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2JvZHktcGFyc2VyJylcIiIsIndlYnBhY2s6Ly8vLi9yb3V0ZXMvYW5vbWFsaWVzLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2V2ZW50LXN0cmVhbScpXCIiLCJ3ZWJwYWNrOi8vLy4vcm91dGVzL3NlZ21lbnRzLnRzIiwid2VicGFjazovLy8uL3JvdXRlcy9hbGVydHMudHMiLCJ3ZWJwYWNrOi8vLy4vc2VydmljZXMvYWxlcnRzLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9zZXQnKVwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxvREFBNEM7QUFDNUM7QUFDQTtBQUNBOztBQUVBLDBDQUFrQztBQUNsQztBQUNBO0FBQ0EsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZDQUFxQztBQUNyQztBQUNBOzs7O0FBSUE7QUFDQSxzREFBOEM7QUFDOUM7QUFDQTtBQUNBLG9DQUE0QjtBQUM1QixxQ0FBNkI7QUFDN0IseUNBQWlDOztBQUVqQywrQ0FBdUM7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsOENBQXNDO0FBQ3RDO0FBQ0E7QUFDQSxxQ0FBNkI7QUFDN0IscUNBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBb0IsZ0JBQWdCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUFvQixnQkFBZ0I7QUFDcEM7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxhQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLGFBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlCQUFpQiw4QkFBOEI7QUFDL0M7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKOztBQUVBLDREQUFvRDtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBO0FBQ0EsY0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtB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QUE0QjtBQUM1QixJQUFNLGVBQWUsbUJBQXJCO0FBQ0EsV0FBVyxVQUFYLEVBQXVCLElBQXZCLEU7Ozs7OztBQzNEQSxzRCIsImZpbGUiOiJzZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHRmdW5jdGlvbiBob3REb3dubG9hZFVwZGF0ZUNodW5rKGNodW5rSWQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdHZhciBjaHVuayA9IHJlcXVpcmUoXCIuL1wiICsgXCJcIiArIGNodW5rSWQgKyBcIi5cIiArIGhvdEN1cnJlbnRIYXNoICsgXCIuaG90LXVwZGF0ZS5qc1wiKTtcclxuIFx0XHRob3RBZGRVcGRhdGVDaHVuayhjaHVuay5pZCwgY2h1bmsubW9kdWxlcyk7XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdERvd25sb2FkTWFuaWZlc3QoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHR0cnkge1xyXG4gXHRcdFx0dmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIuL1wiICsgXCJcIiArIGhvdEN1cnJlbnRIYXNoICsgXCIuaG90LXVwZGF0ZS5qc29uXCIpO1xyXG4gXHRcdH0gY2F0Y2goZSkge1xyXG4gXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gXHRcdH1cclxuIFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHVwZGF0ZSk7XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdERpc3Bvc2VDaHVuayhjaHVua0lkKSB7IC8vZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdGRlbGV0ZSBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF07XHJcbiBcdH1cclxuXG4gXHRcclxuIFx0XHJcbiBcdHZhciBob3RBcHBseU9uVXBkYXRlID0gdHJ1ZTtcclxuIFx0dmFyIGhvdEN1cnJlbnRIYXNoID0gXCJjOWZkMTJjOWFlOTM5ZjU5NjIyYlwiOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdHZhciBob3RSZXF1ZXN0VGltZW91dCA9IDEwMDAwO1xyXG4gXHR2YXIgaG90Q3VycmVudE1vZHVsZURhdGEgPSB7fTtcclxuIFx0dmFyIGhvdEN1cnJlbnRDaGlsZE1vZHVsZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHR2YXIgaG90Q3VycmVudFBhcmVudHMgPSBbXTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHR2YXIgaG90Q3VycmVudFBhcmVudHNUZW1wID0gW107IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdENyZWF0ZVJlcXVpcmUobW9kdWxlSWQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdHZhciBtZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdGlmKCFtZSkgcmV0dXJuIF9fd2VicGFja19yZXF1aXJlX187XHJcbiBcdFx0dmFyIGZuID0gZnVuY3Rpb24ocmVxdWVzdCkge1xyXG4gXHRcdFx0aWYobWUuaG90LmFjdGl2ZSkge1xyXG4gXHRcdFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW3JlcXVlc3RdKSB7XHJcbiBcdFx0XHRcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1tyZXF1ZXN0XS5wYXJlbnRzLmluZGV4T2YobW9kdWxlSWQpIDwgMClcclxuIFx0XHRcdFx0XHRcdGluc3RhbGxlZE1vZHVsZXNbcmVxdWVzdF0ucGFyZW50cy5wdXNoKG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0XHRob3RDdXJyZW50UGFyZW50cyA9IFttb2R1bGVJZF07XHJcbiBcdFx0XHRcdFx0aG90Q3VycmVudENoaWxkTW9kdWxlID0gcmVxdWVzdDtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRpZihtZS5jaGlsZHJlbi5pbmRleE9mKHJlcXVlc3QpIDwgMClcclxuIFx0XHRcdFx0XHRtZS5jaGlsZHJlbi5wdXNoKHJlcXVlc3QpO1xyXG4gXHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0Y29uc29sZS53YXJuKFwiW0hNUl0gdW5leHBlY3RlZCByZXF1aXJlKFwiICsgcmVxdWVzdCArIFwiKSBmcm9tIGRpc3Bvc2VkIG1vZHVsZSBcIiArIG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0aG90Q3VycmVudFBhcmVudHMgPSBbXTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKHJlcXVlc3QpO1xyXG4gXHRcdH07XHJcbiBcdFx0dmFyIE9iamVjdEZhY3RvcnkgPSBmdW5jdGlvbiBPYmplY3RGYWN0b3J5KG5hbWUpIHtcclxuIFx0XHRcdHJldHVybiB7XHJcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcclxuIFx0XHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcclxuIFx0XHRcdFx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfX1tuYW1lXTtcclxuIFx0XHRcdFx0fSxcclxuIFx0XHRcdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gXHRcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX19bbmFtZV0gPSB2YWx1ZTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fTtcclxuIFx0XHR9O1xyXG4gXHRcdGZvcih2YXIgbmFtZSBpbiBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoX193ZWJwYWNrX3JlcXVpcmVfXywgbmFtZSkgJiYgbmFtZSAhPT0gXCJlXCIpIHtcclxuIFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGZuLCBuYW1lLCBPYmplY3RGYWN0b3J5KG5hbWUpKTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFx0Zm4uZSA9IGZ1bmN0aW9uKGNodW5rSWQpIHtcclxuIFx0XHRcdGlmKGhvdFN0YXR1cyA9PT0gXCJyZWFkeVwiKVxyXG4gXHRcdFx0XHRob3RTZXRTdGF0dXMoXCJwcmVwYXJlXCIpO1xyXG4gXHRcdFx0aG90Q2h1bmtzTG9hZGluZysrO1xyXG4gXHRcdFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uZShjaHVua0lkKS50aGVuKGZpbmlzaENodW5rTG9hZGluZywgZnVuY3Rpb24oZXJyKSB7XHJcbiBcdFx0XHRcdGZpbmlzaENodW5rTG9hZGluZygpO1xyXG4gXHRcdFx0XHR0aHJvdyBlcnI7XHJcbiBcdFx0XHR9KTtcclxuIFx0XHJcbiBcdFx0XHRmdW5jdGlvbiBmaW5pc2hDaHVua0xvYWRpbmcoKSB7XHJcbiBcdFx0XHRcdGhvdENodW5rc0xvYWRpbmctLTtcclxuIFx0XHRcdFx0aWYoaG90U3RhdHVzID09PSBcInByZXBhcmVcIikge1xyXG4gXHRcdFx0XHRcdGlmKCFob3RXYWl0aW5nRmlsZXNNYXBbY2h1bmtJZF0pIHtcclxuIFx0XHRcdFx0XHRcdGhvdEVuc3VyZVVwZGF0ZUNodW5rKGNodW5rSWQpO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRpZihob3RDaHVua3NMb2FkaW5nID09PSAwICYmIGhvdFdhaXRpbmdGaWxlcyA9PT0gMCkge1xyXG4gXHRcdFx0XHRcdFx0aG90VXBkYXRlRG93bmxvYWRlZCgpO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH07XHJcbiBcdFx0cmV0dXJuIGZuO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RDcmVhdGVNb2R1bGUobW9kdWxlSWQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdHZhciBob3QgPSB7XHJcbiBcdFx0XHQvLyBwcml2YXRlIHN0dWZmXHJcbiBcdFx0XHRfYWNjZXB0ZWREZXBlbmRlbmNpZXM6IHt9LFxyXG4gXHRcdFx0X2RlY2xpbmVkRGVwZW5kZW5jaWVzOiB7fSxcclxuIFx0XHRcdF9zZWxmQWNjZXB0ZWQ6IGZhbHNlLFxyXG4gXHRcdFx0X3NlbGZEZWNsaW5lZDogZmFsc2UsXHJcbiBcdFx0XHRfZGlzcG9zZUhhbmRsZXJzOiBbXSxcclxuIFx0XHRcdF9tYWluOiBob3RDdXJyZW50Q2hpbGRNb2R1bGUgIT09IG1vZHVsZUlkLFxyXG4gXHRcclxuIFx0XHRcdC8vIE1vZHVsZSBBUElcclxuIFx0XHRcdGFjdGl2ZTogdHJ1ZSxcclxuIFx0XHRcdGFjY2VwdDogZnVuY3Rpb24oZGVwLCBjYWxsYmFjaykge1xyXG4gXHRcdFx0XHRpZih0eXBlb2YgZGVwID09PSBcInVuZGVmaW5lZFwiKVxyXG4gXHRcdFx0XHRcdGhvdC5fc2VsZkFjY2VwdGVkID0gdHJ1ZTtcclxuIFx0XHRcdFx0ZWxzZSBpZih0eXBlb2YgZGVwID09PSBcImZ1bmN0aW9uXCIpXHJcbiBcdFx0XHRcdFx0aG90Ll9zZWxmQWNjZXB0ZWQgPSBkZXA7XHJcbiBcdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIilcclxuIFx0XHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgZGVwLmxlbmd0aDsgaSsrKVxyXG4gXHRcdFx0XHRcdFx0aG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1tkZXBbaV1dID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oKSB7fTtcclxuIFx0XHRcdFx0ZWxzZVxyXG4gXHRcdFx0XHRcdGhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbZGVwXSA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKCkge307XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0ZGVjbGluZTogZnVuY3Rpb24oZGVwKSB7XHJcbiBcdFx0XHRcdGlmKHR5cGVvZiBkZXAgPT09IFwidW5kZWZpbmVkXCIpXHJcbiBcdFx0XHRcdFx0aG90Ll9zZWxmRGVjbGluZWQgPSB0cnVlO1xyXG4gXHRcdFx0XHRlbHNlIGlmKHR5cGVvZiBkZXAgPT09IFwib2JqZWN0XCIpXHJcbiBcdFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGRlcC5sZW5ndGg7IGkrKylcclxuIFx0XHRcdFx0XHRcdGhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbZGVwW2ldXSA9IHRydWU7XHJcbiBcdFx0XHRcdGVsc2VcclxuIFx0XHRcdFx0XHRob3QuX2RlY2xpbmVkRGVwZW5kZW5jaWVzW2RlcF0gPSB0cnVlO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdGRpc3Bvc2U6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiBcdFx0XHRcdGhvdC5fZGlzcG9zZUhhbmRsZXJzLnB1c2goY2FsbGJhY2spO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdGFkZERpc3Bvc2VIYW5kbGVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gXHRcdFx0XHRob3QuX2Rpc3Bvc2VIYW5kbGVycy5wdXNoKGNhbGxiYWNrKTtcclxuIFx0XHRcdH0sXHJcbiBcdFx0XHRyZW1vdmVEaXNwb3NlSGFuZGxlcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuIFx0XHRcdFx0dmFyIGlkeCA9IGhvdC5fZGlzcG9zZUhhbmRsZXJzLmluZGV4T2YoY2FsbGJhY2spO1xyXG4gXHRcdFx0XHRpZihpZHggPj0gMCkgaG90Ll9kaXNwb3NlSGFuZGxlcnMuc3BsaWNlKGlkeCwgMSk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcclxuIFx0XHRcdC8vIE1hbmFnZW1lbnQgQVBJXHJcbiBcdFx0XHRjaGVjazogaG90Q2hlY2ssXHJcbiBcdFx0XHRhcHBseTogaG90QXBwbHksXHJcbiBcdFx0XHRzdGF0dXM6IGZ1bmN0aW9uKGwpIHtcclxuIFx0XHRcdFx0aWYoIWwpIHJldHVybiBob3RTdGF0dXM7XHJcbiBcdFx0XHRcdGhvdFN0YXR1c0hhbmRsZXJzLnB1c2gobCk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0YWRkU3RhdHVzSGFuZGxlcjogZnVuY3Rpb24obCkge1xyXG4gXHRcdFx0XHRob3RTdGF0dXNIYW5kbGVycy5wdXNoKGwpO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdHJlbW92ZVN0YXR1c0hhbmRsZXI6IGZ1bmN0aW9uKGwpIHtcclxuIFx0XHRcdFx0dmFyIGlkeCA9IGhvdFN0YXR1c0hhbmRsZXJzLmluZGV4T2YobCk7XHJcbiBcdFx0XHRcdGlmKGlkeCA+PSAwKSBob3RTdGF0dXNIYW5kbGVycy5zcGxpY2UoaWR4LCAxKTtcclxuIFx0XHRcdH0sXHJcbiBcdFxyXG4gXHRcdFx0Ly9pbmhlcml0IGZyb20gcHJldmlvdXMgZGlzcG9zZSBjYWxsXHJcbiBcdFx0XHRkYXRhOiBob3RDdXJyZW50TW9kdWxlRGF0YVttb2R1bGVJZF1cclxuIFx0XHR9O1xyXG4gXHRcdGhvdEN1cnJlbnRDaGlsZE1vZHVsZSA9IHVuZGVmaW5lZDtcclxuIFx0XHRyZXR1cm4gaG90O1xyXG4gXHR9XHJcbiBcdFxyXG4gXHR2YXIgaG90U3RhdHVzSGFuZGxlcnMgPSBbXTtcclxuIFx0dmFyIGhvdFN0YXR1cyA9IFwiaWRsZVwiO1xyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90U2V0U3RhdHVzKG5ld1N0YXR1cykge1xyXG4gXHRcdGhvdFN0YXR1cyA9IG5ld1N0YXR1cztcclxuIFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgaG90U3RhdHVzSGFuZGxlcnMubGVuZ3RoOyBpKyspXHJcbiBcdFx0XHRob3RTdGF0dXNIYW5kbGVyc1tpXS5jYWxsKG51bGwsIG5ld1N0YXR1cyk7XHJcbiBcdH1cclxuIFx0XHJcbiBcdC8vIHdoaWxlIGRvd25sb2FkaW5nXHJcbiBcdHZhciBob3RXYWl0aW5nRmlsZXMgPSAwO1xyXG4gXHR2YXIgaG90Q2h1bmtzTG9hZGluZyA9IDA7XHJcbiBcdHZhciBob3RXYWl0aW5nRmlsZXNNYXAgPSB7fTtcclxuIFx0dmFyIGhvdFJlcXVlc3RlZEZpbGVzTWFwID0ge307XHJcbiBcdHZhciBob3RBdmFpbGFibGVGaWxlc01hcCA9IHt9O1xyXG4gXHR2YXIgaG90RGVmZXJyZWQ7XHJcbiBcdFxyXG4gXHQvLyBUaGUgdXBkYXRlIGluZm9cclxuIFx0dmFyIGhvdFVwZGF0ZSwgaG90VXBkYXRlTmV3SGFzaDtcclxuIFx0XHJcbiBcdGZ1bmN0aW9uIHRvTW9kdWxlSWQoaWQpIHtcclxuIFx0XHR2YXIgaXNOdW1iZXIgPSAoK2lkKSArIFwiXCIgPT09IGlkO1xyXG4gXHRcdHJldHVybiBpc051bWJlciA/ICtpZCA6IGlkO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RDaGVjayhhcHBseSkge1xyXG4gXHRcdGlmKGhvdFN0YXR1cyAhPT0gXCJpZGxlXCIpIHRocm93IG5ldyBFcnJvcihcImNoZWNrKCkgaXMgb25seSBhbGxvd2VkIGluIGlkbGUgc3RhdHVzXCIpO1xyXG4gXHRcdGhvdEFwcGx5T25VcGRhdGUgPSBhcHBseTtcclxuIFx0XHRob3RTZXRTdGF0dXMoXCJjaGVja1wiKTtcclxuIFx0XHRyZXR1cm4gaG90RG93bmxvYWRNYW5pZmVzdChob3RSZXF1ZXN0VGltZW91dCkudGhlbihmdW5jdGlvbih1cGRhdGUpIHtcclxuIFx0XHRcdGlmKCF1cGRhdGUpIHtcclxuIFx0XHRcdFx0aG90U2V0U3RhdHVzKFwiaWRsZVwiKTtcclxuIFx0XHRcdFx0cmV0dXJuIG51bGw7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRob3RSZXF1ZXN0ZWRGaWxlc01hcCA9IHt9O1xyXG4gXHRcdFx0aG90V2FpdGluZ0ZpbGVzTWFwID0ge307XHJcbiBcdFx0XHRob3RBdmFpbGFibGVGaWxlc01hcCA9IHVwZGF0ZS5jO1xyXG4gXHRcdFx0aG90VXBkYXRlTmV3SGFzaCA9IHVwZGF0ZS5oO1xyXG4gXHRcclxuIFx0XHRcdGhvdFNldFN0YXR1cyhcInByZXBhcmVcIik7XHJcbiBcdFx0XHR2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG4gXHRcdFx0XHRob3REZWZlcnJlZCA9IHtcclxuIFx0XHRcdFx0XHRyZXNvbHZlOiByZXNvbHZlLFxyXG4gXHRcdFx0XHRcdHJlamVjdDogcmVqZWN0XHJcbiBcdFx0XHRcdH07XHJcbiBcdFx0XHR9KTtcclxuIFx0XHRcdGhvdFVwZGF0ZSA9IHt9O1xyXG4gXHRcdFx0dmFyIGNodW5rSWQgPSAwO1xyXG4gXHRcdFx0eyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWxvbmUtYmxvY2tzXHJcbiBcdFx0XHRcdC8qZ2xvYmFscyBjaHVua0lkICovXHJcbiBcdFx0XHRcdGhvdEVuc3VyZVVwZGF0ZUNodW5rKGNodW5rSWQpO1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0aWYoaG90U3RhdHVzID09PSBcInByZXBhcmVcIiAmJiBob3RDaHVua3NMb2FkaW5nID09PSAwICYmIGhvdFdhaXRpbmdGaWxlcyA9PT0gMCkge1xyXG4gXHRcdFx0XHRob3RVcGRhdGVEb3dubG9hZGVkKCk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRyZXR1cm4gcHJvbWlzZTtcclxuIFx0XHR9KTtcclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90QWRkVXBkYXRlQ2h1bmsoY2h1bmtJZCwgbW9yZU1vZHVsZXMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdGlmKCFob3RBdmFpbGFibGVGaWxlc01hcFtjaHVua0lkXSB8fCAhaG90UmVxdWVzdGVkRmlsZXNNYXBbY2h1bmtJZF0pXHJcbiBcdFx0XHRyZXR1cm47XHJcbiBcdFx0aG90UmVxdWVzdGVkRmlsZXNNYXBbY2h1bmtJZF0gPSBmYWxzZTtcclxuIFx0XHRmb3IodmFyIG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHRob3RVcGRhdGVbbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHRpZigtLWhvdFdhaXRpbmdGaWxlcyA9PT0gMCAmJiBob3RDaHVua3NMb2FkaW5nID09PSAwKSB7XHJcbiBcdFx0XHRob3RVcGRhdGVEb3dubG9hZGVkKCk7XHJcbiBcdFx0fVxyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RFbnN1cmVVcGRhdGVDaHVuayhjaHVua0lkKSB7XHJcbiBcdFx0aWYoIWhvdEF2YWlsYWJsZUZpbGVzTWFwW2NodW5rSWRdKSB7XHJcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXNNYXBbY2h1bmtJZF0gPSB0cnVlO1xyXG4gXHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRob3RSZXF1ZXN0ZWRGaWxlc01hcFtjaHVua0lkXSA9IHRydWU7XHJcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXMrKztcclxuIFx0XHRcdGhvdERvd25sb2FkVXBkYXRlQ2h1bmsoY2h1bmtJZCk7XHJcbiBcdFx0fVxyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RVcGRhdGVEb3dubG9hZGVkKCkge1xyXG4gXHRcdGhvdFNldFN0YXR1cyhcInJlYWR5XCIpO1xyXG4gXHRcdHZhciBkZWZlcnJlZCA9IGhvdERlZmVycmVkO1xyXG4gXHRcdGhvdERlZmVycmVkID0gbnVsbDtcclxuIFx0XHRpZighZGVmZXJyZWQpIHJldHVybjtcclxuIFx0XHRpZihob3RBcHBseU9uVXBkYXRlKSB7XHJcbiBcdFx0XHQvLyBXcmFwIGRlZmVycmVkIG9iamVjdCBpbiBQcm9taXNlIHRvIG1hcmsgaXQgYXMgYSB3ZWxsLWhhbmRsZWQgUHJvbWlzZSB0b1xyXG4gXHRcdFx0Ly8gYXZvaWQgdHJpZ2dlcmluZyB1bmNhdWdodCBleGNlcHRpb24gd2FybmluZyBpbiBDaHJvbWUuXHJcbiBcdFx0XHQvLyBTZWUgaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NDY1NjY2XHJcbiBcdFx0XHRQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gXHRcdFx0XHRyZXR1cm4gaG90QXBwbHkoaG90QXBwbHlPblVwZGF0ZSk7XHJcbiBcdFx0XHR9KS50aGVuKFxyXG4gXHRcdFx0XHRmdW5jdGlvbihyZXN1bHQpIHtcclxuIFx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcbiBcdFx0XHRcdH0sXHJcbiBcdFx0XHRcdGZ1bmN0aW9uKGVycikge1xyXG4gXHRcdFx0XHRcdGRlZmVycmVkLnJlamVjdChlcnIpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHQpO1xyXG4gXHRcdH0gZWxzZSB7XHJcbiBcdFx0XHR2YXIgb3V0ZGF0ZWRNb2R1bGVzID0gW107XHJcbiBcdFx0XHRmb3IodmFyIGlkIGluIGhvdFVwZGF0ZSkge1xyXG4gXHRcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaG90VXBkYXRlLCBpZCkpIHtcclxuIFx0XHRcdFx0XHRvdXRkYXRlZE1vZHVsZXMucHVzaCh0b01vZHVsZUlkKGlkKSk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHRcdGRlZmVycmVkLnJlc29sdmUob3V0ZGF0ZWRNb2R1bGVzKTtcclxuIFx0XHR9XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdEFwcGx5KG9wdGlvbnMpIHtcclxuIFx0XHRpZihob3RTdGF0dXMgIT09IFwicmVhZHlcIikgdGhyb3cgbmV3IEVycm9yKFwiYXBwbHkoKSBpcyBvbmx5IGFsbG93ZWQgaW4gcmVhZHkgc3RhdHVzXCIpO1xyXG4gXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG4gXHRcclxuIFx0XHR2YXIgY2I7XHJcbiBcdFx0dmFyIGk7XHJcbiBcdFx0dmFyIGo7XHJcbiBcdFx0dmFyIG1vZHVsZTtcclxuIFx0XHR2YXIgbW9kdWxlSWQ7XHJcbiBcdFxyXG4gXHRcdGZ1bmN0aW9uIGdldEFmZmVjdGVkU3R1ZmYodXBkYXRlTW9kdWxlSWQpIHtcclxuIFx0XHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbdXBkYXRlTW9kdWxlSWRdO1xyXG4gXHRcdFx0dmFyIG91dGRhdGVkRGVwZW5kZW5jaWVzID0ge307XHJcbiBcdFxyXG4gXHRcdFx0dmFyIHF1ZXVlID0gb3V0ZGF0ZWRNb2R1bGVzLnNsaWNlKCkubWFwKGZ1bmN0aW9uKGlkKSB7XHJcbiBcdFx0XHRcdHJldHVybiB7XHJcbiBcdFx0XHRcdFx0Y2hhaW46IFtpZF0sXHJcbiBcdFx0XHRcdFx0aWQ6IGlkXHJcbiBcdFx0XHRcdH07XHJcbiBcdFx0XHR9KTtcclxuIFx0XHRcdHdoaWxlKHF1ZXVlLmxlbmd0aCA+IDApIHtcclxuIFx0XHRcdFx0dmFyIHF1ZXVlSXRlbSA9IHF1ZXVlLnBvcCgpO1xyXG4gXHRcdFx0XHR2YXIgbW9kdWxlSWQgPSBxdWV1ZUl0ZW0uaWQ7XHJcbiBcdFx0XHRcdHZhciBjaGFpbiA9IHF1ZXVlSXRlbS5jaGFpbjtcclxuIFx0XHRcdFx0bW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRcdGlmKCFtb2R1bGUgfHwgbW9kdWxlLmhvdC5fc2VsZkFjY2VwdGVkKVxyXG4gXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRpZihtb2R1bGUuaG90Ll9zZWxmRGVjbGluZWQpIHtcclxuIFx0XHRcdFx0XHRyZXR1cm4ge1xyXG4gXHRcdFx0XHRcdFx0dHlwZTogXCJzZWxmLWRlY2xpbmVkXCIsXHJcbiBcdFx0XHRcdFx0XHRjaGFpbjogY2hhaW4sXHJcbiBcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWRcclxuIFx0XHRcdFx0XHR9O1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGlmKG1vZHVsZS5ob3QuX21haW4pIHtcclxuIFx0XHRcdFx0XHRyZXR1cm4ge1xyXG4gXHRcdFx0XHRcdFx0dHlwZTogXCJ1bmFjY2VwdGVkXCIsXHJcbiBcdFx0XHRcdFx0XHRjaGFpbjogY2hhaW4sXHJcbiBcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWRcclxuIFx0XHRcdFx0XHR9O1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtb2R1bGUucGFyZW50cy5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0XHRcdHZhciBwYXJlbnRJZCA9IG1vZHVsZS5wYXJlbnRzW2ldO1xyXG4gXHRcdFx0XHRcdHZhciBwYXJlbnQgPSBpbnN0YWxsZWRNb2R1bGVzW3BhcmVudElkXTtcclxuIFx0XHRcdFx0XHRpZighcGFyZW50KSBjb250aW51ZTtcclxuIFx0XHRcdFx0XHRpZihwYXJlbnQuaG90Ll9kZWNsaW5lZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pIHtcclxuIFx0XHRcdFx0XHRcdHJldHVybiB7XHJcbiBcdFx0XHRcdFx0XHRcdHR5cGU6IFwiZGVjbGluZWRcIixcclxuIFx0XHRcdFx0XHRcdFx0Y2hhaW46IGNoYWluLmNvbmNhdChbcGFyZW50SWRdKSxcclxuIFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkLFxyXG4gXHRcdFx0XHRcdFx0XHRwYXJlbnRJZDogcGFyZW50SWRcclxuIFx0XHRcdFx0XHRcdH07XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdGlmKG91dGRhdGVkTW9kdWxlcy5pbmRleE9mKHBhcmVudElkKSA+PSAwKSBjb250aW51ZTtcclxuIFx0XHRcdFx0XHRpZihwYXJlbnQuaG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pIHtcclxuIFx0XHRcdFx0XHRcdGlmKCFvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF0pXHJcbiBcdFx0XHRcdFx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSA9IFtdO1xyXG4gXHRcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdLCBbbW9kdWxlSWRdKTtcclxuIFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRkZWxldGUgb3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdO1xyXG4gXHRcdFx0XHRcdG91dGRhdGVkTW9kdWxlcy5wdXNoKHBhcmVudElkKTtcclxuIFx0XHRcdFx0XHRxdWV1ZS5wdXNoKHtcclxuIFx0XHRcdFx0XHRcdGNoYWluOiBjaGFpbi5jb25jYXQoW3BhcmVudElkXSksXHJcbiBcdFx0XHRcdFx0XHRpZDogcGFyZW50SWRcclxuIFx0XHRcdFx0XHR9KTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcclxuIFx0XHRcdHJldHVybiB7XHJcbiBcdFx0XHRcdHR5cGU6IFwiYWNjZXB0ZWRcIixcclxuIFx0XHRcdFx0bW9kdWxlSWQ6IHVwZGF0ZU1vZHVsZUlkLFxyXG4gXHRcdFx0XHRvdXRkYXRlZE1vZHVsZXM6IG91dGRhdGVkTW9kdWxlcyxcclxuIFx0XHRcdFx0b3V0ZGF0ZWREZXBlbmRlbmNpZXM6IG91dGRhdGVkRGVwZW5kZW5jaWVzXHJcbiBcdFx0XHR9O1xyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0ZnVuY3Rpb24gYWRkQWxsVG9TZXQoYSwgYikge1xyXG4gXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdFx0dmFyIGl0ZW0gPSBiW2ldO1xyXG4gXHRcdFx0XHRpZihhLmluZGV4T2YoaXRlbSkgPCAwKVxyXG4gXHRcdFx0XHRcdGEucHVzaChpdGVtKTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIGF0IGJlZ2luIGFsbCB1cGRhdGVzIG1vZHVsZXMgYXJlIG91dGRhdGVkXHJcbiBcdFx0Ly8gdGhlIFwib3V0ZGF0ZWRcIiBzdGF0dXMgY2FuIHByb3BhZ2F0ZSB0byBwYXJlbnRzIGlmIHRoZXkgZG9uJ3QgYWNjZXB0IHRoZSBjaGlsZHJlblxyXG4gXHRcdHZhciBvdXRkYXRlZERlcGVuZGVuY2llcyA9IHt9O1xyXG4gXHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbXTtcclxuIFx0XHR2YXIgYXBwbGllZFVwZGF0ZSA9IHt9O1xyXG4gXHRcclxuIFx0XHR2YXIgd2FyblVuZXhwZWN0ZWRSZXF1aXJlID0gZnVuY3Rpb24gd2FyblVuZXhwZWN0ZWRSZXF1aXJlKCkge1xyXG4gXHRcdFx0Y29uc29sZS53YXJuKFwiW0hNUl0gdW5leHBlY3RlZCByZXF1aXJlKFwiICsgcmVzdWx0Lm1vZHVsZUlkICsgXCIpIHRvIGRpc3Bvc2VkIG1vZHVsZVwiKTtcclxuIFx0XHR9O1xyXG4gXHRcclxuIFx0XHRmb3IodmFyIGlkIGluIGhvdFVwZGF0ZSkge1xyXG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGhvdFVwZGF0ZSwgaWQpKSB7XHJcbiBcdFx0XHRcdG1vZHVsZUlkID0gdG9Nb2R1bGVJZChpZCk7XHJcbiBcdFx0XHRcdHZhciByZXN1bHQ7XHJcbiBcdFx0XHRcdGlmKGhvdFVwZGF0ZVtpZF0pIHtcclxuIFx0XHRcdFx0XHRyZXN1bHQgPSBnZXRBZmZlY3RlZFN0dWZmKG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0XHRyZXN1bHQgPSB7XHJcbiBcdFx0XHRcdFx0XHR0eXBlOiBcImRpc3Bvc2VkXCIsXHJcbiBcdFx0XHRcdFx0XHRtb2R1bGVJZDogaWRcclxuIFx0XHRcdFx0XHR9O1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdHZhciBhYm9ydEVycm9yID0gZmFsc2U7XHJcbiBcdFx0XHRcdHZhciBkb0FwcGx5ID0gZmFsc2U7XHJcbiBcdFx0XHRcdHZhciBkb0Rpc3Bvc2UgPSBmYWxzZTtcclxuIFx0XHRcdFx0dmFyIGNoYWluSW5mbyA9IFwiXCI7XHJcbiBcdFx0XHRcdGlmKHJlc3VsdC5jaGFpbikge1xyXG4gXHRcdFx0XHRcdGNoYWluSW5mbyA9IFwiXFxuVXBkYXRlIHByb3BhZ2F0aW9uOiBcIiArIHJlc3VsdC5jaGFpbi5qb2luKFwiIC0+IFwiKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRzd2l0Y2gocmVzdWx0LnR5cGUpIHtcclxuIFx0XHRcdFx0XHRjYXNlIFwic2VsZi1kZWNsaW5lZFwiOlxyXG4gXHRcdFx0XHRcdFx0aWYob3B0aW9ucy5vbkRlY2xpbmVkKVxyXG4gXHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uRGVjbGluZWQocmVzdWx0KTtcclxuIFx0XHRcdFx0XHRcdGlmKCFvcHRpb25zLmlnbm9yZURlY2xpbmVkKVxyXG4gXHRcdFx0XHRcdFx0XHRhYm9ydEVycm9yID0gbmV3IEVycm9yKFwiQWJvcnRlZCBiZWNhdXNlIG9mIHNlbGYgZGVjbGluZTogXCIgKyByZXN1bHQubW9kdWxlSWQgKyBjaGFpbkluZm8pO1xyXG4gXHRcdFx0XHRcdFx0YnJlYWs7XHJcbiBcdFx0XHRcdFx0Y2FzZSBcImRlY2xpbmVkXCI6XHJcbiBcdFx0XHRcdFx0XHRpZihvcHRpb25zLm9uRGVjbGluZWQpXHJcbiBcdFx0XHRcdFx0XHRcdG9wdGlvbnMub25EZWNsaW5lZChyZXN1bHQpO1xyXG4gXHRcdFx0XHRcdFx0aWYoIW9wdGlvbnMuaWdub3JlRGVjbGluZWQpXHJcbiBcdFx0XHRcdFx0XHRcdGFib3J0RXJyb3IgPSBuZXcgRXJyb3IoXCJBYm9ydGVkIGJlY2F1c2Ugb2YgZGVjbGluZWQgZGVwZW5kZW5jeTogXCIgKyByZXN1bHQubW9kdWxlSWQgKyBcIiBpbiBcIiArIHJlc3VsdC5wYXJlbnRJZCArIGNoYWluSW5mbyk7XHJcbiBcdFx0XHRcdFx0XHRicmVhaztcclxuIFx0XHRcdFx0XHRjYXNlIFwidW5hY2NlcHRlZFwiOlxyXG4gXHRcdFx0XHRcdFx0aWYob3B0aW9ucy5vblVuYWNjZXB0ZWQpXHJcbiBcdFx0XHRcdFx0XHRcdG9wdGlvbnMub25VbmFjY2VwdGVkKHJlc3VsdCk7XHJcbiBcdFx0XHRcdFx0XHRpZighb3B0aW9ucy5pZ25vcmVVbmFjY2VwdGVkKVxyXG4gXHRcdFx0XHRcdFx0XHRhYm9ydEVycm9yID0gbmV3IEVycm9yKFwiQWJvcnRlZCBiZWNhdXNlIFwiICsgbW9kdWxlSWQgKyBcIiBpcyBub3QgYWNjZXB0ZWRcIiArIGNoYWluSW5mbyk7XHJcbiBcdFx0XHRcdFx0XHRicmVhaztcclxuIFx0XHRcdFx0XHRjYXNlIFwiYWNjZXB0ZWRcIjpcclxuIFx0XHRcdFx0XHRcdGlmKG9wdGlvbnMub25BY2NlcHRlZClcclxuIFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5vbkFjY2VwdGVkKHJlc3VsdCk7XHJcbiBcdFx0XHRcdFx0XHRkb0FwcGx5ID0gdHJ1ZTtcclxuIFx0XHRcdFx0XHRcdGJyZWFrO1xyXG4gXHRcdFx0XHRcdGNhc2UgXCJkaXNwb3NlZFwiOlxyXG4gXHRcdFx0XHRcdFx0aWYob3B0aW9ucy5vbkRpc3Bvc2VkKVxyXG4gXHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uRGlzcG9zZWQocmVzdWx0KTtcclxuIFx0XHRcdFx0XHRcdGRvRGlzcG9zZSA9IHRydWU7XHJcbiBcdFx0XHRcdFx0XHRicmVhaztcclxuIFx0XHRcdFx0XHRkZWZhdWx0OlxyXG4gXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leGNlcHRpb24gdHlwZSBcIiArIHJlc3VsdC50eXBlKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRpZihhYm9ydEVycm9yKSB7XHJcbiBcdFx0XHRcdFx0aG90U2V0U3RhdHVzKFwiYWJvcnRcIik7XHJcbiBcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGFib3J0RXJyb3IpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGlmKGRvQXBwbHkpIHtcclxuIFx0XHRcdFx0XHRhcHBsaWVkVXBkYXRlW21vZHVsZUlkXSA9IGhvdFVwZGF0ZVttb2R1bGVJZF07XHJcbiBcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWRNb2R1bGVzLCByZXN1bHQub3V0ZGF0ZWRNb2R1bGVzKTtcclxuIFx0XHRcdFx0XHRmb3IobW9kdWxlSWQgaW4gcmVzdWx0Lm91dGRhdGVkRGVwZW5kZW5jaWVzKSB7XHJcbiBcdFx0XHRcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmVzdWx0Lm91dGRhdGVkRGVwZW5kZW5jaWVzLCBtb2R1bGVJZCkpIHtcclxuIFx0XHRcdFx0XHRcdFx0aWYoIW91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSlcclxuIFx0XHRcdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0gPSBbXTtcclxuIFx0XHRcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdLCByZXN1bHQub3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdKTtcclxuIFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0aWYoZG9EaXNwb3NlKSB7XHJcbiBcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWRNb2R1bGVzLCBbcmVzdWx0Lm1vZHVsZUlkXSk7XHJcbiBcdFx0XHRcdFx0YXBwbGllZFVwZGF0ZVttb2R1bGVJZF0gPSB3YXJuVW5leHBlY3RlZFJlcXVpcmU7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIFN0b3JlIHNlbGYgYWNjZXB0ZWQgb3V0ZGF0ZWQgbW9kdWxlcyB0byByZXF1aXJlIHRoZW0gbGF0ZXIgYnkgdGhlIG1vZHVsZSBzeXN0ZW1cclxuIFx0XHR2YXIgb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzID0gW107XHJcbiBcdFx0Zm9yKGkgPSAwOyBpIDwgb3V0ZGF0ZWRNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHRtb2R1bGVJZCA9IG91dGRhdGVkTW9kdWxlc1tpXTtcclxuIFx0XHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdICYmIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmhvdC5fc2VsZkFjY2VwdGVkKVxyXG4gXHRcdFx0XHRvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMucHVzaCh7XHJcbiBcdFx0XHRcdFx0bW9kdWxlOiBtb2R1bGVJZCxcclxuIFx0XHRcdFx0XHRlcnJvckhhbmRsZXI6IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmhvdC5fc2VsZkFjY2VwdGVkXHJcbiBcdFx0XHRcdH0pO1xyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gTm93IGluIFwiZGlzcG9zZVwiIHBoYXNlXHJcbiBcdFx0aG90U2V0U3RhdHVzKFwiZGlzcG9zZVwiKTtcclxuIFx0XHRPYmplY3Qua2V5cyhob3RBdmFpbGFibGVGaWxlc01hcCkuZm9yRWFjaChmdW5jdGlvbihjaHVua0lkKSB7XHJcbiBcdFx0XHRpZihob3RBdmFpbGFibGVGaWxlc01hcFtjaHVua0lkXSA9PT0gZmFsc2UpIHtcclxuIFx0XHRcdFx0aG90RGlzcG9zZUNodW5rKGNodW5rSWQpO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH0pO1xyXG4gXHRcclxuIFx0XHR2YXIgaWR4O1xyXG4gXHRcdHZhciBxdWV1ZSA9IG91dGRhdGVkTW9kdWxlcy5zbGljZSgpO1xyXG4gXHRcdHdoaWxlKHF1ZXVlLmxlbmd0aCA+IDApIHtcclxuIFx0XHRcdG1vZHVsZUlkID0gcXVldWUucG9wKCk7XHJcbiBcdFx0XHRtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHRcdGlmKCFtb2R1bGUpIGNvbnRpbnVlO1xyXG4gXHRcclxuIFx0XHRcdHZhciBkYXRhID0ge307XHJcbiBcdFxyXG4gXHRcdFx0Ly8gQ2FsbCBkaXNwb3NlIGhhbmRsZXJzXHJcbiBcdFx0XHR2YXIgZGlzcG9zZUhhbmRsZXJzID0gbW9kdWxlLmhvdC5fZGlzcG9zZUhhbmRsZXJzO1xyXG4gXHRcdFx0Zm9yKGogPSAwOyBqIDwgZGlzcG9zZUhhbmRsZXJzLmxlbmd0aDsgaisrKSB7XHJcbiBcdFx0XHRcdGNiID0gZGlzcG9zZUhhbmRsZXJzW2pdO1xyXG4gXHRcdFx0XHRjYihkYXRhKTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdGhvdEN1cnJlbnRNb2R1bGVEYXRhW21vZHVsZUlkXSA9IGRhdGE7XHJcbiBcdFxyXG4gXHRcdFx0Ly8gZGlzYWJsZSBtb2R1bGUgKHRoaXMgZGlzYWJsZXMgcmVxdWlyZXMgZnJvbSB0aGlzIG1vZHVsZSlcclxuIFx0XHRcdG1vZHVsZS5ob3QuYWN0aXZlID0gZmFsc2U7XHJcbiBcdFxyXG4gXHRcdFx0Ly8gcmVtb3ZlIG1vZHVsZSBmcm9tIGNhY2hlXHJcbiBcdFx0XHRkZWxldGUgaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFxyXG4gXHRcdFx0Ly8gd2hlbiBkaXNwb3NpbmcgdGhlcmUgaXMgbm8gbmVlZCB0byBjYWxsIGRpc3Bvc2UgaGFuZGxlclxyXG4gXHRcdFx0ZGVsZXRlIG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXTtcclxuIFx0XHJcbiBcdFx0XHQvLyByZW1vdmUgXCJwYXJlbnRzXCIgcmVmZXJlbmNlcyBmcm9tIGFsbCBjaGlsZHJlblxyXG4gXHRcdFx0Zm9yKGogPSAwOyBqIDwgbW9kdWxlLmNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XHJcbiBcdFx0XHRcdHZhciBjaGlsZCA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlLmNoaWxkcmVuW2pdXTtcclxuIFx0XHRcdFx0aWYoIWNoaWxkKSBjb250aW51ZTtcclxuIFx0XHRcdFx0aWR4ID0gY2hpbGQucGFyZW50cy5pbmRleE9mKG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0aWYoaWR4ID49IDApIHtcclxuIFx0XHRcdFx0XHRjaGlsZC5wYXJlbnRzLnNwbGljZShpZHgsIDEpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyByZW1vdmUgb3V0ZGF0ZWQgZGVwZW5kZW5jeSBmcm9tIG1vZHVsZSBjaGlsZHJlblxyXG4gXHRcdHZhciBkZXBlbmRlbmN5O1xyXG4gXHRcdHZhciBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcztcclxuIFx0XHRmb3IobW9kdWxlSWQgaW4gb3V0ZGF0ZWREZXBlbmRlbmNpZXMpIHtcclxuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvdXRkYXRlZERlcGVuZGVuY2llcywgbW9kdWxlSWQpKSB7XHJcbiBcdFx0XHRcdG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0XHRpZihtb2R1bGUpIHtcclxuIFx0XHRcdFx0XHRtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcyA9IG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0XHRmb3IoaiA9IDA7IGogPCBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcy5sZW5ndGg7IGorKykge1xyXG4gXHRcdFx0XHRcdFx0ZGVwZW5kZW5jeSA9IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzW2pdO1xyXG4gXHRcdFx0XHRcdFx0aWR4ID0gbW9kdWxlLmNoaWxkcmVuLmluZGV4T2YoZGVwZW5kZW5jeSk7XHJcbiBcdFx0XHRcdFx0XHRpZihpZHggPj0gMCkgbW9kdWxlLmNoaWxkcmVuLnNwbGljZShpZHgsIDEpO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gTm90IGluIFwiYXBwbHlcIiBwaGFzZVxyXG4gXHRcdGhvdFNldFN0YXR1cyhcImFwcGx5XCIpO1xyXG4gXHRcclxuIFx0XHRob3RDdXJyZW50SGFzaCA9IGhvdFVwZGF0ZU5ld0hhc2g7XHJcbiBcdFxyXG4gXHRcdC8vIGluc2VydCBuZXcgY29kZVxyXG4gXHRcdGZvcihtb2R1bGVJZCBpbiBhcHBsaWVkVXBkYXRlKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXBwbGllZFVwZGF0ZSwgbW9kdWxlSWQpKSB7XHJcbiBcdFx0XHRcdG1vZHVsZXNbbW9kdWxlSWRdID0gYXBwbGllZFVwZGF0ZVttb2R1bGVJZF07XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBjYWxsIGFjY2VwdCBoYW5kbGVyc1xyXG4gXHRcdHZhciBlcnJvciA9IG51bGw7XHJcbiBcdFx0Zm9yKG1vZHVsZUlkIGluIG91dGRhdGVkRGVwZW5kZW5jaWVzKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob3V0ZGF0ZWREZXBlbmRlbmNpZXMsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHRtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0aWYobW9kdWxlKSB7XHJcbiBcdFx0XHRcdFx0bW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMgPSBvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRcdFx0dmFyIGNhbGxiYWNrcyA9IFtdO1xyXG4gXHRcdFx0XHRcdGZvcihpID0gMDsgaSA8IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHRcdFx0XHRkZXBlbmRlbmN5ID0gbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXNbaV07XHJcbiBcdFx0XHRcdFx0XHRjYiA9IG1vZHVsZS5ob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcGVuZGVuY3ldO1xyXG4gXHRcdFx0XHRcdFx0aWYoY2IpIHtcclxuIFx0XHRcdFx0XHRcdFx0aWYoY2FsbGJhY2tzLmluZGV4T2YoY2IpID49IDApIGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRcdFx0XHRjYWxsYmFja3MucHVzaChjYik7XHJcbiBcdFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdGZvcihpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0XHRcdFx0Y2IgPSBjYWxsYmFja3NbaV07XHJcbiBcdFx0XHRcdFx0XHR0cnkge1xyXG4gXHRcdFx0XHRcdFx0XHRjYihtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcyk7XHJcbiBcdFx0XHRcdFx0XHR9IGNhdGNoKGVycikge1xyXG4gXHRcdFx0XHRcdFx0XHRpZihvcHRpb25zLm9uRXJyb3JlZCkge1xyXG4gXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnMub25FcnJvcmVkKHtcclxuIFx0XHRcdFx0XHRcdFx0XHRcdHR5cGU6IFwiYWNjZXB0LWVycm9yZWRcIixcclxuIFx0XHRcdFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZCxcclxuIFx0XHRcdFx0XHRcdFx0XHRcdGRlcGVuZGVuY3lJZDogbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXNbaV0sXHJcbiBcdFx0XHRcdFx0XHRcdFx0XHRlcnJvcjogZXJyXHJcbiBcdFx0XHRcdFx0XHRcdFx0fSk7XHJcbiBcdFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRcdFx0aWYoIW9wdGlvbnMuaWdub3JlRXJyb3JlZCkge1xyXG4gXHRcdFx0XHRcdFx0XHRcdGlmKCFlcnJvcilcclxuIFx0XHRcdFx0XHRcdFx0XHRcdGVycm9yID0gZXJyO1xyXG4gXHRcdFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG4gXHRcclxuIFx0XHQvLyBMb2FkIHNlbGYgYWNjZXB0ZWQgbW9kdWxlc1xyXG4gXHRcdGZvcihpID0gMDsgaSA8IG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlcy5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0dmFyIGl0ZW0gPSBvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXNbaV07XHJcbiBcdFx0XHRtb2R1bGVJZCA9IGl0ZW0ubW9kdWxlO1xyXG4gXHRcdFx0aG90Q3VycmVudFBhcmVudHMgPSBbbW9kdWxlSWRdO1xyXG4gXHRcdFx0dHJ5IHtcclxuIFx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCk7XHJcbiBcdFx0XHR9IGNhdGNoKGVycikge1xyXG4gXHRcdFx0XHRpZih0eXBlb2YgaXRlbS5lcnJvckhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gXHRcdFx0XHRcdHRyeSB7XHJcbiBcdFx0XHRcdFx0XHRpdGVtLmVycm9ySGFuZGxlcihlcnIpO1xyXG4gXHRcdFx0XHRcdH0gY2F0Y2goZXJyMikge1xyXG4gXHRcdFx0XHRcdFx0aWYob3B0aW9ucy5vbkVycm9yZWQpIHtcclxuIFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5vbkVycm9yZWQoe1xyXG4gXHRcdFx0XHRcdFx0XHRcdHR5cGU6IFwic2VsZi1hY2NlcHQtZXJyb3ItaGFuZGxlci1lcnJvcmVkXCIsXHJcbiBcdFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkLFxyXG4gXHRcdFx0XHRcdFx0XHRcdGVycm9yOiBlcnIyLFxyXG4gXHRcdFx0XHRcdFx0XHRcdG9yZ2luYWxFcnJvcjogZXJyLCAvLyBUT0RPIHJlbW92ZSBpbiB3ZWJwYWNrIDRcclxuIFx0XHRcdFx0XHRcdFx0XHRvcmlnaW5hbEVycm9yOiBlcnJcclxuIFx0XHRcdFx0XHRcdFx0fSk7XHJcbiBcdFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0XHRpZighb3B0aW9ucy5pZ25vcmVFcnJvcmVkKSB7XHJcbiBcdFx0XHRcdFx0XHRcdGlmKCFlcnJvcilcclxuIFx0XHRcdFx0XHRcdFx0XHRlcnJvciA9IGVycjI7XHJcbiBcdFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0XHRpZighZXJyb3IpXHJcbiBcdFx0XHRcdFx0XHRcdGVycm9yID0gZXJyO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0XHRpZihvcHRpb25zLm9uRXJyb3JlZCkge1xyXG4gXHRcdFx0XHRcdFx0b3B0aW9ucy5vbkVycm9yZWQoe1xyXG4gXHRcdFx0XHRcdFx0XHR0eXBlOiBcInNlbGYtYWNjZXB0LWVycm9yZWRcIixcclxuIFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkLFxyXG4gXHRcdFx0XHRcdFx0XHRlcnJvcjogZXJyXHJcbiBcdFx0XHRcdFx0XHR9KTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0aWYoIW9wdGlvbnMuaWdub3JlRXJyb3JlZCkge1xyXG4gXHRcdFx0XHRcdFx0aWYoIWVycm9yKVxyXG4gXHRcdFx0XHRcdFx0XHRlcnJvciA9IGVycjtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIGhhbmRsZSBlcnJvcnMgaW4gYWNjZXB0IGhhbmRsZXJzIGFuZCBzZWxmIGFjY2VwdGVkIG1vZHVsZSBsb2FkXHJcbiBcdFx0aWYoZXJyb3IpIHtcclxuIFx0XHRcdGhvdFNldFN0YXR1cyhcImZhaWxcIik7XHJcbiBcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0aG90U2V0U3RhdHVzKFwiaWRsZVwiKTtcclxuIFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xyXG4gXHRcdFx0cmVzb2x2ZShvdXRkYXRlZE1vZHVsZXMpO1xyXG4gXHRcdH0pO1xyXG4gXHR9XHJcblxuIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aG90OiBob3RDcmVhdGVNb2R1bGUobW9kdWxlSWQpLFxuIFx0XHRcdHBhcmVudHM6IChob3RDdXJyZW50UGFyZW50c1RlbXAgPSBob3RDdXJyZW50UGFyZW50cywgaG90Q3VycmVudFBhcmVudHMgPSBbXSwgaG90Q3VycmVudFBhcmVudHNUZW1wKSxcbiBcdFx0XHRjaGlsZHJlbjogW11cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgaG90Q3JlYXRlUmVxdWlyZShtb2R1bGVJZCkpO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBfX3dlYnBhY2tfaGFzaF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmggPSBmdW5jdGlvbigpIHsgcmV0dXJuIGhvdEN1cnJlbnRIYXNoOyB9O1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBob3RDcmVhdGVSZXF1aXJlKDE1KShfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAxNSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYzlmZDEyYzlhZTkzOWY1OTYyMmIiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ3BhdGgnKVwiXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IERBVEFfUEFUSCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9kYXRhJyk7XG5jb25zdCBBTkFMWVRJQ1NfUEFUSCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi9zcmMnKTtcbmNvbnN0IEFOT01BTElFU19QQVRIID0gcGF0aC5qb2luKEFOQUxZVElDU19QQVRILCAnYW5vbWFsaWVzJyk7XG5jb25zdCBTRUdNRU5UU19QQVRIID0gcGF0aC5qb2luKEFOQUxZVElDU19QQVRILCAnc2VnbWVudHMnKTtcbmNvbnN0IE1FVFJJQ1NfUEFUSCA9IHBhdGguam9pbihBTkFMWVRJQ1NfUEFUSCwgJ21ldHJpY3MnKTtcblxuZXhwb3J0IHsgREFUQV9QQVRILCBBTkFMWVRJQ1NfUEFUSCwgQU5PTUFMSUVTX1BBVEgsIFNFR01FTlRTX1BBVEgsIE1FVFJJQ1NfUEFUSCB9XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9jb25maWcudHMiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9qc29uL3N0cmluZ2lmeScpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgnYmFiZWwtcnVudGltZS9jb3JlLWpzL2pzb24vc3RyaW5naWZ5JylcIlxuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvcmVnZW5lcmF0b3InKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvcmVnZW5lcmF0b3InKVwiXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnYmFiZWwtcnVudGltZS9jb3JlLWpzL3Byb21pc2UnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9wcm9taXNlJylcIlxuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBnZXRKc29uRGF0YVN5bmMsIHdyaXRlSnNvbkRhdGFTeW5jIH0gZnJvbSAnLi9qc29uJ1xuaW1wb3J0IHsgQU5PTUFMSUVTX1BBVEggfSBmcm9tICcuLi9jb25maWcnXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5leHBvcnQgdHlwZSBEYXRhc291cmNlID0ge1xuICBtZXRob2Q6IHN0cmluZyxcbiAgZGF0YTogT2JqZWN0LFxuICBwYXJhbXM6IE9iamVjdCxcbiAgdHlwZTogc3RyaW5nLFxuICB1cmw6IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBNZXRyaWMgPSB7XG4gIGRhdGFzb3VyY2U6IHN0cmluZyxcbiAgdGFyZ2V0czogc3RyaW5nW11cbn1cblxuZXhwb3J0IHR5cGUgQW5vbWFseSA9IHtcbiAgbmFtZTogc3RyaW5nLFxuXG4gIHBhbmVsVXJsOiBzdHJpbmcsXG5cbiAgbWV0cmljOiBNZXRyaWMsXG4gIGRhdGFzb3VyY2U6IERhdGFzb3VyY2VcbiAgc3RhdHVzOiBzdHJpbmcsXG4gIGVycm9yPzogc3RyaW5nLFxuXG4gIGxhc3RfcHJlZGljdGlvbl90aW1lOiBudW1iZXIsXG4gIG5leHRfaWQ6IG51bWJlclxufVxuXG5leHBvcnQgdHlwZSBBbm9tYWx5SWQgPSBzdHJpbmc7XG5cbmxldCBhbm9tYWxpZXNOYW1lVG9JZE1hcCA9IHt9O1xuXG5mdW5jdGlvbiBsb2FkQW5vbWFsaWVzTWFwKCkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGBhbGxfYW5vbWFsaWVzLmpzb25gKTtcbiAgYW5vbWFsaWVzTmFtZVRvSWRNYXAgPSBnZXRKc29uRGF0YVN5bmMoZmlsZW5hbWUpO1xufVxuXG5mdW5jdGlvbiBzYXZlQW5vbWFsaWVzTWFwKCkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGBhbGxfYW5vbWFsaWVzLmpzb25gKTtcbiAgd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWUsIGFub21hbGllc05hbWVUb0lkTWFwKTtcbn1cblxuZnVuY3Rpb24gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlOYW1lOnN0cmluZykgOiBBbm9tYWx5SWQge1xuICBsb2FkQW5vbWFsaWVzTWFwKCk7XG4gIGFub21hbHlOYW1lID0gYW5vbWFseU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgaWYoYW5vbWFseU5hbWUgaW4gYW5vbWFsaWVzTmFtZVRvSWRNYXApIHtcbiAgICByZXR1cm4gYW5vbWFsaWVzTmFtZVRvSWRNYXBbYW5vbWFseU5hbWVdO1xuICB9XG4gIHJldHVybiBhbm9tYWx5TmFtZTtcbn1cblxuZnVuY3Rpb24gaW5zZXJ0QW5vbWFseShhbm9tYWx5OiBBbm9tYWx5KSA6IEFub21hbHlJZCB7XG4gIGNvbnN0IGhhc2hTdHJpbmcgPSBhbm9tYWx5Lm5hbWUgKyAobmV3IERhdGUoKSkudG9TdHJpbmcoKTtcbiAgY29uc3QgYW5vbWFseUlkOkFub21hbHlJZCA9IGNyeXB0by5jcmVhdGVIYXNoKCdtZDUnKS51cGRhdGUoaGFzaFN0cmluZykuZGlnZXN0KCdoZXgnKTtcbiAgYW5vbWFsaWVzTmFtZVRvSWRNYXBbYW5vbWFseS5uYW1lXSA9IGFub21hbHlJZDtcbiAgc2F2ZUFub21hbGllc01hcCgpO1xuICAvLyByZXR1cm4gYW5vbWFseUlkXG4gIC8vIGNvbnN0IGFub21hbHlJZDpBbm9tYWx5SWQgPSBhbm9tYWx5Lm5hbWU7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYCR7YW5vbWFseUlkfS5qc29uYCk7XG4gIGlmKGZzLmV4aXN0c1N5bmMoZmlsZW5hbWUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgc2F2ZUFub21hbHkoYW5vbWFseUlkLCBhbm9tYWx5KTtcbiAgcmV0dXJuIGFub21hbHlJZDtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQW5vbWFseShhbm9tYWx5SWQ6QW5vbWFseUlkKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYCR7YW5vbWFseUlkfS5qc29uYCk7XG4gIGZzLnVubGlua1N5bmMoZmlsZW5hbWUpO1xufVxuXG5mdW5jdGlvbiBzYXZlQW5vbWFseShhbm9tYWx5SWQ6IEFub21hbHlJZCwgYW5vbWFseTogQW5vbWFseSkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGAke2Fub21hbHlJZH0uanNvbmApO1xuICByZXR1cm4gd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWUsIGFub21hbHkpO1xufVxuXG5mdW5jdGlvbiBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkOiBBbm9tYWx5SWQpIDogQW5vbWFseSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYCR7YW5vbWFseUlkfS5qc29uYCk7XG4gIGlmKCFmcy5leGlzdHNTeW5jKGZpbGVuYW1lKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBnZXRKc29uRGF0YVN5bmMoZmlsZW5hbWUpO1xufVxuXG5mdW5jdGlvbiBsb2FkQW5vbWFseUJ5TmFtZShhbm9tYWx5TmFtZTogc3RyaW5nKSA6IEFub21hbHkge1xuICBsZXQgYW5vbWFseUlkID0gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlOYW1lKTtcbiAgcmV0dXJuIGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQpO1xufVxuXG5mdW5jdGlvbiBzYXZlQW5vbWFseVR5cGVJbmZvKGluZm8pIHtcbiAgY29uc29sZS5sb2coJ1NhdmluZycpO1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGAke2luZm8ubmFtZX0uanNvbmApO1xuICBpZihpbmZvLm5leHRfaWQgPT09IHVuZGVmaW5lZCkge1xuICAgIGluZm8ubmV4dF9pZCA9IDA7XG4gIH1cbiAgaWYoaW5mby5sYXN0X3ByZWRpY3Rpb25fdGltZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpbmZvLmxhc3RfcHJlZGljdGlvbl90aW1lID0gMDtcbiAgfVxuXG4gIHJldHVybiB3cml0ZUpzb25EYXRhU3luYyhmaWxlbmFtZSwgaW5mbyk7XG59XG5cbmZ1bmN0aW9uIGdldEFub21hbHlUeXBlSW5mbyhuYW1lKSB7XG4gIHJldHVybiBnZXRKc29uRGF0YVN5bmMocGF0aC5qb2luKEFOT01BTElFU19QQVRILCBgJHtuYW1lfS5qc29uYCkpO1xufVxuXG5mdW5jdGlvbiBzZXRBbm9tYWx5U3RhdHVzKGFub21hbHlJZDpBbm9tYWx5SWQsIHN0YXR1czpzdHJpbmcsIGVycm9yPzpzdHJpbmcpIHtcbiAgbGV0IGluZm8gPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgaW5mby5zdGF0dXMgPSBzdGF0dXM7XG4gIGlmKGVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICBpbmZvLmVycm9yID0gZXJyb3I7XG4gIH0gZWxzZSB7XG4gICAgaW5mby5lcnJvciA9ICcnO1xuICB9XG4gIHNhdmVBbm9tYWx5KGFub21hbHlJZCwgaW5mbyk7XG59XG5cbmZ1bmN0aW9uIHNldEFub21hbHlQcmVkaWN0aW9uVGltZShhbm9tYWx5SWQ6QW5vbWFseUlkLCBsYXN0UHJlZGljdGlvblRpbWU6bnVtYmVyKSB7XG4gIGxldCBpbmZvID0gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZCk7XG4gIGluZm8ubGFzdF9wcmVkaWN0aW9uX3RpbWUgPSBsYXN0UHJlZGljdGlvblRpbWU7XG4gIHNhdmVBbm9tYWx5KGFub21hbHlJZCwgaW5mbyk7XG59XG5cbmV4cG9ydCB7XG4gIHNhdmVBbm9tYWx5LCBsb2FkQW5vbWFseUJ5SWQsIGxvYWRBbm9tYWx5QnlOYW1lLCBpbnNlcnRBbm9tYWx5LCByZW1vdmVBbm9tYWx5LCBzYXZlQW5vbWFseVR5cGVJbmZvLFxuICBnZXRBbm9tYWx5VHlwZUluZm8sIGdldEFub21hbHlJZEJ5TmFtZSwgc2V0QW5vbWFseVN0YXR1cywgc2V0QW5vbWFseVByZWRpY3Rpb25UaW1lXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zZXJ2aWNlcy9hbm9tYWx5VHlwZS50cyIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcblxuYXN5bmMgZnVuY3Rpb24gZ2V0SnNvbkRhdGEoZmlsZW5hbWU6IHN0cmluZyk6IFByb21pc2U8T2JqZWN0PiB7XG4gIHZhciBkYXRhID0gYXdhaXQgbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZnMucmVhZEZpbGUoZmlsZW5hbWUsICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgaWYoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgcmVqZWN0KCdDYW5gdCByZWFkIGZpbGUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyBmaWxlIGZvcm1hdCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyaXRlSnNvbkRhdGEoZmlsZW5hbWU6IHN0cmluZywgZGF0YTogT2JqZWN0KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZnMud3JpdGVGaWxlKGZpbGVuYW1lLCBKU09OLnN0cmluZ2lmeShkYXRhKSwgJ3V0ZjgnLCAoZXJyKSA9PiB7XG4gICAgICBpZihlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICByZWplY3QoJ0NhdGB0IHdyaXRlIGZpbGUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0SnNvbkRhdGFTeW5jKGZpbGVuYW1lOiBzdHJpbmcpIHtcbiAgbGV0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4Jyk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyBmaWxlIGZvcm1hdCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyaXRlSnNvbkRhdGFTeW5jKGZpbGVuYW1lOiBzdHJpbmcsIGRhdGE6IE9iamVjdCkge1xuICBmcy53cml0ZUZpbGVTeW5jKGZpbGVuYW1lLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG59XG5cbmV4cG9ydCB7XG4gIGdldEpzb25EYXRhLFxuICB3cml0ZUpzb25EYXRhLFxuICBnZXRKc29uRGF0YVN5bmMsXG4gIHdyaXRlSnNvbkRhdGFTeW5jXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zZXJ2aWNlcy9qc29uLnRzIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdleHByZXNzJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJyZXF1aXJlKCdleHByZXNzJylcIlxuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9nZXQtaXRlcmF0b3InKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9nZXQtaXRlcmF0b3InKVwiXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnZnMnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2ZzJylcIlxuLy8gbW9kdWxlIGlkID0gOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgeyBBTkFMWVRJQ1NfUEFUSCB9IGZyb20gJy4uL2NvbmZpZydcbmltcG9ydCB7XG4gIEFub21hbHksXG4gIEFub21hbHlJZCwgZ2V0QW5vbWFseVR5cGVJbmZvLFxuICBsb2FkQW5vbWFseUJ5SWQsXG4gIHNldEFub21hbHlQcmVkaWN0aW9uVGltZSxcbiAgc2V0QW5vbWFseVN0YXR1c1xufSBmcm9tICcuL2Fub21hbHlUeXBlJ1xuaW1wb3J0IHsgZ2V0VGFyZ2V0IH0gZnJvbSAnLi9tZXRyaWNzJztcbmltcG9ydCB7IGdldExhYmVsZWRTZWdtZW50cywgaW5zZXJ0U2VnbWVudHMsIHJlbW92ZVNlZ21lbnRzIH0gZnJvbSAnLi9zZWdtZW50cyc7XG5pbXBvcnQgeyBzcGxpdCwgbWFwLCBtYXBTeW5jIH0gZnJvbSAnZXZlbnQtc3RyZWFtJ1xuXG5jb25zdCBsZWFybldvcmtlciA9IHNwYXduKCdweXRob24zJywgWyd3b3JrZXIucHknXSwgeyBjd2Q6IEFOQUxZVElDU19QQVRIIH0pXG5sZWFybldvcmtlci5zdGRvdXQucGlwZShzcGxpdCgpKVxuICAucGlwZShcbiAgICBtYXBTeW5jKGZ1bmN0aW9uKGxpbmUpe1xuICAgICAgb25NZXNzYWdlKGxpbmUpXG4gICAgfSlcbiAgKTtcblxubGVhcm5Xb3JrZXIuc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiBjb25zb2xlLmVycm9yKGB3b3JrZXIgc3RkZXJyOiAke2RhdGF9YCkpO1xuXG5jb25zdCB0YXNrTWFwID0ge307XG5sZXQgbmV4dFRhc2tJZCA9IDA7XG5cbmZ1bmN0aW9uIG9uTWVzc2FnZShkYXRhKSB7XG4gIGNvbnNvbGUubG9nKGB3b3JrZXIgc3Rkb3V0OiAke2RhdGF9YCk7XG4gIGxldCByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gIGxldCB0YXNrSWQgPSByZXNwb25zZS5fX3Rhc2tfaWQ7XG4gIC8vIGxldCBhbm9tYWx5TmFtZSA9IHJlc3BvbnNlLmFub21hbHlfbmFtZTtcbiAgLy8gbGV0IHRhc2sgPSByZXNwb25zZS50YXNrO1xuICBsZXQgc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuXG4gIGlmKHN0YXR1cyA9PT0gJ3N1Y2Nlc3MnIHx8IHN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcbiAgICBpZih0YXNrSWQgaW4gdGFza01hcCkge1xuICAgICAgbGV0IHJlc29sdmVyID0gdGFza01hcFt0YXNrSWRdO1xuICAgICAgcmVzb2x2ZXIocmVzcG9uc2UpO1xuICAgICAgZGVsZXRlIHRhc2tNYXBbdGFza0lkXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcnVuVGFzayh0YXNrKSA6IFByb21pc2U8YW55PiB7XG4gIGxldCBhbm9tYWx5OkFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQodGFzay5hbm9tYWx5X2lkKTtcbiAgdGFzay5tZXRyaWMgPSB7XG4gICAgZGF0YXNvdXJjZTogYW5vbWFseS5tZXRyaWMuZGF0YXNvdXJjZSxcbiAgICB0YXJnZXRzOiBhbm9tYWx5Lm1ldHJpYy50YXJnZXRzLm1hcCh0ID0+IGdldFRhcmdldCh0KSlcbiAgfTtcblxuICB0YXNrLl9fdGFza19pZCA9IG5leHRUYXNrSWQrKztcbiAgbGV0IGNvbW1hbmQgPSBKU09OLnN0cmluZ2lmeSh0YXNrKVxuICBsZWFybldvcmtlci5zdGRpbi53cml0ZShgJHtjb21tYW5kfVxcbmApO1xuICByZXR1cm4gbmV3IFByb21pc2U8T2JqZWN0PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdGFza01hcFt0YXNrLl9fdGFza19pZF0gPSByZXNvbHZlXG4gIH0pXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bkxlYXJuaW5nKGFub21hbHlJZDpBbm9tYWx5SWQpIHtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG4gIHNldEFub21hbHlTdGF0dXMoYW5vbWFseUlkLCAnbGVhcm5pbmcnKTtcbiAgbGV0IGFub21hbHk6QW5vbWFseSAgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgbGV0IGFuYWx5dGljc1R5cGUgPSBcImFub21hbGllc1wiO1xuICBsZXQgcHJlc2V0ID0gdW5kZWZpbmVkO1xuICBpZiAoYW5vbWFseS5uYW1lLmluY2x1ZGVzKFwianVtcHNcIikpIHtcbiAgICBhbmFseXRpY3NUeXBlID0gXCJwYXR0ZXJuc1wiO1xuICAgIHByZXNldCA9IFwic3RlcHNcIlxuICB9XG4gIGlmIChhbm9tYWx5Lm5hbWUuaW5jbHVkZXMoXCJjbGlmZnNcIikgfHwgYW5vbWFseS5uYW1lLmluY2x1ZGVzKFwiZHJvcHNcIikpIHtcbiAgICBhbmFseXRpY3NUeXBlID0gXCJwYXR0ZXJuc1wiO1xuICAgIHByZXNldCA9IFwiY2xpZmZzXCJcbiAgfVxuICBpZiAoYW5vbWFseS5uYW1lLmluY2x1ZGVzKFwicGVha3NcIikpIHtcbiAgICBhbmFseXRpY3NUeXBlID0gXCJwYXR0ZXJuc1wiO1xuICAgIHByZXNldCA9IFwicGVha3NcIlxuICB9XG4gIGxldCB0YXNrID0ge1xuICAgIHR5cGU6ICdsZWFybicsXG4gICAgYW5vbWFseV9pZDogYW5vbWFseUlkLFxuICAgIGFuYWx5dGljc190eXBlOiBhbmFseXRpY3NUeXBlLFxuICAgIHByZXNldCxcbiAgICBzZWdtZW50czogc2VnbWVudHNcbiAgfTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgcnVuVGFzayh0YXNrKTtcblxuICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgc2V0QW5vbWFseVN0YXR1cyhhbm9tYWx5SWQsICdyZWFkeScpO1xuICAgIGluc2VydFNlZ21lbnRzKGFub21hbHlJZCwgcmVzdWx0LnNlZ21lbnRzLCBmYWxzZSk7XG4gICAgc2V0QW5vbWFseVByZWRpY3Rpb25UaW1lKGFub21hbHlJZCwgcmVzdWx0Lmxhc3RfcHJlZGljdGlvbl90aW1lKTtcbiAgfSBlbHNlIHtcbiAgICBzZXRBbm9tYWx5U3RhdHVzKGFub21hbHlJZCwgJ2ZhaWxlZCcsIHJlc3VsdC5lcnJvcik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuUHJlZGljdChhbm9tYWx5SWQ6QW5vbWFseUlkKSB7XG4gIGxldCBhbm9tYWx5OkFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgbGV0IGFuYWx5dGljc1R5cGUgPSBcImFub21hbGllc1wiO1xuICBsZXQgcHJlc2V0ID0gdW5kZWZpbmVkO1xuICBpZiAoYW5vbWFseS5uYW1lLmluY2x1ZGVzKFwianVtcFwiKSkge1xuICAgIGFuYWx5dGljc1R5cGUgPSBcInBhdHRlcm5zXCI7XG4gICAgcHJlc2V0ID0gXCJzdGVwc1wiXG4gIH1cbiAgaWYgKGFub21hbHkubmFtZS5pbmNsdWRlcyhcImNsaWZmc1wiKSB8fCBhbm9tYWx5Lm5hbWUuaW5jbHVkZXMoXCJkcm9wc1wiKSkge1xuICAgIGFuYWx5dGljc1R5cGUgPSBcInBhdHRlcm5zXCI7XG4gICAgcHJlc2V0ID0gXCJjbGlmZnNcIlxuICB9XG4gIGlmIChhbm9tYWx5Lm5hbWUuaW5jbHVkZXMoXCJwZWFrc1wiKSkge1xuICAgIGFuYWx5dGljc1R5cGUgPSBcInBhdHRlcm5zXCI7XG4gICAgcHJlc2V0ID0gXCJwZWFrc1wiXG4gIH1cbiAgbGV0IHRhc2sgPSB7XG4gICAgdHlwZTogJ3ByZWRpY3QnLFxuICAgIGFub21hbHlfaWQ6IGFub21hbHlJZCxcbiAgICBhbmFseXRpY3NfdHlwZTogYW5hbHl0aWNzVHlwZSxcbiAgICBwcmVzZXQsXG4gICAgbGFzdF9wcmVkaWN0aW9uX3RpbWU6IGFub21hbHkubGFzdF9wcmVkaWN0aW9uX3RpbWVcbiAgfTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHJ1blRhc2sodGFzayk7XG5cbiAgaWYocmVzdWx0LnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgLy8gTWVyZ2luZyBzZWdtZW50c1xuICBsZXQgc2VnbWVudHMgPSBnZXRMYWJlbGVkU2VnbWVudHMoYW5vbWFseUlkKTtcbiAgaWYoc2VnbWVudHMubGVuZ3RoID4gMCAmJiByZXN1bHQuc2VnbWVudHMubGVuZ3RoID4gMCkge1xuICAgIGxldCBsYXN0T2xkU2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdO1xuICAgIGxldCBmaXJzdE5ld1NlZ21lbnQgPSByZXN1bHQuc2VnbWVudHNbMF07XG5cbiAgICBpZihmaXJzdE5ld1NlZ21lbnQuc3RhcnQgPD0gbGFzdE9sZFNlZ21lbnQuZmluaXNoKSB7XG4gICAgICByZXN1bHQuc2VnbWVudHNbMF0uc3RhcnQgPSBsYXN0T2xkU2VnbWVudC5zdGFydDtcbiAgICAgIHJlbW92ZVNlZ21lbnRzKGFub21hbHlJZCwgW2xhc3RPbGRTZWdtZW50LmlkXSk7XG4gICAgfVxuICB9XG5cbiAgaW5zZXJ0U2VnbWVudHMoYW5vbWFseUlkLCByZXN1bHQuc2VnbWVudHMsIGZhbHNlKTtcbiAgc2V0QW5vbWFseVByZWRpY3Rpb25UaW1lKGFub21hbHlJZCwgcmVzdWx0Lmxhc3RfcHJlZGljdGlvbl90aW1lKTtcbiAgcmV0dXJuIHJlc3VsdC5zZWdtZW50cztcbn1cblxuZXhwb3J0IHsgcnVuTGVhcm5pbmcsIHJ1blByZWRpY3QgfVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc2VydmljZXMvYW5hbHl0aWNzLnRzIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEpzb25EYXRhU3luYywgd3JpdGVKc29uRGF0YVN5bmMgfSAgZnJvbSAnLi9qc29uJztcbmltcG9ydCB7IFNFR01FTlRTX1BBVEggfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgQW5vbWFseUlkLCBsb2FkQW5vbWFseUJ5SWQsIHNhdmVBbm9tYWx5IH0gZnJvbSAnLi9hbm9tYWx5VHlwZSc7XG5cbmZ1bmN0aW9uIGdldExhYmVsZWRTZWdtZW50cyhhbm9tYWx5SWQ6IEFub21hbHlJZCkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oU0VHTUVOVFNfUEFUSCwgYCR7YW5vbWFseUlkfV9sYWJlbGVkLmpzb25gKTtcblxuICBsZXQgc2VnbWVudHMgPSBbXTtcbiAgdHJ5IHtcbiAgICBzZWdtZW50cyA9IGdldEpzb25EYXRhU3luYyhmaWxlbmFtZSk7XG4gICAgZm9yIChsZXQgc2VnbWVudCBvZiBzZWdtZW50cykge1xuICAgICAgaWYgKHNlZ21lbnQubGFiZWxlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNlZ21lbnQubGFiZWxlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcbiAgfVxuICByZXR1cm4gc2VnbWVudHM7XG59XG5cbmZ1bmN0aW9uIGdldFByZWRpY3RlZFNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihTRUdNRU5UU19QQVRILCBgJHthbm9tYWx5SWR9X3NlZ21lbnRzLmpzb25gKTtcblxuICBsZXQganNvbkRhdGE7XG4gIHRyeSB7XG4gICAganNvbkRhdGEgPSBnZXRKc29uRGF0YVN5bmMoZmlsZW5hbWUpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XG4gICAganNvbkRhdGEgPSBbXTtcbiAgfVxuICByZXR1cm4ganNvbkRhdGE7XG59XG5cbmZ1bmN0aW9uIHNhdmVTZWdtZW50cyhhbm9tYWx5SWQ6IEFub21hbHlJZCwgc2VnbWVudHMpIHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKFNFR01FTlRTX1BBVEgsIGAke2Fub21hbHlJZH1fbGFiZWxlZC5qc29uYCk7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWUsIHNlZ21lbnRzKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xuICAgIHRocm93IG5ldyBFcnJvcignQ2FuYHQgd3JpdGUgdG8gZGInKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbnNlcnRTZWdtZW50cyhhbm9tYWx5SWQ6IEFub21hbHlJZCwgYWRkZWRTZWdtZW50cywgbGFiZWxlZDpib29sZWFuKSB7XG4gIC8vIFNldCBzdGF0dXNcbiAgbGV0IGluZm8gPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG5cbiAgbGV0IG5leHRJZCA9IGluZm8ubmV4dF9pZDtcbiAgbGV0IGFkZGVkSWRzID0gW11cbiAgZm9yIChsZXQgc2VnbWVudCBvZiBhZGRlZFNlZ21lbnRzKSB7XG4gICAgc2VnbWVudC5pZCA9IG5leHRJZDtcbiAgICBzZWdtZW50LmxhYmVsZWQgPSBsYWJlbGVkO1xuICAgIGFkZGVkSWRzLnB1c2gobmV4dElkKTtcbiAgICBuZXh0SWQrKztcbiAgICBzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xuICB9XG4gIGluZm8ubmV4dF9pZCA9IG5leHRJZDtcbiAgc2F2ZVNlZ21lbnRzKGFub21hbHlJZCwgc2VnbWVudHMpO1xuICBzYXZlQW5vbWFseShhbm9tYWx5SWQsIGluZm8pO1xuICByZXR1cm4gYWRkZWRJZHM7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkLCByZW1vdmVkU2VnbWVudHMpIHtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG4gIGZvciAobGV0IHNlZ21lbnRJZCBvZiByZW1vdmVkU2VnbWVudHMpIHtcbiAgICBzZWdtZW50cyA9IHNlZ21lbnRzLmZpbHRlcihlbCA9PiBlbC5pZCAhPT0gc2VnbWVudElkKTtcbiAgfVxuICBzYXZlU2VnbWVudHMoYW5vbWFseUlkLCBzZWdtZW50cyk7XG59XG5cbmV4cG9ydCB7IGdldExhYmVsZWRTZWdtZW50cywgZ2V0UHJlZGljdGVkU2VnbWVudHMsIHNhdmVTZWdtZW50cywgaW5zZXJ0U2VnbWVudHMsIHJlbW92ZVNlZ21lbnRzIH1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NlcnZpY2VzL3NlZ21lbnRzLnRzIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdjcnlwdG8nKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2NyeXB0bycpXCJcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBnZXRKc29uRGF0YVN5bmMsIHdyaXRlSnNvbkRhdGFTeW5jIH0gIGZyb20gJy4vanNvbic7XG5pbXBvcnQgeyBNRVRSSUNTX1BBVEggfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5cbmZ1bmN0aW9uIHNhdmVUYXJnZXRzKHRhcmdldHMpIHtcbiAgbGV0IG1ldHJpY3MgPSBbXTtcbiAgZm9yIChsZXQgdGFyZ2V0IG9mIHRhcmdldHMpIHtcbiAgICBtZXRyaWNzLnB1c2goc2F2ZVRhcmdldCh0YXJnZXQpKTtcbiAgfVxuICByZXR1cm4gbWV0cmljcztcbn1cblxuZnVuY3Rpb24gc2F2ZVRhcmdldCh0YXJnZXQpIHtcbiAgLy9jb25zdCBtZDUgPSBjcnlwdG8uY3JlYXRlSGFzaCgnbWQ1JylcbiAgY29uc3QgdGFyZ2V0SWQgPSBjcnlwdG8uY3JlYXRlSGFzaCgnbWQ1JykudXBkYXRlKEpTT04uc3RyaW5naWZ5KHRhcmdldCkpLmRpZ2VzdCgnaGV4Jyk7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihNRVRSSUNTX1BBVEgsIGAke3RhcmdldElkfS5qc29uYCk7XG4gIHdyaXRlSnNvbkRhdGFTeW5jKGZpbGVuYW1lLCB0YXJnZXQpO1xuICByZXR1cm4gdGFyZ2V0SWQ7XG59XG5cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXRJZCkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oTUVUUklDU19QQVRILCBgJHt0YXJnZXRJZH0uanNvbmApO1xuICByZXR1cm4gZ2V0SnNvbkRhdGFTeW5jKGZpbGVuYW1lKTtcbn1cblxuZXhwb3J0IHsgc2F2ZVRhcmdldHMsIGdldFRhcmdldCB9XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zZXJ2aWNlcy9tZXRyaWNzLnRzIiwiLy9pbXBvcnQgKiBhcyBUZWxlZ3JhZiBmcm9tICd0ZWxlZ3JhZidcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBEQVRBX1BBVEggfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgZ2V0SnNvbkRhdGFTeW5jLCB3cml0ZUpzb25EYXRhU3luYyB9IGZyb20gJy4vanNvbic7XG5pbXBvcnQgeyBBbm9tYWx5SWQgfSBmcm9tICcuL2Fub21hbHlUeXBlJztcblxuXG50eXBlIFN1YnNjcmliZXJJZCA9IHN0cmluZztcbnR5cGUgU3Vic2NyaWJlcnNNYXAgPSBNYXA8IEFub21hbHlJZCwgU3Vic2NyaWJlcklkW10gPjtcblxudHlwZSBCb3RDb25maWcgPSB7XG4gIHRva2VuOiBzdHJpbmcsXG4gIHN1YnNjcmlwdGlvbnM6IFN1YnNjcmliZXJzTWFwXG59O1xuXG5mdW5jdGlvbiBzZW5kTm90aWZpY2F0aW9uKGFub21hbHlOYW1lLCBhY3RpdmUpIHtcbiAgY29uc29sZS5sb2coJ05vdGlmaWNhdGlvbiAnICsgYW5vbWFseU5hbWUpO1xuICBpZihhbm9tYWx5TmFtZSBpbiBib3RDb25maWcuc3Vic2NyaXB0aW9ucykge1xuICAgIGxldCBub3RpZmljYXRpb25NZXNzYWdlO1xuICAgIGlmKGFjdGl2ZSkge1xuICAgICAgbm90aWZpY2F0aW9uTWVzc2FnZSA9ICdBbGVydCEgQW5vbWFseSB0eXBlICcgKyBhbm9tYWx5TmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm90aWZpY2F0aW9uTWVzc2FnZSA9ICdPayEgQW5vbWFseSB0eXBlICcgKyBhbm9tYWx5TmFtZTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBTdWJzY3JpYmVySWQgb2YgYm90Q29uZmlnLnN1YnNjcmlwdGlvbnNbYW5vbWFseU5hbWVdKSB7XG4gICAgICBib3QudGVsZWdyYW0uc2VuZE1lc3NhZ2UoU3Vic2NyaWJlcklkLCBub3RpZmljYXRpb25NZXNzYWdlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9hZEJvdENvbmZpZygpIDogQm90Q29uZmlnIHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKERBVEFfUEFUSCwgYGJvdF9jb25maWcuanNvbmApO1xuICBsZXQganNvbkRhdGE7XG4gIHRyeSB7XG4gICAganNvbkRhdGEgPSBnZXRKc29uRGF0YVN5bmMoZmlsZW5hbWUpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XG4gICAganNvbkRhdGEgPSBbXTtcbiAgfVxuICByZXR1cm4ganNvbkRhdGE7XG59XG5cbmZ1bmN0aW9uIHNhdmVCb3RDb25maWcoYm90Q29uZmlnOiBCb3RDb25maWcpIHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKERBVEFfUEFUSCwgYGJvdF9jb25maWcuanNvbmApO1xuICB0cnkge1xuICAgIHdyaXRlSnNvbkRhdGFTeW5jKGZpbGVuYW1lLCBib3RDb25maWcpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XG4gIH1cbn1cblxuY29uc3QgY29tbWFuZEFyZ3MgPSAoY3R4LCBuZXh0KSA9PiB7XG4gIHRyeSB7XG4gICAgaWYoY3R4LnVwZGF0ZVR5cGUgPT09ICdtZXNzYWdlJykge1xuICAgICAgY29uc3QgdGV4dCA9IGN0eC51cGRhdGUubWVzc2FnZS50ZXh0O1xuICAgICAgaWYodGV4dCAhPT0gdW5kZWZpbmVkICYmIHRleHQuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdGV4dC5tYXRjaCgvXlxcLyhbXlxcc10rKVxccz8oLispPy8pO1xuICAgICAgICBsZXQgYXJncyA9IFtdO1xuICAgICAgICBsZXQgY29tbWFuZDtcbiAgICAgICAgaWYobWF0Y2ggIT09IG51bGwpIHtcbiAgICAgICAgICBpZihtYXRjaFsxXSkge1xuICAgICAgICAgICAgY29tbWFuZCA9IG1hdGNoWzFdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihtYXRjaFsyXSkge1xuICAgICAgICAgICAgYXJncyA9IG1hdGNoWzJdLnNwbGl0KCcgJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGN0eC5zdGF0ZS5jb21tYW5kID0ge1xuICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICBjb21tYW5kLFxuICAgICAgICAgIGFyZ3MsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXh0KGN0eCk7XG4gIH0gY2F0Y2ggKGUpIHtcblxuICB9XG59O1xuXG5mdW5jdGlvbiBhZGROb3RpZmljYXRpb24oY3R4KSB7XG4gIGNvbnNvbGUubG9nKCdhZGROb3RpZmljYXRpb24nKVxuICBsZXQgY29tbWFuZCA9IGN0eC5zdGF0ZS5jb21tYW5kO1xuICBsZXQgY2hhdElkID0gY3R4LmNoYXQuaWQ7XG4gIGlmKGNvbW1hbmQuYXJncy5sZW5ndGggPiAwKSB7XG4gICAgZm9yIChsZXQgYW5vbWFseU5hbWUgb2YgY29tbWFuZC5hcmdzKSB7XG4gICAgICBpZighKGFub21hbHlOYW1lIGluIGJvdENvbmZpZy5zdWJzY3JpcHRpb25zKSkge1xuICAgICAgICBib3RDb25maWcuc3Vic2NyaXB0aW9uc1thbm9tYWx5TmFtZV0gPSBbXVxuICAgICAgfVxuICAgICAgaWYoYm90Q29uZmlnLnN1YnNjcmlwdGlvbnNbYW5vbWFseU5hbWVdLmluY2x1ZGVzKGNoYXRJZCkpIHtcbiAgICAgICAgcmV0dXJuIGN0eC5yZXBseSgnWW91IGFyZSBhbHJlYWR5IHN1YnNjcmliZWQgb24gYWxlcnRzIGZyb20gYW5vbWFseSAnICsgY29tbWFuZC5hcmdzKVxuICAgICAgfSAgZWxzZSB7XG4gICAgICAgIGJvdENvbmZpZy5zdWJzY3JpcHRpb25zW2Fub21hbHlOYW1lXS5wdXNoKGNoYXRJZCk7XG4gICAgICAgIHNhdmVCb3RDb25maWcoYm90Q29uZmlnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN0eC5yZXBseSgnWW91IGhhdmUgYmVlbiBzdWNjZXNzZnVsbHkgc3Vic2NyaWJlZCBvbiBhbGVydHMgZnJvbSBhbm9tYWx5ICcgKyBjb21tYW5kLmFyZ3MpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGN0eC5yZXBseSgnWW91IHNob3VsZCB1c2Ugc3ludGF4OiBcXC9hZGROb3RpZmljYXRpb24gPGFub21hbHlfbmFtZT4nKVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5vdGlmaWNhdGlvbihjdHgpIHtcbiAgbGV0IGNvbW1hbmQgPSBjdHguc3RhdGUuY29tbWFuZDtcbiAgbGV0IGNoYXRJZCA9IGN0eC5jaGF0LmlkO1xuICBpZihjb21tYW5kLmFyZ3MubGVuZ3RoID4gMCkge1xuICAgIGZvciAobGV0IGFub21hbHlOYW1lIG9mIGNvbW1hbmQuYXJncykge1xuICAgICAgaWYoYW5vbWFseU5hbWUgaW4gYm90Q29uZmlnLnN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgYm90Q29uZmlnLnN1YnNjcmlwdGlvbnNbYW5vbWFseU5hbWVdID0gYm90Q29uZmlnLnN1YnNjcmlwdGlvbnNbYW5vbWFseU5hbWVdLmZpbHRlcihlbCA9PiBlbCAhPT0gY2hhdElkKTtcbiAgICAgICAgc2F2ZUJvdENvbmZpZyhib3RDb25maWcpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3R4LnJlcGx5KCdZb3UgaGF2ZSBiZWVuIHN1Y2Nlc3NmdWxseSB1bnN1YnNjcmliZWQgZnJvbSBhbGVydHMgZnJvbSAnICsgY29tbWFuZC5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY3R4LnJlcGx5KCdZb3Ugc2hvdWxkIHVzZSBzeW50YXg6IFxcL3JlbW92ZU5vdGlmaWNhdGlvbiA8YW5vbWFseV9uYW1lPicpO1xuICB9XG59XG5cbi8vIGNvbnN0IFRlbGVncmFmID0gcmVxdWlyZSgndGVsZWdyYWYnKTtcbmxldCBib3RDb25maWc6IEJvdENvbmZpZztcbmxldCBib3Q7XG5cbmZ1bmN0aW9uIHRnQm90SW5pdCgpIHtcbiAgdHJ5IHtcbiAgICAvLyBib3RDb25maWcgPSBsb2FkQm90Q29uZmlnKCk7XG4gICAgLy8gYm90ID0gbmV3IFRlbGVncmFmKGJvdENvbmZpZy50b2tlbik7XG5cbiAgICAvLyBib3QudXNlKGNvbW1hbmRBcmdzKTtcblxuICAgIC8vIGJvdC5jb21tYW5kKCdhZGROb3RpZmljYXRpb24nLCBhZGROb3RpZmljYXRpb24pO1xuICAgIC8vIGJvdC5jb21tYW5kKCdyZW1vdmVOb3RpZmljYXRpb24nLCByZW1vdmVOb3RpZmljYXRpb24pO1xuXG4gICAgLy8gYm90LnN0YXJ0UG9sbGluZygpO1xuICB9IGNhdGNoKGUpIHtcbiAgICAvLyBUT0RPOiBoYW5kbGUgZXhjZXB0aW9uXG4gIH1cbn1cblxuZXhwb3J0IHsgc2VuZE5vdGlmaWNhdGlvbiwgdGdCb3RJbml0IH1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NlcnZpY2VzL25vdGlmaWNhdGlvbi50cyIsImltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgKiBhcyBib2R5UGFyc2VyIGZyb20gJ2JvZHktcGFyc2VyJztcblxuaW1wb3J0IHsgcm91dGVyIGFzIGFub21hbGllc1JvdXRlciB9IGZyb20gJy4vcm91dGVzL2Fub21hbGllcyc7XG5pbXBvcnQgeyByb3V0ZXIgYXMgc2VnbWVudHNSb3V0ZXIgfSBmcm9tICcuL3JvdXRlcy9zZWdtZW50cyc7XG5pbXBvcnQgeyByb3V0ZXIgYXMgYWxlcnRzUm91dGVyIH0gZnJvbSAnLi9yb3V0ZXMvYWxlcnRzJztcbmltcG9ydCB7IHRnQm90SW5pdCB9IGZyb20gJy4vc2VydmljZXMvbm90aWZpY2F0aW9uJztcblxuY29uc3QgYXBwID0gZXhwcmVzcygpO1xuY29uc3QgUE9SVCA9IHByb2Nlc3MuZW52LkhBU1RJQ19QT1JUIHx8IDgwMDA7XG5cbmFwcC51c2UoYm9keVBhcnNlci5qc29uKCkpO1xuYXBwLnVzZShib2R5UGFyc2VyLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSB9KSk7XG5cbmFwcC51c2UoZnVuY3Rpb24gKHJlcSwgcmVzLCBuZXh0KSB7XG4gIHJlcy5oZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gIHJlcy5oZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgcmVzLmhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdPcmlnaW4sIFgtUmVxdWVzdGVkLVdpdGgsIENvbnRlbnQtVHlwZSwgQWNjZXB0Jyk7XG4gIG5leHQoKTtcbn0pO1xuXG5hcHAudXNlKCcvYW5vbWFsaWVzJywgYW5vbWFsaWVzUm91dGVyKTtcbmFwcC51c2UoJy9zZWdtZW50cycsIHNlZ21lbnRzUm91dGVyKTtcbmFwcC51c2UoJy9hbGVydHMnLCBhbGVydHNSb3V0ZXIpO1xuYXBwLnVzZSgnLycsIChyZXEsIHJlcykgPT4gcmVzLnNlbmQoeyBzdGF0dXM6ICdPSycgfSkpO1xuXG5hcHAubGlzdGVuKFBPUlQsICgpID0+IHtcbiAgY29uc29sZS5sb2coYFNlcnZlciBpcyBydW5uaW5nIG9uIDoke1BPUlR9YClcbn0pO1xuXG50Z0JvdEluaXQoKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2luZGV4LnRzIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdib2R5LXBhcnNlcicpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgnYm9keS1wYXJzZXInKVwiXG4vLyBtb2R1bGUgaWQgPSAxNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgKiBhcyBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuXG5pbXBvcnQge1xuICBEYXRhc291cmNlLFxuICBNZXRyaWMsXG4gIEFub21hbHksXG4gIHNhdmVBbm9tYWx5LFxuICBpbnNlcnRBbm9tYWx5LCByZW1vdmVBbm9tYWx5LCBsb2FkQW5vbWFseUJ5TmFtZSwgbG9hZEFub21hbHlCeUlkLCBnZXRBbm9tYWx5SWRCeU5hbWVcbn0gZnJvbSAnLi4vc2VydmljZXMvYW5vbWFseVR5cGUnO1xuaW1wb3J0IHsgcnVuTGVhcm5pbmcgfSBmcm9tICcuLi9zZXJ2aWNlcy9hbmFseXRpY3MnXG5pbXBvcnQgeyBzYXZlVGFyZ2V0cyB9IGZyb20gJy4uL3NlcnZpY2VzL21ldHJpY3MnO1xuXG5hc3luYyBmdW5jdGlvbiBzZW5kQW5vbWFseVR5cGVTdGF0dXMocmVxLCByZXMpIHtcbiAgbGV0IGlkID0gcmVxLnF1ZXJ5LmlkO1xuICBsZXQgbmFtZSA9IHJlcS5xdWVyeS5uYW1lO1xuICB0cnkge1xuICAgIGxldCBhbm9tYWx5OiBBbm9tYWx5O1xuICAgIGlmKGlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbm9tYWx5ID0gbG9hZEFub21hbHlCeU5hbWUobmFtZSk7XG4gICAgfVxuICAgIGlmKGFub21hbHkgPT09IG51bGwpIHtcbiAgICAgIHJlcy5zdGF0dXMoNDA0KS5zZW5kKHtcbiAgICAgICAgY29kZTogNDA0LFxuICAgICAgICBtZXNzYWdlOiAnTm90IGZvdW5kJ1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKGFub21hbHkuc3RhdHVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gc3RhdHVzIGZvciAnICsgbmFtZSk7XG4gICAgfVxuICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKHsgc3RhdHVzOiBhbm9tYWx5LnN0YXR1cywgZXJyb3JNZXNzYWdlOiBhbm9tYWx5LmVycm9yIH0pO1xuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIC8vIFRPRE86IGJldHRlciBzZW5kIDQwNCB3aGVuIHdlIGtub3cgdGhhbiBpc25gdCBmb3VuZFxuICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKHsgZXJyb3I6ICdDYW5gdCByZXR1cm4gYW55dGhpbmcnIH0pO1xuICB9XG5cbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0QW5vbWFseShyZXEsIHJlcykge1xuICB0cnkge1xuICAgIGxldCBpZCA9IHJlcS5xdWVyeS5pZDtcbiAgICBsZXQgbmFtZSA9IHJlcS5xdWVyeS5uYW1lO1xuXG4gICAgbGV0IGFub21hbHk6QW5vbWFseTtcbiAgICBpZihpZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhbm9tYWx5ID0gbG9hZEFub21hbHlCeUlkKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYW5vbWFseSA9IGxvYWRBbm9tYWx5QnlOYW1lKG5hbWUudG9Mb3dlckNhc2UoKSk7XG4gICAgfVxuICAgIGlmKGFub21hbHkgPT09IG51bGwpIHtcbiAgICAgIHJlcy5zdGF0dXMoNDA0KS5zZW5kKHtcbiAgICAgICAgY29kZTogNDA0LFxuICAgICAgICBtZXNzYWdlOiAnTm90IGZvdW5kJ1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHBheWxvYWQgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBuYW1lOiBhbm9tYWx5Lm5hbWUsXG4gICAgICBtZXRyaWM6IGFub21hbHkubWV0cmljLFxuICAgICAgc3RhdHVzOiBhbm9tYWx5LnN0YXR1c1xuICAgIH0pO1xuICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKHBheWxvYWQpXG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgLy8gVE9ETzogYmV0dGVyIHNlbmQgNDA0IHdoZW4gd2Uga25vdyB0aGFuIGlzbmB0IGZvdW5kXG4gICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoJ0NhbmB0IGdldCBhbnl0aGluZycpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUFub21hbHkocmVxLCByZXMpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBtZXRyaWM6TWV0cmljID0ge1xuICAgICAgZGF0YXNvdXJjZTogcmVxLmJvZHkubWV0cmljLmRhdGFzb3VyY2UsXG4gICAgICB0YXJnZXRzOiBzYXZlVGFyZ2V0cyhyZXEuYm9keS5tZXRyaWMudGFyZ2V0cylcbiAgICB9O1xuXG4gICAgY29uc3QgYW5vbWFseTpBbm9tYWx5ID0ge1xuICAgICAgbmFtZTogcmVxLmJvZHkubmFtZSxcbiAgICAgIHBhbmVsVXJsOiByZXEuYm9keS5wYW5lbFVybCxcbiAgICAgIG1ldHJpYzogbWV0cmljLFxuICAgICAgZGF0YXNvdXJjZTogcmVxLmJvZHkuZGF0YXNvdXJjZSxcbiAgICAgIHN0YXR1czogJ2xlYXJuaW5nJyxcbiAgICAgIGxhc3RfcHJlZGljdGlvbl90aW1lOiAwLFxuICAgICAgbmV4dF9pZDogMFxuICAgIH07XG4gICAgbGV0IGFub21hbHlJZCA9IGluc2VydEFub21hbHkoYW5vbWFseSk7XG4gICAgaWYoYW5vbWFseUlkID09PSBudWxsKSB7XG4gICAgICByZXMuc3RhdHVzKDQwMykuc2VuZCh7XG4gICAgICAgIGNvZGU6IDQwMyxcbiAgICAgICAgbWVzc2FnZTogJ0FscmVhZHkgZXhpc3RzJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgbGV0IHBheWxvYWQgPSBKU09OLnN0cmluZ2lmeSh7IGFub21hbHlfaWQ6IGFub21hbHlJZCB9KVxuICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKHBheWxvYWQpO1xuXG4gICAgcnVuTGVhcm5pbmcoYW5vbWFseUlkKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoe1xuICAgICAgY29kZTogNTAwLFxuICAgICAgbWVzc2FnZTogJ0ludGVybmFsIGVycm9yJ1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlbGV0ZUFub21hbHkocmVxLCByZXMpIHtcbiAgdHJ5IHtcbiAgICBsZXQgaWQgPSByZXEucXVlcnkuaWQ7XG4gICAgbGV0IG5hbWUgPSByZXEucXVlcnkubmFtZTtcblxuICAgIGlmKGlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlbW92ZUFub21hbHkoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmVBbm9tYWx5KG5hbWUudG9Mb3dlckNhc2UoKSk7XG4gICAgfVxuICAgIFxuICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKHtcbiAgICAgIGNvZGU6IDIwMCxcbiAgICAgIG1lc3NhZ2U6ICdTdWNjZXNzJ1xuICAgIH0pO1xuICB9IGNhdGNoKGUpIHtcbiAgICByZXMuc3RhdHVzKDUwMCkuc2VuZCh7XG4gICAgICBjb2RlOiA1MDAsXG4gICAgICBtZXNzYWdlOiAnSW50ZXJuYWwgZXJyb3InXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbnJvdXRlci5nZXQoJy9zdGF0dXMnLCBzZW5kQW5vbWFseVR5cGVTdGF0dXMpO1xucm91dGVyLmdldCgnLycsIGdldEFub21hbHkpO1xucm91dGVyLnBvc3QoJy8nLCBjcmVhdGVBbm9tYWx5KTtcbnJvdXRlci5kZWxldGUoJy8nLCBkZWxldGVBbm9tYWx5KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3JvdXRlcy9hbm9tYWxpZXMudHMiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKVwiXG4vLyBtb2R1bGUgaWQgPSAxOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2V2ZW50LXN0cmVhbScpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgnZXZlbnQtc3RyZWFtJylcIlxuLy8gbW9kdWxlIGlkID0gMTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCB7XG4gIGdldExhYmVsZWRTZWdtZW50cyxcbiAgaW5zZXJ0U2VnbWVudHMsXG4gIHJlbW92ZVNlZ21lbnRzLFxufSBmcm9tICcuLi9zZXJ2aWNlcy9zZWdtZW50cyc7XG5pbXBvcnQge3J1bkxlYXJuaW5nfSBmcm9tICcuLi9zZXJ2aWNlcy9hbmFseXRpY3MnO1xuaW1wb3J0IHtBbm9tYWx5LCBBbm9tYWx5SWQsIGdldEFub21hbHlJZEJ5TmFtZSwgbG9hZEFub21hbHlCeUlkfSBmcm9tICcuLi9zZXJ2aWNlcy9hbm9tYWx5VHlwZSc7XG5cblxuYXN5bmMgZnVuY3Rpb24gc2VuZFNlZ21lbnRzKHJlcSwgcmVzKSB7XG4gIHRyeSB7XG4gICAgbGV0IGFub21hbHlJZDogQW5vbWFseUlkID0gcmVxLnF1ZXJ5LmFub21hbHlfaWQ7XG4gICAgbGV0IGFub21hbHk6QW5vbWFseSA9IGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQpO1xuICAgIGlmKGFub21hbHkgPT09IG51bGwpIHtcbiAgICAgIGFub21hbHlJZCA9IGdldEFub21hbHlJZEJ5TmFtZShhbm9tYWx5SWQpO1xuICAgIH1cblxuICAgIGxldCBsYXN0U2VnbWVudElkID0gcmVxLnF1ZXJ5Lmxhc3Rfc2VnbWVudDtcbiAgICBsZXQgdGltZUZyb20gPSByZXEucXVlcnkuZnJvbTtcbiAgICBsZXQgdGltZVRvID0gcmVxLnF1ZXJ5LnRvO1xuXG4gICAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG5cbiAgICAvLyBJZCBmaWx0ZXJpbmdcbiAgICBpZihsYXN0U2VnbWVudElkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHNlZ21lbnRzID0gc2VnbWVudHMuZmlsdGVyKGVsID0+IGVsLmlkID4gbGFzdFNlZ21lbnRJZCk7XG4gICAgfVxuXG4gICAgLy8gVGltZSBmaWx0ZXJpbmdcbiAgICBpZih0aW1lRnJvbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzZWdtZW50cyA9IHNlZ21lbnRzLmZpbHRlcihlbCA9PiBlbC5maW5pc2ggPiB0aW1lRnJvbSk7XG4gICAgfVxuXG4gICAgaWYodGltZVRvICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHNlZ21lbnRzID0gc2VnbWVudHMuZmlsdGVyKGVsID0+IGVsLnN0YXJ0IDwgdGltZVRvKTtcbiAgICB9XG5cbiAgICBsZXQgcGF5bG9hZCA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIHNlZ21lbnRzXG4gICAgfSk7XG4gICAgcmVzLnN0YXR1cygyMDApLnNlbmQocGF5bG9hZCk7XG4gIH0gY2F0Y2goZSkge1xuICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKHtcbiAgICAgIGNvZGU6IDUwMCxcbiAgICAgIG1lc3NhZ2U6ICdJbnRlcm5hbCBlcnJvcidcbiAgICB9KTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVTZWdtZW50cyhyZXEsIHJlcykge1xuICB0cnkge1xuICAgIGxldCBzZWdtZW50c1VwZGF0ZSA9IHJlcS5ib2R5O1xuXG4gICAgbGV0IGFub21hbHlJZCA9IHNlZ21lbnRzVXBkYXRlLmFub21hbHlfaWQ7XG4gICAgbGV0IGFub21hbHlOYW1lID0gc2VnbWVudHNVcGRhdGUubmFtZTtcblxuICAgIGlmKGFub21hbHlJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBhbm9tYWx5SWQgPSBnZXRBbm9tYWx5SWRCeU5hbWUoYW5vbWFseU5hbWUudG9Mb3dlckNhc2UoKSk7XG4gICAgfVxuXG4gICAgbGV0IGFkZGVkSWRzID0gaW5zZXJ0U2VnbWVudHMoYW5vbWFseUlkLCBzZWdtZW50c1VwZGF0ZS5hZGRlZF9zZWdtZW50cywgdHJ1ZSk7XG4gICAgcmVtb3ZlU2VnbWVudHMoYW5vbWFseUlkLCBzZWdtZW50c1VwZGF0ZS5yZW1vdmVkX3NlZ21lbnRzKTtcblxuICAgIGxldCBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoeyBhZGRlZF9pZHM6IGFkZGVkSWRzIH0pO1xuICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKHBheWxvYWQpO1xuXG4gICAgcnVuTGVhcm5pbmcoYW5vbWFseUlkKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoe1xuICAgICAgY29kZTogNTAwLFxuICAgICAgbWVzc2FnZTogJ0ludGVybmFsIGVycm9yJ1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG5yb3V0ZXIuZ2V0KCcvJywgc2VuZFNlZ21lbnRzKTtcbnJvdXRlci5wYXRjaCgnLycsIHVwZGF0ZVNlZ21lbnRzKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3JvdXRlcy9zZWdtZW50cy50cyIsImltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQge0Fub21hbHlJZCwgZ2V0QW5vbWFseUlkQnlOYW1lLCBsb2FkQW5vbWFseUJ5SWR9IGZyb20gJy4uL3NlcnZpY2VzL2Fub21hbHlUeXBlJztcbmltcG9ydCB7IGdldEFsZXJ0c0Fub21hbGllcywgc2F2ZUFsZXJ0c0Fub21hbGllcyB9IGZyb20gJy4uL3NlcnZpY2VzL2FsZXJ0cyc7XG5cbmZ1bmN0aW9uIGdldEFsZXJ0KHJlcSwgcmVzKSB7XG4gIHRyeSB7XG4gICAgbGV0IGFub21hbHlJZDogQW5vbWFseUlkID0gcmVxLnF1ZXJ5LmFub21hbHlfaWQ7XG4gICAgbGV0IGFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKVxuICAgIGlmIChhbm9tYWx5ID09IG51bGwpIHtcbiAgICAgIGFub21hbHlJZCA9IGdldEFub21hbHlJZEJ5TmFtZShhbm9tYWx5SWQudG9Mb3dlckNhc2UoKSk7XG4gICAgfVxuXG4gICAgbGV0IGFsZXJ0c0Fub21hbGllcyA9IGdldEFsZXJ0c0Fub21hbGllcygpO1xuICAgIGxldCBwb3MgPSBhbGVydHNBbm9tYWxpZXMuaW5kZXhPZihhbm9tYWx5SWQpO1xuXG4gICAgbGV0IGVuYWJsZTogYm9vbGVhbiA9IChwb3MgIT09IC0xKTtcbiAgICByZXMuc3RhdHVzKDIwMCkuc2VuZCh7XG4gICAgICBlbmFibGVcbiAgICB9KTtcbiAgfSBjYXRjaChlKSB7XG4gICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoe1xuICAgICAgY29kZTogNTAwLFxuICAgICAgbWVzc2FnZTogJ0ludGVybmFsIGVycm9yJ1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoYW5nZUFsZXJ0KHJlcSwgcmVzKSB7XG4gIHRyeSB7XG4gICAgbGV0IGFub21hbHlJZDogQW5vbWFseUlkID0gcmVxLmJvZHkuYW5vbWFseV9pZDtcbiAgICBsZXQgZW5hYmxlOiBib29sZWFuID0gcmVxLmJvZHkuZW5hYmxlO1xuXG4gICAgbGV0IGFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKVxuICAgIGlmIChhbm9tYWx5ID09IG51bGwpIHtcbiAgICAgIGFub21hbHlJZCA9IGdldEFub21hbHlJZEJ5TmFtZShhbm9tYWx5SWQudG9Mb3dlckNhc2UoKSk7XG4gICAgfVxuXG4gICAgbGV0IGFsZXJ0c0Fub21hbGllcyA9IGdldEFsZXJ0c0Fub21hbGllcygpO1xuICAgIGxldCBwb3M6IG51bWJlciA9IGFsZXJ0c0Fub21hbGllcy5pbmRleE9mKGFub21hbHlJZCk7XG4gICAgaWYoZW5hYmxlICYmIHBvcyA9PSAtMSkge1xuICAgICAgYWxlcnRzQW5vbWFsaWVzLnB1c2goYW5vbWFseUlkKTtcbiAgICAgIHNhdmVBbGVydHNBbm9tYWxpZXMoYWxlcnRzQW5vbWFsaWVzKTtcbiAgICB9IGVsc2UgaWYoIWVuYWJsZSAmJiBwb3MgPiAtMSkge1xuICAgICAgYWxlcnRzQW5vbWFsaWVzLnNwbGljZShwb3MsIDEpO1xuICAgICAgc2F2ZUFsZXJ0c0Fub21hbGllcyhhbGVydHNBbm9tYWxpZXMpO1xuICAgIH1cbiAgICByZXMuc3RhdHVzKDIwMCkuc2VuZCh7XG4gICAgICBzdGF0dXM6ICdPaydcbiAgICB9KTtcbiAgfSBjYXRjaChlKSB7XG4gICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoe1xuICAgICAgY29kZTogNTAwLFxuICAgICAgbWVzc2FnZTogJ0ludGVybmFsIGVycm9yJ1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG5yb3V0ZXIuZ2V0KCcvJywgZ2V0QWxlcnQpO1xucm91dGVyLnBvc3QoJy8nLCBjaGFuZ2VBbGVydCk7XG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3JvdXRlcy9hbGVydHMudHMiLCJpbXBvcnQgeyBnZXRKc29uRGF0YVN5bmMsIHdyaXRlSnNvbkRhdGFTeW5jIH0gZnJvbSAnLi9qc29uJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBBbm9tYWx5SWQgfSBmcm9tICcuL2Fub21hbHlUeXBlJztcbmltcG9ydCB7IEFOT01BTElFU19QQVRIIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7IHJ1blByZWRpY3QgfSBmcm9tICcuL2FuYWx5dGljcyc7XG5pbXBvcnQgeyBzZW5kTm90aWZpY2F0aW9uIH0gZnJvbSAnLi9ub3RpZmljYXRpb24nO1xuaW1wb3J0IHsgZ2V0TGFiZWxlZFNlZ21lbnRzIH0gZnJvbSAnLi9zZWdtZW50cyc7XG5cbmZ1bmN0aW9uIGdldEFsZXJ0c0Fub21hbGllcygpIDogQW5vbWFseUlkW10ge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGBhbGVydHNfYW5vbWFsaWVzLmpzb25gKTtcbiAgaWYoIWZzLmV4aXN0c1N5bmMoZmlsZW5hbWUpKSB7XG4gICAgc2F2ZUFsZXJ0c0Fub21hbGllcyhbXSk7XG4gIH1cbiAgcmV0dXJuIGdldEpzb25EYXRhU3luYyhwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGBhbGVydHNfYW5vbWFsaWVzLmpzb25gKSk7XG59XG5cbmZ1bmN0aW9uIHNhdmVBbGVydHNBbm9tYWxpZXMoYW5vbWFsaWVzOiBBbm9tYWx5SWRbXSkge1xuICByZXR1cm4gd3JpdGVKc29uRGF0YVN5bmMocGF0aC5qb2luKEFOT01BTElFU19QQVRILCBgYWxlcnRzX2Fub21hbGllcy5qc29uYCksIGFub21hbGllcyk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NBbGVydHMoYW5vbWFseUlkKSB7XG4gIGxldCBzZWdtZW50cyA9IGdldExhYmVsZWRTZWdtZW50cyhhbm9tYWx5SWQpO1xuXG4gIGNvbnN0IGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIGNvbnN0IGFjdGl2ZUFsZXJ0ID0gYWN0aXZlQWxlcnRzLmhhcyhhbm9tYWx5SWQpO1xuICBsZXQgbmV3QWN0aXZlQWxlcnQgPSBmYWxzZTtcblxuICBpZihzZWdtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgbGV0IGxhc3RTZWdtZW50ID0gc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV07XG4gICAgaWYobGFzdFNlZ21lbnQuZmluaXNoID49IGN1cnJlbnRUaW1lIC0gYWxlcnRUaW1lb3V0KSB7XG4gICAgICBuZXdBY3RpdmVBbGVydCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYoIWFjdGl2ZUFsZXJ0ICYmIG5ld0FjdGl2ZUFsZXJ0KSB7XG4gICAgYWN0aXZlQWxlcnRzLmFkZChhbm9tYWx5SWQpO1xuICAgIHNlbmROb3RpZmljYXRpb24oYW5vbWFseUlkLCB0cnVlKTtcbiAgfSBlbHNlIGlmKGFjdGl2ZUFsZXJ0ICYmICFuZXdBY3RpdmVBbGVydCkge1xuICAgIGFjdGl2ZUFsZXJ0cy5kZWxldGUoYW5vbWFseUlkKTtcbiAgICBzZW5kTm90aWZpY2F0aW9uKGFub21hbHlJZCwgZmFsc2UpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFsZXJ0c1RpY2soKSB7XG4gIGxldCBhbGVydHNBbm9tYWxpZXMgPSBnZXRBbGVydHNBbm9tYWxpZXMoKTtcbiAgZm9yIChsZXQgYW5vbWFseUlkIG9mIGFsZXJ0c0Fub21hbGllcykge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW5QcmVkaWN0KGFub21hbHlJZCk7XG4gICAgICBwcm9jZXNzQWxlcnRzKGFub21hbHlJZCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgc2V0VGltZW91dChhbGVydHNUaWNrLCA1MDAwKTtcbn1cblxuY29uc3QgYWxlcnRUaW1lb3V0ID0gNjAwMDA7IC8vIG1zXG5jb25zdCBhY3RpdmVBbGVydHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbnNldFRpbWVvdXQoYWxlcnRzVGljaywgNTAwMCk7XG5cblxuZXhwb3J0IHsgZ2V0QWxlcnRzQW5vbWFsaWVzLCBzYXZlQWxlcnRzQW5vbWFsaWVzIH1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NlcnZpY2VzL2FsZXJ0cy50cyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnYmFiZWwtcnVudGltZS9jb3JlLWpzL3NldCcpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgnYmFiZWwtcnVudGltZS9jb3JlLWpzL3NldCcpXCJcbi8vIG1vZHVsZSBpZCA9IDIzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=