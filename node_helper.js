"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Magic Mirror
 * Module: MMM-Todoist
 *
 * By Chris Brooker
 *
 * MIT Licensed.
 */
//@ts-ignore
var _todoist_api_typescript_1 = require("@todoist-api-typescript");
//@ts-ignore
var node_helper_1 = require("node_helper");
//@ts-ignore
var showdown_1 = require("showdown");
var markdown = new showdown_1.default.Converter();
var config;
module.exports = node_helper_1.default.create({
    start: function () {
        console.log("Starting node helper for: " + this.name);
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === "FETCH_TODOIST") {
            this.config = payload;
            this.fetchTodos();
        }
    },
    fetchTodos: function () {
        var self = this;
        //request.debug = true;
        var accessToken = self.config.accessToken;
        var api = new _todoist_api_typescript_1.TodoistApi(accessToken);
        console.log("fetching Tasks...");
        api.getTasks({ roject_id: config.project }).then(function (tasks) {
            var taskJson = JSON.parse(tasks);
            taskJson.items.forEach(function (item) {
                item.contentHtml = markdown.makeHtml(item.content);
            });
            self.sendSocketNotification("TASKS", taskJson);
        })
            .catch(function (error) {
            {
                if (self.config.debug) {
                    console.log(error);
                }
                self.sendSocketNotification("FETCH_ERROR", {
                    error: error
                });
                return console.error(" ERROR - MMM-Todoist: " + error);
            }
        });
        /*
                request({
                    url: self.config.apiBase + "/" + self.config.apiVersion + "/" + self.config.todoistEndpoint + "/",
                    method: "POST",
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        "cache-control": "no-cache",
                        "Authorization": "Bearer " + acessCode
                    },
                    form: {
                        sync_token: "*",
                        resource_types: self.config.todoistResourceType
                    }
                },
                    function (error, response, body) {
                        if (error) {
                            self.sendSocketNotification("FETCH_ERROR", {
                                error: error
                            });
                            return console.error(" ERROR - MMM-Todoist: " + error);
                        }
                        if (self.config.debug) {
                            console.log(body);
                        }
                        if (response.statusCode === 200) {
                            var taskJson = JSON.parse(body);
                            taskJson.items.forEach((item) => {
                                item.contentHtml = markdown.makeHtml(item.content);
                            });
        
                            taskJson.accessToken = acessCode;
                            self.sendSocketNotification("TASKS", taskJson);
                        }
                        else {
                            console.log("Todoist api request status=" + response.statusCode);
                        }
        
                    });
        
                    */
    }
});
