/******/ (function(modules) { // webpackBootstrap
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
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/config.ts":
/*!***********************!*\
  !*** ./src/config.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const path = __webpack_require__(/*! path */ "path");
exports.ANALYTICS_PATH = path.join(__dirname, '../../analytics');
exports.DATA_PATH = path.join(__dirname, '../../data');
exports.DATASETS_PATH = path.join(exports.DATA_PATH, 'datasets');
exports.ANOMALIES_PATH = path.join(exports.DATA_PATH, 'anomalies');
exports.MODELS_PATH = path.join(exports.DATA_PATH, 'models');
exports.METRICS_PATH = path.join(exports.DATA_PATH, 'metrics');
exports.SEGMENTS_PATH = path.join(exports.DATA_PATH, 'segments');

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
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
const Koa = __webpack_require__(/*! koa */ "koa");
const Router = __webpack_require__(/*! koa-router */ "koa-router");
const bodyParser = __webpack_require__(/*! koa-bodyparser */ "koa-bodyparser");
const anomalies_1 = __webpack_require__(/*! ./routes/anomalies */ "./src/routes/anomalies.ts");
const segments_1 = __webpack_require__(/*! ./routes/segments */ "./src/routes/segments.ts");
const alerts_1 = __webpack_require__(/*! ./routes/alerts */ "./src/routes/alerts.ts");
const data_1 = __webpack_require__(/*! ./services/data */ "./src/services/data.ts");
data_1.checkDataFolders();
var app = new Koa();
const PORT = process.env.HASTIC_PORT || 8000;
app.use(bodyParser());
app.use(function (ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
});
var rootRouter = new Router();
rootRouter.use('/anomalies', anomalies_1.router.routes(), anomalies_1.router.allowedMethods());
rootRouter.use('/segments', segments_1.router.routes(), segments_1.router.allowedMethods());
rootRouter.use('/alerts', alerts_1.router.routes(), alerts_1.router.allowedMethods());
rootRouter.get('/', ctx => __awaiter(undefined, void 0, void 0, function* () {
    ctx.response.body = { status: 'Ok ok' };
}));
app.use(rootRouter.routes()).use(rootRouter.allowedMethods());
app.listen(PORT, () => {
    console.log(`Server is running on :${PORT}`);
});

/***/ }),

/***/ "./src/routes/alerts.ts":
/*!******************************!*\
  !*** ./src/routes/alerts.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const anomalyType_1 = __webpack_require__(/*! ../services/anomalyType */ "./src/services/anomalyType.ts");
const alerts_1 = __webpack_require__(/*! ../services/alerts */ "./src/services/alerts.ts");
const Router = __webpack_require__(/*! koa-router */ "koa-router");
function getAlert(ctx) {
    let anomalyId = ctx.request.query.anomaly_id;
    let anomaly = anomalyType_1.loadAnomalyById(anomalyId);
    if (anomaly == null) {
        anomalyId = anomalyType_1.getAnomalyIdByName(anomalyId.toLowerCase());
    }
    let alertsAnomalies = alerts_1.getAlertsAnomalies();
    let pos = alertsAnomalies.indexOf(anomalyId);
    let enable = pos !== -1;
    ctx.response.body = { enable };
}
function changeAlert(ctx) {
    let anomalyId = ctx.request.body.anomaly_id;
    let enable = ctx.request.body.enable;
    let anomaly = anomalyType_1.loadAnomalyById(anomalyId);
    if (anomaly == null) {
        anomalyId = anomalyType_1.getAnomalyIdByName(anomalyId.toLowerCase());
    }
    let alertsAnomalies = alerts_1.getAlertsAnomalies();
    let pos = alertsAnomalies.indexOf(anomalyId);
    if (enable && pos == -1) {
        alertsAnomalies.push(anomalyId);
        alerts_1.saveAlertsAnomalies(alertsAnomalies);
    } else if (!enable && pos > -1) {
        alertsAnomalies.splice(pos, 1);
        alerts_1.saveAlertsAnomalies(alertsAnomalies);
    }
    ctx.response.body = { status: 'OK' };
}
exports.router = new Router();
exports.router.get('/', getAlert);
exports.router.post('/', changeAlert);

/***/ }),

/***/ "./src/routes/anomalies.ts":
/*!*********************************!*\
  !*** ./src/routes/anomalies.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
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
const Router = __webpack_require__(/*! koa-router */ "koa-router");
const anomalyType_1 = __webpack_require__(/*! ../services/anomalyType */ "./src/services/anomalyType.ts");
const analytics_1 = __webpack_require__(/*! ../services/analytics */ "./src/services/analytics.ts");
const metrics_1 = __webpack_require__(/*! ../services/metrics */ "./src/services/metrics.ts");
function sendAnomalyTypeStatus(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = ctx.request.query.id;
        let name = ctx.request.query.name;
        try {
            let anomaly;
            if (id !== undefined) {
                anomaly = anomalyType_1.loadAnomalyById(id);
            } else {
                anomaly = anomalyType_1.loadAnomalyByName(name);
            }
            if (anomaly === null) {
                ctx.response.status = 404;
                return;
            }
            if (anomaly.status === undefined) {
                throw new Error('No status for ' + name);
            }
            ctx.response.body = { status: anomaly.status, errorMessage: anomaly.error };
        } catch (e) {
            console.error(e);
            // TODO: better send 404 when we know than isn`t found
            ctx.response.status = 500;
            ctx.response.body = { error: 'Can`t return anything' };
        }
    });
}
function getAnomaly(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let id = ctx.request.query.id;
            let name = ctx.request.query.name;
            let anomaly;
            if (id !== undefined) {
                anomaly = anomalyType_1.loadAnomalyById(id);
            } else {
                anomaly = anomalyType_1.loadAnomalyByName(name.toLowerCase());
            }
            if (anomaly === null) {
                ctx.response.status = 404;
                return;
            }
            ctx.response.body = {
                name: anomaly.name,
                metric: anomaly.metric,
                status: anomaly.status
            };
        } catch (e) {
            console.error(e);
            // TODO: better send 404 when we know than isn`t found
            ctx.response.status = 500;
            ctx.response.body = 'Can`t get anything';
        }
    });
}
function createAnomaly(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let body = ctx.request.body;
            const metric = {
                datasource: body.metric.datasource,
                targets: metrics_1.saveTargets(body.metric.targets)
            };
            const anomaly = {
                name: body.name,
                panelUrl: body.panelUrl,
                pattern: body.pattern.toLowerCase(),
                metric: metric,
                datasource: body.datasource,
                status: 'learning',
                last_prediction_time: 0,
                next_id: 0
            };
            let anomalyId = anomalyType_1.insertAnomaly(anomaly);
            if (anomalyId === null) {
                ctx.response.status = 403;
                ctx.response.body = {
                    code: 403,
                    message: 'Already exists'
                };
            }
            ctx.response.body = { anomaly_id: anomalyId };
            analytics_1.runLearning(anomalyId);
        } catch (e) {
            ctx.response.status = 500;
            ctx.response.body = {
                code: 500,
                message: 'Internal error'
            };
        }
    });
}
function deleteAnomaly(ctx) {
    try {
        let id = ctx.request.query.id;
        let name = ctx.request.query.name;
        if (id !== undefined) {
            anomalyType_1.removeAnomaly(id);
        } else {
            anomalyType_1.removeAnomaly(name.toLowerCase());
        }
        ctx.response.body = {
            code: 200,
            message: 'Success'
        };
    } catch (e) {
        ctx.response.status = 500;
        ctx.response.body = {
            code: 500,
            message: 'Internal error'
        };
    }
}
exports.router = new Router();
exports.router.get('/status', sendAnomalyTypeStatus);
exports.router.get('/', getAnomaly);
exports.router.post('/', createAnomaly);
exports.router.delete('/', deleteAnomaly);

/***/ }),

/***/ "./src/routes/segments.ts":
/*!********************************!*\
  !*** ./src/routes/segments.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
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
const Router = __webpack_require__(/*! koa-router */ "koa-router");
const segments_1 = __webpack_require__(/*! ../services/segments */ "./src/services/segments.ts");
const anomalyType_1 = __webpack_require__(/*! ../services/anomalyType */ "./src/services/anomalyType.ts");
const analytics_1 = __webpack_require__(/*! ../services/analytics */ "./src/services/analytics.ts");
function sendSegments(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        let anomalyId = ctx.request.query.anomaly_id;
        let anomaly = anomalyType_1.loadAnomalyById(anomalyId);
        if (anomaly === null) {
            anomalyId = anomalyType_1.getAnomalyIdByName(anomalyId);
        }
        let lastSegmentId = ctx.request.query.last_segment;
        let timeFrom = ctx.request.query.from;
        let timeTo = ctx.request.query.to;
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
        ctx.response.body = { segments };
    });
}
function updateSegments(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let segmentsUpdate = ctx.request.body;
            let anomalyId = segmentsUpdate.anomaly_id;
            let anomalyName = segmentsUpdate.name;
            if (anomalyId === undefined) {
                anomalyId = anomalyType_1.getAnomalyIdByName(anomalyName.toLowerCase());
            }
            let addedIds = segments_1.insertSegments(anomalyId, segmentsUpdate.added_segments, true);
            segments_1.removeSegments(anomalyId, segmentsUpdate.removed_segments);
            ctx.response.body = { added_ids: addedIds };
            analytics_1.runLearning(anomalyId);
        } catch (e) {
            ctx.response.status = 500;
            ctx.response.body = {
                code: 500,
                message: 'Internal error'
            };
        }
    });
}
exports.router = new Router();
exports.router.get('/', sendSegments);
exports.router.patch('/', updateSegments);

/***/ }),

