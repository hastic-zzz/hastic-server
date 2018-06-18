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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 14);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require('babel-runtime/regenerator');

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require('babel-runtime/core-js/promise');

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var path = __webpack_require__(4);
var json_1 = __webpack_require__(6);
var config_1 = __webpack_require__(3);
var fs = __webpack_require__(8);
var crypto = __webpack_require__(12);
var anomaliesNameToIdMap = {};
function loadAnomaliesMap() {
    var filename = path.join(config_1.ANOMALIES_PATH, "all_anomalies.json");
    if (!fs.existsSync(filename)) {
        saveAnomaliesMap();
    }
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var path = __webpack_require__(4);
exports.ANALYTICS_PATH = path.join(__dirname, '../../analytics');
exports.DATA_PATH = path.join(__dirname, '../../data');
exports.DATASETS_PATH = path.join(exports.DATA_PATH, 'datasets');
exports.ANOMALIES_PATH = path.join(exports.DATA_PATH, 'anomalies');
exports.MODELS_PATH = path.join(exports.DATA_PATH, 'models');
exports.METRICS_PATH = path.join(exports.DATA_PATH, 'metrics');
exports.SEGMENTS_PATH = path.join(exports.DATA_PATH, 'segments');

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require('path');

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require('koa-router');

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _stringify = __webpack_require__(7);

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = __webpack_require__(0);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = __webpack_require__(1);

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
var fs = __webpack_require__(8);
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

module.exports = require('babel-runtime/core-js/json/stringify');

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require('fs');

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(0);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = __webpack_require__(7);

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = __webpack_require__(1);

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
var config_1 = __webpack_require__(3);
var anomalyType_1 = __webpack_require__(2);
var metrics_1 = __webpack_require__(13);
var segments_1 = __webpack_require__(11);
var event_stream_1 = __webpack_require__(20);
var learnWorker = child_process_1.spawn('python3', ['worker.py'], { cwd: config_1.ANALYTICS_PATH });
learnWorker.stdout.pipe(event_stream_1.split()).pipe(event_stream_1.mapSync(onMessage));
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
        var segments, anomaly, pattern, task, result;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        segments = segments_1.getLabeledSegments(anomalyId);

                        anomalyType_1.setAnomalyStatus(anomalyId, 'learning');
                        anomaly = anomalyType_1.loadAnomalyById(anomalyId);
                        pattern = anomaly.pattern;
                        task = {
                            type: 'learn',
                            anomaly_id: anomalyId,
                            pattern: pattern,
                            segments: segments
                        };
                        _context.next = 7;
                        return runTask(task);

                    case 7:
                        result = _context.sent;

                        if (result.status === 'success') {
                            anomalyType_1.setAnomalyStatus(anomalyId, 'ready');
                            segments_1.insertSegments(anomalyId, result.segments, false);
                            anomalyType_1.setAnomalyPredictionTime(anomalyId, result.last_prediction_time);
                        } else {
                            anomalyType_1.setAnomalyStatus(anomalyId, 'failed', result.error);
                        }

                    case 9:
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
        var anomaly, pattern, task, result, segments, lastOldSegment, firstNewSegment;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        anomaly = anomalyType_1.loadAnomalyById(anomalyId);
                        pattern = anomaly.pattern;
                        task = {
                            type: 'predict',
                            anomaly_id: anomalyId,
                            pattern: pattern,
                            last_prediction_time: anomaly.last_prediction_time
                        };
                        _context2.next = 5;
                        return runTask(task);

                    case 5:
                        result = _context2.sent;

                        if (!(result.status === 'failed')) {
                            _context2.next = 8;
                            break;
                        }

                        return _context2.abrupt("return", []);

                    case 8:
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

                    case 13:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
}
exports.runPredict = runPredict;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require('babel-runtime/core-js/get-iterator');

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _getIterator2 = __webpack_require__(10);

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var path = __webpack_require__(4);
var json_1 = __webpack_require__(6);
var config_1 = __webpack_require__(3);
var anomalyType_1 = __webpack_require__(2);
var _ = __webpack_require__(19);
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
        return json_1.writeJsonDataSync(filename, _.uniqBy(segments, 'start'));
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


var _stringify = __webpack_require__(7);

var _stringify2 = _interopRequireDefault(_stringify);

var _getIterator2 = __webpack_require__(10);

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var path = __webpack_require__(4);
var json_1 = __webpack_require__(6);
var config_1 = __webpack_require__(3);
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


