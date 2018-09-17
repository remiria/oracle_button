"use strict";

/**
 * @returns {string}
 */
function getLocalStorageKey() {
	return "oracle_button_config";
}

/**
 * @returns {string}
 */
function getDefaultVoice() {
	return "kiritan";
}

/**
 * @return {Config}
 */
function getDefaultConfig() {
	return {
		voice: getDefaultVoice(),
		isOracleButtonVisible: true
	}
}

/**
 * 
 * @param {Object} config 
 * @returns {boolean}
 */
function isValidConfig(config) {
	return config.hasOwnProperty("voice") && config.hasOwnProperty("isOracleButtonVisible");
}

/**
 * @returns {Config}
 */
function getConfig() {
	const config = localStorage.getItem(getLocalStorageKey());
	const defaultConfig = getDefaultConfig();
	if (!config) {
		return defaultConfig;
	}

	try {
		const parsedConfig = JSON.parse(config);
		return isValidConfig(parsedConfig) ? parsedConfig : defaultConfig;
	} catch {
		alert("EMERGENCY!! Unexpected Config structureeeeeeeaaaaahhhh!!!!!!!");
		setConfig(defaultConfig);
		emergencyOracle();
		return defaultConfig;
	}
	
}

/**
 * @param {Config} config
 */
function setConfig(config) {
	localStorage.setItem(getLocalStorageKey(), JSON.stringify(config));
}

/**
 * @returns {string}
 */
function getCurrentVoice() {
	const config = getConfig();
	return config.voice;
}

/**
 * @param {string} selected
 */
function setCurrentVoice(selected) {
	const config = getConfig();
	setConfig({
		voice: selected,
		isOracleButtonVisible: config.isOracleButtonVisible
	});
}

/**
 * @returns {boolean}
 */
function getOracleButtonVisibility() {
	return getConfig().isOracleButtonVisible;
}

/**
 * @param {boolean} shouldBeVisible
 */
function setOracleButtonVisiblity(shouldBeVisible) {
	const config = getConfig();
	setConfig({
		voice: config.voice,
		isOracleButtonVisible: shouldBeVisible
	});
}

function sendToggleMessage(shouldBeVisible, callback) {
	chrome.windows.getAll({populate:true}, (windows) => {
		windows.forEach((window) => {
			window.tabs.forEach((tab) => {
				chrome.tabs.sendMessage(tab.id, {visibility: shouldBeVisible},callback);
			});
		});
	});
};

function say() {
	const current = getConfig().voice;
	const audioURL = chrome.extension.getURL(`sounds/${current}/oracle.wav`);
	const audio = new Audio();
	audio.src = audioURL;
	audio.play();
}

function emergencyOracle() {
	const ORACLE = "https://www.oracle.com";
	chrome.windows.getAll({populate:true}, (windows) => {
		windows.forEach((window) => {
		  window.tabs.forEach((tab) => {
			chrome.tabs.update(tab.id, {url: ORACLE});
		  });
		});
	});
}

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
		if (request.message === "say") {
			say();
			sendResponse(true);
		} else if (request.message === "initVisibility") {
			sendResponse(true);
			sendToggleMessage(getOracleButtonVisibility(), () => {
					return;
			});
		}
});


