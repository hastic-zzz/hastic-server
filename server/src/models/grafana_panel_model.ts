export type GrafanaPanelTemplate = {
  // TODO: not any
  analyticUnitTemplates: any[]
}

export type GrafanaTemplateVariables = {
  grafanaUrl: string,
  panelId: string,
  datasourceUrl: string
};