/***/ "./src/services/alerts.ts":
/*!********************************!*\
  !*** ./src/services/alerts.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
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
const json_1 = __webpack_require__(/*! ./json */ "./src/services/json.ts");
const analytics_1 = __webpack_require__(/*! ./analytics */ "./src/services/analytics.ts");
const notification_1 = __webpack_require__(/*! ./notification */ "./src/services/notification.ts");
const segments_1 = __webpack_require__(/*! ./segments */ "./src/services/segments.ts");
const config_1 = __webpack_require__(/*! ../config */ "./src/config.ts");
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
const ALERTS_DB_PATH = path.join(config_1.ANOMALIES_PATH, `alerts_anomalies.json`);
function getAlertsAnomalies() {
    if (!fs.existsSync(ALERTS_DB_PATH)) {
        saveAlertsAnomalies([]);
    }
    return json_1.getJsonDataSync(ALERTS_DB_PATH);
}
exports.getAlertsAnomalies = getAlertsAnomalies;
function saveAlertsAnomalies(anomalies) {
    return json_1.writeJsonDataSync(ALERTS_DB_PATH, anomalies);
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
    } else if (activeAlert && !newActiveAlert) {
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
            } catch (e) {
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

/***/ "./src/services/analytics.ts":
/*!***********************************!*\
  !*** ./src/services/analytics.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
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
const child_process_1 = __webpack_require__(/*! child_process */ "child_process");
const config_1 = __webpack_require__(/*! ../config */ "./src/config.ts");
const anomalyType_1 = __webpack_require__(/*! ./anomalyType */ "./src/services/anomalyType.ts");
const metrics_1 = __webpack_require__(/*! ./metrics */ "./src/services/metrics.ts");
const segments_1 = __webpack_require__(/*! ./segments */ "./src/services/segments.ts");
const event_stream_1 = __webpack_require__(/*! event-stream */ "event-stream");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
var learnWorker;
if (fs.existsSync(path.join(config_1.ANALYTICS_PATH, 'dist/worker/worker'))) {
    learnWorker = child_process_1.spawn('dist/worker/worker', [], { cwd: config_1.ANALYTICS_PATH });
} else {
    // If compiled analytics script doesn't exist - fallback to regular python
    learnWorker = child_process_1.spawn('python3', ['worker.py'], { cwd: config_1.ANALYTICS_PATH });
}
learnWorker.stdout.pipe(event_stream_1.split()).pipe(event_stream_1.mapSync(onMessage));
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
        let pattern = anomaly.pattern;
        let task = {
            type: 'learn',
            anomaly_id: anomalyId,
            pattern,
            segments: segments
        };
        let result = yield runTask(task);
        if (result.status === 'success') {
            anomalyType_1.setAnomalyStatus(anomalyId, 'ready');
            segments_1.insertSegments(anomalyId, result.segments, false);
            anomalyType_1.setAnomalyPredictionTime(anomalyId, result.last_prediction_time);
        } else {
            anomalyType_1.setAnomalyStatus(anomalyId, 'failed', result.error);
        }
    });
}
exports.runLearning = runLearning;
function runPredict(anomalyId) {
    return __awaiter(this, void 0, void 0, function* () {
        let anomaly = anomalyType_1.loadAnomalyById(anomalyId);
        let pattern = anomaly.pattern;
        let task = {
            type: 'predict',
            anomaly_id: anomalyId,
            pattern,
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

/***/ "./src/services/anomalyType.ts":
/*!*************************************!*\
  !*** ./src/services/anomalyType.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const path = __webpack_require__(/*! path */ "path");
const json_1 = __webpack_require__(/*! ./json */ "./src/services/json.ts");
const config_1 = __webpack_require__(/*! ../config */ "./src/config.ts");
const fs = __webpack_require__(/*! fs */ "fs");
const crypto = __webpack_require__(/*! crypto */ "crypto");
let anomaliesNameToIdMap = {};
function loadAnomaliesMap() {
    let filename = path.join(config_1.ANOMALIES_PATH, `all_anomalies.json`);
    if (!fs.existsSync(filename)) {
        saveAnomaliesMap();
    }
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
    const hashString = anomaly.name + new Date().toString();
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
    } else {
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

/***/ "./src/services/data.ts":
/*!******************************!*\
  !*** ./src/services/data.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const config = __webpack_require__(/*! ../config */ "./src/config.ts");
const fs = __webpack_require__(/*! fs */ "fs");
// see analytics/pattern_detection_model.py with folders available
function maybeCreate(path) {
    if (fs.existsSync(path)) {
        return;
    }
    fs.mkdirSync(path);
}
function checkDataFolders() {
    var folders = [config.DATA_PATH, config.DATASETS_PATH, config.ANOMALIES_PATH, config.MODELS_PATH, config.METRICS_PATH, config.SEGMENTS_PATH].forEach(maybeCreate);
}
exports.checkDataFolders = checkDataFolders;

/***/ }),

/***/ "./src/services/json.ts":
/*!******************************!*\
  !*** ./src/services/json.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
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
const fs = __webpack_require__(/*! fs */ "fs");
function getJsonData(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield new Promise((resolve, reject) => {
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    reject('Can`t read file');
                } else {
                    resolve(data);
                }
            });
        });
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error(e);
            throw new Error('Wrong file format');
        }
    });
}
exports.getJsonData = getJsonData;
function writeJsonData(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, JSON.stringify(data), 'utf8', err => {
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
    let data = fs.readFileSync(filename, 'utf8');
    try {
        return JSON.parse(data);
    } catch (e) {
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

/***/ "./src/services/metrics.ts":
/*!*********************************!*\
  !*** ./src/services/metrics.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const path = __webpack_require__(/*! path */ "path");
const json_1 = __webpack_require__(/*! ./json */ "./src/services/json.ts");
const config_1 = __webpack_require__(/*! ../config */ "./src/config.ts");
const crypto = __webpack_require__(/*! crypto */ "crypto");
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

/***/ "./src/services/notification.ts":
/*!**************************************!*\
  !*** ./src/services/notification.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
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
const axios_1 = __webpack_require__(/*! axios */ "axios");
const anomalyType_1 = __webpack_require__(/*! ./anomalyType */ "./src/services/anomalyType.ts");
function sendNotification(anomalyId, active) {
    return __awaiter(this, void 0, void 0, function* () {
        let anomalyName = anomalyType_1.loadAnomalyById(anomalyId).name;
        console.log('Notification ' + anomalyName);
        let notification = {
            anomaly: anomalyName,
            status: ''
        };
        if (active) {
            notification.status = 'alert';
        } else {
            notification.status = 'OK';
        }
        let endpoint = process.env.HASTIC_ALERT_ENDPOINT;
        if (endpoint === undefined) {
            console.error(`Can't send alert, env HASTIC_ALERT_ENDPOINT is undefined`);
            return;
        }
        try {
            var data = yield axios_1.default.post(endpoint, {
                method: 'POST',
                body: JSON.stringify(notification)
            });
            console.log(data);
        } catch (err) {
            console.error(`Can't send alert to ${endpoint}. Error: ${err}`);
        }
    });
}
exports.sendNotification = sendNotification;

/***/ }),

/***/ "./src/services/segments.ts":
/*!**********************************!*\
  !*** ./src/services/segments.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const path = __webpack_require__(/*! path */ "path");
const json_1 = __webpack_require__(/*! ./json */ "./src/services/json.ts");
const config_1 = __webpack_require__(/*! ../config */ "./src/config.ts");
const anomalyType_1 = __webpack_require__(/*! ./anomalyType */ "./src/services/anomalyType.ts");
const _ = __webpack_require__(/*! lodash */ "lodash");
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
    } catch (e) {
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
    } catch (e) {
        console.error(e.message);
        jsonData = [];
    }
    return jsonData;
}
exports.getPredictedSegments = getPredictedSegments;
function saveSegments(anomalyId, segments) {
    let filename = path.join(config_1.SEGMENTS_PATH, `${anomalyId}_labeled.json`);
    try {
        return json_1.writeJsonDataSync(filename, _.uniqBy(segments, 'start'));
    } catch (e) {
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

/***/ 0:
/*!****************************!*\
  !*** multi ./src/index.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/index.ts */"./src/index.ts");


/***/ }),

/***/ "axios":
/*!***********************************!*\
  !*** external "require('axios')" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require('axios');

/***/ }),

/***/ "child_process":
/*!*******************************************!*\
  !*** external "require('child_process')" ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require('child_process');

/***/ }),

/***/ "crypto":
/*!************************************!*\
  !*** external "require('crypto')" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require('crypto');

/***/ }),

/***/ "event-stream":
/*!******************************************!*\
  !*** external "require('event-stream')" ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require('event-stream');

/***/ }),

/***/ "fs":
/*!********************************!*\
  !*** external "require('fs')" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require('fs');

/***/ }),

/***/ "koa":
/*!*********************************!*\
  !*** external "require('koa')" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require('koa');

/***/ }),

/***/ "koa-bodyparser":
/*!********************************************!*\
  !*** external "require('koa-bodyparser')" ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require('koa-bodyparser');

/***/ }),

/***/ "koa-router":
/*!****************************************!*\
  !*** external "require('koa-router')" ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require('koa-router');

/***/ }),

/***/ "lodash":
/*!************************************!*\
  !*** external "require('lodash')" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require('lodash');

/***/ }),

