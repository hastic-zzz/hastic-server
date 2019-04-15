import { GRAFANA_URL } from '../config';

export function getGrafanaUrl(browserGrafanaUrl: string): string {
  return (GRAFANA_URL !== null) ? GRAFANA_URL : browserGrafanaUrl;
}
