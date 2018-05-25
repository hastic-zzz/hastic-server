//import * as Telegraf from 'telegraf'
import * as path from 'path';
import { DATA_PATH } from '../config';
import { getJsonDataSync, writeJsonDataSync } from './json';
import { AnomalyId } from './anomalyType';


type SubscriberId = string;
type SubscribersMap = Map< AnomalyId, SubscriberId[] >;

type BotConfig = {
  token: string,
  subscriptions: SubscribersMap
};

function sendNotification(anomalyName, active) {
  console.log('Notification ' + anomalyName);
  if(anomalyName in botConfig.subscriptions) {
    let notificationMessage;
    if(active) {
      notificationMessage = 'Alert! Anomaly type ' + anomalyName;
    } else {
      notificationMessage = 'Ok! Anomaly type ' + anomalyName;
    }

    for (let SubscriberId of botConfig.subscriptions[anomalyName]) {
      bot.telegram.sendMessage(SubscriberId, notificationMessage);
    }
  }
}

function loadBotConfig() : BotConfig {
  let filename = path.join(DATA_PATH, `bot_config.json`);
  let jsonData;
  try {
    jsonData = getJsonDataSync(filename);
  } catch(e) {
    console.error(e.message);
    jsonData = [];
  }
  return jsonData;
}

function saveBotConfig(botConfig: BotConfig) {
  let filename = path.join(DATA_PATH, `bot_config.json`);
  try {
    writeJsonDataSync(filename, botConfig);
  } catch(e) {
    console.error(e.message);
  }
}

const commandArgs = (ctx, next) => {
  try {
    if(ctx.updateType === 'message') {
      const text = ctx.update.message.text;
      if(text !== undefined && text.startsWith('/')) {
        const match = text.match(/^\/([^\s]+)\s?(.+)?/);
        let args = [];
        let command;
        if(match !== null) {
          if(match[1]) {
            command = match[1];
          }
          if(match[2]) {
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
  } catch (e) {

  }
};

function addNotification(ctx) {
  console.log('addNotification')
  let command = ctx.state.command;
  let chatId = ctx.chat.id;
  if(command.args.length > 0) {
    for (let anomalyName of command.args) {
      if(!(anomalyName in botConfig.subscriptions)) {
        botConfig.subscriptions[anomalyName] = []
      }
      if(botConfig.subscriptions[anomalyName].includes(chatId)) {
        return ctx.reply('You are already subscribed on alerts from anomaly ' + command.args)
      }  else {
        botConfig.subscriptions[anomalyName].push(chatId);
        saveBotConfig(botConfig);
      }
    }
    return ctx.reply('You have been successfully subscribed on alerts from anomaly ' + command.args)
  } else {
    return ctx.reply('You should use syntax: \/addNotification <anomaly_name>')
  }
}

function removeNotification(ctx) {
  let command = ctx.state.command;
  let chatId = ctx.chat.id;
  if(command.args.length > 0) {
    for (let anomalyName of command.args) {
      if(anomalyName in botConfig.subscriptions) {
        botConfig.subscriptions[anomalyName] = botConfig.subscriptions[anomalyName].filter(el => el !== chatId);
        saveBotConfig(botConfig);
      }
    }
    return ctx.reply('You have been successfully unsubscribed from alerts from ' + command.args);
  } else {
    return ctx.reply('You should use syntax: \/removeNotification <anomaly_name>');
  }
}

// const Telegraf = require('telegraf');
let botConfig: BotConfig;
let bot;

function tgBotInit() {
  try {
    // botConfig = loadBotConfig();
    // bot = new Telegraf(botConfig.token);

    // bot.use(commandArgs);

    // bot.command('addNotification', addNotification);
    // bot.command('removeNotification', removeNotification);

    // bot.startPolling();
  } catch(e) {
    // TODO: handle exception
  }
}

export { sendNotification, tgBotInit }
