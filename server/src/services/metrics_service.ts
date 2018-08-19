// import pandas as pd
// import os, re
// import numpy as np
// from urllib.parse import urlencode, urlparse
// import urllib.request
// import json
// from time import time
// from config import HASTIC_API_KEY


// MS_IN_WEEK = 604800000

// class GrafanaDataProvider:
//     chunk_size = 50000

//     def __init__(self, datasource, target, data_filename):
//         self.datasource = datasource
//         self.target = target
//         self.data_filename = data_filename
//         self.last_time = None
//         self.total_size = 0
//         self.last_chunk_index = 0
//         self.chunk_last_times = {}
//         self.__init_chunks()
//         self.synchronize()

//     def get_dataframe(self, after_time=None):
//         result = pd.DataFrame()
//         for chunk_index, last_chunk_time in self.chunk_last_times.items():
//             if after_time is None or after_time <= last_chunk_time:
//                 chunk = self.__load_chunk(chunk_index)
//                 if after_time is not None:
//                     chunk = chunk[chunk['timestamp'] >= after_time]
//                 result = pd.concat([result, chunk])
//         return result

//     def get_upper_bound(self, after_time):
//         for chunk_index, last_chunk_time in self.chunk_last_times.items():
//             if after_time < last_chunk_time:
//                 chunk = self.__load_chunk(chunk_index)
//                 chunk = chunk[chunk['timestamp'] >= after_time]
//                 return chunk.index[0]
//         return self.size()

//     def size(self):
//         return self.total_size

//     def get_data_range(self, start_index, stop_index=None):
//         return self.__get_data(start_index, stop_index)

//     def transform_anomalies(self, anomalies):
//         result = []
//         if len(anomalies) == 0:
//             return result
//         dataframe = self.get_dataframe(None)
//         for anomaly in anomalies:
//             start_time = pd.to_datetime(anomaly['start'] - 1, unit='ms')
//             finish_time = pd.to_datetime(anomaly['finish'] + 1, unit='ms')
//             current_index = (dataframe['timestamp'] >= start_time) & (dataframe['timestamp'] <= finish_time)
//             anomaly_frame = dataframe[current_index]
//             if anomaly_frame.empty:
//                 continue

//             cur_anomaly = {
//                 'start': anomaly_frame.index[0],
//                 'finish': anomaly_frame.index[len(anomaly_frame) - 1],
//                 'labeled': anomaly['labeled']
//             }
//             result.append(cur_anomaly)
//         return result

//     def inverse_transform_indexes(self, indexes):
//         if len(indexes) == 0:
//             return []
//         dataframe = self.get_data_range(indexes[0][0], indexes[-1][1] + 1)

//         return [(dataframe['timestamp'][i1], dataframe['timestamp'][i2]) for (i1, i2) in indexes]

//     def synchronize(self):
//         append_dataframe = self.load_from_db(self.last_time)
//         self.__append_data(append_dataframe)

//     def custom_query(self, after_time, before_time = None):
//         if self.datasource['type'] == 'influxdb':
//             query = self.datasource['params']['q']
//             if after_time is not None:
//                 if before_time is not None:
//                     timeFilter = 'time >= %s AND time <= %s' % (after_time, before_time)
//                 else:
//                     timeFilter = 'time >= "%s"' % (str(after_time))
//             else:
//                 timeFilter = 'time > 0ms'
//             query = re.sub(r'(?:time >.+?)(GROUP.+)*$', timeFilter + r' \1', query)
//             return query
//         else:
//             raise 'Datasource type ' + self.datasource['type'] + ' is not supported yet'

//     def load_from_db(self, after_time=None):
//         result = self.__load_data_chunks(after_time)
//         if result == None or len(result['values']) == 0:
//             dataframe = pd.DataFrame([])
//         else:
//             dataframe = pd.DataFrame(result['values'], columns = result['columns'])
//             cols = dataframe.columns.tolist()
//             cols.remove('time')
//             cols = ['time'] + cols
//             dataframe = dataframe[cols]
//             dataframe['time'] = pd.to_datetime(dataframe['time'], unit='ms')
//             dataframe = dataframe.dropna(axis=0, how='any')

//         return dataframe

//     def __load_data_chunks(self, after_time = None):
//         params = self.datasource['params']

