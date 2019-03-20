import { Collection, makeDBQ } from '../services/data_service';

const db = makeDBQ(Collection.ANALYTIC_UNITS);

export async function convertPanelUrlToPanelId() {
  const analyticUnits = await db.findMany({ panelUrl: { $exists: true } });
  console.log(`Found ${analyticUnits.length} analytic units with panelUrl field`);
  if(analyticUnits.length === 0) {
    console.log('Nothing to migrate');
    return;
  }

  const panelUrlRegex = /^(.+)\/d\/([^\/]+)\/.+panelId=(\d+)/;
  const newPanelUrlRegex = /^(.+)\/dashboard\/(\w+).+panelId=(\d+)/;
  const updatedAnalyticUnits = analyticUnits
    .map(analyticUnit => {
      const parsedPanelUrl = analyticUnit.panelUrl.match(panelUrlRegex) || analyticUnit.panelUrl.match(newPanelUrlRegex);
      if(parsedPanelUrl === null) {
        console.log(`Cannot parse url: ${analyticUnit.panelUrl}`);
        return null;
      }
      const grafanaUrl = parsedPanelUrl[1];
      const dashboardId = parsedPanelUrl[2];
      const oldPanelId = parsedPanelUrl[3];
      const panelId = `${dashboardId}/${oldPanelId}`;

      return {
        _id: analyticUnit._id,
        grafanaUrl,
        panelId
      };
    })
    .filter(analyticUnit => analyticUnit !== null);
  
  console.log(updatedAnalyticUnits);
  await updatedAnalyticUnits.forEach(analyticUnit => db.updateOne(analyticUnit._id, {
    panelUrl: undefined,
    ...analyticUnit
  }));
}

