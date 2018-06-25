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
const fs = __webpack_require__(/*! fs */ "fs");
const json_1 = __webpack_require__(/*! ./services/json */ "./src/services/json.ts");
let configFile = path.join(__dirname, '../../config.json');
let configExists = fs.existsSync(configFile);
exports.ANALYTICS_PATH = path.join(__dirname, '../../analytics');
exports.DATA_PATH = path.join(__dirname, '../../data');
exports.DATASETS_PATH = path.join(exports.DATA_PATH, 'datasets');
exports.ANOMALIES_PATH = path.join(exports.DATA_PATH, 'anomalies');
exports.MODELS_PATH = path.join(exports.DATA_PATH, 'models');
exports.METRICS_PATH = path.join(exports.DATA_PATH, 'metrics');
exports.SEGMENTS_PATH = path.join(exports.DATA_PATH, 'segments');
exports.HASTIC_PORT = getConfigField('HASTIC_PORT', '8000');
function getConfigField(field, defaultVal) {
    let val = defaultVal;
    if (process.env[field] !== undefined) {
        val = process.env[field];
    } else if (configExists) {
        let config = json_1.getJsonDataSync(configFile);
        if (config[field] !== undefined) {
            val = config[field];
        }
    }
    if (val === undefined) {
        throw new Error(`Please configure ${field}`);
    }
    return val;
}

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
const config_1 = __webpack_require__(/*! ./config */ "./src/config.ts");
data_1.checkDataFolders();
var app = new Koa();
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
    ctx.response.body = { status: 'Ok' };
}));
app.use(rootRouter.routes()).use(rootRouter.allowedMethods());
app.listen(config_1.HASTIC_PORT, () => {
    console.log(`Server is running on :${config_1.HASTIC_PORT}`);
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
const anomalyType_1 = __webpack_require__(/*! ./anomalyType */ "./src/services/anomalyType.ts");
const metrics_1 = __webpack_require__(/*! ./metrics */ "./src/services/metrics.ts");
const segments_1 = __webpack_require__(/*! ./segments */ "./src/services/segments.ts");
const analyticsConnection_1 = __webpack_require__(/*! ./analyticsConnection */ "./src/services/analyticsConnection.ts");
const taskMap = {};
let nextTaskId = 0;
const analyticsConnection = new analyticsConnection_1.AnalyticsConnection(onResponse);
function onResponse(response) {
    let taskId = response.__task_id;
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
    return __awaiter(this, void 0, void 0, function* () {
        let anomaly = anomalyType_1.loadAnomalyById(task.anomaly_id);
        task.metric = {
            datasource: anomaly.metric.datasource,
            targets: anomaly.metric.targets.map(t => metrics_1.getTarget(t))
        };
        task.__task_id = nextTaskId++;
        yield analyticsConnection.sendMessage(task);
        return new Promise((resolve, reject) => {
            taskMap[task.__task_id] = resolve;
        });
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

/***/ "./src/services/analyticsConnection.ts":
/*!*********************************************!*\
  !*** ./src/services/analyticsConnection.ts ***!
  \*********************************************/
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
const config_1 = __webpack_require__(/*! ../config */ "./src/config.ts");
const child_process_1 = __webpack_require__(/*! child_process */ "child_process");
const event_stream_1 = __webpack_require__(/*! event-stream */ "event-stream");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
class AnalyticsConnection {
    constructor(_onResponse) {
        this._onResponse = _onResponse;
        if (fs.existsSync(path.join(config_1.ANALYTICS_PATH, 'dist/worker/worker'))) {
            this._learnWorker = child_process_1.spawn('dist/worker/worker', [], { cwd: config_1.ANALYTICS_PATH });
        } else {
            // If compiled analytics script doesn't exist - fallback to regular python
            this._learnWorker = child_process_1.spawn('python3', ['worker.py'], { cwd: config_1.ANALYTICS_PATH });
        }
        this._learnWorker.stdout.pipe(event_stream_1.split()).pipe(event_stream_1.mapSync(this._onPipeMessage.bind(this)));
        this._learnWorker.stderr.on('data', data => console.error(`worker stderr: ${data}`));
    }
    _onPipeMessage(data) {
        console.log(`worker stdout: ${data}`);
        let response = JSON.parse(data);
        this._onResponse(response);
    }
    sendMessage(task) {
        return __awaiter(this, void 0, void 0, function* () {
            // return Promise.resolve().then(() => {
            let command = JSON.stringify(task);
            this._learnWorker.stdin.write(`${command}\n`);
            // });
        });
    }
}
exports.AnalyticsConnection = AnalyticsConnection;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbmZpZy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JvdXRlcy9hbGVydHMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JvdXRlcy9hbm9tYWxpZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JvdXRlcy9zZWdtZW50cy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvc2VydmljZXMvYWxlcnRzLnRzIiwid2VicGFjazovLy8uL3NyYy9zZXJ2aWNlcy9hbmFseXRpY3MudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZpY2VzL2FuYWx5dGljc0Nvbm5lY3Rpb24udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZpY2VzL2Fub21hbHlUeXBlLnRzIiwid2VicGFjazovLy8uL3NyYy9zZXJ2aWNlcy9kYXRhLnRzIiwid2VicGFjazovLy8uL3NyYy9zZXJ2aWNlcy9qc29uLnRzIiwid2VicGFjazovLy8uL3NyYy9zZXJ2aWNlcy9tZXRyaWNzLnRzIiwid2VicGFjazovLy8uL3NyYy9zZXJ2aWNlcy9ub3RpZmljYXRpb24udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZpY2VzL3NlZ21lbnRzLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2F4aW9zJylcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdjaGlsZF9wcm9jZXNzJylcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdjcnlwdG8nKVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2V2ZW50LXN0cmVhbScpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgnZnMnKVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2tvYScpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgna29hLWJvZHlwYXJzZXInKVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2tvYS1yb3V0ZXInKVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2xvZGFzaCcpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgncGF0aCcpXCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUNBO0FBQ0E7QUFHQSxJQUFJLGFBQWEsS0FBSyxJQUFMLENBQVUsU0FBVixFQUFxQixtQkFBckIsQ0FBakI7QUFDQSxJQUFJLGVBQWUsR0FBRyxVQUFILENBQWMsVUFBZCxDQUFuQjtBQUVhLHlCQUFpQixLQUFLLElBQUwsQ0FBVSxTQUFWLEVBQXFCLGlCQUFyQixDQUFqQjtBQUVBLG9CQUFZLEtBQUssSUFBTCxDQUFVLFNBQVYsRUFBcUIsWUFBckIsQ0FBWjtBQUVBLHdCQUFnQixLQUFLLElBQUwsQ0FB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QUFXLFNBQVMsTUFBVCxDQUFnQixNQUFNLEdBQUcsRUFBSCxLQUFVLFNBQWhDLENBQVg7QUFDRDtBQUNELGlCQUFhLFNBQWIsRUFBd0IsUUFBeEI7QUFDRDtBQUVnRix3Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1RWpGLGtDOzs7Ozs7Ozs7OztBQ0FBLDBDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLHlDOzs7Ozs7Ozs7OztBQ0FBLCtCOzs7Ozs7Ozs7OztBQ0FBLGdDOzs7Ozs7Ozs7OztBQ0FBLDJDOzs7Ozs7Ozs7OztBQ0FBLHVDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLGlDIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBnZXRKc29uRGF0YVN5bmMgfSBmcm9tICcuL3NlcnZpY2VzL2pzb24nO1xuXG5cbmxldCBjb25maWdGaWxlID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL2NvbmZpZy5qc29uJyk7XG5sZXQgY29uZmlnRXhpc3RzID0gZnMuZXhpc3RzU3luYyhjb25maWdGaWxlKTtcblxuZXhwb3J0IGNvbnN0IEFOQUxZVElDU19QQVRIID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL2FuYWx5dGljcycpO1xuXG5leHBvcnQgY29uc3QgREFUQV9QQVRIID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL2RhdGEnKTtcblxuZXhwb3J0IGNvbnN0IERBVEFTRVRTX1BBVEggPSBwYXRoLmpvaW4oREFUQV9QQVRILCAnZGF0YXNldHMnKTtcbmV4cG9ydCBjb25zdCBBTk9NQUxJRVNfUEFUSCA9IHBhdGguam9pbihEQVRBX1BBVEgsICdhbm9tYWxpZXMnKTtcbmV4cG9ydCBjb25zdCBNT0RFTFNfUEFUSCA9IHBhdGguam9pbihEQVRBX1BBVEgsICdtb2RlbHMnKTtcbmV4cG9ydCBjb25zdCBNRVRSSUNTX1BBVEggPSBwYXRoLmpvaW4oREFUQV9QQVRILCAnbWV0cmljcycpO1xuZXhwb3J0IGNvbnN0IFNFR01FTlRTX1BBVEggPSBwYXRoLmpvaW4oREFUQV9QQVRILCAnc2VnbWVudHMnKTtcblxuZXhwb3J0IGNvbnN0IEhBU1RJQ19QT1JUID0gZ2V0Q29uZmlnRmllbGQoJ0hBU1RJQ19QT1JUJywgJzgwMDAnKTtcbmZ1bmN0aW9uIGdldENvbmZpZ0ZpZWxkKGZpZWxkLCBkZWZhdWx0VmFsPykge1xuICBsZXQgdmFsID0gZGVmYXVsdFZhbDtcblxuICBpZihwcm9jZXNzLmVudltmaWVsZF0gIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbCA9IHByb2Nlc3MuZW52W2ZpZWxkXTtcbiAgfSBlbHNlIGlmKGNvbmZpZ0V4aXN0cykge1xuICAgIGxldCBjb25maWc6IGFueSA9IGdldEpzb25EYXRhU3luYyhjb25maWdGaWxlKTtcblxuICAgIGlmKGNvbmZpZ1tmaWVsZF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFsID0gY29uZmlnW2ZpZWxkXTtcbiAgICB9XG4gIH1cblxuICBpZih2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgUGxlYXNlIGNvbmZpZ3VyZSAke2ZpZWxkfWApXG4gIH1cbiAgcmV0dXJuIHZhbDtcbn1cbiIsImltcG9ydCAqIGFzIEtvYSBmcm9tICdrb2EnO1xuaW1wb3J0ICogYXMgUm91dGVyIGZyb20gJ2tvYS1yb3V0ZXInO1xuaW1wb3J0ICogYXMgYm9keVBhcnNlciBmcm9tICdrb2EtYm9keXBhcnNlcic7XG5cblxuaW1wb3J0IHsgcm91dGVyIGFzIGFub21hbGllc1JvdXRlciB9IGZyb20gJy4vcm91dGVzL2Fub21hbGllcyc7XG5pbXBvcnQgeyByb3V0ZXIgYXMgc2VnbWVudHNSb3V0ZXIgfSBmcm9tICcuL3JvdXRlcy9zZWdtZW50cyc7XG5pbXBvcnQgeyByb3V0ZXIgYXMgYWxlcnRzUm91dGVyIH0gZnJvbSAnLi9yb3V0ZXMvYWxlcnRzJztcblxuaW1wb3J0IHsgY2hlY2tEYXRhRm9sZGVycyB9IGZyb20gJy4vc2VydmljZXMvZGF0YSc7XG5cbmltcG9ydCB7IEhBU1RJQ19QT1JUIH0gZnJvbSAnLi9jb25maWcnO1xuXG5jaGVja0RhdGFGb2xkZXJzKCk7XG5cbnZhciBhcHAgPSBuZXcgS29hKCk7XG5cbmFwcC51c2UoYm9keVBhcnNlcigpKVxuXG5hcHAudXNlKGFzeW5jIGZ1bmN0aW9uKGN0eCwgbmV4dCkge1xuICBjdHguc2V0KCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICBjdHguc2V0KCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gIGN0eC5zZXQoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnT3JpZ2luLCBYLVJlcXVlc3RlZC1XaXRoLCBDb250ZW50LVR5cGUsIEFjY2VwdCcpO1xuICBuZXh0KCk7XG59KTtcblxuXG52YXIgcm9vdFJvdXRlciA9IG5ldyBSb3V0ZXIoKTtcbnJvb3RSb3V0ZXIudXNlKCcvYW5vbWFsaWVzJywgYW5vbWFsaWVzUm91dGVyLnJvdXRlcygpLCBhbm9tYWxpZXNSb3V0ZXIuYWxsb3dlZE1ldGhvZHMoKSk7XG5yb290Um91dGVyLnVzZSgnL3NlZ21lbnRzJywgc2VnbWVudHNSb3V0ZXIucm91dGVzKCksIHNlZ21lbnRzUm91dGVyLmFsbG93ZWRNZXRob2RzKCkpO1xucm9vdFJvdXRlci51c2UoJy9hbGVydHMnLCBhbGVydHNSb3V0ZXIucm91dGVzKCksIGFsZXJ0c1JvdXRlci5hbGxvd2VkTWV0aG9kcygpKTtcbnJvb3RSb3V0ZXIuZ2V0KCcvJywgYXN5bmMgKGN0eCkgPT4ge1xuICBjdHgucmVzcG9uc2UuYm9keSA9IHsgc3RhdHVzOiAnT2snIH07XG59KTtcblxuYXBwXG4gIC51c2Uocm9vdFJvdXRlci5yb3V0ZXMoKSlcbiAgLnVzZShyb290Um91dGVyLmFsbG93ZWRNZXRob2RzKCkpO1xuXG5hcHAubGlzdGVuKEhBU1RJQ19QT1JULCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBTZXJ2ZXIgaXMgcnVubmluZyBvbiA6JHtIQVNUSUNfUE9SVH1gKTtcbn0pO1xuXG4iLCJpbXBvcnQgeyBBbm9tYWx5SWQsIGdldEFub21hbHlJZEJ5TmFtZSwgbG9hZEFub21hbHlCeUlkIH0gZnJvbSAnLi4vc2VydmljZXMvYW5vbWFseVR5cGUnO1xuaW1wb3J0IHsgZ2V0QWxlcnRzQW5vbWFsaWVzLCBzYXZlQWxlcnRzQW5vbWFsaWVzIH0gZnJvbSAnLi4vc2VydmljZXMvYWxlcnRzJztcblxuaW1wb3J0ICogYXMgUm91dGVyIGZyb20gJ2tvYS1yb3V0ZXInO1xuXG5cbmZ1bmN0aW9uIGdldEFsZXJ0KGN0eDogUm91dGVyLklSb3V0ZXJDb250ZXh0KSB7XG4gIFxuICBsZXQgYW5vbWFseUlkOiBBbm9tYWx5SWQgPSBjdHgucmVxdWVzdC5xdWVyeS5hbm9tYWx5X2lkO1xuICBsZXQgYW5vbWFseSA9IGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQpXG4gIGlmKGFub21hbHkgPT0gbnVsbCkge1xuICAgIGFub21hbHlJZCA9IGdldEFub21hbHlJZEJ5TmFtZShhbm9tYWx5SWQudG9Mb3dlckNhc2UoKSk7XG4gIH1cblxuICBsZXQgYWxlcnRzQW5vbWFsaWVzID0gZ2V0QWxlcnRzQW5vbWFsaWVzKCk7XG4gIGxldCBwb3MgPSBhbGVydHNBbm9tYWxpZXMuaW5kZXhPZihhbm9tYWx5SWQpO1xuXG4gIGxldCBlbmFibGU6IGJvb2xlYW4gPSAocG9zICE9PSAtMSk7XG4gIGN0eC5yZXNwb25zZS5ib2R5ID0geyBlbmFibGUgfTtcbiAgXG59XG5cbmZ1bmN0aW9uIGNoYW5nZUFsZXJ0KGN0eDogUm91dGVyLklSb3V0ZXJDb250ZXh0KSB7XG5cbiAgbGV0IGFub21hbHlJZDogQW5vbWFseUlkID0gY3R4LnJlcXVlc3QuYm9keS5hbm9tYWx5X2lkO1xuICBsZXQgZW5hYmxlOiBib29sZWFuID0gY3R4LnJlcXVlc3QuYm9keS5lbmFibGU7XG5cbiAgbGV0IGFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKVxuICBpZihhbm9tYWx5ID09IG51bGwpIHtcbiAgICBhbm9tYWx5SWQgPSBnZXRBbm9tYWx5SWRCeU5hbWUoYW5vbWFseUlkLnRvTG93ZXJDYXNlKCkpO1xuICB9XG5cbiAgbGV0IGFsZXJ0c0Fub21hbGllcyA9IGdldEFsZXJ0c0Fub21hbGllcygpO1xuICBsZXQgcG9zOiBudW1iZXIgPSBhbGVydHNBbm9tYWxpZXMuaW5kZXhPZihhbm9tYWx5SWQpO1xuICBpZihlbmFibGUgJiYgcG9zID09IC0xKSB7XG4gICAgYWxlcnRzQW5vbWFsaWVzLnB1c2goYW5vbWFseUlkKTtcbiAgICBzYXZlQWxlcnRzQW5vbWFsaWVzKGFsZXJ0c0Fub21hbGllcyk7XG4gIH0gZWxzZSBpZighZW5hYmxlICYmIHBvcyA+IC0xKSB7XG4gICAgYWxlcnRzQW5vbWFsaWVzLnNwbGljZShwb3MsIDEpO1xuICAgIHNhdmVBbGVydHNBbm9tYWxpZXMoYWxlcnRzQW5vbWFsaWVzKTtcbiAgfVxuICBjdHgucmVzcG9uc2UuYm9keSA9IHsgc3RhdHVzOiAnT0snIH07XG5cbn1cblxuZXhwb3J0IGNvbnN0IHJvdXRlciA9IG5ldyBSb3V0ZXIoKTtcblxucm91dGVyLmdldCgnLycsIGdldEFsZXJ0KTtcbnJvdXRlci5wb3N0KCcvJywgY2hhbmdlQWxlcnQpO1xuXG4iLCJpbXBvcnQgKiBhcyBSb3V0ZXIgZnJvbSAna29hLXJvdXRlcic7XG5cbmltcG9ydCB7XG4gIERhdGFzb3VyY2UsXG4gIE1ldHJpYyxcbiAgQW5vbWFseSxcbiAgc2F2ZUFub21hbHksXG4gIGluc2VydEFub21hbHksIHJlbW92ZUFub21hbHksIGxvYWRBbm9tYWx5QnlOYW1lLCBsb2FkQW5vbWFseUJ5SWQsIGdldEFub21hbHlJZEJ5TmFtZVxufSBmcm9tICcuLi9zZXJ2aWNlcy9hbm9tYWx5VHlwZSc7XG5pbXBvcnQgeyBydW5MZWFybmluZyB9IGZyb20gJy4uL3NlcnZpY2VzL2FuYWx5dGljcydcbmltcG9ydCB7IHNhdmVUYXJnZXRzIH0gZnJvbSAnLi4vc2VydmljZXMvbWV0cmljcyc7XG5cbmFzeW5jIGZ1bmN0aW9uIHNlbmRBbm9tYWx5VHlwZVN0YXR1cyhjdHg6IFJvdXRlci5JUm91dGVyQ29udGV4dCkge1xuICBsZXQgaWQgPSBjdHgucmVxdWVzdC5xdWVyeS5pZDtcbiAgbGV0IG5hbWUgPSBjdHgucmVxdWVzdC5xdWVyeS5uYW1lO1xuICB0cnkge1xuICAgIGxldCBhbm9tYWx5OiBBbm9tYWx5O1xuICAgIGlmKGlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbm9tYWx5ID0gbG9hZEFub21hbHlCeU5hbWUobmFtZSk7XG4gICAgfVxuICAgIGlmKGFub21hbHkgPT09IG51bGwpIHtcbiAgICAgIGN0eC5yZXNwb25zZS5zdGF0dXMgPSA0MDQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKGFub21hbHkuc3RhdHVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gc3RhdHVzIGZvciAnICsgbmFtZSk7XG4gICAgfVxuICAgIGN0eC5yZXNwb25zZS5ib2R5ID0geyBzdGF0dXM6IGFub21hbHkuc3RhdHVzLCBlcnJvck1lc3NhZ2U6IGFub21hbHkuZXJyb3IgfTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAvLyBUT0RPOiBiZXR0ZXIgc2VuZCA0MDQgd2hlbiB3ZSBrbm93IHRoYW4gaXNuYHQgZm91bmRcbiAgICBjdHgucmVzcG9uc2Uuc3RhdHVzID0gNTAwO1xuICAgIGN0eC5yZXNwb25zZS5ib2R5ID0geyBlcnJvcjogJ0NhbmB0IHJldHVybiBhbnl0aGluZycgfTtcbiAgfVxuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEFub21hbHkoY3R4OiBSb3V0ZXIuSVJvdXRlckNvbnRleHQpIHtcbiAgdHJ5IHtcbiAgICBsZXQgaWQgPSBjdHgucmVxdWVzdC5xdWVyeS5pZDtcbiAgICBsZXQgbmFtZSA9IGN0eC5yZXF1ZXN0LnF1ZXJ5Lm5hbWU7XG5cbiAgICBsZXQgYW5vbWFseTpBbm9tYWx5O1xuICAgIGlmKGlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbm9tYWx5ID0gbG9hZEFub21hbHlCeU5hbWUobmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICB9XG4gICAgaWYoYW5vbWFseSA9PT0gbnVsbCkge1xuICAgICAgY3R4LnJlc3BvbnNlLnN0YXR1cyA9IDQwNDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHtcbiAgICAgIG5hbWU6IGFub21hbHkubmFtZSxcbiAgICAgIG1ldHJpYzogYW5vbWFseS5tZXRyaWMsXG4gICAgICBzdGF0dXM6IGFub21hbHkuc3RhdHVzXG4gICAgfTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAvLyBUT0RPOiBiZXR0ZXIgc2VuZCA0MDQgd2hlbiB3ZSBrbm93IHRoYW4gaXNuYHQgZm91bmRcbiAgICBjdHgucmVzcG9uc2Uuc3RhdHVzID0gNTAwO1xuICAgIGN0eC5yZXNwb25zZS5ib2R5ID0gJ0NhbmB0IGdldCBhbnl0aGluZyc7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlQW5vbWFseShjdHg6IFJvdXRlci5JUm91dGVyQ29udGV4dCkge1xuICB0cnkge1xuICAgIGxldCBib2R5ID0gY3R4LnJlcXVlc3QuYm9keTtcbiAgICBjb25zdCBtZXRyaWM6TWV0cmljID0ge1xuICAgICAgZGF0YXNvdXJjZTogYm9keS5tZXRyaWMuZGF0YXNvdXJjZSxcbiAgICAgIHRhcmdldHM6IHNhdmVUYXJnZXRzKGJvZHkubWV0cmljLnRhcmdldHMpXG4gICAgfTtcblxuICAgIGNvbnN0IGFub21hbHk6QW5vbWFseSA9IHtcbiAgICAgIG5hbWU6IGJvZHkubmFtZSxcbiAgICAgIHBhbmVsVXJsOiBib2R5LnBhbmVsVXJsLFxuICAgICAgcGF0dGVybjogYm9keS5wYXR0ZXJuLnRvTG93ZXJDYXNlKCksXG4gICAgICBtZXRyaWM6IG1ldHJpYyxcbiAgICAgIGRhdGFzb3VyY2U6IGJvZHkuZGF0YXNvdXJjZSxcbiAgICAgIHN0YXR1czogJ2xlYXJuaW5nJyxcbiAgICAgIGxhc3RfcHJlZGljdGlvbl90aW1lOiAwLFxuICAgICAgbmV4dF9pZDogMFxuICAgIH07XG4gICAgbGV0IGFub21hbHlJZCA9IGluc2VydEFub21hbHkoYW5vbWFseSk7XG4gICAgaWYoYW5vbWFseUlkID09PSBudWxsKSB7XG4gICAgICBjdHgucmVzcG9uc2Uuc3RhdHVzID0gNDAzO1xuICAgICAgY3R4LnJlc3BvbnNlLmJvZHkgPSB7XG4gICAgICAgIGNvZGU6IDQwMyxcbiAgICAgICAgbWVzc2FnZTogJ0FscmVhZHkgZXhpc3RzJ1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHsgYW5vbWFseV9pZDogYW5vbWFseUlkIH07XG5cbiAgICBydW5MZWFybmluZyhhbm9tYWx5SWQpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBjdHgucmVzcG9uc2Uuc3RhdHVzID0gNTAwO1xuICAgIGN0eC5yZXNwb25zZS5ib2R5ID0ge1xuICAgICAgY29kZTogNTAwLFxuICAgICAgbWVzc2FnZTogJ0ludGVybmFsIGVycm9yJ1xuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVsZXRlQW5vbWFseShjdHg6IFJvdXRlci5JUm91dGVyQ29udGV4dCkge1xuICB0cnkge1xuICAgIGxldCBpZCA9IGN0eC5yZXF1ZXN0LnF1ZXJ5LmlkO1xuICAgIGxldCBuYW1lID0gY3R4LnJlcXVlc3QucXVlcnkubmFtZTtcblxuICAgIGlmKGlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlbW92ZUFub21hbHkoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmVBbm9tYWx5KG5hbWUudG9Mb3dlckNhc2UoKSk7XG4gICAgfVxuICAgIFxuICAgIGN0eC5yZXNwb25zZS5ib2R5ID0ge1xuICAgICAgY29kZTogMjAwLFxuICAgICAgbWVzc2FnZTogJ1N1Y2Nlc3MnXG4gICAgfTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY3R4LnJlc3BvbnNlLnN0YXR1cyA9IDUwMDtcbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHtcbiAgICAgIGNvZGU6IDUwMCxcbiAgICAgIG1lc3NhZ2U6ICdJbnRlcm5hbCBlcnJvcidcbiAgICB9O1xuICB9XG59XG5cblxuZXhwb3J0IHZhciByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG5cbnJvdXRlci5nZXQoJy9zdGF0dXMnLCBzZW5kQW5vbWFseVR5cGVTdGF0dXMpO1xucm91dGVyLmdldCgnLycsIGdldEFub21hbHkpO1xucm91dGVyLnBvc3QoJy8nLCBjcmVhdGVBbm9tYWx5KTtcbnJvdXRlci5kZWxldGUoJy8nLCBkZWxldGVBbm9tYWx5KTtcbiIsImltcG9ydCAqIGFzIFJvdXRlciBmcm9tICdrb2Etcm91dGVyJztcblxuaW1wb3J0IHtcbiAgZ2V0TGFiZWxlZFNlZ21lbnRzLFxuICBpbnNlcnRTZWdtZW50cyxcbiAgcmVtb3ZlU2VnbWVudHMsXG59IGZyb20gJy4uL3NlcnZpY2VzL3NlZ21lbnRzJztcblxuaW1wb3J0IHtcbiAgQW5vbWFseSwgQW5vbWFseUlkLCBnZXRBbm9tYWx5SWRCeU5hbWUsIGxvYWRBbm9tYWx5QnlJZFxufSBmcm9tICcuLi9zZXJ2aWNlcy9hbm9tYWx5VHlwZSc7XG5cbmltcG9ydCB7IHJ1bkxlYXJuaW5nIH0gZnJvbSAnLi4vc2VydmljZXMvYW5hbHl0aWNzJztcblxuXG5hc3luYyBmdW5jdGlvbiBzZW5kU2VnbWVudHMoY3R4OiBSb3V0ZXIuSVJvdXRlckNvbnRleHQpIHtcblxuICBsZXQgYW5vbWFseUlkOiBBbm9tYWx5SWQgPSBjdHgucmVxdWVzdC5xdWVyeS5hbm9tYWx5X2lkO1xuICBsZXQgYW5vbWFseTpBbm9tYWx5ID0gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZCk7XG4gIGlmKGFub21hbHkgPT09IG51bGwpIHtcbiAgICBhbm9tYWx5SWQgPSBnZXRBbm9tYWx5SWRCeU5hbWUoYW5vbWFseUlkKTtcbiAgfVxuXG4gIGxldCBsYXN0U2VnbWVudElkID0gY3R4LnJlcXVlc3QucXVlcnkubGFzdF9zZWdtZW50O1xuICBsZXQgdGltZUZyb20gPSBjdHgucmVxdWVzdC5xdWVyeS5mcm9tO1xuICBsZXQgdGltZVRvID0gY3R4LnJlcXVlc3QucXVlcnkudG87XG5cbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG5cbiAgLy8gSWQgZmlsdGVyaW5nXG4gIGlmKGxhc3RTZWdtZW50SWQgIT09IHVuZGVmaW5lZCkge1xuICAgIHNlZ21lbnRzID0gc2VnbWVudHMuZmlsdGVyKGVsID0+IGVsLmlkID4gbGFzdFNlZ21lbnRJZCk7XG4gIH1cblxuICAvLyBUaW1lIGZpbHRlcmluZ1xuICBpZih0aW1lRnJvbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgc2VnbWVudHMgPSBzZWdtZW50cy5maWx0ZXIoZWwgPT4gZWwuZmluaXNoID4gdGltZUZyb20pO1xuICB9XG5cbiAgaWYodGltZVRvICE9PSB1bmRlZmluZWQpIHtcbiAgICBzZWdtZW50cyA9IHNlZ21lbnRzLmZpbHRlcihlbCA9PiBlbC5zdGFydCA8IHRpbWVUbyk7XG4gIH1cblxuICBjdHgucmVzcG9uc2UuYm9keSA9IHsgc2VnbWVudHMgfVxuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVNlZ21lbnRzKGN0eDogUm91dGVyLklSb3V0ZXJDb250ZXh0KSB7XG4gIHRyeSB7XG4gICAgbGV0IHNlZ21lbnRzVXBkYXRlID0gY3R4LnJlcXVlc3QuYm9keTtcblxuICAgIGxldCBhbm9tYWx5SWQgPSBzZWdtZW50c1VwZGF0ZS5hbm9tYWx5X2lkO1xuICAgIGxldCBhbm9tYWx5TmFtZSA9IHNlZ21lbnRzVXBkYXRlLm5hbWU7XG5cbiAgICBpZihhbm9tYWx5SWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYW5vbWFseUlkID0gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlOYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgIH1cblxuICAgIGxldCBhZGRlZElkcyA9IGluc2VydFNlZ21lbnRzKGFub21hbHlJZCwgc2VnbWVudHNVcGRhdGUuYWRkZWRfc2VnbWVudHMsIHRydWUpO1xuICAgIHJlbW92ZVNlZ21lbnRzKGFub21hbHlJZCwgc2VnbWVudHNVcGRhdGUucmVtb3ZlZF9zZWdtZW50cyk7XG5cbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHsgYWRkZWRfaWRzOiBhZGRlZElkcyB9O1xuXG4gICAgcnVuTGVhcm5pbmcoYW5vbWFseUlkKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY3R4LnJlc3BvbnNlLnN0YXR1cyA9IDUwMDtcbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHtcbiAgICAgIGNvZGU6IDUwMCxcbiAgICAgIG1lc3NhZ2U6ICdJbnRlcm5hbCBlcnJvcidcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG5cbnJvdXRlci5nZXQoJy8nLCBzZW5kU2VnbWVudHMpO1xucm91dGVyLnBhdGNoKCcvJywgdXBkYXRlU2VnbWVudHMpO1xuIiwiaW1wb3J0IHsgZ2V0SnNvbkRhdGFTeW5jLCB3cml0ZUpzb25EYXRhU3luYyB9IGZyb20gJy4vanNvbic7XG5pbXBvcnQgeyBBbm9tYWx5SWQgfSBmcm9tICcuL2Fub21hbHlUeXBlJztcbmltcG9ydCB7IHJ1blByZWRpY3QgfSBmcm9tICcuL2FuYWx5dGljcyc7XG5pbXBvcnQgeyBzZW5kTm90aWZpY2F0aW9uIH0gZnJvbSAnLi9ub3RpZmljYXRpb24nO1xuaW1wb3J0IHsgZ2V0TGFiZWxlZFNlZ21lbnRzIH0gZnJvbSAnLi9zZWdtZW50cyc7XG5cbmltcG9ydCB7IEFOT01BTElFU19QQVRIIH0gZnJvbSAnLi4vY29uZmlnJztcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcblxuXG5cbmNvbnN0IEFMRVJUU19EQl9QQVRIID0gcGF0aC5qb2luKEFOT01BTElFU19QQVRILCBgYWxlcnRzX2Fub21hbGllcy5qc29uYCk7XG5cbmZ1bmN0aW9uIGdldEFsZXJ0c0Fub21hbGllcygpOiBBbm9tYWx5SWRbXSB7XG4gIGlmKCFmcy5leGlzdHNTeW5jKEFMRVJUU19EQl9QQVRIKSkge1xuICAgIHNhdmVBbGVydHNBbm9tYWxpZXMoW10pO1xuICB9XG4gIHJldHVybiBnZXRKc29uRGF0YVN5bmMoQUxFUlRTX0RCX1BBVEgpO1xufVxuXG5mdW5jdGlvbiBzYXZlQWxlcnRzQW5vbWFsaWVzKGFub21hbGllczogQW5vbWFseUlkW10pIHtcbiAgcmV0dXJuIHdyaXRlSnNvbkRhdGFTeW5jKEFMRVJUU19EQl9QQVRILCBhbm9tYWxpZXMpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzQWxlcnRzKGFub21hbHlJZCkge1xuICBsZXQgc2VnbWVudHMgPSBnZXRMYWJlbGVkU2VnbWVudHMoYW5vbWFseUlkKTtcblxuICBjb25zdCBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICBjb25zdCBhY3RpdmVBbGVydCA9IGFjdGl2ZUFsZXJ0cy5oYXMoYW5vbWFseUlkKTtcbiAgbGV0IG5ld0FjdGl2ZUFsZXJ0ID0gZmFsc2U7XG5cbiAgaWYoc2VnbWVudHMubGVuZ3RoID4gMCkge1xuICAgIGxldCBsYXN0U2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdO1xuICAgIGlmKGxhc3RTZWdtZW50LmZpbmlzaCA+PSBjdXJyZW50VGltZSAtIGFsZXJ0VGltZW91dCkge1xuICAgICAgbmV3QWN0aXZlQWxlcnQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmKCFhY3RpdmVBbGVydCAmJiBuZXdBY3RpdmVBbGVydCkge1xuICAgIGFjdGl2ZUFsZXJ0cy5hZGQoYW5vbWFseUlkKTtcbiAgICBzZW5kTm90aWZpY2F0aW9uKGFub21hbHlJZCwgdHJ1ZSk7XG4gIH0gZWxzZSBpZihhY3RpdmVBbGVydCAmJiAhbmV3QWN0aXZlQWxlcnQpIHtcbiAgICBhY3RpdmVBbGVydHMuZGVsZXRlKGFub21hbHlJZCk7XG4gICAgc2VuZE5vdGlmaWNhdGlvbihhbm9tYWx5SWQsIGZhbHNlKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBhbGVydHNUaWNrKCkge1xuICBsZXQgYWxlcnRzQW5vbWFsaWVzID0gZ2V0QWxlcnRzQW5vbWFsaWVzKCk7XG4gIGZvciAobGV0IGFub21hbHlJZCBvZiBhbGVydHNBbm9tYWxpZXMpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnVuUHJlZGljdChhbm9tYWx5SWQpO1xuICAgICAgcHJvY2Vzc0FsZXJ0cyhhbm9tYWx5SWQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIHNldFRpbWVvdXQoYWxlcnRzVGljaywgNTAwMCk7XG59XG5cbmNvbnN0IGFsZXJ0VGltZW91dCA9IDYwMDAwOyAvLyBtc1xuY29uc3QgYWN0aXZlQWxlcnRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5zZXRUaW1lb3V0KGFsZXJ0c1RpY2ssIDUwMDApO1xuXG5cbmV4cG9ydCB7IGdldEFsZXJ0c0Fub21hbGllcywgc2F2ZUFsZXJ0c0Fub21hbGllcyB9XG4iLCJpbXBvcnQge1xuICBBbm9tYWx5LFxuICBBbm9tYWx5SWQsIGdldEFub21hbHlUeXBlSW5mbyxcbiAgbG9hZEFub21hbHlCeUlkLFxuICBzZXRBbm9tYWx5UHJlZGljdGlvblRpbWUsXG4gIHNldEFub21hbHlTdGF0dXNcbn0gZnJvbSAnLi9hbm9tYWx5VHlwZSdcbmltcG9ydCB7IGdldFRhcmdldCB9IGZyb20gJy4vbWV0cmljcyc7XG5pbXBvcnQgeyBnZXRMYWJlbGVkU2VnbWVudHMsIGluc2VydFNlZ21lbnRzLCByZW1vdmVTZWdtZW50cyB9IGZyb20gJy4vc2VnbWVudHMnXG5pbXBvcnQgeyBBbmFseXRpY3NDb25uZWN0aW9uIH0gZnJvbSAnLi9hbmFseXRpY3NDb25uZWN0aW9uJ1xuXG5cbmNvbnN0IHRhc2tNYXAgPSB7fTtcbmxldCBuZXh0VGFza0lkID0gMDtcblxuY29uc3QgYW5hbHl0aWNzQ29ubmVjdGlvbiA9IG5ldyBBbmFseXRpY3NDb25uZWN0aW9uKG9uUmVzcG9uc2UpO1xuXG5mdW5jdGlvbiBvblJlc3BvbnNlKHJlc3BvbnNlOiBhbnkpIHtcbiAgbGV0IHRhc2tJZCA9IHJlc3BvbnNlLl9fdGFza19pZDtcbiAgbGV0IHN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1cztcbiAgaWYoc3RhdHVzID09PSAnc3VjY2VzcycgfHwgc3RhdHVzID09PSAnZmFpbGVkJykge1xuICAgIGlmKHRhc2tJZCBpbiB0YXNrTWFwKSB7XG4gICAgICBsZXQgcmVzb2x2ZXIgPSB0YXNrTWFwW3Rhc2tJZF07XG4gICAgICByZXNvbHZlcihyZXNwb25zZSk7XG4gICAgICBkZWxldGUgdGFza01hcFt0YXNrSWRdO1xuICAgIH1cbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW5UYXNrKHRhc2spOiBQcm9taXNlPGFueT4ge1xuICBsZXQgYW5vbWFseTogQW5vbWFseSA9IGxvYWRBbm9tYWx5QnlJZCh0YXNrLmFub21hbHlfaWQpO1xuICB0YXNrLm1ldHJpYyA9IHtcbiAgICBkYXRhc291cmNlOiBhbm9tYWx5Lm1ldHJpYy5kYXRhc291cmNlLFxuICAgIHRhcmdldHM6IGFub21hbHkubWV0cmljLnRhcmdldHMubWFwKHQgPT4gZ2V0VGFyZ2V0KHQpKVxuICB9O1xuXG4gIHRhc2suX190YXNrX2lkID0gbmV4dFRhc2tJZCsrO1xuICBhd2FpdCBhbmFseXRpY3NDb25uZWN0aW9uLnNlbmRNZXNzYWdlKHRhc2spO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdGFza01hcFt0YXNrLl9fdGFza19pZF0gPSByZXNvbHZlO1xuICB9KVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuTGVhcm5pbmcoYW5vbWFseUlkOkFub21hbHlJZCkge1xuICBsZXQgc2VnbWVudHMgPSBnZXRMYWJlbGVkU2VnbWVudHMoYW5vbWFseUlkKTtcbiAgc2V0QW5vbWFseVN0YXR1cyhhbm9tYWx5SWQsICdsZWFybmluZycpO1xuICBsZXQgYW5vbWFseTpBbm9tYWx5ICA9IGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQpO1xuICBsZXQgcGF0dGVybiA9IGFub21hbHkucGF0dGVybjtcbiAgbGV0IHRhc2sgPSB7XG4gICAgdHlwZTogJ2xlYXJuJyxcbiAgICBhbm9tYWx5X2lkOiBhbm9tYWx5SWQsXG4gICAgcGF0dGVybixcbiAgICBzZWdtZW50czogc2VnbWVudHNcbiAgfTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgcnVuVGFzayh0YXNrKTtcblxuICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgc2V0QW5vbWFseVN0YXR1cyhhbm9tYWx5SWQsICdyZWFkeScpO1xuICAgIGluc2VydFNlZ21lbnRzKGFub21hbHlJZCwgcmVzdWx0LnNlZ21lbnRzLCBmYWxzZSk7XG4gICAgc2V0QW5vbWFseVByZWRpY3Rpb25UaW1lKGFub21hbHlJZCwgcmVzdWx0Lmxhc3RfcHJlZGljdGlvbl90aW1lKTtcbiAgfSBlbHNlIHtcbiAgICBzZXRBbm9tYWx5U3RhdHVzKGFub21hbHlJZCwgJ2ZhaWxlZCcsIHJlc3VsdC5lcnJvcik7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blByZWRpY3QoYW5vbWFseUlkOkFub21hbHlJZCkge1xuICBsZXQgYW5vbWFseTpBbm9tYWx5ID0gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZCk7XG4gIGxldCBwYXR0ZXJuID0gYW5vbWFseS5wYXR0ZXJuO1xuICBsZXQgdGFzayA9IHtcbiAgICB0eXBlOiAncHJlZGljdCcsXG4gICAgYW5vbWFseV9pZDogYW5vbWFseUlkLFxuICAgIHBhdHRlcm4sXG4gICAgbGFzdF9wcmVkaWN0aW9uX3RpbWU6IGFub21hbHkubGFzdF9wcmVkaWN0aW9uX3RpbWVcbiAgfTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHJ1blRhc2sodGFzayk7XG5cbiAgaWYocmVzdWx0LnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgLy8gTWVyZ2luZyBzZWdtZW50c1xuICBsZXQgc2VnbWVudHMgPSBnZXRMYWJlbGVkU2VnbWVudHMoYW5vbWFseUlkKTtcbiAgaWYoc2VnbWVudHMubGVuZ3RoID4gMCAmJiByZXN1bHQuc2VnbWVudHMubGVuZ3RoID4gMCkge1xuICAgIGxldCBsYXN0T2xkU2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdO1xuICAgIGxldCBmaXJzdE5ld1NlZ21lbnQgPSByZXN1bHQuc2VnbWVudHNbMF07XG5cbiAgICBpZihmaXJzdE5ld1NlZ21lbnQuc3RhcnQgPD0gbGFzdE9sZFNlZ21lbnQuZmluaXNoKSB7XG4gICAgICByZXN1bHQuc2VnbWVudHNbMF0uc3RhcnQgPSBsYXN0T2xkU2VnbWVudC5zdGFydDtcbiAgICAgIHJlbW92ZVNlZ21lbnRzKGFub21hbHlJZCwgW2xhc3RPbGRTZWdtZW50LmlkXSk7XG4gICAgfVxuICB9XG5cbiAgaW5zZXJ0U2VnbWVudHMoYW5vbWFseUlkLCByZXN1bHQuc2VnbWVudHMsIGZhbHNlKTtcbiAgc2V0QW5vbWFseVByZWRpY3Rpb25UaW1lKGFub21hbHlJZCwgcmVzdWx0Lmxhc3RfcHJlZGljdGlvbl90aW1lKTtcbiAgcmV0dXJuIHJlc3VsdC5zZWdtZW50cztcbn0iLCJpbXBvcnQgeyBBTkFMWVRJQ1NfUEFUSCB9IGZyb20gJy4uL2NvbmZpZydcclxuXHJcbmltcG9ydCB7IHNwYXduLCBDaGlsZFByb2Nlc3MgfSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xyXG5pbXBvcnQgeyBzcGxpdCwgbWFwU3luYyB9IGZyb20gJ2V2ZW50LXN0cmVhbSc7XHJcblxyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEFuYWx5dGljc0Nvbm5lY3Rpb24ge1xyXG5cclxuICBwcml2YXRlIF9sZWFybldvcmtlcjogQ2hpbGRQcm9jZXNzO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9vblJlc3BvbnNlOiAocmVzcG9uc2U6IGFueSkgPT4gdm9pZCkge1xyXG4gICAgaWYoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4oQU5BTFlUSUNTX1BBVEgsICdkaXN0L3dvcmtlci93b3JrZXInKSkpIHtcclxuICAgICAgdGhpcy5fbGVhcm5Xb3JrZXIgPSBzcGF3bignZGlzdC93b3JrZXIvd29ya2VyJywgW10sIHsgY3dkOiBBTkFMWVRJQ1NfUEFUSCB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gSWYgY29tcGlsZWQgYW5hbHl0aWNzIHNjcmlwdCBkb2Vzbid0IGV4aXN0IC0gZmFsbGJhY2sgdG8gcmVndWxhciBweXRob25cclxuICAgICAgdGhpcy5fbGVhcm5Xb3JrZXIgPSBzcGF3bigncHl0aG9uMycsIFsnd29ya2VyLnB5J10sIHsgY3dkOiBBTkFMWVRJQ1NfUEFUSCB9KVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2xlYXJuV29ya2VyLnN0ZG91dC5waXBlKFxyXG4gICAgICBzcGxpdCgpKS5waXBlKG1hcFN5bmModGhpcy5fb25QaXBlTWVzc2FnZS5iaW5kKHRoaXMpKVxyXG4gICAgKTtcclxuICAgIHRoaXMuX2xlYXJuV29ya2VyLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4gY29uc29sZS5lcnJvcihgd29ya2VyIHN0ZGVycjogJHtkYXRhfWApKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX29uUGlwZU1lc3NhZ2UoZGF0YSkge1xyXG4gICAgY29uc29sZS5sb2coYHdvcmtlciBzdGRvdXQ6ICR7ZGF0YX1gKTtcclxuICAgIGxldCByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcbiAgICB0aGlzLl9vblJlc3BvbnNlKHJlc3BvbnNlKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBzZW5kTWVzc2FnZSh0YXNrOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIC8vIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcclxuICAgIGxldCBjb21tYW5kID0gSlNPTi5zdHJpbmdpZnkodGFzayk7XHJcbiAgICB0aGlzLl9sZWFybldvcmtlci5zdGRpbi53cml0ZShgJHtjb21tYW5kfVxcbmApO1xyXG4gICAgLy8gfSk7XHJcbiAgfVxyXG5cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBnZXRKc29uRGF0YVN5bmMsIHdyaXRlSnNvbkRhdGFTeW5jIH0gZnJvbSAnLi9qc29uJ1xuaW1wb3J0IHsgQU5PTUFMSUVTX1BBVEggfSBmcm9tICcuLi9jb25maWcnXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5leHBvcnQgdHlwZSBEYXRhc291cmNlID0ge1xuICBtZXRob2Q6IHN0cmluZyxcbiAgZGF0YTogT2JqZWN0LFxuICBwYXJhbXM6IE9iamVjdCxcbiAgdHlwZTogc3RyaW5nLFxuICB1cmw6IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBNZXRyaWMgPSB7XG4gIGRhdGFzb3VyY2U6IHN0cmluZyxcbiAgdGFyZ2V0czogc3RyaW5nW11cbn1cblxuZXhwb3J0IHR5cGUgQW5vbWFseSA9IHtcbiAgbmFtZTogc3RyaW5nLFxuXG4gIHBhbmVsVXJsOiBzdHJpbmcsXG5cbiAgcGF0dGVybjogc3RyaW5nLFxuICBtZXRyaWM6IE1ldHJpYyxcbiAgZGF0YXNvdXJjZTogRGF0YXNvdXJjZVxuICBzdGF0dXM6IHN0cmluZyxcbiAgZXJyb3I/OiBzdHJpbmcsXG5cbiAgbGFzdF9wcmVkaWN0aW9uX3RpbWU6IG51bWJlcixcbiAgbmV4dF9pZDogbnVtYmVyXG59XG5cbmV4cG9ydCB0eXBlIEFub21hbHlJZCA9IHN0cmluZztcblxubGV0IGFub21hbGllc05hbWVUb0lkTWFwID0ge307XG5cbmZ1bmN0aW9uIGxvYWRBbm9tYWxpZXNNYXAoKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYGFsbF9hbm9tYWxpZXMuanNvbmApO1xuICBpZighZnMuZXhpc3RzU3luYyhmaWxlbmFtZSkpIHtcbiAgICBzYXZlQW5vbWFsaWVzTWFwKCk7XG4gIH1cbiAgYW5vbWFsaWVzTmFtZVRvSWRNYXAgPSBnZXRKc29uRGF0YVN5bmMoZmlsZW5hbWUpO1xufVxuXG5mdW5jdGlvbiBzYXZlQW5vbWFsaWVzTWFwKCkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGBhbGxfYW5vbWFsaWVzLmpzb25gKTtcbiAgd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWUsIGFub21hbGllc05hbWVUb0lkTWFwKTtcbn1cblxuZnVuY3Rpb24gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlOYW1lOnN0cmluZykgOiBBbm9tYWx5SWQge1xuICBsb2FkQW5vbWFsaWVzTWFwKCk7XG4gIGFub21hbHlOYW1lID0gYW5vbWFseU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgaWYoYW5vbWFseU5hbWUgaW4gYW5vbWFsaWVzTmFtZVRvSWRNYXApIHtcbiAgICByZXR1cm4gYW5vbWFsaWVzTmFtZVRvSWRNYXBbYW5vbWFseU5hbWVdO1xuICB9XG4gIHJldHVybiBhbm9tYWx5TmFtZTtcbn1cblxuZnVuY3Rpb24gaW5zZXJ0QW5vbWFseShhbm9tYWx5OiBBbm9tYWx5KSA6IEFub21hbHlJZCB7XG4gIGNvbnN0IGhhc2hTdHJpbmcgPSBhbm9tYWx5Lm5hbWUgKyAobmV3IERhdGUoKSkudG9TdHJpbmcoKTtcbiAgY29uc3QgYW5vbWFseUlkOkFub21hbHlJZCA9IGNyeXB0by5jcmVhdGVIYXNoKCdtZDUnKS51cGRhdGUoaGFzaFN0cmluZykuZGlnZXN0KCdoZXgnKTtcbiAgYW5vbWFsaWVzTmFtZVRvSWRNYXBbYW5vbWFseS5uYW1lXSA9IGFub21hbHlJZDtcbiAgc2F2ZUFub21hbGllc01hcCgpO1xuICAvLyByZXR1cm4gYW5vbWFseUlkXG4gIC8vIGNvbnN0IGFub21hbHlJZDpBbm9tYWx5SWQgPSBhbm9tYWx5Lm5hbWU7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYCR7YW5vbWFseUlkfS5qc29uYCk7XG4gIGlmKGZzLmV4aXN0c1N5bmMoZmlsZW5hbWUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgc2F2ZUFub21hbHkoYW5vbWFseUlkLCBhbm9tYWx5KTtcbiAgcmV0dXJuIGFub21hbHlJZDtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQW5vbWFseShhbm9tYWx5SWQ6QW5vbWFseUlkKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYCR7YW5vbWFseUlkfS5qc29uYCk7XG4gIGZzLnVubGlua1N5bmMoZmlsZW5hbWUpO1xufVxuXG5mdW5jdGlvbiBzYXZlQW5vbWFseShhbm9tYWx5SWQ6IEFub21hbHlJZCwgYW5vbWFseTogQW5vbWFseSkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGAke2Fub21hbHlJZH0uanNvbmApO1xuICByZXR1cm4gd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWUsIGFub21hbHkpO1xufVxuXG5mdW5jdGlvbiBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkOiBBbm9tYWx5SWQpIDogQW5vbWFseSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYCR7YW5vbWFseUlkfS5qc29uYCk7XG4gIGlmKCFmcy5leGlzdHNTeW5jKGZpbGVuYW1lKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBnZXRKc29uRGF0YVN5bmMoZmlsZW5hbWUpO1xufVxuXG5mdW5jdGlvbiBsb2FkQW5vbWFseUJ5TmFtZShhbm9tYWx5TmFtZTogc3RyaW5nKSA6IEFub21hbHkge1xuICBsZXQgYW5vbWFseUlkID0gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlOYW1lKTtcbiAgcmV0dXJuIGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQpO1xufVxuXG5mdW5jdGlvbiBzYXZlQW5vbWFseVR5cGVJbmZvKGluZm8pIHtcbiAgY29uc29sZS5sb2coJ1NhdmluZycpO1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGAke2luZm8ubmFtZX0uanNvbmApO1xuICBpZihpbmZvLm5leHRfaWQgPT09IHVuZGVmaW5lZCkge1xuICAgIGluZm8ubmV4dF9pZCA9IDA7XG4gIH1cbiAgaWYoaW5mby5sYXN0X3ByZWRpY3Rpb25fdGltZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpbmZvLmxhc3RfcHJlZGljdGlvbl90aW1lID0gMDtcbiAgfVxuXG4gIHJldHVybiB3cml0ZUpzb25EYXRhU3luYyhmaWxlbmFtZSwgaW5mbyk7XG59XG5cbmZ1bmN0aW9uIGdldEFub21hbHlUeXBlSW5mbyhuYW1lKSB7XG4gIHJldHVybiBnZXRKc29uRGF0YVN5bmMocGF0aC5qb2luKEFOT01BTElFU19QQVRILCBgJHtuYW1lfS5qc29uYCkpO1xufVxuXG5mdW5jdGlvbiBzZXRBbm9tYWx5U3RhdHVzKGFub21hbHlJZDpBbm9tYWx5SWQsIHN0YXR1czpzdHJpbmcsIGVycm9yPzpzdHJpbmcpIHtcbiAgbGV0IGluZm8gPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgaW5mby5zdGF0dXMgPSBzdGF0dXM7XG4gIGlmKGVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICBpbmZvLmVycm9yID0gZXJyb3I7XG4gIH0gZWxzZSB7XG4gICAgaW5mby5lcnJvciA9ICcnO1xuICB9XG4gIHNhdmVBbm9tYWx5KGFub21hbHlJZCwgaW5mbyk7XG59XG5cbmZ1bmN0aW9uIHNldEFub21hbHlQcmVkaWN0aW9uVGltZShhbm9tYWx5SWQ6QW5vbWFseUlkLCBsYXN0UHJlZGljdGlvblRpbWU6bnVtYmVyKSB7XG4gIGxldCBpbmZvID0gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZCk7XG4gIGluZm8ubGFzdF9wcmVkaWN0aW9uX3RpbWUgPSBsYXN0UHJlZGljdGlvblRpbWU7XG4gIHNhdmVBbm9tYWx5KGFub21hbHlJZCwgaW5mbyk7XG59XG5cbmV4cG9ydCB7XG4gIHNhdmVBbm9tYWx5LCBsb2FkQW5vbWFseUJ5SWQsIGxvYWRBbm9tYWx5QnlOYW1lLCBpbnNlcnRBbm9tYWx5LCByZW1vdmVBbm9tYWx5LCBzYXZlQW5vbWFseVR5cGVJbmZvLFxuICBnZXRBbm9tYWx5VHlwZUluZm8sIGdldEFub21hbHlJZEJ5TmFtZSwgc2V0QW5vbWFseVN0YXR1cywgc2V0QW5vbWFseVByZWRpY3Rpb25UaW1lXG59XG4iLCJpbXBvcnQgKiBhcyBjb25maWcgZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcblxyXG5cclxuLy8gc2VlIGFuYWx5dGljcy9wYXR0ZXJuX2RldGVjdGlvbl9tb2RlbC5weSB3aXRoIGZvbGRlcnMgYXZhaWxhYmxlXHJcblxyXG5mdW5jdGlvbiBtYXliZUNyZWF0ZShwYXRoOiBzdHJpbmcpOiB2b2lkIHtcclxuICBpZihmcy5leGlzdHNTeW5jKHBhdGgpKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIGZzLm1rZGlyU3luYyhwYXRoKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRGF0YUZvbGRlcnMoKTogdm9pZCB7XHJcbiAgdmFyIGZvbGRlcnMgPSBbXHJcbiAgICBjb25maWcuREFUQV9QQVRILFxyXG4gICAgY29uZmlnLkRBVEFTRVRTX1BBVEgsXHJcbiAgICBjb25maWcuQU5PTUFMSUVTX1BBVEgsXHJcbiAgICBjb25maWcuTU9ERUxTX1BBVEgsXHJcbiAgICBjb25maWcuTUVUUklDU19QQVRILFxyXG4gICAgY29uZmlnLlNFR01FTlRTX1BBVEhcclxuICBdLmZvckVhY2gobWF5YmVDcmVhdGUpO1xyXG59XHJcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcblxuYXN5bmMgZnVuY3Rpb24gZ2V0SnNvbkRhdGEoZmlsZW5hbWU6IHN0cmluZyk6IFByb21pc2U8T2JqZWN0PiB7XG4gIHZhciBkYXRhID0gYXdhaXQgbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZnMucmVhZEZpbGUoZmlsZW5hbWUsICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgaWYoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgcmVqZWN0KCdDYW5gdCByZWFkIGZpbGUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyBmaWxlIGZvcm1hdCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyaXRlSnNvbkRhdGEoZmlsZW5hbWU6IHN0cmluZywgZGF0YTogT2JqZWN0KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZnMud3JpdGVGaWxlKGZpbGVuYW1lLCBKU09OLnN0cmluZ2lmeShkYXRhKSwgJ3V0ZjgnLCAoZXJyKSA9PiB7XG4gICAgICBpZihlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICByZWplY3QoJ0NhdGB0IHdyaXRlIGZpbGUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0SnNvbkRhdGFTeW5jKGZpbGVuYW1lOiBzdHJpbmcpIHtcbiAgbGV0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4Jyk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyBmaWxlIGZvcm1hdCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyaXRlSnNvbkRhdGFTeW5jKGZpbGVuYW1lOiBzdHJpbmcsIGRhdGE6IE9iamVjdCkge1xuICBmcy53cml0ZUZpbGVTeW5jKGZpbGVuYW1lLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG59XG5cbmV4cG9ydCB7XG4gIGdldEpzb25EYXRhLFxuICB3cml0ZUpzb25EYXRhLFxuICBnZXRKc29uRGF0YVN5bmMsXG4gIHdyaXRlSnNvbkRhdGFTeW5jXG59XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZ2V0SnNvbkRhdGFTeW5jLCB3cml0ZUpzb25EYXRhU3luYyB9ICBmcm9tICcuL2pzb24nO1xuaW1wb3J0IHsgTUVUUklDU19QQVRIIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5mdW5jdGlvbiBzYXZlVGFyZ2V0cyh0YXJnZXRzKSB7XG4gIGxldCBtZXRyaWNzID0gW107XG4gIGZvciAobGV0IHRhcmdldCBvZiB0YXJnZXRzKSB7XG4gICAgbWV0cmljcy5wdXNoKHNhdmVUYXJnZXQodGFyZ2V0KSk7XG4gIH1cbiAgcmV0dXJuIG1ldHJpY3M7XG59XG5cbmZ1bmN0aW9uIHNhdmVUYXJnZXQodGFyZ2V0KSB7XG4gIC8vY29uc3QgbWQ1ID0gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpXG4gIGNvbnN0IHRhcmdldElkID0gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShKU09OLnN0cmluZ2lmeSh0YXJnZXQpKS5kaWdlc3QoJ2hleCcpO1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oTUVUUklDU19QQVRILCBgJHt0YXJnZXRJZH0uanNvbmApO1xuICB3cml0ZUpzb25EYXRhU3luYyhmaWxlbmFtZSwgdGFyZ2V0KTtcbiAgcmV0dXJuIHRhcmdldElkO1xufVxuXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0SWQpIHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKE1FVFJJQ1NfUEFUSCwgYCR7dGFyZ2V0SWR9Lmpzb25gKTtcbiAgcmV0dXJuIGdldEpzb25EYXRhU3luYyhmaWxlbmFtZSk7XG59XG5cbmV4cG9ydCB7IHNhdmVUYXJnZXRzLCBnZXRUYXJnZXQgfVxuIiwiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IGxvYWRBbm9tYWx5QnlJZCB9IGZyb20gJy4vYW5vbWFseVR5cGUnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZE5vdGlmaWNhdGlvbihhbm9tYWx5SWQsIGFjdGl2ZSkge1xuICBsZXQgYW5vbWFseU5hbWUgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKS5uYW1lO1xuICBjb25zb2xlLmxvZygnTm90aWZpY2F0aW9uICcgKyBhbm9tYWx5TmFtZSk7XG5cbiAgbGV0IG5vdGlmaWNhdGlvbiA9IHtcbiAgICBhbm9tYWx5OiBhbm9tYWx5TmFtZSxcbiAgICBzdGF0dXM6ICcnXG4gIH07XG4gIGlmKGFjdGl2ZSkge1xuICAgIG5vdGlmaWNhdGlvbi5zdGF0dXMgPSAnYWxlcnQnO1xuICB9IGVsc2Uge1xuICAgIG5vdGlmaWNhdGlvbi5zdGF0dXMgPSAnT0snO1xuICB9XG5cbiAgbGV0IGVuZHBvaW50ID0gcHJvY2Vzcy5lbnYuSEFTVElDX0FMRVJUX0VORFBPSU5UO1xuICBpZihlbmRwb2ludCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc29sZS5lcnJvcihgQ2FuJ3Qgc2VuZCBhbGVydCwgZW52IEhBU1RJQ19BTEVSVF9FTkRQT0lOVCBpcyB1bmRlZmluZWRgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIHZhciBkYXRhID0gYXdhaXQgYXhpb3MucG9zdChlbmRwb2ludCwge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShub3RpZmljYXRpb24pXG4gICAgfSlcbiAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgfSBjYXRjaChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKGBDYW4ndCBzZW5kIGFsZXJ0IHRvICR7ZW5kcG9pbnR9LiBFcnJvcjogJHtlcnJ9YClcbiAgfVxuICBcbn1cblxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEpzb25EYXRhU3luYywgd3JpdGVKc29uRGF0YVN5bmMgfSAgZnJvbSAnLi9qc29uJztcbmltcG9ydCB7IFNFR01FTlRTX1BBVEggfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgQW5vbWFseUlkLCBsb2FkQW5vbWFseUJ5SWQsIHNhdmVBbm9tYWx5IH0gZnJvbSAnLi9hbm9tYWx5VHlwZSc7XG5cbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcblxuZnVuY3Rpb24gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihTRUdNRU5UU19QQVRILCBgJHthbm9tYWx5SWR9X2xhYmVsZWQuanNvbmApO1xuXG4gIGxldCBzZWdtZW50cyA9IFtdO1xuICB0cnkge1xuICAgIHNlZ21lbnRzID0gZ2V0SnNvbkRhdGFTeW5jKGZpbGVuYW1lKTtcbiAgICBmb3IgKGxldCBzZWdtZW50IG9mIHNlZ21lbnRzKSB7XG4gICAgICBpZiAoc2VnbWVudC5sYWJlbGVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2VnbWVudC5sYWJlbGVkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xuICB9XG4gIHJldHVybiBzZWdtZW50cztcbn1cblxuZnVuY3Rpb24gZ2V0UHJlZGljdGVkU2VnbWVudHMoYW5vbWFseUlkOiBBbm9tYWx5SWQpIHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKFNFR01FTlRTX1BBVEgsIGAke2Fub21hbHlJZH1fc2VnbWVudHMuanNvbmApO1xuXG4gIGxldCBqc29uRGF0YTtcbiAgdHJ5IHtcbiAgICBqc29uRGF0YSA9IGdldEpzb25EYXRhU3luYyhmaWxlbmFtZSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcbiAgICBqc29uRGF0YSA9IFtdO1xuICB9XG4gIHJldHVybiBqc29uRGF0YTtcbn1cblxuZnVuY3Rpb24gc2F2ZVNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkLCBzZWdtZW50cykge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oU0VHTUVOVFNfUEFUSCwgYCR7YW5vbWFseUlkfV9sYWJlbGVkLmpzb25gKTtcblxuICB0cnkge1xuICAgIHJldHVybiB3cml0ZUpzb25EYXRhU3luYyhmaWxlbmFtZSwgXy51bmlxQnkoc2VnbWVudHMsICdzdGFydCcpKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xuICAgIHRocm93IG5ldyBFcnJvcignQ2FuYHQgd3JpdGUgdG8gZGInKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbnNlcnRTZWdtZW50cyhhbm9tYWx5SWQ6IEFub21hbHlJZCwgYWRkZWRTZWdtZW50cywgbGFiZWxlZDpib29sZWFuKSB7XG4gIC8vIFNldCBzdGF0dXNcbiAgbGV0IGluZm8gPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG5cbiAgbGV0IG5leHRJZCA9IGluZm8ubmV4dF9pZDtcbiAgbGV0IGFkZGVkSWRzID0gW11cbiAgZm9yIChsZXQgc2VnbWVudCBvZiBhZGRlZFNlZ21lbnRzKSB7XG4gICAgc2VnbWVudC5pZCA9IG5leHRJZDtcbiAgICBzZWdtZW50LmxhYmVsZWQgPSBsYWJlbGVkO1xuICAgIGFkZGVkSWRzLnB1c2gobmV4dElkKTtcbiAgICBuZXh0SWQrKztcbiAgICBzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xuICB9XG4gIGluZm8ubmV4dF9pZCA9IG5leHRJZDtcbiAgc2F2ZVNlZ21lbnRzKGFub21hbHlJZCwgc2VnbWVudHMpO1xuICBzYXZlQW5vbWFseShhbm9tYWx5SWQsIGluZm8pO1xuICByZXR1cm4gYWRkZWRJZHM7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkLCByZW1vdmVkU2VnbWVudHMpIHtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG4gIGZvciAobGV0IHNlZ21lbnRJZCBvZiByZW1vdmVkU2VnbWVudHMpIHtcbiAgICBzZWdtZW50cyA9IHNlZ21lbnRzLmZpbHRlcihlbCA9PiBlbC5pZCAhPT0gc2VnbWVudElkKTtcbiAgfVxuICBzYXZlU2VnbWVudHMoYW5vbWFseUlkLCBzZWdtZW50cyk7XG59XG5cbmV4cG9ydCB7IGdldExhYmVsZWRTZWdtZW50cywgZ2V0UHJlZGljdGVkU2VnbWVudHMsIHNhdmVTZWdtZW50cywgaW5zZXJ0U2VnbWVudHMsIHJlbW92ZVNlZ21lbnRzIH1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnYXhpb3MnKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2NyeXB0bycpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnZXZlbnQtc3RyZWFtJyk7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdmcycpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgna29hJyk7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdrb2EtYm9keXBhcnNlcicpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgna29hLXJvdXRlcicpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnbG9kYXNoJyk7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdwYXRoJyk7Il0sInNvdXJjZVJvb3QiOiIifQ==