/***/ "path":
/*!**********************************!*\
  !*** external "require('path')" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require('path');

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbmZpZy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JvdXRlcy9hbGVydHMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JvdXRlcy9hbm9tYWxpZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JvdXRlcy9zZWdtZW50cy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvc2VydmljZXMvYWxlcnRzLnRzIiwid2VicGFjazovLy8uL3NyYy9zZXJ2aWNlcy9hbmFseXRpY3MudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZpY2VzL2Fub21hbHlUeXBlLnRzIiwid2VicGFjazovLy8uL3NyYy9zZXJ2aWNlcy9kYXRhLnRzIiwid2VicGFjazovLy8uL3NyYy9zZXJ2aWNlcy9qc29uLnRzIiwid2VicGFjazovLy8uL3NyYy9zZXJ2aWNlcy9tZXRyaWNzLnRzIiwid2VicGFjazovLy8uL3NyYy9zZXJ2aWNlcy9ub3RpZmljYXRpb24udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZpY2VzL3NlZ21lbnRzLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2F4aW9zJylcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdjaGlsZF9wcm9jZXNzJylcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdjcnlwdG8nKVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2V2ZW50LXN0cmVhbScpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgnZnMnKVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2tvYScpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgna29hLWJvZHlwYXJzZXInKVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2tvYS1yb3V0ZXInKVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2xvZGFzaCcpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgncGF0aCcpXCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUVhLHlCQUFpQixLQUFLLElBQUwsQ0FBVSxTQUFWLEVBQXFCLGlCQUFyQixDQUFqQjtBQUVBLG9CQUFZLEtBQUssSUFBTCxDQUFVLFNBQVYsRUFBcUIsWUFBckIsQ0FBWjtBQUVBLHdCQUFnQixLQUFLLElBQUwsQ0FBVSxpQkFBVixFQUFxQixVQUFyQixDQUFoQjtBQUNBLHlCQUFpQixLQUFLLElBQUwsQ0FBVSxpQkFBVixFQUFxQixXQUFyQixDQUFqQjtBQUNBLHNCQUFjLEtBQUssSUFBTCxDQUFVLGlCQUFWLEVBQXFCLFFBQXJCLENBQWQ7QUFDQSx1QkFBZSxLQUFLLElBQUwsQ0FBVSxpQkFB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QyxtQkFBVyxTQUFTLE1BQVQsQ0FBZ0IsTUFBTSxHQUFHLEVBQUgsS0FBVSxTQUFoQyxDQUFYO0FBQ0Q7QUFDRCxpQkFBYSxTQUFiLEVBQXdCLFFBQXhCO0FBQ0Q7QUFFZ0Ysd0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNUVqRixrQzs7Ozs7Ozs7Ozs7QUNBQSwwQzs7Ozs7Ozs7Ozs7QUNBQSxtQzs7Ozs7Ozs7Ozs7QUNBQSx5Qzs7Ozs7Ozs7Ozs7QUNBQSwrQjs7Ozs7Ozs7Ozs7QUNBQSxnQzs7Ozs7Ozs7Ozs7QUNBQSwyQzs7Ozs7Ozs7Ozs7QUNBQSx1Qzs7Ozs7Ozs7Ozs7QUNBQSxtQzs7Ozs7Ozs7Ozs7QUNBQSxpQyIsImZpbGUiOiJzZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgY29uc3QgQU5BTFlUSUNTX1BBVEggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vYW5hbHl0aWNzJyk7XG5cbmV4cG9ydCBjb25zdCBEQVRBX1BBVEggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vZGF0YScpO1xuXG5leHBvcnQgY29uc3QgREFUQVNFVFNfUEFUSCA9IHBhdGguam9pbihEQVRBX1BBVEgsICdkYXRhc2V0cycpO1xuZXhwb3J0IGNvbnN0IEFOT01BTElFU19QQVRIID0gcGF0aC5qb2luKERBVEFfUEFUSCwgJ2Fub21hbGllcycpO1xuZXhwb3J0IGNvbnN0IE1PREVMU19QQVRIID0gcGF0aC5qb2luKERBVEFfUEFUSCwgJ21vZGVscycpO1xuZXhwb3J0IGNvbnN0IE1FVFJJQ1NfUEFUSCA9IHBhdGguam9pbihEQVRBX1BBVEgsICdtZXRyaWNzJyk7XG5leHBvcnQgY29uc3QgU0VHTUVOVFNfUEFUSCA9IHBhdGguam9pbihEQVRBX1BBVEgsICdzZWdtZW50cycpO1xuXG4iLCJpbXBvcnQgKiBhcyBLb2EgZnJvbSAna29hJztcbmltcG9ydCAqIGFzIFJvdXRlciBmcm9tICdrb2Etcm91dGVyJztcbmltcG9ydCAqIGFzIGJvZHlQYXJzZXIgZnJvbSAna29hLWJvZHlwYXJzZXInO1xuXG5cbmltcG9ydCB7IHJvdXRlciBhcyBhbm9tYWxpZXNSb3V0ZXIgfSBmcm9tICcuL3JvdXRlcy9hbm9tYWxpZXMnO1xuaW1wb3J0IHsgcm91dGVyIGFzIHNlZ21lbnRzUm91dGVyIH0gZnJvbSAnLi9yb3V0ZXMvc2VnbWVudHMnO1xuaW1wb3J0IHsgcm91dGVyIGFzIGFsZXJ0c1JvdXRlciB9IGZyb20gJy4vcm91dGVzL2FsZXJ0cyc7XG5cbmltcG9ydCB7IGNoZWNrRGF0YUZvbGRlcnMgfSBmcm9tICcuL3NlcnZpY2VzL2RhdGEnO1xuXG5jaGVja0RhdGFGb2xkZXJzKCk7XG5cbnZhciBhcHAgPSBuZXcgS29hKCk7XG5jb25zdCBQT1JUID0gcHJvY2Vzcy5lbnYuSEFTVElDX1BPUlQgfHwgODAwMDtcblxuYXBwLnVzZShib2R5UGFyc2VyKCkpXG5cbmFwcC51c2UoYXN5bmMgZnVuY3Rpb24oY3R4LCBuZXh0KSB7XG4gIGN0eC5zZXQoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gIGN0eC5zZXQoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgY3R4LnNldCgnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdPcmlnaW4sIFgtUmVxdWVzdGVkLVdpdGgsIENvbnRlbnQtVHlwZSwgQWNjZXB0Jyk7XG4gIG5leHQoKTtcbn0pO1xuXG5cbnZhciByb290Um91dGVyID0gbmV3IFJvdXRlcigpO1xucm9vdFJvdXRlci51c2UoJy9hbm9tYWxpZXMnLCBhbm9tYWxpZXNSb3V0ZXIucm91dGVzKCksIGFub21hbGllc1JvdXRlci5hbGxvd2VkTWV0aG9kcygpKTtcbnJvb3RSb3V0ZXIudXNlKCcvc2VnbWVudHMnLCBzZWdtZW50c1JvdXRlci5yb3V0ZXMoKSwgc2VnbWVudHNSb3V0ZXIuYWxsb3dlZE1ldGhvZHMoKSk7XG5yb290Um91dGVyLnVzZSgnL2FsZXJ0cycsIGFsZXJ0c1JvdXRlci5yb3V0ZXMoKSwgYWxlcnRzUm91dGVyLmFsbG93ZWRNZXRob2RzKCkpO1xucm9vdFJvdXRlci5nZXQoJy8nLCBhc3luYyAoY3R4KSA9PiB7XG4gIGN0eC5yZXNwb25zZS5ib2R5ID0geyBzdGF0dXM6ICdPayBvaycgfTtcbn0pO1xuXG5hcHBcbiAgLnVzZShyb290Um91dGVyLnJvdXRlcygpKVxuICAudXNlKHJvb3RSb3V0ZXIuYWxsb3dlZE1ldGhvZHMoKSlcblxuYXBwLmxpc3RlbihQT1JULCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBTZXJ2ZXIgaXMgcnVubmluZyBvbiA6JHtQT1JUfWApXG59KTtcblxuIiwiaW1wb3J0IHsgQW5vbWFseUlkLCBnZXRBbm9tYWx5SWRCeU5hbWUsIGxvYWRBbm9tYWx5QnlJZCB9IGZyb20gJy4uL3NlcnZpY2VzL2Fub21hbHlUeXBlJztcbmltcG9ydCB7IGdldEFsZXJ0c0Fub21hbGllcywgc2F2ZUFsZXJ0c0Fub21hbGllcyB9IGZyb20gJy4uL3NlcnZpY2VzL2FsZXJ0cyc7XG5cbmltcG9ydCAqIGFzIFJvdXRlciBmcm9tICdrb2Etcm91dGVyJztcblxuXG5mdW5jdGlvbiBnZXRBbGVydChjdHg6IFJvdXRlci5JUm91dGVyQ29udGV4dCkge1xuICBcbiAgbGV0IGFub21hbHlJZDogQW5vbWFseUlkID0gY3R4LnJlcXVlc3QucXVlcnkuYW5vbWFseV9pZDtcbiAgbGV0IGFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKVxuICBpZihhbm9tYWx5ID09IG51bGwpIHtcbiAgICBhbm9tYWx5SWQgPSBnZXRBbm9tYWx5SWRCeU5hbWUoYW5vbWFseUlkLnRvTG93ZXJDYXNlKCkpO1xuICB9XG5cbiAgbGV0IGFsZXJ0c0Fub21hbGllcyA9IGdldEFsZXJ0c0Fub21hbGllcygpO1xuICBsZXQgcG9zID0gYWxlcnRzQW5vbWFsaWVzLmluZGV4T2YoYW5vbWFseUlkKTtcblxuICBsZXQgZW5hYmxlOiBib29sZWFuID0gKHBvcyAhPT0gLTEpO1xuICBjdHgucmVzcG9uc2UuYm9keSA9IHsgZW5hYmxlIH07XG4gIFxufVxuXG5mdW5jdGlvbiBjaGFuZ2VBbGVydChjdHg6IFJvdXRlci5JUm91dGVyQ29udGV4dCkge1xuXG4gIGxldCBhbm9tYWx5SWQ6IEFub21hbHlJZCA9IGN0eC5yZXF1ZXN0LmJvZHkuYW5vbWFseV9pZDtcbiAgbGV0IGVuYWJsZTogYm9vbGVhbiA9IGN0eC5yZXF1ZXN0LmJvZHkuZW5hYmxlO1xuXG4gIGxldCBhbm9tYWx5ID0gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZClcbiAgaWYoYW5vbWFseSA9PSBudWxsKSB7XG4gICAgYW5vbWFseUlkID0gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlJZC50b0xvd2VyQ2FzZSgpKTtcbiAgfVxuXG4gIGxldCBhbGVydHNBbm9tYWxpZXMgPSBnZXRBbGVydHNBbm9tYWxpZXMoKTtcbiAgbGV0IHBvczogbnVtYmVyID0gYWxlcnRzQW5vbWFsaWVzLmluZGV4T2YoYW5vbWFseUlkKTtcbiAgaWYoZW5hYmxlICYmIHBvcyA9PSAtMSkge1xuICAgIGFsZXJ0c0Fub21hbGllcy5wdXNoKGFub21hbHlJZCk7XG4gICAgc2F2ZUFsZXJ0c0Fub21hbGllcyhhbGVydHNBbm9tYWxpZXMpO1xuICB9IGVsc2UgaWYoIWVuYWJsZSAmJiBwb3MgPiAtMSkge1xuICAgIGFsZXJ0c0Fub21hbGllcy5zcGxpY2UocG9zLCAxKTtcbiAgICBzYXZlQWxlcnRzQW5vbWFsaWVzKGFsZXJ0c0Fub21hbGllcyk7XG4gIH1cbiAgY3R4LnJlc3BvbnNlLmJvZHkgPSB7IHN0YXR1czogJ09LJyB9O1xuXG59XG5cbmV4cG9ydCBjb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG5cbnJvdXRlci5nZXQoJy8nLCBnZXRBbGVydCk7XG5yb3V0ZXIucG9zdCgnLycsIGNoYW5nZUFsZXJ0KTtcblxuIiwiaW1wb3J0ICogYXMgUm91dGVyIGZyb20gJ2tvYS1yb3V0ZXInO1xuXG5pbXBvcnQge1xuICBEYXRhc291cmNlLFxuICBNZXRyaWMsXG4gIEFub21hbHksXG4gIHNhdmVBbm9tYWx5LFxuICBpbnNlcnRBbm9tYWx5LCByZW1vdmVBbm9tYWx5LCBsb2FkQW5vbWFseUJ5TmFtZSwgbG9hZEFub21hbHlCeUlkLCBnZXRBbm9tYWx5SWRCeU5hbWVcbn0gZnJvbSAnLi4vc2VydmljZXMvYW5vbWFseVR5cGUnO1xuaW1wb3J0IHsgcnVuTGVhcm5pbmcgfSBmcm9tICcuLi9zZXJ2aWNlcy9hbmFseXRpY3MnXG5pbXBvcnQgeyBzYXZlVGFyZ2V0cyB9IGZyb20gJy4uL3NlcnZpY2VzL21ldHJpY3MnO1xuXG5hc3luYyBmdW5jdGlvbiBzZW5kQW5vbWFseVR5cGVTdGF0dXMoY3R4OiBSb3V0ZXIuSVJvdXRlckNvbnRleHQpIHtcbiAgbGV0IGlkID0gY3R4LnJlcXVlc3QucXVlcnkuaWQ7XG4gIGxldCBuYW1lID0gY3R4LnJlcXVlc3QucXVlcnkubmFtZTtcbiAgdHJ5IHtcbiAgICBsZXQgYW5vbWFseTogQW5vbWFseTtcbiAgICBpZihpZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhbm9tYWx5ID0gbG9hZEFub21hbHlCeUlkKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYW5vbWFseSA9IGxvYWRBbm9tYWx5QnlOYW1lKG5hbWUpO1xuICAgIH1cbiAgICBpZihhbm9tYWx5ID09PSBudWxsKSB7XG4gICAgICBjdHgucmVzcG9uc2Uuc3RhdHVzID0gNDA0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZihhbm9tYWx5LnN0YXR1cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHN0YXR1cyBmb3IgJyArIG5hbWUpO1xuICAgIH1cbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHsgc3RhdHVzOiBhbm9tYWx5LnN0YXR1cywgZXJyb3JNZXNzYWdlOiBhbm9tYWx5LmVycm9yIH07XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgLy8gVE9ETzogYmV0dGVyIHNlbmQgNDA0IHdoZW4gd2Uga25vdyB0aGFuIGlzbmB0IGZvdW5kXG4gICAgY3R4LnJlc3BvbnNlLnN0YXR1cyA9IDUwMDtcbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHsgZXJyb3I6ICdDYW5gdCByZXR1cm4gYW55dGhpbmcnIH07XG4gIH1cblxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRBbm9tYWx5KGN0eDogUm91dGVyLklSb3V0ZXJDb250ZXh0KSB7XG4gIHRyeSB7XG4gICAgbGV0IGlkID0gY3R4LnJlcXVlc3QucXVlcnkuaWQ7XG4gICAgbGV0IG5hbWUgPSBjdHgucmVxdWVzdC5xdWVyeS5uYW1lO1xuXG4gICAgbGV0IGFub21hbHk6QW5vbWFseTtcbiAgICBpZihpZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhbm9tYWx5ID0gbG9hZEFub21hbHlCeUlkKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYW5vbWFseSA9IGxvYWRBbm9tYWx5QnlOYW1lKG5hbWUudG9Mb3dlckNhc2UoKSk7XG4gICAgfVxuICAgIGlmKGFub21hbHkgPT09IG51bGwpIHtcbiAgICAgIGN0eC5yZXNwb25zZS5zdGF0dXMgPSA0MDQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY3R4LnJlc3BvbnNlLmJvZHkgPSB7XG4gICAgICBuYW1lOiBhbm9tYWx5Lm5hbWUsXG4gICAgICBtZXRyaWM6IGFub21hbHkubWV0cmljLFxuICAgICAgc3RhdHVzOiBhbm9tYWx5LnN0YXR1c1xuICAgIH07XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgLy8gVE9ETzogYmV0dGVyIHNlbmQgNDA0IHdoZW4gd2Uga25vdyB0aGFuIGlzbmB0IGZvdW5kXG4gICAgY3R4LnJlc3BvbnNlLnN0YXR1cyA9IDUwMDtcbiAgICBjdHgucmVzcG9uc2UuYm9keSA9ICdDYW5gdCBnZXQgYW55dGhpbmcnO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUFub21hbHkoY3R4OiBSb3V0ZXIuSVJvdXRlckNvbnRleHQpIHtcbiAgdHJ5IHtcbiAgICBsZXQgYm9keSA9IGN0eC5yZXF1ZXN0LmJvZHk7XG4gICAgY29uc3QgbWV0cmljOk1ldHJpYyA9IHtcbiAgICAgIGRhdGFzb3VyY2U6IGJvZHkubWV0cmljLmRhdGFzb3VyY2UsXG4gICAgICB0YXJnZXRzOiBzYXZlVGFyZ2V0cyhib2R5Lm1ldHJpYy50YXJnZXRzKVxuICAgIH07XG5cbiAgICBjb25zdCBhbm9tYWx5OkFub21hbHkgPSB7XG4gICAgICBuYW1lOiBib2R5Lm5hbWUsXG4gICAgICBwYW5lbFVybDogYm9keS5wYW5lbFVybCxcbiAgICAgIHBhdHRlcm46IGJvZHkucGF0dGVybi50b0xvd2VyQ2FzZSgpLFxuICAgICAgbWV0cmljOiBtZXRyaWMsXG4gICAgICBkYXRhc291cmNlOiBib2R5LmRhdGFzb3VyY2UsXG4gICAgICBzdGF0dXM6ICdsZWFybmluZycsXG4gICAgICBsYXN0X3ByZWRpY3Rpb25fdGltZTogMCxcbiAgICAgIG5leHRfaWQ6IDBcbiAgICB9O1xuICAgIGxldCBhbm9tYWx5SWQgPSBpbnNlcnRBbm9tYWx5KGFub21hbHkpO1xuICAgIGlmKGFub21hbHlJZCA9PT0gbnVsbCkge1xuICAgICAgY3R4LnJlc3BvbnNlLnN0YXR1cyA9IDQwMztcbiAgICAgIGN0eC5yZXNwb25zZS5ib2R5ID0ge1xuICAgICAgICBjb2RlOiA0MDMsXG4gICAgICAgIG1lc3NhZ2U6ICdBbHJlYWR5IGV4aXN0cydcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY3R4LnJlc3BvbnNlLmJvZHkgPSB7IGFub21hbHlfaWQ6IGFub21hbHlJZCB9O1xuXG4gICAgcnVuTGVhcm5pbmcoYW5vbWFseUlkKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY3R4LnJlc3BvbnNlLnN0YXR1cyA9IDUwMDtcbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHtcbiAgICAgIGNvZGU6IDUwMCxcbiAgICAgIG1lc3NhZ2U6ICdJbnRlcm5hbCBlcnJvcidcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlbGV0ZUFub21hbHkoY3R4OiBSb3V0ZXIuSVJvdXRlckNvbnRleHQpIHtcbiAgdHJ5IHtcbiAgICBsZXQgaWQgPSBjdHgucmVxdWVzdC5xdWVyeS5pZDtcbiAgICBsZXQgbmFtZSA9IGN0eC5yZXF1ZXN0LnF1ZXJ5Lm5hbWU7XG5cbiAgICBpZihpZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZW1vdmVBbm9tYWx5KGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVtb3ZlQW5vbWFseShuYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgIH1cbiAgICBcbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHtcbiAgICAgIGNvZGU6IDIwMCxcbiAgICAgIG1lc3NhZ2U6ICdTdWNjZXNzJ1xuICAgIH07XG4gIH0gY2F0Y2goZSkge1xuICAgIGN0eC5yZXNwb25zZS5zdGF0dXMgPSA1MDA7XG4gICAgY3R4LnJlc3BvbnNlLmJvZHkgPSB7XG4gICAgICBjb2RlOiA1MDAsXG4gICAgICBtZXNzYWdlOiAnSW50ZXJuYWwgZXJyb3InXG4gICAgfTtcbiAgfVxufVxuXG5cbmV4cG9ydCB2YXIgcm91dGVyID0gbmV3IFJvdXRlcigpO1xuXG5yb3V0ZXIuZ2V0KCcvc3RhdHVzJywgc2VuZEFub21hbHlUeXBlU3RhdHVzKTtcbnJvdXRlci5nZXQoJy8nLCBnZXRBbm9tYWx5KTtcbnJvdXRlci5wb3N0KCcvJywgY3JlYXRlQW5vbWFseSk7XG5yb3V0ZXIuZGVsZXRlKCcvJywgZGVsZXRlQW5vbWFseSk7XG4iLCJpbXBvcnQgKiBhcyBSb3V0ZXIgZnJvbSAna29hLXJvdXRlcic7XG5cbmltcG9ydCB7XG4gIGdldExhYmVsZWRTZWdtZW50cyxcbiAgaW5zZXJ0U2VnbWVudHMsXG4gIHJlbW92ZVNlZ21lbnRzLFxufSBmcm9tICcuLi9zZXJ2aWNlcy9zZWdtZW50cyc7XG5cbmltcG9ydCB7XG4gIEFub21hbHksIEFub21hbHlJZCwgZ2V0QW5vbWFseUlkQnlOYW1lLCBsb2FkQW5vbWFseUJ5SWRcbn0gZnJvbSAnLi4vc2VydmljZXMvYW5vbWFseVR5cGUnO1xuXG5pbXBvcnQgeyBydW5MZWFybmluZyB9IGZyb20gJy4uL3NlcnZpY2VzL2FuYWx5dGljcyc7XG5cblxuYXN5bmMgZnVuY3Rpb24gc2VuZFNlZ21lbnRzKGN0eDogUm91dGVyLklSb3V0ZXJDb250ZXh0KSB7XG5cbiAgbGV0IGFub21hbHlJZDogQW5vbWFseUlkID0gY3R4LnJlcXVlc3QucXVlcnkuYW5vbWFseV9pZDtcbiAgbGV0IGFub21hbHk6QW5vbWFseSA9IGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQpO1xuICBpZihhbm9tYWx5ID09PSBudWxsKSB7XG4gICAgYW5vbWFseUlkID0gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlJZCk7XG4gIH1cblxuICBsZXQgbGFzdFNlZ21lbnRJZCA9IGN0eC5yZXF1ZXN0LnF1ZXJ5Lmxhc3Rfc2VnbWVudDtcbiAgbGV0IHRpbWVGcm9tID0gY3R4LnJlcXVlc3QucXVlcnkuZnJvbTtcbiAgbGV0IHRpbWVUbyA9IGN0eC5yZXF1ZXN0LnF1ZXJ5LnRvO1xuXG4gIGxldCBzZWdtZW50cyA9IGdldExhYmVsZWRTZWdtZW50cyhhbm9tYWx5SWQpO1xuXG4gIC8vIElkIGZpbHRlcmluZ1xuICBpZihsYXN0U2VnbWVudElkICE9PSB1bmRlZmluZWQpIHtcbiAgICBzZWdtZW50cyA9IHNlZ21lbnRzLmZpbHRlcihlbCA9PiBlbC5pZCA+IGxhc3RTZWdtZW50SWQpO1xuICB9XG5cbiAgLy8gVGltZSBmaWx0ZXJpbmdcbiAgaWYodGltZUZyb20gIT09IHVuZGVmaW5lZCkge1xuICAgIHNlZ21lbnRzID0gc2VnbWVudHMuZmlsdGVyKGVsID0+IGVsLmZpbmlzaCA+IHRpbWVGcm9tKTtcbiAgfVxuXG4gIGlmKHRpbWVUbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgc2VnbWVudHMgPSBzZWdtZW50cy5maWx0ZXIoZWwgPT4gZWwuc3RhcnQgPCB0aW1lVG8pO1xuICB9XG5cbiAgY3R4LnJlc3BvbnNlLmJvZHkgPSB7IHNlZ21lbnRzIH1cblxufVxuXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVTZWdtZW50cyhjdHg6IFJvdXRlci5JUm91dGVyQ29udGV4dCkge1xuICB0cnkge1xuICAgIGxldCBzZWdtZW50c1VwZGF0ZSA9IGN0eC5yZXF1ZXN0LmJvZHk7XG5cbiAgICBsZXQgYW5vbWFseUlkID0gc2VnbWVudHNVcGRhdGUuYW5vbWFseV9pZDtcbiAgICBsZXQgYW5vbWFseU5hbWUgPSBzZWdtZW50c1VwZGF0ZS5uYW1lO1xuXG4gICAgaWYoYW5vbWFseUlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGFub21hbHlJZCA9IGdldEFub21hbHlJZEJ5TmFtZShhbm9tYWx5TmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICB9XG5cbiAgICBsZXQgYWRkZWRJZHMgPSBpbnNlcnRTZWdtZW50cyhhbm9tYWx5SWQsIHNlZ21lbnRzVXBkYXRlLmFkZGVkX3NlZ21lbnRzLCB0cnVlKTtcbiAgICByZW1vdmVTZWdtZW50cyhhbm9tYWx5SWQsIHNlZ21lbnRzVXBkYXRlLnJlbW92ZWRfc2VnbWVudHMpO1xuXG4gICAgY3R4LnJlc3BvbnNlLmJvZHkgPSB7IGFkZGVkX2lkczogYWRkZWRJZHMgfTtcblxuICAgIHJ1bkxlYXJuaW5nKGFub21hbHlJZCk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGN0eC5yZXNwb25zZS5zdGF0dXMgPSA1MDA7XG4gICAgY3R4LnJlc3BvbnNlLmJvZHkgPSB7XG4gICAgICBjb2RlOiA1MDAsXG4gICAgICBtZXNzYWdlOiAnSW50ZXJuYWwgZXJyb3InXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgcm91dGVyID0gbmV3IFJvdXRlcigpO1xuXG5yb3V0ZXIuZ2V0KCcvJywgc2VuZFNlZ21lbnRzKTtcbnJvdXRlci5wYXRjaCgnLycsIHVwZGF0ZVNlZ21lbnRzKTtcbiIsImltcG9ydCB7IGdldEpzb25EYXRhU3luYywgd3JpdGVKc29uRGF0YVN5bmMgfSBmcm9tICcuL2pzb24nO1xuaW1wb3J0IHsgQW5vbWFseUlkIH0gZnJvbSAnLi9hbm9tYWx5VHlwZSc7XG5pbXBvcnQgeyBydW5QcmVkaWN0IH0gZnJvbSAnLi9hbmFseXRpY3MnO1xuaW1wb3J0IHsgc2VuZE5vdGlmaWNhdGlvbiB9IGZyb20gJy4vbm90aWZpY2F0aW9uJztcbmltcG9ydCB7IGdldExhYmVsZWRTZWdtZW50cyB9IGZyb20gJy4vc2VnbWVudHMnO1xuXG5pbXBvcnQgeyBBTk9NQUxJRVNfUEFUSCB9IGZyb20gJy4uL2NvbmZpZyc7XG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5cblxuXG5jb25zdCBBTEVSVFNfREJfUEFUSCA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYGFsZXJ0c19hbm9tYWxpZXMuanNvbmApO1xuXG5mdW5jdGlvbiBnZXRBbGVydHNBbm9tYWxpZXMoKTogQW5vbWFseUlkW10ge1xuICBpZighZnMuZXhpc3RzU3luYyhBTEVSVFNfREJfUEFUSCkpIHtcbiAgICBzYXZlQWxlcnRzQW5vbWFsaWVzKFtdKTtcbiAgfVxuICByZXR1cm4gZ2V0SnNvbkRhdGFTeW5jKEFMRVJUU19EQl9QQVRIKTtcbn1cblxuZnVuY3Rpb24gc2F2ZUFsZXJ0c0Fub21hbGllcyhhbm9tYWxpZXM6IEFub21hbHlJZFtdKSB7XG4gIHJldHVybiB3cml0ZUpzb25EYXRhU3luYyhBTEVSVFNfREJfUEFUSCwgYW5vbWFsaWVzKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0FsZXJ0cyhhbm9tYWx5SWQpIHtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG5cbiAgY29uc3QgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgY29uc3QgYWN0aXZlQWxlcnQgPSBhY3RpdmVBbGVydHMuaGFzKGFub21hbHlJZCk7XG4gIGxldCBuZXdBY3RpdmVBbGVydCA9IGZhbHNlO1xuXG4gIGlmKHNlZ21lbnRzLmxlbmd0aCA+IDApIHtcbiAgICBsZXQgbGFzdFNlZ21lbnQgPSBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXTtcbiAgICBpZihsYXN0U2VnbWVudC5maW5pc2ggPj0gY3VycmVudFRpbWUgLSBhbGVydFRpbWVvdXQpIHtcbiAgICAgIG5ld0FjdGl2ZUFsZXJ0ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZighYWN0aXZlQWxlcnQgJiYgbmV3QWN0aXZlQWxlcnQpIHtcbiAgICBhY3RpdmVBbGVydHMuYWRkKGFub21hbHlJZCk7XG4gICAgc2VuZE5vdGlmaWNhdGlvbihhbm9tYWx5SWQsIHRydWUpO1xuICB9IGVsc2UgaWYoYWN0aXZlQWxlcnQgJiYgIW5ld0FjdGl2ZUFsZXJ0KSB7XG4gICAgYWN0aXZlQWxlcnRzLmRlbGV0ZShhbm9tYWx5SWQpO1xuICAgIHNlbmROb3RpZmljYXRpb24oYW5vbWFseUlkLCBmYWxzZSk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gYWxlcnRzVGljaygpIHtcbiAgbGV0IGFsZXJ0c0Fub21hbGllcyA9IGdldEFsZXJ0c0Fub21hbGllcygpO1xuICBmb3IgKGxldCBhbm9tYWx5SWQgb2YgYWxlcnRzQW5vbWFsaWVzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJ1blByZWRpY3QoYW5vbWFseUlkKTtcbiAgICAgIHByb2Nlc3NBbGVydHMoYW5vbWFseUlkKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBzZXRUaW1lb3V0KGFsZXJ0c1RpY2ssIDUwMDApO1xufVxuXG5jb25zdCBhbGVydFRpbWVvdXQgPSA2MDAwMDsgLy8gbXNcbmNvbnN0IGFjdGl2ZUFsZXJ0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuc2V0VGltZW91dChhbGVydHNUaWNrLCA1MDAwKTtcblxuXG5leHBvcnQgeyBnZXRBbGVydHNBbm9tYWxpZXMsIHNhdmVBbGVydHNBbm9tYWxpZXMgfVxuIiwiaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IHsgQU5BTFlUSUNTX1BBVEggfSBmcm9tICcuLi9jb25maWcnXG5pbXBvcnQge1xuICBBbm9tYWx5LFxuICBBbm9tYWx5SWQsIGdldEFub21hbHlUeXBlSW5mbyxcbiAgbG9hZEFub21hbHlCeUlkLFxuICBzZXRBbm9tYWx5UHJlZGljdGlvblRpbWUsXG4gIHNldEFub21hbHlTdGF0dXNcbn0gZnJvbSAnLi9hbm9tYWx5VHlwZSdcbmltcG9ydCB7IGdldFRhcmdldCB9IGZyb20gJy4vbWV0cmljcyc7XG5pbXBvcnQgeyBnZXRMYWJlbGVkU2VnbWVudHMsIGluc2VydFNlZ21lbnRzLCByZW1vdmVTZWdtZW50cyB9IGZyb20gJy4vc2VnbWVudHMnO1xuaW1wb3J0IHsgc3BsaXQsIG1hcFN5bmMgfSBmcm9tICdldmVudC1zdHJlYW0nO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxudmFyIGxlYXJuV29ya2VyO1xuaWYoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4oQU5BTFlUSUNTX1BBVEgsICdkaXN0L3dvcmtlci93b3JrZXInKSkpIHtcbiAgbGVhcm5Xb3JrZXIgPSBzcGF3bignZGlzdC93b3JrZXIvd29ya2VyJywgW10sIHsgY3dkOiBBTkFMWVRJQ1NfUEFUSCB9KVxufSBlbHNlIHtcbiAgLy8gSWYgY29tcGlsZWQgYW5hbHl0aWNzIHNjcmlwdCBkb2Vzbid0IGV4aXN0IC0gZmFsbGJhY2sgdG8gcmVndWxhciBweXRob25cbiAgbGVhcm5Xb3JrZXIgPSBzcGF3bigncHl0aG9uMycsIFsnd29ya2VyLnB5J10sIHsgY3dkOiBBTkFMWVRJQ1NfUEFUSCB9KVxufVxubGVhcm5Xb3JrZXIuc3Rkb3V0LnBpcGUoc3BsaXQoKSkucGlwZShtYXBTeW5jKG9uTWVzc2FnZSkpO1xuXG5sZWFybldvcmtlci5zdGRlcnIub24oJ2RhdGEnLCBkYXRhID0+IGNvbnNvbGUuZXJyb3IoYHdvcmtlciBzdGRlcnI6ICR7ZGF0YX1gKSk7XG5cbmNvbnN0IHRhc2tNYXAgPSB7fTtcbmxldCBuZXh0VGFza0lkID0gMDtcblxuZnVuY3Rpb24gb25NZXNzYWdlKGRhdGEpIHtcbiAgY29uc29sZS5sb2coYHdvcmtlciBzdGRvdXQ6ICR7ZGF0YX1gKTtcbiAgbGV0IHJlc3BvbnNlID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgbGV0IHRhc2tJZCA9IHJlc3BvbnNlLl9fdGFza19pZDtcbiAgLy8gbGV0IGFub21hbHlOYW1lID0gcmVzcG9uc2UuYW5vbWFseV9uYW1lO1xuICAvLyBsZXQgdGFzayA9IHJlc3BvbnNlLnRhc2s7XG4gIGxldCBzdGF0dXMgPSByZXNwb25zZS5zdGF0dXM7XG5cbiAgaWYoc3RhdHVzID09PSAnc3VjY2VzcycgfHwgc3RhdHVzID09PSAnZmFpbGVkJykge1xuICAgIGlmKHRhc2tJZCBpbiB0YXNrTWFwKSB7XG4gICAgICBsZXQgcmVzb2x2ZXIgPSB0YXNrTWFwW3Rhc2tJZF07XG4gICAgICByZXNvbHZlcihyZXNwb25zZSk7XG4gICAgICBkZWxldGUgdGFza01hcFt0YXNrSWRdO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBydW5UYXNrKHRhc2spIDogUHJvbWlzZTxhbnk+IHtcbiAgbGV0IGFub21hbHk6QW5vbWFseSA9IGxvYWRBbm9tYWx5QnlJZCh0YXNrLmFub21hbHlfaWQpO1xuICB0YXNrLm1ldHJpYyA9IHtcbiAgICBkYXRhc291cmNlOiBhbm9tYWx5Lm1ldHJpYy5kYXRhc291cmNlLFxuICAgIHRhcmdldHM6IGFub21hbHkubWV0cmljLnRhcmdldHMubWFwKHQgPT4gZ2V0VGFyZ2V0KHQpKVxuICB9O1xuXG4gIHRhc2suX190YXNrX2lkID0gbmV4dFRhc2tJZCsrO1xuICBsZXQgY29tbWFuZCA9IEpTT04uc3RyaW5naWZ5KHRhc2spXG4gIGxlYXJuV29ya2VyLnN0ZGluLndyaXRlKGAke2NvbW1hbmR9XFxuYCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZTxPYmplY3Q+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICB0YXNrTWFwW3Rhc2suX190YXNrX2lkXSA9IHJlc29sdmVcbiAgfSlcbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuTGVhcm5pbmcoYW5vbWFseUlkOkFub21hbHlJZCkge1xuICBsZXQgc2VnbWVudHMgPSBnZXRMYWJlbGVkU2VnbWVudHMoYW5vbWFseUlkKTtcbiAgc2V0QW5vbWFseVN0YXR1cyhhbm9tYWx5SWQsICdsZWFybmluZycpO1xuICBsZXQgYW5vbWFseTpBbm9tYWx5ICA9IGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQpO1xuICBsZXQgcGF0dGVybiA9IGFub21hbHkucGF0dGVybjtcbiAgbGV0IHRhc2sgPSB7XG4gICAgdHlwZTogJ2xlYXJuJyxcbiAgICBhbm9tYWx5X2lkOiBhbm9tYWx5SWQsXG4gICAgcGF0dGVybixcbiAgICBzZWdtZW50czogc2VnbWVudHNcbiAgfTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgcnVuVGFzayh0YXNrKTtcblxuICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgc2V0QW5vbWFseVN0YXR1cyhhbm9tYWx5SWQsICdyZWFkeScpO1xuICAgIGluc2VydFNlZ21lbnRzKGFub21hbHlJZCwgcmVzdWx0LnNlZ21lbnRzLCBmYWxzZSk7XG4gICAgc2V0QW5vbWFseVByZWRpY3Rpb25UaW1lKGFub21hbHlJZCwgcmVzdWx0Lmxhc3RfcHJlZGljdGlvbl90aW1lKTtcbiAgfSBlbHNlIHtcbiAgICBzZXRBbm9tYWx5U3RhdHVzKGFub21hbHlJZCwgJ2ZhaWxlZCcsIHJlc3VsdC5lcnJvcik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuUHJlZGljdChhbm9tYWx5SWQ6QW5vbWFseUlkKSB7XG4gIGxldCBhbm9tYWx5OkFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgbGV0IHBhdHRlcm4gPSBhbm9tYWx5LnBhdHRlcm47XG4gIGxldCB0YXNrID0ge1xuICAgIHR5cGU6ICdwcmVkaWN0JyxcbiAgICBhbm9tYWx5X2lkOiBhbm9tYWx5SWQsXG4gICAgcGF0dGVybixcbiAgICBsYXN0X3ByZWRpY3Rpb25fdGltZTogYW5vbWFseS5sYXN0X3ByZWRpY3Rpb25fdGltZVxuICB9O1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgcnVuVGFzayh0YXNrKTtcblxuICBpZihyZXN1bHQuc3RhdHVzID09PSAnZmFpbGVkJykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICAvLyBNZXJnaW5nIHNlZ21lbnRzXG4gIGxldCBzZWdtZW50cyA9IGdldExhYmVsZWRTZWdtZW50cyhhbm9tYWx5SWQpO1xuICBpZihzZWdtZW50cy5sZW5ndGggPiAwICYmIHJlc3VsdC5zZWdtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgbGV0IGxhc3RPbGRTZWdtZW50ID0gc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV07XG4gICAgbGV0IGZpcnN0TmV3U2VnbWVudCA9IHJlc3VsdC5zZWdtZW50c1swXTtcblxuICAgIGlmKGZpcnN0TmV3U2VnbWVudC5zdGFydCA8PSBsYXN0T2xkU2VnbWVudC5maW5pc2gpIHtcbiAgICAgIHJlc3VsdC5zZWdtZW50c1swXS5zdGFydCA9IGxhc3RPbGRTZWdtZW50LnN0YXJ0O1xuICAgICAgcmVtb3ZlU2VnbWVudHMoYW5vbWFseUlkLCBbbGFzdE9sZFNlZ21lbnQuaWRdKTtcbiAgICB9XG4gIH1cblxuICBpbnNlcnRTZWdtZW50cyhhbm9tYWx5SWQsIHJlc3VsdC5zZWdtZW50cywgZmFsc2UpO1xuICBzZXRBbm9tYWx5UHJlZGljdGlvblRpbWUoYW5vbWFseUlkLCByZXN1bHQubGFzdF9wcmVkaWN0aW9uX3RpbWUpO1xuICByZXR1cm4gcmVzdWx0LnNlZ21lbnRzO1xufVxuXG5leHBvcnQgeyBydW5MZWFybmluZywgcnVuUHJlZGljdCB9XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBnZXRKc29uRGF0YVN5bmMsIHdyaXRlSnNvbkRhdGFTeW5jIH0gZnJvbSAnLi9qc29uJ1xuaW1wb3J0IHsgQU5PTUFMSUVTX1BBVEggfSBmcm9tICcuLi9jb25maWcnXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5leHBvcnQgdHlwZSBEYXRhc291cmNlID0ge1xuICBtZXRob2Q6IHN0cmluZyxcbiAgZGF0YTogT2JqZWN0LFxuICBwYXJhbXM6IE9iamVjdCxcbiAgdHlwZTogc3RyaW5nLFxuICB1cmw6IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBNZXRyaWMgPSB7XG4gIGRhdGFzb3VyY2U6IHN0cmluZyxcbiAgdGFyZ2V0czogc3RyaW5nW11cbn1cblxuZXhwb3J0IHR5cGUgQW5vbWFseSA9IHtcbiAgbmFtZTogc3RyaW5nLFxuXG4gIHBhbmVsVXJsOiBzdHJpbmcsXG5cbiAgcGF0dGVybjogc3RyaW5nLFxuICBtZXRyaWM6IE1ldHJpYyxcbiAgZGF0YXNvdXJjZTogRGF0YXNvdXJjZVxuICBzdGF0dXM6IHN0cmluZyxcbiAgZXJyb3I/OiBzdHJpbmcsXG5cbiAgbGFzdF9wcmVkaWN0aW9uX3RpbWU6IG51bWJlcixcbiAgbmV4dF9pZDogbnVtYmVyXG59XG5cbmV4cG9ydCB0eXBlIEFub21hbHlJZCA9IHN0cmluZztcblxubGV0IGFub21hbGllc05hbWVUb0lkTWFwID0ge307XG5cbmZ1bmN0aW9uIGxvYWRBbm9tYWxpZXNNYXAoKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYGFsbF9hbm9tYWxpZXMuanNvbmApO1xuICBpZighZnMuZXhpc3RzU3luYyhmaWxlbmFtZSkpIHtcbiAgICBzYXZlQW5vbWFsaWVzTWFwKCk7XG4gIH1cbiAgYW5vbWFsaWVzTmFtZVRvSWRNYXAgPSBnZXRKc29uRGF0YVN5bmMoZmlsZW5hbWUpO1xufVxuXG5mdW5jdGlvbiBzYXZlQW5vbWFsaWVzTWFwKCkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGBhbGxfYW5vbWFsaWVzLmpzb25gKTtcbiAgd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWUsIGFub21hbGllc05hbWVUb0lkTWFwKTtcbn1cblxuZnVuY3Rpb24gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlOYW1lOnN0cmluZykgOiBBbm9tYWx5SWQge1xuICBsb2FkQW5vbWFsaWVzTWFwKCk7XG4gIGFub21hbHlOYW1lID0gYW5vbWFseU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgaWYoYW5vbWFseU5hbWUgaW4gYW5vbWFsaWVzTmFtZVRvSWRNYXApIHtcbiAgICByZXR1cm4gYW5vbWFsaWVzTmFtZVRvSWRNYXBbYW5vbWFseU5hbWVdO1xuICB9XG4gIHJldHVybiBhbm9tYWx5TmFtZTtcbn1cblxuZnVuY3Rpb24gaW5zZXJ0QW5vbWFseShhbm9tYWx5OiBBbm9tYWx5KSA6IEFub21hbHlJZCB7XG4gIGNvbnN0IGhhc2hTdHJpbmcgPSBhbm9tYWx5Lm5hbWUgKyAobmV3IERhdGUoKSkudG9TdHJpbmcoKTtcbiAgY29uc3QgYW5vbWFseUlkOkFub21hbHlJZCA9IGNyeXB0by5jcmVhdGVIYXNoKCdtZDUnKS51cGRhdGUoaGFzaFN0cmluZykuZGlnZXN0KCdoZXgnKTtcbiAgYW5vbWFsaWVzTmFtZVRvSWRNYXBbYW5vbWFseS5uYW1lXSA9IGFub21hbHlJZDtcbiAgc2F2ZUFub21hbGllc01hcCgpO1xuICAvLyByZXR1cm4gYW5vbWFseUlkXG4gIC8vIGNvbnN0IGFub21hbHlJZDpBbm9tYWx5SWQgPSBhbm9tYWx5Lm5hbWU7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYCR7YW5vbWFseUlkfS5qc29uYCk7XG4gIGlmKGZzLmV4aXN0c1N5bmMoZmlsZW5hbWUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgc2F2ZUFub21hbHkoYW5vbWFseUlkLCBhbm9tYWx5KTtcbiAgcmV0dXJuIGFub21hbHlJZDtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQW5vbWFseShhbm9tYWx5SWQ6QW5vbWFseUlkKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYCR7YW5vbWFseUlkfS5qc29uYCk7XG4gIGZzLnVubGlua1N5bmMoZmlsZW5hbWUpO1xufVxuXG5mdW5jdGlvbiBzYXZlQW5vbWFseShhbm9tYWx5SWQ6IEFub21hbHlJZCwgYW5vbWFseTogQW5vbWFseSkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGAke2Fub21hbHlJZH0uanNvbmApO1xuICByZXR1cm4gd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWUsIGFub21hbHkpO1xufVxuXG5mdW5jdGlvbiBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkOiBBbm9tYWx5SWQpIDogQW5vbWFseSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYCR7YW5vbWFseUlkfS5qc29uYCk7XG4gIGlmKCFmcy5leGlzdHNTeW5jKGZpbGVuYW1lKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBnZXRKc29uRGF0YVN5bmMoZmlsZW5hbWUpO1xufVxuXG5mdW5jdGlvbiBsb2FkQW5vbWFseUJ5TmFtZShhbm9tYWx5TmFtZTogc3RyaW5nKSA6IEFub21hbHkge1xuICBsZXQgYW5vbWFseUlkID0gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlOYW1lKTtcbiAgcmV0dXJuIGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQpO1xufVxuXG5mdW5jdGlvbiBzYXZlQW5vbWFseVR5cGVJbmZvKGluZm8pIHtcbiAgY29uc29sZS5sb2coJ1NhdmluZycpO1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGAke2luZm8ubmFtZX0uanNvbmApO1xuICBpZihpbmZvLm5leHRfaWQgPT09IHVuZGVmaW5lZCkge1xuICAgIGluZm8ubmV4dF9pZCA9IDA7XG4gIH1cbiAgaWYoaW5mby5sYXN0X3ByZWRpY3Rpb25fdGltZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpbmZvLmxhc3RfcHJlZGljdGlvbl90aW1lID0gMDtcbiAgfVxuXG4gIHJldHVybiB3cml0ZUpzb25EYXRhU3luYyhmaWxlbmFtZSwgaW5mbyk7XG59XG5cbmZ1bmN0aW9uIGdldEFub21hbHlUeXBlSW5mbyhuYW1lKSB7XG4gIHJldHVybiBnZXRKc29uRGF0YVN5bmMocGF0aC5qb2luKEFOT01BTElFU19QQVRILCBgJHtuYW1lfS5qc29uYCkpO1xufVxuXG5mdW5jdGlvbiBzZXRBbm9tYWx5U3RhdHVzKGFub21hbHlJZDpBbm9tYWx5SWQsIHN0YXR1czpzdHJpbmcsIGVycm9yPzpzdHJpbmcpIHtcbiAgbGV0IGluZm8gPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgaW5mby5zdGF0dXMgPSBzdGF0dXM7XG4gIGlmKGVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICBpbmZvLmVycm9yID0gZXJyb3I7XG4gIH0gZWxzZSB7XG4gICAgaW5mby5lcnJvciA9ICcnO1xuICB9XG4gIHNhdmVBbm9tYWx5KGFub21hbHlJZCwgaW5mbyk7XG59XG5cbmZ1bmN0aW9uIHNldEFub21hbHlQcmVkaWN0aW9uVGltZShhbm9tYWx5SWQ6QW5vbWFseUlkLCBsYXN0UHJlZGljdGlvblRpbWU6bnVtYmVyKSB7XG4gIGxldCBpbmZvID0gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZCk7XG4gIGluZm8ubGFzdF9wcmVkaWN0aW9uX3RpbWUgPSBsYXN0UHJlZGljdGlvblRpbWU7XG4gIHNhdmVBbm9tYWx5KGFub21hbHlJZCwgaW5mbyk7XG59XG5cbmV4cG9ydCB7XG4gIHNhdmVBbm9tYWx5LCBsb2FkQW5vbWFseUJ5SWQsIGxvYWRBbm9tYWx5QnlOYW1lLCBpbnNlcnRBbm9tYWx5LCByZW1vdmVBbm9tYWx5LCBzYXZlQW5vbWFseVR5cGVJbmZvLFxuICBnZXRBbm9tYWx5VHlwZUluZm8sIGdldEFub21hbHlJZEJ5TmFtZSwgc2V0QW5vbWFseVN0YXR1cywgc2V0QW5vbWFseVByZWRpY3Rpb25UaW1lXG59XG4iLCJpbXBvcnQgKiBhcyBjb25maWcgZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcblxyXG5cclxuLy8gc2VlIGFuYWx5dGljcy9wYXR0ZXJuX2RldGVjdGlvbl9tb2RlbC5weSB3aXRoIGZvbGRlcnMgYXZhaWxhYmxlXHJcblxyXG5mdW5jdGlvbiBtYXliZUNyZWF0ZShwYXRoOiBzdHJpbmcpOiB2b2lkIHtcclxuICBpZihmcy5leGlzdHNTeW5jKHBhdGgpKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIGZzLm1rZGlyU3luYyhwYXRoKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRGF0YUZvbGRlcnMoKTogdm9pZCB7XHJcbiAgdmFyIGZvbGRlcnMgPSBbXHJcbiAgICBjb25maWcuREFUQV9QQVRILFxyXG4gICAgY29uZmlnLkRBVEFTRVRTX1BBVEgsXHJcbiAgICBjb25maWcuQU5PTUFMSUVTX1BBVEgsXHJcbiAgICBjb25maWcuTU9ERUxTX1BBVEgsXHJcbiAgICBjb25maWcuTUVUUklDU19QQVRILFxyXG4gICAgY29uZmlnLlNFR01FTlRTX1BBVEhcclxuICBdLmZvckVhY2gobWF5YmVDcmVhdGUpO1xyXG59XHJcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcblxuYXN5bmMgZnVuY3Rpb24gZ2V0SnNvbkRhdGEoZmlsZW5hbWU6IHN0cmluZyk6IFByb21pc2U8T2JqZWN0PiB7XG4gIHZhciBkYXRhID0gYXdhaXQgbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZnMucmVhZEZpbGUoZmlsZW5hbWUsICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgaWYoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgcmVqZWN0KCdDYW5gdCByZWFkIGZpbGUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyBmaWxlIGZvcm1hdCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyaXRlSnNvbkRhdGEoZmlsZW5hbWU6IHN0cmluZywgZGF0YTogT2JqZWN0KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZnMud3JpdGVGaWxlKGZpbGVuYW1lLCBKU09OLnN0cmluZ2lmeShkYXRhKSwgJ3V0ZjgnLCAoZXJyKSA9PiB7XG4gICAgICBpZihlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICByZWplY3QoJ0NhdGB0IHdyaXRlIGZpbGUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0SnNvbkRhdGFTeW5jKGZpbGVuYW1lOiBzdHJpbmcpIHtcbiAgbGV0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4Jyk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyBmaWxlIGZvcm1hdCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyaXRlSnNvbkRhdGFTeW5jKGZpbGVuYW1lOiBzdHJpbmcsIGRhdGE6IE9iamVjdCkge1xuICBmcy53cml0ZUZpbGVTeW5jKGZpbGVuYW1lLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG59XG5cbmV4cG9ydCB7XG4gIGdldEpzb25EYXRhLFxuICB3cml0ZUpzb25EYXRhLFxuICBnZXRKc29uRGF0YVN5bmMsXG4gIHdyaXRlSnNvbkRhdGFTeW5jXG59XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZ2V0SnNvbkRhdGFTeW5jLCB3cml0ZUpzb25EYXRhU3luYyB9ICBmcm9tICcuL2pzb24nO1xuaW1wb3J0IHsgTUVUUklDU19QQVRIIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5mdW5jdGlvbiBzYXZlVGFyZ2V0cyh0YXJnZXRzKSB7XG4gIGxldCBtZXRyaWNzID0gW107XG4gIGZvciAobGV0IHRhcmdldCBvZiB0YXJnZXRzKSB7XG4gICAgbWV0cmljcy5wdXNoKHNhdmVUYXJnZXQodGFyZ2V0KSk7XG4gIH1cbiAgcmV0dXJuIG1ldHJpY3M7XG59XG5cbmZ1bmN0aW9uIHNhdmVUYXJnZXQodGFyZ2V0KSB7XG4gIC8vY29uc3QgbWQ1ID0gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpXG4gIGNvbnN0IHRhcmdldElkID0gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShKU09OLnN0cmluZ2lmeSh0YXJnZXQpKS5kaWdlc3QoJ2hleCcpO1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oTUVUUklDU19QQVRILCBgJHt0YXJnZXRJZH0uanNvbmApO1xuICB3cml0ZUpzb25EYXRhU3luYyhmaWxlbmFtZSwgdGFyZ2V0KTtcbiAgcmV0dXJuIHRhcmdldElkO1xufVxuXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0SWQpIHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKE1FVFJJQ1NfUEFUSCwgYCR7dGFyZ2V0SWR9Lmpzb25gKTtcbiAgcmV0dXJuIGdldEpzb25EYXRhU3luYyhmaWxlbmFtZSk7XG59XG5cbmV4cG9ydCB7IHNhdmVUYXJnZXRzLCBnZXRUYXJnZXQgfVxuIiwiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IGxvYWRBbm9tYWx5QnlJZCB9IGZyb20gJy4vYW5vbWFseVR5cGUnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZE5vdGlmaWNhdGlvbihhbm9tYWx5SWQsIGFjdGl2ZSkge1xuICBsZXQgYW5vbWFseU5hbWUgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKS5uYW1lO1xuICBjb25zb2xlLmxvZygnTm90aWZpY2F0aW9uICcgKyBhbm9tYWx5TmFtZSk7XG5cbiAgbGV0IG5vdGlmaWNhdGlvbiA9IHtcbiAgICBhbm9tYWx5OiBhbm9tYWx5TmFtZSxcbiAgICBzdGF0dXM6ICcnXG4gIH07XG4gIGlmKGFjdGl2ZSkge1xuICAgIG5vdGlmaWNhdGlvbi5zdGF0dXMgPSAnYWxlcnQnO1xuICB9IGVsc2Uge1xuICAgIG5vdGlmaWNhdGlvbi5zdGF0dXMgPSAnT0snO1xuICB9XG5cbiAgbGV0IGVuZHBvaW50ID0gcHJvY2Vzcy5lbnYuSEFTVElDX0FMRVJUX0VORFBPSU5UO1xuICBpZihlbmRwb2ludCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc29sZS5lcnJvcihgQ2FuJ3Qgc2VuZCBhbGVydCwgZW52IEhBU1RJQ19BTEVSVF9FTkRQT0lOVCBpcyB1bmRlZmluZWRgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIHZhciBkYXRhID0gYXdhaXQgYXhpb3MucG9zdChlbmRwb2ludCwge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShub3RpZmljYXRpb24pXG4gICAgfSlcbiAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgfSBjYXRjaChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKGBDYW4ndCBzZW5kIGFsZXJ0IHRvICR7ZW5kcG9pbnR9LiBFcnJvcjogJHtlcnJ9YClcbiAgfVxuICBcbn1cblxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEpzb25EYXRhU3luYywgd3JpdGVKc29uRGF0YVN5bmMgfSAgZnJvbSAnLi9qc29uJztcbmltcG9ydCB7IFNFR01FTlRTX1BBVEggfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgQW5vbWFseUlkLCBsb2FkQW5vbWFseUJ5SWQsIHNhdmVBbm9tYWx5IH0gZnJvbSAnLi9hbm9tYWx5VHlwZSc7XG5cbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcblxuZnVuY3Rpb24gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihTRUdNRU5UU19QQVRILCBgJHthbm9tYWx5SWR9X2xhYmVsZWQuanNvbmApO1xuXG4gIGxldCBzZWdtZW50cyA9IFtdO1xuICB0cnkge1xuICAgIHNlZ21lbnRzID0gZ2V0SnNvbkRhdGFTeW5jKGZpbGVuYW1lKTtcbiAgICBmb3IgKGxldCBzZWdtZW50IG9mIHNlZ21lbnRzKSB7XG4gICAgICBpZiAoc2VnbWVudC5sYWJlbGVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2VnbWVudC5sYWJlbGVkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xuICB9XG4gIHJldHVybiBzZWdtZW50cztcbn1cblxuZnVuY3Rpb24gZ2V0UHJlZGljdGVkU2VnbWVudHMoYW5vbWFseUlkOiBBbm9tYWx5SWQpIHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKFNFR01FTlRTX1BBVEgsIGAke2Fub21hbHlJZH1fc2VnbWVudHMuanNvbmApO1xuXG4gIGxldCBqc29uRGF0YTtcbiAgdHJ5IHtcbiAgICBqc29uRGF0YSA9IGdldEpzb25EYXRhU3luYyhmaWxlbmFtZSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcbiAgICBqc29uRGF0YSA9IFtdO1xuICB9XG4gIHJldHVybiBqc29uRGF0YTtcbn1cblxuZnVuY3Rpb24gc2F2ZVNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkLCBzZWdtZW50cykge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oU0VHTUVOVFNfUEFUSCwgYCR7YW5vbWFseUlkfV9sYWJlbGVkLmpzb25gKTtcblxuICB0cnkge1xuICAgIHJldHVybiB3cml0ZUpzb25EYXRhU3luYyhmaWxlbmFtZSwgXy51bmlxQnkoc2VnbWVudHMsICdzdGFydCcpKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xuICAgIHRocm93IG5ldyBFcnJvcignQ2FuYHQgd3JpdGUgdG8gZGInKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbnNlcnRTZWdtZW50cyhhbm9tYWx5SWQ6IEFub21hbHlJZCwgYWRkZWRTZWdtZW50cywgbGFiZWxlZDpib29sZWFuKSB7XG4gIC8vIFNldCBzdGF0dXNcbiAgbGV0IGluZm8gPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG5cbiAgbGV0IG5leHRJZCA9IGluZm8ubmV4dF9pZDtcbiAgbGV0IGFkZGVkSWRzID0gW11cbiAgZm9yIChsZXQgc2VnbWVudCBvZiBhZGRlZFNlZ21lbnRzKSB7XG4gICAgc2VnbWVudC5pZCA9IG5leHRJZDtcbiAgICBzZWdtZW50LmxhYmVsZWQgPSBsYWJlbGVkO1xuICAgIGFkZGVkSWRzLnB1c2gobmV4dElkKTtcbiAgICBuZXh0SWQrKztcbiAgICBzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xuICB9XG4gIGluZm8ubmV4dF9pZCA9IG5leHRJZDtcbiAgc2F2ZVNlZ21lbnRzKGFub21hbHlJZCwgc2VnbWVudHMpO1xuICBzYXZlQW5vbWFseShhbm9tYWx5SWQsIGluZm8pO1xuICByZXR1cm4gYWRkZWRJZHM7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkLCByZW1vdmVkU2VnbWVudHMpIHtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG4gIGZvciAobGV0IHNlZ21lbnRJZCBvZiByZW1vdmVkU2VnbWVudHMpIHtcbiAgICBzZWdtZW50cyA9IHNlZ21lbnRzLmZpbHRlcihlbCA9PiBlbC5pZCAhPT0gc2VnbWVudElkKTtcbiAgfVxuICBzYXZlU2VnbWVudHMoYW5vbWFseUlkLCBzZWdtZW50cyk7XG59XG5cbmV4cG9ydCB7IGdldExhYmVsZWRTZWdtZW50cywgZ2V0UHJlZGljdGVkU2VnbWVudHMsIHNhdmVTZWdtZW50cywgaW5zZXJ0U2VnbWVudHMsIHJlbW92ZVNlZ21lbnRzIH1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnYXhpb3MnKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2NyeXB0bycpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnZXZlbnQtc3RyZWFtJyk7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdmcycpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgna29hJyk7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdrb2EtYm9keXBhcnNlcicpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgna29hLXJvdXRlcicpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnbG9kYXNoJyk7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdwYXRoJyk7Il0sInNvdXJjZVJvb3QiOiIifQ==