//         if after_time == None:
//             res = {
//                 'columns': [],
//                 'values': []
//             }

//             after_time = int(time() * 1000 - MS_IN_WEEK)
//             before_time = int(time() * 1000)
//             while True:
//                 params['q'] = self.custom_query(str(after_time) + 'ms', str(before_time) + 'ms')
//                 serie = self.__query_grafana(params)

//                 if serie != None:
//                     res['columns'] = serie['columns']
//                     res['values'] += serie['values']

//                     after_time -= MS_IN_WEEK
//                     before_time -= MS_IN_WEEK
//                 else:
//                     return res
//         else:
//             params['q'] = self.custom_query(str(after_time))

//             return self.__query_grafana(params)

//     def __query_grafana(self, params):
        
//         headers = { 'Authorization': 'Bearer ' + HASTIC_API_KEY }
//         url = self.datasource['origin'] + '/' + self.datasource['url'] + '?' + urlencode(params)

//         req = urllib.request.Request(url, headers=headers)
//         with urllib.request.urlopen(req) as resp:
//             res = json.loads(resp.read().decode('utf-8'))['results'][0]
//             if 'series' in res:
//                 return res['series'][0]
//             else:
//                 return None

//     def __init_chunks(self):
//         chunk_index = 0
//         self.last_chunk_index = 0
//         while True:
//             filename = self.data_filename
//             if chunk_index > 0:
//                 filename += "." + str(chunk_index)
//             if os.path.exists(filename):
//                 self.last_chunk_index = chunk_index
//                 chunk = self.__load_chunk(chunk_index)
//                 chunk_last_time = chunk.iloc[len(chunk) - 1]['timestamp']
//                 self.chunk_last_times[chunk_index] = chunk_last_time
//                 self.last_time = chunk_last_time
//             else:
//                 break
//             chunk_index += 1
//         self.total_size = self.last_chunk_index * self.chunk_size
//         last_chunk = self.__load_chunk(self.last_chunk_index)
//         self.total_size += len(last_chunk)

//     def __load_chunk(self, index):
//         filename = self.data_filename
//         if index > 0:
//             filename += "." + str(index)

//         if os.path.exists(filename):
//             chunk = pd.read_csv(filename, parse_dates=[0])
//             frame_index = np.arange(index * self.chunk_size, index * self.chunk_size + len(chunk))
//             chunk = chunk.set_index(frame_index)
//             return chunk.rename(columns={chunk.columns[0]: "timestamp", chunk.columns[1]: "value"})
//         return pd.DataFrame()

//     def __save_chunk(self, index, dataframe):
//         filename = self.data_filename
//         if index > 0:
//             filename += "." + str(index)

//         chunk_last_time = dataframe.iloc[len(dataframe) - 1]['time']
//         self.chunk_last_times[index] = chunk_last_time

//         if os.path.exists(filename):
//             dataframe.to_csv(filename, mode='a', index=False, header=False)
//         else:
//             dataframe.to_csv(filename, mode='w', index=False, header=True)

//     def __append_data(self, dataframe):
//         while len(dataframe) > 0:
//             chunk = self.__load_chunk(self.last_chunk_index)
//             rows_count = min(self.chunk_size - len(chunk), len(dataframe))

//             rows = dataframe.iloc[0:rows_count]

//             if len(rows) > 0:
//                 self.__save_chunk(self.last_chunk_index, rows)
//                 self.total_size += rows_count

//                 self.last_time = rows.iloc[-1]['time']
//                 dataframe = dataframe[rows_count:]

//             if len(dataframe) > 0:
//                 self.last_chunk_index += 1

//     def __get_data(self, start_index, stop_index):
//         result = pd.DataFrame()
//         start_chunk = start_index // self.chunk_size
//         finish_chunk = self.last_chunk_index
//         if stop_index is not None:
//             finish_chunk = stop_index // self.chunk_size
//         for chunk_num in range(start_chunk, finish_chunk + 1):
//             chunk = self.__load_chunk(chunk_num)
//             if stop_index is not None and chunk_num == finish_chunk:
//                 chunk = chunk[:stop_index % self.chunk_size]
//             if chunk_num == start_chunk:
//                 chunk = chunk[start_index % self.chunk_size:]
//             result = pd.concat([result, chunk])
//         return result