var _regenerator = __webpack_require__(0);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = __webpack_require__(1);

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
var Koa = __webpack_require__(15);
var Router = __webpack_require__(5);
var bodyParser = __webpack_require__(16);
var anomalies_1 = __webpack_require__(17);
var segments_1 = __webpack_require__(21);
var alerts_1 = __webpack_require__(22);
var data_1 = __webpack_require__(27);
data_1.checkDataFolders();
var app = new Koa();
var PORT = process.env.HASTIC_PORT || 8000;
app.use(bodyParser());
app.use(function (ctx, next) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        ctx.set('Access-Control-Allow-Origin', '*');
                        ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
                        ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                        next();

                    case 4:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
});
var rootRouter = new Router();
rootRouter.use('/anomalies', anomalies_1.router.routes(), anomalies_1.router.allowedMethods());
rootRouter.use('/segments', segments_1.router.routes(), segments_1.router.allowedMethods());
rootRouter.use('/alerts', alerts_1.router.routes(), alerts_1.router.allowedMethods());
rootRouter.get('/', function (ctx) {
    return __awaiter(undefined, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        ctx.response.body = { status: 'OK' };

                    case 1:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
});
app.use(rootRouter.routes()).use(rootRouter.allowedMethods());
app.listen(PORT, function () {
    console.log("Server is running on :" + PORT);
});

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require('koa');

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require('koa-bodyparser');

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(0);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = __webpack_require__(1);

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
var Router = __webpack_require__(5);
var anomalyType_1 = __webpack_require__(2);
var analytics_1 = __webpack_require__(9);
var metrics_1 = __webpack_require__(13);
function sendAnomalyTypeStatus(ctx) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var id, name, anomaly;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        id = ctx.request.query.id;
                        name = ctx.request.query.name;
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

                        ctx.response.status = 404;
                        return _context.abrupt("return");

                    case 8:
                        if (!(anomaly.status === undefined)) {
                            _context.next = 10;
                            break;
                        }

                        throw new Error('No status for ' + name);

                    case 10:
                        ctx.response.body = { status: anomaly.status, errorMessage: anomaly.error };
                        _context.next = 18;
                        break;

                    case 13:
                        _context.prev = 13;
                        _context.t0 = _context["catch"](2);

                        console.error(_context.t0);
                        // TODO: better send 404 when we know than isn`t found
                        ctx.response.status = 500;
                        ctx.response.body = { error: 'Can`t return anything' };

                    case 18:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[2, 13]]);
    }));
}
function getAnomaly(ctx) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var id, name, anomaly;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        id = ctx.request.query.id;
                        name = ctx.request.query.name;
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

                        ctx.response.status = 404;
                        return _context2.abrupt("return");

                    case 8:
                        ctx.response.body = {
                            name: anomaly.name,
                            metric: anomaly.metric,
                            status: anomaly.status
                        };
                        _context2.next = 16;
                        break;

                    case 11:
                        _context2.prev = 11;
                        _context2.t0 = _context2["catch"](0);

                        console.error(_context2.t0);
                        // TODO: better send 404 when we know than isn`t found
                        ctx.response.status = 500;
                        ctx.response.body = 'Can`t get anything';

                    case 16:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 11]]);
    }));
}
function createAnomaly(ctx) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var body, metric, anomaly, anomalyId;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        try {
                            body = ctx.request.body;
                            metric = {
                                datasource: body.metric.datasource,
                                targets: metrics_1.saveTargets(body.metric.targets)
                            };
                            anomaly = {
                                name: body.name,
                                panelUrl: body.panelUrl,
                                pattern: body.pattern.toLowerCase(),
                                metric: metric,
                                datasource: body.datasource,
                                status: 'learning',
                                last_prediction_time: 0,
                                next_id: 0
                            };
                            anomalyId = anomalyType_1.insertAnomaly(anomaly);

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

                    case 1:
                    case "end":
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));
}
function deleteAnomaly(ctx) {
    try {
        var id = ctx.request.query.id;
        var name = ctx.request.query.name;
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
/* 18 */
/***/ (function(module, exports) {

module.exports = require('child_process');

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require('lodash');

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require('event-stream');

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(0);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = __webpack_require__(1);

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
var Router = __webpack_require__(5);
var segments_1 = __webpack_require__(11);
var anomalyType_1 = __webpack_require__(2);
var analytics_1 = __webpack_require__(9);
function sendSegments(ctx) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var anomalyId, anomaly, lastSegmentId, timeFrom, timeTo, segments;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        anomalyId = ctx.request.query.anomaly_id;
                        anomaly = anomalyType_1.loadAnomalyById(anomalyId);

                        if (anomaly === null) {
                            anomalyId = anomalyType_1.getAnomalyIdByName(anomalyId);
                        }
                        lastSegmentId = ctx.request.query.last_segment;
                        timeFrom = ctx.request.query.from;
                        timeTo = ctx.request.query.to;
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
                        ctx.response.body = { segments: segments };

                    case 11:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
function updateSegments(ctx) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var segmentsUpdate, anomalyId, anomalyName, addedIds;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        try {
                            segmentsUpdate = ctx.request.body;
                            anomalyId = segmentsUpdate.anomaly_id;
                            anomalyName = segmentsUpdate.name;

                            if (anomalyId === undefined) {
                                anomalyId = anomalyType_1.getAnomalyIdByName(anomalyName.toLowerCase());
                            }
                            addedIds = segments_1.insertSegments(anomalyId, segmentsUpdate.added_segments, true);

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

                    case 1:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
}
exports.router = new Router();
exports.router.get('/', sendSegments);
exports.router.patch('/', updateSegments);

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var anomalyType_1 = __webpack_require__(2);
var alerts_1 = __webpack_require__(23);
var Router = __webpack_require__(5);
function getAlert(ctx) {
    var anomalyId = ctx.request.query.anomaly_id;
    var anomaly = anomalyType_1.loadAnomalyById(anomalyId);
    if (anomaly == null) {
        anomalyId = anomalyType_1.getAnomalyIdByName(anomalyId.toLowerCase());
    }
    var alertsAnomalies = alerts_1.getAlertsAnomalies();
    var pos = alertsAnomalies.indexOf(anomalyId);
    var enable = pos !== -1;
    ctx.response.body = { enable: enable };
}
function changeAlert(ctx) {
    var anomalyId = ctx.request.body.anomaly_id;
    var enable = ctx.request.body.enable;
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
    ctx.response.body = { status: 'OK' };
}
exports.router = new Router();
exports.router.get('/', getAlert);
exports.router.post('/', changeAlert);

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _set = __webpack_require__(24);

var _set2 = _interopRequireDefault(_set);

var _regenerator = __webpack_require__(0);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = __webpack_require__(10);

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = __webpack_require__(1);

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
var analytics_1 = __webpack_require__(9);
var notification_1 = __webpack_require__(25);
var segments_1 = __webpack_require__(11);
var config_1 = __webpack_require__(3);
var path = __webpack_require__(4);
var fs = __webpack_require__(8);
var ALERTS_DB_PATH = path.join(config_1.ANOMALIES_PATH, "alerts_anomalies.json");
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
/* 24 */
/***/ (function(module, exports) {

module.exports = require('babel-runtime/core-js/set');

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(0);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = __webpack_require__(7);

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = __webpack_require__(1);

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
var axios_1 = __webpack_require__(26);
var anomalyType_1 = __webpack_require__(2);
function sendNotification(anomalyId, active) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var anomalyName, notification, endpoint, data;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        anomalyName = anomalyType_1.loadAnomalyById(anomalyId).name;

                        console.log('Notification ' + anomalyName);
                        notification = {
                            anomaly: anomalyName,
                            status: ''
                        };

                        if (active) {
                            notification.status = 'alert';
                        } else {
                            notification.status = 'OK';
                        }
                        endpoint = process.env.HASTIC_ALERT_ENDPOINT;

                        if (!(endpoint === undefined)) {
                            _context.next = 8;
                            break;
                        }

                        console.error("Can't send alert, env HASTIC_ALERT_ENDPOINT is undefined");
                        return _context.abrupt("return");

                    case 8:
                        _context.prev = 8;
                        _context.next = 11;
                        return axios_1.default.post(endpoint, {
                            method: 'POST',
                            body: (0, _stringify2.default)(notification)
                        });

                    case 11:
                        data = _context.sent;

                        console.log(data);
                        _context.next = 18;
                        break;

                    case 15:
                        _context.prev = 15;
                        _context.t0 = _context["catch"](8);

                        console.error("Can't send alert to " + endpoint + ". Error: " + _context.t0);

                    case 18:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[8, 15]]);
    }));
}
exports.sendNotification = sendNotification;

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = require('axios');

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var config = __webpack_require__(3);
var fs = __webpack_require__(8);
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

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNTVhNzY2MjNiNzUwOTAwNzY0NWEiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgnYmFiZWwtcnVudGltZS9yZWdlbmVyYXRvcicpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgnYmFiZWwtcnVudGltZS9jb3JlLWpzL3Byb21pc2UnKVwiIiwid2VicGFjazovLy8uL3NlcnZpY2VzL2Fub21hbHlUeXBlLnRzIiwid2VicGFjazovLy8uL2NvbmZpZy50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdwYXRoJylcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdrb2Etcm91dGVyJylcIiIsIndlYnBhY2s6Ly8vLi9zZXJ2aWNlcy9qc29uLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9qc29uL3N0cmluZ2lmeScpXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgnZnMnKVwiIiwid2VicGFjazovLy8uL3NlcnZpY2VzL2FuYWx5dGljcy50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdiYWJlbC1ydW50aW1lL2NvcmUtanMvZ2V0LWl0ZXJhdG9yJylcIiIsIndlYnBhY2s6Ly8vLi9zZXJ2aWNlcy9zZWdtZW50cy50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdjcnlwdG8nKVwiIiwid2VicGFjazovLy8uL3NlcnZpY2VzL21ldHJpY3MudHMiLCJ3ZWJwYWNrOi8vLy4vaW5kZXgudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWlyZSgna29hJylcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdrb2EtYm9keXBhcnNlcicpXCIiLCJ3ZWJwYWNrOi8vLy4vcm91dGVzL2Fub21hbGllcy50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdjaGlsZF9wcm9jZXNzJylcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdsb2Rhc2gnKVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2V2ZW50LXN0cmVhbScpXCIiLCJ3ZWJwYWNrOi8vLy4vcm91dGVzL3NlZ21lbnRzLnRzIiwid2VicGFjazovLy8uL3JvdXRlcy9hbGVydHMudHMiLCJ3ZWJwYWNrOi8vLy4vc2VydmljZXMvYWxlcnRzLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9zZXQnKVwiIiwid2VicGFjazovLy8uL3NlcnZpY2VzL25vdGlmaWNhdGlvbi50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1aXJlKCdheGlvcycpXCIiLCJ3ZWJwYWNrOi8vLy4vc2VydmljZXMvZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7QUM3REEsc0Q7Ozs7OztBQ0FBLDBEOzs7Ozs7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWdDQSxJQUFJLHVCQUF1QixFQUEzQjtBQUVBO0FBQ0UsUUFBSSxXQUFXLEtBQUssSUFBTCxDQUFVLHVCQUFWLHVCQUFmO0FBQ0EsUUFBRyxDQUFDLEdBQUcsVUFBSCxD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RyxHQUFHLFVBQUgsQ0FBYyxJQUFkLENBQUgsRUFBd0I7QUFDdEI7QUFDRDtBQUNELE9BQUcsU0FBSCxDQUFhLElBQWI7QUFDRDtBQUVEO0FBQ0UsUUFBSSxVQUFVLENBQ1osT0FBTyxTQURLLEVBRVosT0FBTyxhQUZLLEVBR1osT0FBTyxjQUhLLEVBSVosT0FBTyxXQUpLLEVBS1osT0FBTyxZQUxLLEVBTVosT0FBTyxhQU5LLEVBT1osT0FQWSxDQU9KLFdBUEksQ0FBZDtBQVFEO0FBVEQsNEMiLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMTQpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDU1YTc2NjIzYjc1MDkwMDc2NDVhIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdiYWJlbC1ydW50aW1lL3JlZ2VuZXJhdG9yJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJyZXF1aXJlKCdiYWJlbC1ydW50aW1lL3JlZ2VuZXJhdG9yJylcIlxuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9wcm9taXNlJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJyZXF1aXJlKCdiYWJlbC1ydW50aW1lL2NvcmUtanMvcHJvbWlzZScpXCJcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgZ2V0SnNvbkRhdGFTeW5jLCB3cml0ZUpzb25EYXRhU3luYyB9IGZyb20gJy4vanNvbidcbmltcG9ydCB7IEFOT01BTElFU19QQVRIIH0gZnJvbSAnLi4vY29uZmlnJ1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnXG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSAnY3J5cHRvJztcblxuZXhwb3J0IHR5cGUgRGF0YXNvdXJjZSA9IHtcbiAgbWV0aG9kOiBzdHJpbmcsXG4gIGRhdGE6IE9iamVjdCxcbiAgcGFyYW1zOiBPYmplY3QsXG4gIHR5cGU6IHN0cmluZyxcbiAgdXJsOiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgTWV0cmljID0ge1xuICBkYXRhc291cmNlOiBzdHJpbmcsXG4gIHRhcmdldHM6IHN0cmluZ1tdXG59XG5cbmV4cG9ydCB0eXBlIEFub21hbHkgPSB7XG4gIG5hbWU6IHN0cmluZyxcblxuICBwYW5lbFVybDogc3RyaW5nLFxuXG4gIHBhdHRlcm46IHN0cmluZyxcbiAgbWV0cmljOiBNZXRyaWMsXG4gIGRhdGFzb3VyY2U6IERhdGFzb3VyY2VcbiAgc3RhdHVzOiBzdHJpbmcsXG4gIGVycm9yPzogc3RyaW5nLFxuXG4gIGxhc3RfcHJlZGljdGlvbl90aW1lOiBudW1iZXIsXG4gIG5leHRfaWQ6IG51bWJlclxufVxuXG5leHBvcnQgdHlwZSBBbm9tYWx5SWQgPSBzdHJpbmc7XG5cbmxldCBhbm9tYWxpZXNOYW1lVG9JZE1hcCA9IHt9O1xuXG5mdW5jdGlvbiBsb2FkQW5vbWFsaWVzTWFwKCkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGBhbGxfYW5vbWFsaWVzLmpzb25gKTtcbiAgaWYoIWZzLmV4aXN0c1N5bmMoZmlsZW5hbWUpKSB7XG4gICAgc2F2ZUFub21hbGllc01hcCgpO1xuICB9XG4gIGFub21hbGllc05hbWVUb0lkTWFwID0gZ2V0SnNvbkRhdGFTeW5jKGZpbGVuYW1lKTtcbn1cblxuZnVuY3Rpb24gc2F2ZUFub21hbGllc01hcCgpIHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKEFOT01BTElFU19QQVRILCBgYWxsX2Fub21hbGllcy5qc29uYCk7XG4gIHdyaXRlSnNvbkRhdGFTeW5jKGZpbGVuYW1lLCBhbm9tYWxpZXNOYW1lVG9JZE1hcCk7XG59XG5cbmZ1bmN0aW9uIGdldEFub21hbHlJZEJ5TmFtZShhbm9tYWx5TmFtZTpzdHJpbmcpIDogQW5vbWFseUlkIHtcbiAgbG9hZEFub21hbGllc01hcCgpO1xuICBhbm9tYWx5TmFtZSA9IGFub21hbHlOYW1lLnRvTG93ZXJDYXNlKCk7XG4gIGlmKGFub21hbHlOYW1lIGluIGFub21hbGllc05hbWVUb0lkTWFwKSB7XG4gICAgcmV0dXJuIGFub21hbGllc05hbWVUb0lkTWFwW2Fub21hbHlOYW1lXTtcbiAgfVxuICByZXR1cm4gYW5vbWFseU5hbWU7XG59XG5cbmZ1bmN0aW9uIGluc2VydEFub21hbHkoYW5vbWFseTogQW5vbWFseSkgOiBBbm9tYWx5SWQge1xuICBjb25zdCBoYXNoU3RyaW5nID0gYW5vbWFseS5uYW1lICsgKG5ldyBEYXRlKCkpLnRvU3RyaW5nKCk7XG4gIGNvbnN0IGFub21hbHlJZDpBbm9tYWx5SWQgPSBjcnlwdG8uY3JlYXRlSGFzaCgnbWQ1JykudXBkYXRlKGhhc2hTdHJpbmcpLmRpZ2VzdCgnaGV4Jyk7XG4gIGFub21hbGllc05hbWVUb0lkTWFwW2Fub21hbHkubmFtZV0gPSBhbm9tYWx5SWQ7XG4gIHNhdmVBbm9tYWxpZXNNYXAoKTtcbiAgLy8gcmV0dXJuIGFub21hbHlJZFxuICAvLyBjb25zdCBhbm9tYWx5SWQ6QW5vbWFseUlkID0gYW5vbWFseS5uYW1lO1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGAke2Fub21hbHlJZH0uanNvbmApO1xuICBpZihmcy5leGlzdHNTeW5jKGZpbGVuYW1lKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHNhdmVBbm9tYWx5KGFub21hbHlJZCwgYW5vbWFseSk7XG4gIHJldHVybiBhbm9tYWx5SWQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUFub21hbHkoYW5vbWFseUlkOkFub21hbHlJZCkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGAke2Fub21hbHlJZH0uanNvbmApO1xuICBmcy51bmxpbmtTeW5jKGZpbGVuYW1lKTtcbn1cblxuZnVuY3Rpb24gc2F2ZUFub21hbHkoYW5vbWFseUlkOiBBbm9tYWx5SWQsIGFub21hbHk6IEFub21hbHkpIHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKEFOT01BTElFU19QQVRILCBgJHthbm9tYWx5SWR9Lmpzb25gKTtcbiAgcmV0dXJuIHdyaXRlSnNvbkRhdGFTeW5jKGZpbGVuYW1lLCBhbm9tYWx5KTtcbn1cblxuZnVuY3Rpb24gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZDogQW5vbWFseUlkKSA6IEFub21hbHkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGAke2Fub21hbHlJZH0uanNvbmApO1xuICBpZighZnMuZXhpc3RzU3luYyhmaWxlbmFtZSkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gZ2V0SnNvbkRhdGFTeW5jKGZpbGVuYW1lKTtcbn1cblxuZnVuY3Rpb24gbG9hZEFub21hbHlCeU5hbWUoYW5vbWFseU5hbWU6IHN0cmluZykgOiBBbm9tYWx5IHtcbiAgbGV0IGFub21hbHlJZCA9IGdldEFub21hbHlJZEJ5TmFtZShhbm9tYWx5TmFtZSk7XG4gIHJldHVybiBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbn1cblxuZnVuY3Rpb24gc2F2ZUFub21hbHlUeXBlSW5mbyhpbmZvKSB7XG4gIGNvbnNvbGUubG9nKCdTYXZpbmcnKTtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKEFOT01BTElFU19QQVRILCBgJHtpbmZvLm5hbWV9Lmpzb25gKTtcbiAgaWYoaW5mby5uZXh0X2lkID09PSB1bmRlZmluZWQpIHtcbiAgICBpbmZvLm5leHRfaWQgPSAwO1xuICB9XG4gIGlmKGluZm8ubGFzdF9wcmVkaWN0aW9uX3RpbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaW5mby5sYXN0X3ByZWRpY3Rpb25fdGltZSA9IDA7XG4gIH1cblxuICByZXR1cm4gd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWUsIGluZm8pO1xufVxuXG5mdW5jdGlvbiBnZXRBbm9tYWx5VHlwZUluZm8obmFtZSkge1xuICByZXR1cm4gZ2V0SnNvbkRhdGFTeW5jKHBhdGguam9pbihBTk9NQUxJRVNfUEFUSCwgYCR7bmFtZX0uanNvbmApKTtcbn1cblxuZnVuY3Rpb24gc2V0QW5vbWFseVN0YXR1cyhhbm9tYWx5SWQ6QW5vbWFseUlkLCBzdGF0dXM6c3RyaW5nLCBlcnJvcj86c3RyaW5nKSB7XG4gIGxldCBpbmZvID0gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZCk7XG4gIGluZm8uc3RhdHVzID0gc3RhdHVzO1xuICBpZihlcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaW5mby5lcnJvciA9IGVycm9yO1xuICB9IGVsc2Uge1xuICAgIGluZm8uZXJyb3IgPSAnJztcbiAgfVxuICBzYXZlQW5vbWFseShhbm9tYWx5SWQsIGluZm8pO1xufVxuXG5mdW5jdGlvbiBzZXRBbm9tYWx5UHJlZGljdGlvblRpbWUoYW5vbWFseUlkOkFub21hbHlJZCwgbGFzdFByZWRpY3Rpb25UaW1lOm51bWJlcikge1xuICBsZXQgaW5mbyA9IGxvYWRBbm9tYWx5QnlJZChhbm9tYWx5SWQpO1xuICBpbmZvLmxhc3RfcHJlZGljdGlvbl90aW1lID0gbGFzdFByZWRpY3Rpb25UaW1lO1xuICBzYXZlQW5vbWFseShhbm9tYWx5SWQsIGluZm8pO1xufVxuXG5leHBvcnQge1xuICBzYXZlQW5vbWFseSwgbG9hZEFub21hbHlCeUlkLCBsb2FkQW5vbWFseUJ5TmFtZSwgaW5zZXJ0QW5vbWFseSwgcmVtb3ZlQW5vbWFseSwgc2F2ZUFub21hbHlUeXBlSW5mbyxcbiAgZ2V0QW5vbWFseVR5cGVJbmZvLCBnZXRBbm9tYWx5SWRCeU5hbWUsIHNldEFub21hbHlTdGF0dXMsIHNldEFub21hbHlQcmVkaWN0aW9uVGltZVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc2VydmljZXMvYW5vbWFseVR5cGUudHMiLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgY29uc3QgQU5BTFlUSUNTX1BBVEggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vYW5hbHl0aWNzJyk7XG5cbmV4cG9ydCBjb25zdCBEQVRBX1BBVEggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vZGF0YScpO1xuXG5leHBvcnQgY29uc3QgREFUQVNFVFNfUEFUSCA9IHBhdGguam9pbihEQVRBX1BBVEgsICdkYXRhc2V0cycpO1xuZXhwb3J0IGNvbnN0IEFOT01BTElFU19QQVRIID0gcGF0aC5qb2luKERBVEFfUEFUSCwgJ2Fub21hbGllcycpO1xuZXhwb3J0IGNvbnN0IE1PREVMU19QQVRIID0gcGF0aC5qb2luKERBVEFfUEFUSCwgJ21vZGVscycpO1xuZXhwb3J0IGNvbnN0IE1FVFJJQ1NfUEFUSCA9IHBhdGguam9pbihEQVRBX1BBVEgsICdtZXRyaWNzJyk7XG5leHBvcnQgY29uc3QgU0VHTUVOVFNfUEFUSCA9IHBhdGguam9pbihEQVRBX1BBVEgsICdzZWdtZW50cycpO1xuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9jb25maWcudHMiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ3BhdGgnKVwiXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgna29hLXJvdXRlcicpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgna29hLXJvdXRlcicpXCJcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRKc29uRGF0YShmaWxlbmFtZTogc3RyaW5nKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgdmFyIGRhdGEgPSBhd2FpdCBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmcy5yZWFkRmlsZShmaWxlbmFtZSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICBpZihlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICByZWplY3QoJ0NhbmB0IHJlYWQgZmlsZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1dyb25nIGZpbGUgZm9ybWF0Jyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JpdGVKc29uRGF0YShmaWxlbmFtZTogc3RyaW5nLCBkYXRhOiBPYmplY3QpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmcy53cml0ZUZpbGUoZmlsZW5hbWUsIEpTT04uc3RyaW5naWZ5KGRhdGEpLCAndXRmOCcsIChlcnIpID0+IHtcbiAgICAgIGlmKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIHJlamVjdCgnQ2F0YHQgd3JpdGUgZmlsZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KVxufVxuXG5mdW5jdGlvbiBnZXRKc29uRGF0YVN5bmMoZmlsZW5hbWU6IHN0cmluZykge1xuICBsZXQgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKTtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1dyb25nIGZpbGUgZm9ybWF0Jyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JpdGVKc29uRGF0YVN5bmMoZmlsZW5hbWU6IHN0cmluZywgZGF0YTogT2JqZWN0KSB7XG4gIGZzLndyaXRlRmlsZVN5bmMoZmlsZW5hbWUsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbn1cblxuZXhwb3J0IHtcbiAgZ2V0SnNvbkRhdGEsXG4gIHdyaXRlSnNvbkRhdGEsXG4gIGdldEpzb25EYXRhU3luYyxcbiAgd3JpdGVKc29uRGF0YVN5bmNcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NlcnZpY2VzL2pzb24udHMiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9qc29uL3N0cmluZ2lmeScpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgnYmFiZWwtcnVudGltZS9jb3JlLWpzL2pzb24vc3RyaW5naWZ5JylcIlxuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2ZzJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJyZXF1aXJlKCdmcycpXCJcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IHsgQU5BTFlUSUNTX1BBVEggfSBmcm9tICcuLi9jb25maWcnXG5pbXBvcnQge1xuICBBbm9tYWx5LFxuICBBbm9tYWx5SWQsIGdldEFub21hbHlUeXBlSW5mbyxcbiAgbG9hZEFub21hbHlCeUlkLFxuICBzZXRBbm9tYWx5UHJlZGljdGlvblRpbWUsXG4gIHNldEFub21hbHlTdGF0dXNcbn0gZnJvbSAnLi9hbm9tYWx5VHlwZSdcbmltcG9ydCB7IGdldFRhcmdldCB9IGZyb20gJy4vbWV0cmljcyc7XG5pbXBvcnQgeyBnZXRMYWJlbGVkU2VnbWVudHMsIGluc2VydFNlZ21lbnRzLCByZW1vdmVTZWdtZW50cyB9IGZyb20gJy4vc2VnbWVudHMnO1xuaW1wb3J0IHsgc3BsaXQsIG1hcCwgbWFwU3luYyB9IGZyb20gJ2V2ZW50LXN0cmVhbSc7XG5cbmNvbnN0IGxlYXJuV29ya2VyID0gc3Bhd24oJ3B5dGhvbjMnLCBbJ3dvcmtlci5weSddLCB7IGN3ZDogQU5BTFlUSUNTX1BBVEggfSlcbmxlYXJuV29ya2VyLnN0ZG91dC5waXBlKHNwbGl0KCkpLnBpcGUobWFwU3luYyhvbk1lc3NhZ2UpKTtcblxubGVhcm5Xb3JrZXIuc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiBjb25zb2xlLmVycm9yKGB3b3JrZXIgc3RkZXJyOiAke2RhdGF9YCkpO1xuXG5jb25zdCB0YXNrTWFwID0ge307XG5sZXQgbmV4dFRhc2tJZCA9IDA7XG5cbmZ1bmN0aW9uIG9uTWVzc2FnZShkYXRhKSB7XG4gIGNvbnNvbGUubG9nKGB3b3JrZXIgc3Rkb3V0OiAke2RhdGF9YCk7XG4gIGxldCByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gIGxldCB0YXNrSWQgPSByZXNwb25zZS5fX3Rhc2tfaWQ7XG4gIC8vIGxldCBhbm9tYWx5TmFtZSA9IHJlc3BvbnNlLmFub21hbHlfbmFtZTtcbiAgLy8gbGV0IHRhc2sgPSByZXNwb25zZS50YXNrO1xuICBsZXQgc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuXG4gIGlmKHN0YXR1cyA9PT0gJ3N1Y2Nlc3MnIHx8IHN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcbiAgICBpZih0YXNrSWQgaW4gdGFza01hcCkge1xuICAgICAgbGV0IHJlc29sdmVyID0gdGFza01hcFt0YXNrSWRdO1xuICAgICAgcmVzb2x2ZXIocmVzcG9uc2UpO1xuICAgICAgZGVsZXRlIHRhc2tNYXBbdGFza0lkXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcnVuVGFzayh0YXNrKSA6IFByb21pc2U8YW55PiB7XG4gIGxldCBhbm9tYWx5OkFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQodGFzay5hbm9tYWx5X2lkKTtcbiAgdGFzay5tZXRyaWMgPSB7XG4gICAgZGF0YXNvdXJjZTogYW5vbWFseS5tZXRyaWMuZGF0YXNvdXJjZSxcbiAgICB0YXJnZXRzOiBhbm9tYWx5Lm1ldHJpYy50YXJnZXRzLm1hcCh0ID0+IGdldFRhcmdldCh0KSlcbiAgfTtcblxuICB0YXNrLl9fdGFza19pZCA9IG5leHRUYXNrSWQrKztcbiAgbGV0IGNvbW1hbmQgPSBKU09OLnN0cmluZ2lmeSh0YXNrKVxuICBsZWFybldvcmtlci5zdGRpbi53cml0ZShgJHtjb21tYW5kfVxcbmApO1xuICByZXR1cm4gbmV3IFByb21pc2U8T2JqZWN0PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdGFza01hcFt0YXNrLl9fdGFza19pZF0gPSByZXNvbHZlXG4gIH0pXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bkxlYXJuaW5nKGFub21hbHlJZDpBbm9tYWx5SWQpIHtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG4gIHNldEFub21hbHlTdGF0dXMoYW5vbWFseUlkLCAnbGVhcm5pbmcnKTtcbiAgbGV0IGFub21hbHk6QW5vbWFseSAgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgbGV0IHBhdHRlcm4gPSBhbm9tYWx5LnBhdHRlcm47XG4gIGxldCB0YXNrID0ge1xuICAgIHR5cGU6ICdsZWFybicsXG4gICAgYW5vbWFseV9pZDogYW5vbWFseUlkLFxuICAgIHBhdHRlcm4sXG4gICAgc2VnbWVudHM6IHNlZ21lbnRzXG4gIH07XG5cbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHJ1blRhc2sodGFzayk7XG5cbiAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdzdWNjZXNzJykge1xuICAgIHNldEFub21hbHlTdGF0dXMoYW5vbWFseUlkLCAncmVhZHknKTtcbiAgICBpbnNlcnRTZWdtZW50cyhhbm9tYWx5SWQsIHJlc3VsdC5zZWdtZW50cywgZmFsc2UpO1xuICAgIHNldEFub21hbHlQcmVkaWN0aW9uVGltZShhbm9tYWx5SWQsIHJlc3VsdC5sYXN0X3ByZWRpY3Rpb25fdGltZSk7XG4gIH0gZWxzZSB7XG4gICAgc2V0QW5vbWFseVN0YXR1cyhhbm9tYWx5SWQsICdmYWlsZWQnLCByZXN1bHQuZXJyb3IpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1blByZWRpY3QoYW5vbWFseUlkOkFub21hbHlJZCkge1xuICBsZXQgYW5vbWFseTpBbm9tYWx5ID0gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZCk7XG4gIGxldCBwYXR0ZXJuID0gYW5vbWFseS5wYXR0ZXJuO1xuICBsZXQgdGFzayA9IHtcbiAgICB0eXBlOiAncHJlZGljdCcsXG4gICAgYW5vbWFseV9pZDogYW5vbWFseUlkLFxuICAgIHBhdHRlcm4sXG4gICAgbGFzdF9wcmVkaWN0aW9uX3RpbWU6IGFub21hbHkubGFzdF9wcmVkaWN0aW9uX3RpbWVcbiAgfTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHJ1blRhc2sodGFzayk7XG5cbiAgaWYocmVzdWx0LnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgLy8gTWVyZ2luZyBzZWdtZW50c1xuICBsZXQgc2VnbWVudHMgPSBnZXRMYWJlbGVkU2VnbWVudHMoYW5vbWFseUlkKTtcbiAgaWYoc2VnbWVudHMubGVuZ3RoID4gMCAmJiByZXN1bHQuc2VnbWVudHMubGVuZ3RoID4gMCkge1xuICAgIGxldCBsYXN0T2xkU2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdO1xuICAgIGxldCBmaXJzdE5ld1NlZ21lbnQgPSByZXN1bHQuc2VnbWVudHNbMF07XG5cbiAgICBpZihmaXJzdE5ld1NlZ21lbnQuc3RhcnQgPD0gbGFzdE9sZFNlZ21lbnQuZmluaXNoKSB7XG4gICAgICByZXN1bHQuc2VnbWVudHNbMF0uc3RhcnQgPSBsYXN0T2xkU2VnbWVudC5zdGFydDtcbiAgICAgIHJlbW92ZVNlZ21lbnRzKGFub21hbHlJZCwgW2xhc3RPbGRTZWdtZW50LmlkXSk7XG4gICAgfVxuICB9XG5cbiAgaW5zZXJ0U2VnbWVudHMoYW5vbWFseUlkLCByZXN1bHQuc2VnbWVudHMsIGZhbHNlKTtcbiAgc2V0QW5vbWFseVByZWRpY3Rpb25UaW1lKGFub21hbHlJZCwgcmVzdWx0Lmxhc3RfcHJlZGljdGlvbl90aW1lKTtcbiAgcmV0dXJuIHJlc3VsdC5zZWdtZW50cztcbn1cblxuZXhwb3J0IHsgcnVuTGVhcm5pbmcsIHJ1blByZWRpY3QgfVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc2VydmljZXMvYW5hbHl0aWNzLnRzIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdiYWJlbC1ydW50aW1lL2NvcmUtanMvZ2V0LWl0ZXJhdG9yJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJyZXF1aXJlKCdiYWJlbC1ydW50aW1lL2NvcmUtanMvZ2V0LWl0ZXJhdG9yJylcIlxuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEpzb25EYXRhU3luYywgd3JpdGVKc29uRGF0YVN5bmMgfSAgZnJvbSAnLi9qc29uJztcbmltcG9ydCB7IFNFR01FTlRTX1BBVEggfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgQW5vbWFseUlkLCBsb2FkQW5vbWFseUJ5SWQsIHNhdmVBbm9tYWx5IH0gZnJvbSAnLi9hbm9tYWx5VHlwZSc7XG5cbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcblxuZnVuY3Rpb24gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkKSB7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihTRUdNRU5UU19QQVRILCBgJHthbm9tYWx5SWR9X2xhYmVsZWQuanNvbmApO1xuXG4gIGxldCBzZWdtZW50cyA9IFtdO1xuICB0cnkge1xuICAgIHNlZ21lbnRzID0gZ2V0SnNvbkRhdGFTeW5jKGZpbGVuYW1lKTtcbiAgICBmb3IgKGxldCBzZWdtZW50IG9mIHNlZ21lbnRzKSB7XG4gICAgICBpZiAoc2VnbWVudC5sYWJlbGVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2VnbWVudC5sYWJlbGVkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xuICB9XG4gIHJldHVybiBzZWdtZW50cztcbn1cblxuZnVuY3Rpb24gZ2V0UHJlZGljdGVkU2VnbWVudHMoYW5vbWFseUlkOiBBbm9tYWx5SWQpIHtcbiAgbGV0IGZpbGVuYW1lID0gcGF0aC5qb2luKFNFR01FTlRTX1BBVEgsIGAke2Fub21hbHlJZH1fc2VnbWVudHMuanNvbmApO1xuXG4gIGxldCBqc29uRGF0YTtcbiAgdHJ5IHtcbiAgICBqc29uRGF0YSA9IGdldEpzb25EYXRhU3luYyhmaWxlbmFtZSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcbiAgICBqc29uRGF0YSA9IFtdO1xuICB9XG4gIHJldHVybiBqc29uRGF0YTtcbn1cblxuZnVuY3Rpb24gc2F2ZVNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkLCBzZWdtZW50cykge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oU0VHTUVOVFNfUEFUSCwgYCR7YW5vbWFseUlkfV9sYWJlbGVkLmpzb25gKTtcblxuICB0cnkge1xuICAgIHJldHVybiB3cml0ZUpzb25EYXRhU3luYyhmaWxlbmFtZSwgXy51bmlxQnkoc2VnbWVudHMsICdzdGFydCcpKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xuICAgIHRocm93IG5ldyBFcnJvcignQ2FuYHQgd3JpdGUgdG8gZGInKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbnNlcnRTZWdtZW50cyhhbm9tYWx5SWQ6IEFub21hbHlJZCwgYWRkZWRTZWdtZW50cywgbGFiZWxlZDpib29sZWFuKSB7XG4gIC8vIFNldCBzdGF0dXNcbiAgbGV0IGluZm8gPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKTtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG5cbiAgbGV0IG5leHRJZCA9IGluZm8ubmV4dF9pZDtcbiAgbGV0IGFkZGVkSWRzID0gW11cbiAgZm9yIChsZXQgc2VnbWVudCBvZiBhZGRlZFNlZ21lbnRzKSB7XG4gICAgc2VnbWVudC5pZCA9IG5leHRJZDtcbiAgICBzZWdtZW50LmxhYmVsZWQgPSBsYWJlbGVkO1xuICAgIGFkZGVkSWRzLnB1c2gobmV4dElkKTtcbiAgICBuZXh0SWQrKztcbiAgICBzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xuICB9XG4gIGluZm8ubmV4dF9pZCA9IG5leHRJZDtcbiAgc2F2ZVNlZ21lbnRzKGFub21hbHlJZCwgc2VnbWVudHMpO1xuICBzYXZlQW5vbWFseShhbm9tYWx5SWQsIGluZm8pO1xuICByZXR1cm4gYWRkZWRJZHM7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVNlZ21lbnRzKGFub21hbHlJZDogQW5vbWFseUlkLCByZW1vdmVkU2VnbWVudHMpIHtcbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG4gIGZvciAobGV0IHNlZ21lbnRJZCBvZiByZW1vdmVkU2VnbWVudHMpIHtcbiAgICBzZWdtZW50cyA9IHNlZ21lbnRzLmZpbHRlcihlbCA9PiBlbC5pZCAhPT0gc2VnbWVudElkKTtcbiAgfVxuICBzYXZlU2VnbWVudHMoYW5vbWFseUlkLCBzZWdtZW50cyk7XG59XG5cbmV4cG9ydCB7IGdldExhYmVsZWRTZWdtZW50cywgZ2V0UHJlZGljdGVkU2VnbWVudHMsIHNhdmVTZWdtZW50cywgaW5zZXJ0U2VnbWVudHMsIHJlbW92ZVNlZ21lbnRzIH1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NlcnZpY2VzL3NlZ21lbnRzLnRzIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdjcnlwdG8nKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2NyeXB0bycpXCJcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBnZXRKc29uRGF0YVN5bmMsIHdyaXRlSnNvbkRhdGFTeW5jIH0gIGZyb20gJy4vanNvbic7XG5pbXBvcnQgeyBNRVRSSUNTX1BBVEggfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5cbmZ1bmN0aW9uIHNhdmVUYXJnZXRzKHRhcmdldHMpIHtcbiAgbGV0IG1ldHJpY3MgPSBbXTtcbiAgZm9yIChsZXQgdGFyZ2V0IG9mIHRhcmdldHMpIHtcbiAgICBtZXRyaWNzLnB1c2goc2F2ZVRhcmdldCh0YXJnZXQpKTtcbiAgfVxuICByZXR1cm4gbWV0cmljcztcbn1cblxuZnVuY3Rpb24gc2F2ZVRhcmdldCh0YXJnZXQpIHtcbiAgLy9jb25zdCBtZDUgPSBjcnlwdG8uY3JlYXRlSGFzaCgnbWQ1JylcbiAgY29uc3QgdGFyZ2V0SWQgPSBjcnlwdG8uY3JlYXRlSGFzaCgnbWQ1JykudXBkYXRlKEpTT04uc3RyaW5naWZ5KHRhcmdldCkpLmRpZ2VzdCgnaGV4Jyk7XG4gIGxldCBmaWxlbmFtZSA9IHBhdGguam9pbihNRVRSSUNTX1BBVEgsIGAke3RhcmdldElkfS5qc29uYCk7XG4gIHdyaXRlSnNvbkRhdGFTeW5jKGZpbGVuYW1lLCB0YXJnZXQpO1xuICByZXR1cm4gdGFyZ2V0SWQ7XG59XG5cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXRJZCkge1xuICBsZXQgZmlsZW5hbWUgPSBwYXRoLmpvaW4oTUVUUklDU19QQVRILCBgJHt0YXJnZXRJZH0uanNvbmApO1xuICByZXR1cm4gZ2V0SnNvbkRhdGFTeW5jKGZpbGVuYW1lKTtcbn1cblxuZXhwb3J0IHsgc2F2ZVRhcmdldHMsIGdldFRhcmdldCB9XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zZXJ2aWNlcy9tZXRyaWNzLnRzIiwiaW1wb3J0ICogYXMgS29hIGZyb20gJ2tvYSc7XG5pbXBvcnQgKiBhcyBSb3V0ZXIgZnJvbSAna29hLXJvdXRlcic7XG5pbXBvcnQgKiBhcyBib2R5UGFyc2VyIGZyb20gJ2tvYS1ib2R5cGFyc2VyJztcblxuXG5pbXBvcnQgeyByb3V0ZXIgYXMgYW5vbWFsaWVzUm91dGVyIH0gZnJvbSAnLi9yb3V0ZXMvYW5vbWFsaWVzJztcbmltcG9ydCB7IHJvdXRlciBhcyBzZWdtZW50c1JvdXRlciB9IGZyb20gJy4vcm91dGVzL3NlZ21lbnRzJztcbmltcG9ydCB7IHJvdXRlciBhcyBhbGVydHNSb3V0ZXIgfSBmcm9tICcuL3JvdXRlcy9hbGVydHMnO1xuXG5pbXBvcnQgeyBjaGVja0RhdGFGb2xkZXJzIH0gZnJvbSAnLi9zZXJ2aWNlcy9kYXRhJztcblxuY2hlY2tEYXRhRm9sZGVycygpO1xuXG52YXIgYXBwID0gbmV3IEtvYSgpO1xuY29uc3QgUE9SVCA9IHByb2Nlc3MuZW52LkhBU1RJQ19QT1JUIHx8IDgwMDA7XG5cbmFwcC51c2UoYm9keVBhcnNlcigpKVxuXG5hcHAudXNlKGFzeW5jIGZ1bmN0aW9uKGN0eCwgbmV4dCkge1xuICBjdHguc2V0KCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICBjdHguc2V0KCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gIGN0eC5zZXQoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnT3JpZ2luLCBYLVJlcXVlc3RlZC1XaXRoLCBDb250ZW50LVR5cGUsIEFjY2VwdCcpO1xuICBuZXh0KCk7XG59KTtcblxudmFyIHJvb3RSb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG5yb290Um91dGVyLnVzZSgnL2Fub21hbGllcycsIGFub21hbGllc1JvdXRlci5yb3V0ZXMoKSwgYW5vbWFsaWVzUm91dGVyLmFsbG93ZWRNZXRob2RzKCkpO1xucm9vdFJvdXRlci51c2UoJy9zZWdtZW50cycsIHNlZ21lbnRzUm91dGVyLnJvdXRlcygpLCBzZWdtZW50c1JvdXRlci5hbGxvd2VkTWV0aG9kcygpKTtcbnJvb3RSb3V0ZXIudXNlKCcvYWxlcnRzJywgYWxlcnRzUm91dGVyLnJvdXRlcygpLCBhbGVydHNSb3V0ZXIuYWxsb3dlZE1ldGhvZHMoKSk7XG5yb290Um91dGVyLmdldCgnLycsIGFzeW5jIChjdHgpID0+IHtcbiAgY3R4LnJlc3BvbnNlLmJvZHkgPSB7IHN0YXR1czogJ09LJyB9O1xufSk7XG5cbmFwcFxuICAudXNlKHJvb3RSb3V0ZXIucm91dGVzKCkpXG4gIC51c2Uocm9vdFJvdXRlci5hbGxvd2VkTWV0aG9kcygpKVxuXG5hcHAubGlzdGVuKFBPUlQsICgpID0+IHtcbiAgY29uc29sZS5sb2coYFNlcnZlciBpcyBydW5uaW5nIG9uIDoke1BPUlR9YClcbn0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vaW5kZXgudHMiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2tvYScpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgna29hJylcIlxuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdrb2EtYm9keXBhcnNlcicpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgna29hLWJvZHlwYXJzZXInKVwiXG4vLyBtb2R1bGUgaWQgPSAxNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgKiBhcyBSb3V0ZXIgZnJvbSAna29hLXJvdXRlcic7XG5cbmltcG9ydCB7XG4gIERhdGFzb3VyY2UsXG4gIE1ldHJpYyxcbiAgQW5vbWFseSxcbiAgc2F2ZUFub21hbHksXG4gIGluc2VydEFub21hbHksIHJlbW92ZUFub21hbHksIGxvYWRBbm9tYWx5QnlOYW1lLCBsb2FkQW5vbWFseUJ5SWQsIGdldEFub21hbHlJZEJ5TmFtZVxufSBmcm9tICcuLi9zZXJ2aWNlcy9hbm9tYWx5VHlwZSc7XG5pbXBvcnQgeyBydW5MZWFybmluZyB9IGZyb20gJy4uL3NlcnZpY2VzL2FuYWx5dGljcydcbmltcG9ydCB7IHNhdmVUYXJnZXRzIH0gZnJvbSAnLi4vc2VydmljZXMvbWV0cmljcyc7XG5cbmFzeW5jIGZ1bmN0aW9uIHNlbmRBbm9tYWx5VHlwZVN0YXR1cyhjdHg6IFJvdXRlci5JUm91dGVyQ29udGV4dCkge1xuICBsZXQgaWQgPSBjdHgucmVxdWVzdC5xdWVyeS5pZDtcbiAgbGV0IG5hbWUgPSBjdHgucmVxdWVzdC5xdWVyeS5uYW1lO1xuICB0cnkge1xuICAgIGxldCBhbm9tYWx5OiBBbm9tYWx5O1xuICAgIGlmKGlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbm9tYWx5ID0gbG9hZEFub21hbHlCeU5hbWUobmFtZSk7XG4gICAgfVxuICAgIGlmKGFub21hbHkgPT09IG51bGwpIHtcbiAgICAgIGN0eC5yZXNwb25zZS5zdGF0dXMgPSA0MDQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKGFub21hbHkuc3RhdHVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gc3RhdHVzIGZvciAnICsgbmFtZSk7XG4gICAgfVxuICAgIGN0eC5yZXNwb25zZS5ib2R5ID0geyBzdGF0dXM6IGFub21hbHkuc3RhdHVzLCBlcnJvck1lc3NhZ2U6IGFub21hbHkuZXJyb3IgfTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAvLyBUT0RPOiBiZXR0ZXIgc2VuZCA0MDQgd2hlbiB3ZSBrbm93IHRoYW4gaXNuYHQgZm91bmRcbiAgICBjdHgucmVzcG9uc2Uuc3RhdHVzID0gNTAwO1xuICAgIGN0eC5yZXNwb25zZS5ib2R5ID0geyBlcnJvcjogJ0NhbmB0IHJldHVybiBhbnl0aGluZycgfTtcbiAgfVxuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEFub21hbHkoY3R4OiBSb3V0ZXIuSVJvdXRlckNvbnRleHQpIHtcbiAgdHJ5IHtcbiAgICBsZXQgaWQgPSBjdHgucmVxdWVzdC5xdWVyeS5pZDtcbiAgICBsZXQgbmFtZSA9IGN0eC5yZXF1ZXN0LnF1ZXJ5Lm5hbWU7XG5cbiAgICBsZXQgYW5vbWFseTpBbm9tYWx5O1xuICAgIGlmKGlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbm9tYWx5ID0gbG9hZEFub21hbHlCeU5hbWUobmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICB9XG4gICAgaWYoYW5vbWFseSA9PT0gbnVsbCkge1xuICAgICAgY3R4LnJlc3BvbnNlLnN0YXR1cyA9IDQwNDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHtcbiAgICAgIG5hbWU6IGFub21hbHkubmFtZSxcbiAgICAgIG1ldHJpYzogYW5vbWFseS5tZXRyaWMsXG4gICAgICBzdGF0dXM6IGFub21hbHkuc3RhdHVzXG4gICAgfTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAvLyBUT0RPOiBiZXR0ZXIgc2VuZCA0MDQgd2hlbiB3ZSBrbm93IHRoYW4gaXNuYHQgZm91bmRcbiAgICBjdHgucmVzcG9uc2Uuc3RhdHVzID0gNTAwO1xuICAgIGN0eC5yZXNwb25zZS5ib2R5ID0gJ0NhbmB0IGdldCBhbnl0aGluZyc7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlQW5vbWFseShjdHg6IFJvdXRlci5JUm91dGVyQ29udGV4dCkge1xuICB0cnkge1xuICAgIGxldCBib2R5ID0gY3R4LnJlcXVlc3QuYm9keTtcbiAgICBjb25zdCBtZXRyaWM6TWV0cmljID0ge1xuICAgICAgZGF0YXNvdXJjZTogYm9keS5tZXRyaWMuZGF0YXNvdXJjZSxcbiAgICAgIHRhcmdldHM6IHNhdmVUYXJnZXRzKGJvZHkubWV0cmljLnRhcmdldHMpXG4gICAgfTtcblxuICAgIGNvbnN0IGFub21hbHk6QW5vbWFseSA9IHtcbiAgICAgIG5hbWU6IGJvZHkubmFtZSxcbiAgICAgIHBhbmVsVXJsOiBib2R5LnBhbmVsVXJsLFxuICAgICAgcGF0dGVybjogYm9keS5wYXR0ZXJuLnRvTG93ZXJDYXNlKCksXG4gICAgICBtZXRyaWM6IG1ldHJpYyxcbiAgICAgIGRhdGFzb3VyY2U6IGJvZHkuZGF0YXNvdXJjZSxcbiAgICAgIHN0YXR1czogJ2xlYXJuaW5nJyxcbiAgICAgIGxhc3RfcHJlZGljdGlvbl90aW1lOiAwLFxuICAgICAgbmV4dF9pZDogMFxuICAgIH07XG4gICAgbGV0IGFub21hbHlJZCA9IGluc2VydEFub21hbHkoYW5vbWFseSk7XG4gICAgaWYoYW5vbWFseUlkID09PSBudWxsKSB7XG4gICAgICBjdHgucmVzcG9uc2Uuc3RhdHVzID0gNDAzO1xuICAgICAgY3R4LnJlc3BvbnNlLmJvZHkgPSB7XG4gICAgICAgIGNvZGU6IDQwMyxcbiAgICAgICAgbWVzc2FnZTogJ0FscmVhZHkgZXhpc3RzJ1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHsgYW5vbWFseV9pZDogYW5vbWFseUlkIH07XG5cbiAgICBydW5MZWFybmluZyhhbm9tYWx5SWQpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBjdHgucmVzcG9uc2Uuc3RhdHVzID0gNTAwO1xuICAgIGN0eC5yZXNwb25zZS5ib2R5ID0ge1xuICAgICAgY29kZTogNTAwLFxuICAgICAgbWVzc2FnZTogJ0ludGVybmFsIGVycm9yJ1xuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVsZXRlQW5vbWFseShjdHg6IFJvdXRlci5JUm91dGVyQ29udGV4dCkge1xuICB0cnkge1xuICAgIGxldCBpZCA9IGN0eC5yZXF1ZXN0LnF1ZXJ5LmlkO1xuICAgIGxldCBuYW1lID0gY3R4LnJlcXVlc3QucXVlcnkubmFtZTtcblxuICAgIGlmKGlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlbW92ZUFub21hbHkoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmVBbm9tYWx5KG5hbWUudG9Mb3dlckNhc2UoKSk7XG4gICAgfVxuICAgIFxuICAgIGN0eC5yZXNwb25zZS5ib2R5ID0ge1xuICAgICAgY29kZTogMjAwLFxuICAgICAgbWVzc2FnZTogJ1N1Y2Nlc3MnXG4gICAgfTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY3R4LnJlc3BvbnNlLnN0YXR1cyA9IDUwMDtcbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHtcbiAgICAgIGNvZGU6IDUwMCxcbiAgICAgIG1lc3NhZ2U6ICdJbnRlcm5hbCBlcnJvcidcbiAgICB9O1xuICB9XG59XG5cblxuZXhwb3J0IHZhciByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG5cbnJvdXRlci5nZXQoJy9zdGF0dXMnLCBzZW5kQW5vbWFseVR5cGVTdGF0dXMpO1xucm91dGVyLmdldCgnLycsIGdldEFub21hbHkpO1xucm91dGVyLnBvc3QoJy8nLCBjcmVhdGVBbm9tYWx5KTtcbnJvdXRlci5kZWxldGUoJy8nLCBkZWxldGVBbm9tYWx5KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3JvdXRlcy9hbm9tYWxpZXMudHMiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKVwiXG4vLyBtb2R1bGUgaWQgPSAxOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgnbG9kYXNoJylcIlxuLy8gbW9kdWxlIGlkID0gMTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdldmVudC1zdHJlYW0nKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2V2ZW50LXN0cmVhbScpXCJcbi8vIG1vZHVsZSBpZCA9IDIwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAqIGFzIFJvdXRlciBmcm9tICdrb2Etcm91dGVyJztcblxuaW1wb3J0IHtcbiAgZ2V0TGFiZWxlZFNlZ21lbnRzLFxuICBpbnNlcnRTZWdtZW50cyxcbiAgcmVtb3ZlU2VnbWVudHMsXG59IGZyb20gJy4uL3NlcnZpY2VzL3NlZ21lbnRzJztcblxuaW1wb3J0IHtcbiAgQW5vbWFseSwgQW5vbWFseUlkLCBnZXRBbm9tYWx5SWRCeU5hbWUsIGxvYWRBbm9tYWx5QnlJZFxufSBmcm9tICcuLi9zZXJ2aWNlcy9hbm9tYWx5VHlwZSc7XG5cbmltcG9ydCB7IHJ1bkxlYXJuaW5nIH0gZnJvbSAnLi4vc2VydmljZXMvYW5hbHl0aWNzJztcblxuXG5hc3luYyBmdW5jdGlvbiBzZW5kU2VnbWVudHMoY3R4OiBSb3V0ZXIuSVJvdXRlckNvbnRleHQpIHtcblxuICBsZXQgYW5vbWFseUlkOiBBbm9tYWx5SWQgPSBjdHgucmVxdWVzdC5xdWVyeS5hbm9tYWx5X2lkO1xuICBsZXQgYW5vbWFseTpBbm9tYWx5ID0gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZCk7XG4gIGlmKGFub21hbHkgPT09IG51bGwpIHtcbiAgICBhbm9tYWx5SWQgPSBnZXRBbm9tYWx5SWRCeU5hbWUoYW5vbWFseUlkKTtcbiAgfVxuXG4gIGxldCBsYXN0U2VnbWVudElkID0gY3R4LnJlcXVlc3QucXVlcnkubGFzdF9zZWdtZW50O1xuICBsZXQgdGltZUZyb20gPSBjdHgucmVxdWVzdC5xdWVyeS5mcm9tO1xuICBsZXQgdGltZVRvID0gY3R4LnJlcXVlc3QucXVlcnkudG87XG5cbiAgbGV0IHNlZ21lbnRzID0gZ2V0TGFiZWxlZFNlZ21lbnRzKGFub21hbHlJZCk7XG5cbiAgLy8gSWQgZmlsdGVyaW5nXG4gIGlmKGxhc3RTZWdtZW50SWQgIT09IHVuZGVmaW5lZCkge1xuICAgIHNlZ21lbnRzID0gc2VnbWVudHMuZmlsdGVyKGVsID0+IGVsLmlkID4gbGFzdFNlZ21lbnRJZCk7XG4gIH1cblxuICAvLyBUaW1lIGZpbHRlcmluZ1xuICBpZih0aW1lRnJvbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgc2VnbWVudHMgPSBzZWdtZW50cy5maWx0ZXIoZWwgPT4gZWwuZmluaXNoID4gdGltZUZyb20pO1xuICB9XG5cbiAgaWYodGltZVRvICE9PSB1bmRlZmluZWQpIHtcbiAgICBzZWdtZW50cyA9IHNlZ21lbnRzLmZpbHRlcihlbCA9PiBlbC5zdGFydCA8IHRpbWVUbyk7XG4gIH1cblxuICBjdHgucmVzcG9uc2UuYm9keSA9IHsgc2VnbWVudHMgfVxuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVNlZ21lbnRzKGN0eDogUm91dGVyLklSb3V0ZXJDb250ZXh0KSB7XG4gIHRyeSB7XG4gICAgbGV0IHNlZ21lbnRzVXBkYXRlID0gY3R4LnJlcXVlc3QuYm9keTtcblxuICAgIGxldCBhbm9tYWx5SWQgPSBzZWdtZW50c1VwZGF0ZS5hbm9tYWx5X2lkO1xuICAgIGxldCBhbm9tYWx5TmFtZSA9IHNlZ21lbnRzVXBkYXRlLm5hbWU7XG5cbiAgICBpZihhbm9tYWx5SWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYW5vbWFseUlkID0gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlOYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgIH1cblxuICAgIGxldCBhZGRlZElkcyA9IGluc2VydFNlZ21lbnRzKGFub21hbHlJZCwgc2VnbWVudHNVcGRhdGUuYWRkZWRfc2VnbWVudHMsIHRydWUpO1xuICAgIHJlbW92ZVNlZ21lbnRzKGFub21hbHlJZCwgc2VnbWVudHNVcGRhdGUucmVtb3ZlZF9zZWdtZW50cyk7XG5cbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHsgYWRkZWRfaWRzOiBhZGRlZElkcyB9O1xuXG4gICAgcnVuTGVhcm5pbmcoYW5vbWFseUlkKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY3R4LnJlc3BvbnNlLnN0YXR1cyA9IDUwMDtcbiAgICBjdHgucmVzcG9uc2UuYm9keSA9IHtcbiAgICAgIGNvZGU6IDUwMCxcbiAgICAgIG1lc3NhZ2U6ICdJbnRlcm5hbCBlcnJvcidcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG5cbnJvdXRlci5nZXQoJy8nLCBzZW5kU2VnbWVudHMpO1xucm91dGVyLnBhdGNoKCcvJywgdXBkYXRlU2VnbWVudHMpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcm91dGVzL3NlZ21lbnRzLnRzIiwiaW1wb3J0IHsgQW5vbWFseUlkLCBnZXRBbm9tYWx5SWRCeU5hbWUsIGxvYWRBbm9tYWx5QnlJZCB9IGZyb20gJy4uL3NlcnZpY2VzL2Fub21hbHlUeXBlJztcbmltcG9ydCB7IGdldEFsZXJ0c0Fub21hbGllcywgc2F2ZUFsZXJ0c0Fub21hbGllcyB9IGZyb20gJy4uL3NlcnZpY2VzL2FsZXJ0cyc7XG5cbmltcG9ydCAqIGFzIFJvdXRlciBmcm9tICdrb2Etcm91dGVyJztcblxuXG5mdW5jdGlvbiBnZXRBbGVydChjdHg6IFJvdXRlci5JUm91dGVyQ29udGV4dCkge1xuICBcbiAgbGV0IGFub21hbHlJZDogQW5vbWFseUlkID0gY3R4LnJlcXVlc3QucXVlcnkuYW5vbWFseV9pZDtcbiAgbGV0IGFub21hbHkgPSBsb2FkQW5vbWFseUJ5SWQoYW5vbWFseUlkKVxuICBpZihhbm9tYWx5ID09IG51bGwpIHtcbiAgICBhbm9tYWx5SWQgPSBnZXRBbm9tYWx5SWRCeU5hbWUoYW5vbWFseUlkLnRvTG93ZXJDYXNlKCkpO1xuICB9XG5cbiAgbGV0IGFsZXJ0c0Fub21hbGllcyA9IGdldEFsZXJ0c0Fub21hbGllcygpO1xuICBsZXQgcG9zID0gYWxlcnRzQW5vbWFsaWVzLmluZGV4T2YoYW5vbWFseUlkKTtcblxuICBsZXQgZW5hYmxlOiBib29sZWFuID0gKHBvcyAhPT0gLTEpO1xuICBjdHgucmVzcG9uc2UuYm9keSA9IHsgZW5hYmxlIH07XG4gIFxufVxuXG5mdW5jdGlvbiBjaGFuZ2VBbGVydChjdHg6IFJvdXRlci5JUm91dGVyQ29udGV4dCkge1xuXG4gIGxldCBhbm9tYWx5SWQ6IEFub21hbHlJZCA9IGN0eC5yZXF1ZXN0LmJvZHkuYW5vbWFseV9pZDtcbiAgbGV0IGVuYWJsZTogYm9vbGVhbiA9IGN0eC5yZXF1ZXN0LmJvZHkuZW5hYmxlO1xuXG4gIGxldCBhbm9tYWx5ID0gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZClcbiAgaWYoYW5vbWFseSA9PSBudWxsKSB7XG4gICAgYW5vbWFseUlkID0gZ2V0QW5vbWFseUlkQnlOYW1lKGFub21hbHlJZC50b0xvd2VyQ2FzZSgpKTtcbiAgfVxuXG4gIGxldCBhbGVydHNBbm9tYWxpZXMgPSBnZXRBbGVydHNBbm9tYWxpZXMoKTtcbiAgbGV0IHBvczogbnVtYmVyID0gYWxlcnRzQW5vbWFsaWVzLmluZGV4T2YoYW5vbWFseUlkKTtcbiAgaWYoZW5hYmxlICYmIHBvcyA9PSAtMSkge1xuICAgIGFsZXJ0c0Fub21hbGllcy5wdXNoKGFub21hbHlJZCk7XG4gICAgc2F2ZUFsZXJ0c0Fub21hbGllcyhhbGVydHNBbm9tYWxpZXMpO1xuICB9IGVsc2UgaWYoIWVuYWJsZSAmJiBwb3MgPiAtMSkge1xuICAgIGFsZXJ0c0Fub21hbGllcy5zcGxpY2UocG9zLCAxKTtcbiAgICBzYXZlQWxlcnRzQW5vbWFsaWVzKGFsZXJ0c0Fub21hbGllcyk7XG4gIH1cbiAgY3R4LnJlc3BvbnNlLmJvZHkgPSB7IHN0YXR1czogJ09LJyB9O1xuXG59XG5cbmV4cG9ydCBjb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG5cbnJvdXRlci5nZXQoJy8nLCBnZXRBbGVydCk7XG5yb3V0ZXIucG9zdCgnLycsIGNoYW5nZUFsZXJ0KTtcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcm91dGVzL2FsZXJ0cy50cyIsImltcG9ydCB7IGdldEpzb25EYXRhU3luYywgd3JpdGVKc29uRGF0YVN5bmMgfSBmcm9tICcuL2pzb24nO1xuaW1wb3J0IHsgQW5vbWFseUlkIH0gZnJvbSAnLi9hbm9tYWx5VHlwZSc7XG5pbXBvcnQgeyBydW5QcmVkaWN0IH0gZnJvbSAnLi9hbmFseXRpY3MnO1xuaW1wb3J0IHsgc2VuZE5vdGlmaWNhdGlvbiB9IGZyb20gJy4vbm90aWZpY2F0aW9uJztcbmltcG9ydCB7IGdldExhYmVsZWRTZWdtZW50cyB9IGZyb20gJy4vc2VnbWVudHMnO1xuXG5pbXBvcnQgeyBBTk9NQUxJRVNfUEFUSCB9IGZyb20gJy4uL2NvbmZpZyc7XG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5cblxuY29uc3QgQUxFUlRTX0RCX1BBVEggPSBwYXRoLmpvaW4oQU5PTUFMSUVTX1BBVEgsIGBhbGVydHNfYW5vbWFsaWVzLmpzb25gKTtcblxuZnVuY3Rpb24gZ2V0QWxlcnRzQW5vbWFsaWVzKCk6IEFub21hbHlJZFtdIHtcbiAgaWYoIWZzLmV4aXN0c1N5bmMoQUxFUlRTX0RCX1BBVEgpKSB7XG4gICAgc2F2ZUFsZXJ0c0Fub21hbGllcyhbXSk7XG4gIH1cbiAgcmV0dXJuIGdldEpzb25EYXRhU3luYyhBTEVSVFNfREJfUEFUSCk7XG59XG5cbmZ1bmN0aW9uIHNhdmVBbGVydHNBbm9tYWxpZXMoYW5vbWFsaWVzOiBBbm9tYWx5SWRbXSkge1xuICByZXR1cm4gd3JpdGVKc29uRGF0YVN5bmMoQUxFUlRTX0RCX1BBVEgsIGFub21hbGllcyk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NBbGVydHMoYW5vbWFseUlkKSB7XG4gIGxldCBzZWdtZW50cyA9IGdldExhYmVsZWRTZWdtZW50cyhhbm9tYWx5SWQpO1xuXG4gIGNvbnN0IGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIGNvbnN0IGFjdGl2ZUFsZXJ0ID0gYWN0aXZlQWxlcnRzLmhhcyhhbm9tYWx5SWQpO1xuICBsZXQgbmV3QWN0aXZlQWxlcnQgPSBmYWxzZTtcblxuICBpZihzZWdtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgbGV0IGxhc3RTZWdtZW50ID0gc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV07XG4gICAgaWYobGFzdFNlZ21lbnQuZmluaXNoID49IGN1cnJlbnRUaW1lIC0gYWxlcnRUaW1lb3V0KSB7XG4gICAgICBuZXdBY3RpdmVBbGVydCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYoIWFjdGl2ZUFsZXJ0ICYmIG5ld0FjdGl2ZUFsZXJ0KSB7XG4gICAgYWN0aXZlQWxlcnRzLmFkZChhbm9tYWx5SWQpO1xuICAgIHNlbmROb3RpZmljYXRpb24oYW5vbWFseUlkLCB0cnVlKTtcbiAgfSBlbHNlIGlmKGFjdGl2ZUFsZXJ0ICYmICFuZXdBY3RpdmVBbGVydCkge1xuICAgIGFjdGl2ZUFsZXJ0cy5kZWxldGUoYW5vbWFseUlkKTtcbiAgICBzZW5kTm90aWZpY2F0aW9uKGFub21hbHlJZCwgZmFsc2UpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFsZXJ0c1RpY2soKSB7XG4gIGxldCBhbGVydHNBbm9tYWxpZXMgPSBnZXRBbGVydHNBbm9tYWxpZXMoKTtcbiAgZm9yIChsZXQgYW5vbWFseUlkIG9mIGFsZXJ0c0Fub21hbGllcykge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW5QcmVkaWN0KGFub21hbHlJZCk7XG4gICAgICBwcm9jZXNzQWxlcnRzKGFub21hbHlJZCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgc2V0VGltZW91dChhbGVydHNUaWNrLCA1MDAwKTtcbn1cblxuY29uc3QgYWxlcnRUaW1lb3V0ID0gNjAwMDA7IC8vIG1zXG5jb25zdCBhY3RpdmVBbGVydHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbnNldFRpbWVvdXQoYWxlcnRzVGljaywgNTAwMCk7XG5cblxuZXhwb3J0IHsgZ2V0QWxlcnRzQW5vbWFsaWVzLCBzYXZlQWxlcnRzQW5vbWFsaWVzIH1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NlcnZpY2VzL2FsZXJ0cy50cyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnYmFiZWwtcnVudGltZS9jb3JlLWpzL3NldCcpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVxdWlyZSgnYmFiZWwtcnVudGltZS9jb3JlLWpzL3NldCcpXCJcbi8vIG1vZHVsZSBpZCA9IDI0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgeyBsb2FkQW5vbWFseUJ5SWQgfSBmcm9tICcuL2Fub21hbHlUeXBlJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbmROb3RpZmljYXRpb24oYW5vbWFseUlkLCBhY3RpdmUpIHtcbiAgbGV0IGFub21hbHlOYW1lID0gbG9hZEFub21hbHlCeUlkKGFub21hbHlJZCkubmFtZTtcbiAgY29uc29sZS5sb2coJ05vdGlmaWNhdGlvbiAnICsgYW5vbWFseU5hbWUpO1xuXG4gIGxldCBub3RpZmljYXRpb24gPSB7XG4gICAgYW5vbWFseTogYW5vbWFseU5hbWUsXG4gICAgc3RhdHVzOiAnJ1xuICB9O1xuICBpZihhY3RpdmUpIHtcbiAgICBub3RpZmljYXRpb24uc3RhdHVzID0gJ2FsZXJ0JztcbiAgfSBlbHNlIHtcbiAgICBub3RpZmljYXRpb24uc3RhdHVzID0gJ09LJztcbiAgfVxuXG4gIGxldCBlbmRwb2ludCA9IHByb2Nlc3MuZW52LkhBU1RJQ19BTEVSVF9FTkRQT0lOVDtcbiAgaWYoZW5kcG9pbnQgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnNvbGUuZXJyb3IoYENhbid0IHNlbmQgYWxlcnQsIGVudiBIQVNUSUNfQUxFUlRfRU5EUE9JTlQgaXMgdW5kZWZpbmVkYCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdHJ5IHtcbiAgICB2YXIgZGF0YSA9IGF3YWl0IGF4aW9zLnBvc3QoZW5kcG9pbnQsIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkobm90aWZpY2F0aW9uKVxuICAgIH0pXG4gICAgY29uc29sZS5sb2coZGF0YSk7XG4gIH0gY2F0Y2goZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcihgQ2FuJ3Qgc2VuZCBhbGVydCB0byAke2VuZHBvaW50fS4gRXJyb3I6ICR7ZXJyfWApXG4gIH1cbiAgXG59XG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NlcnZpY2VzL25vdGlmaWNhdGlvbi50cyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnYXhpb3MnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInJlcXVpcmUoJ2F4aW9zJylcIlxuLy8gbW9kdWxlIGlkID0gMjZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICogYXMgY29uZmlnIGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5cclxuXHJcbi8vIHNlZSBhbmFseXRpY3MvcGF0dGVybl9kZXRlY3Rpb25fbW9kZWwucHkgd2l0aCBmb2xkZXJzIGF2YWlsYWJsZVxyXG5cclxuZnVuY3Rpb24gbWF5YmVDcmVhdGUocGF0aDogc3RyaW5nKTogdm9pZCB7XHJcbiAgaWYoZnMuZXhpc3RzU3luYyhwYXRoKSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBmcy5ta2RpclN5bmMocGF0aCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RhdGFGb2xkZXJzKCk6IHZvaWQge1xyXG4gIHZhciBmb2xkZXJzID0gW1xyXG4gICAgY29uZmlnLkRBVEFfUEFUSCxcclxuICAgIGNvbmZpZy5EQVRBU0VUU19QQVRILFxyXG4gICAgY29uZmlnLkFOT01BTElFU19QQVRILFxyXG4gICAgY29uZmlnLk1PREVMU19QQVRILFxyXG4gICAgY29uZmlnLk1FVFJJQ1NfUEFUSCxcclxuICAgIGNvbmZpZy5TRUdNRU5UU19QQVRIXHJcbiAgXS5mb3JFYWNoKG1heWJlQ3JlYXRlKTtcclxufVxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zZXJ2aWNlcy9kYXRhLnRzIl0sInNvdXJjZVJvb3QiOiIifQ==